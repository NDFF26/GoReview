import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // In-memory global store on the backend server for instant cross-device SAAS sync
  let serverSyncStore: { users: any[]; adminPassword?: string; updatedAt: string } | null = null;

  app.get("/api/sync", (req, res) => {
    if (!serverSyncStore) {
      return res.status(404).json({ error: "No server sync state stored yet." });
    }
    res.json(serverSyncStore);
  });

  app.post("/api/sync", (req, res) => {
    try {
      const { users, adminPassword, updatedAt } = req.body;
      if (!Array.isArray(users)) {
        return res.status(400).json({ error: "Invalid users array" });
      }

      // Merge incoming users with server store
      const currentUsers = serverSyncStore?.users || [];
      const userMap = new Map<string, any>();

      for (const u of currentUsers) {
        if (u && u.username) {
          userMap.set(u.username.toLowerCase(), u);
        }
      }

      for (const u of users) {
        if (!u || !u.username) continue;
        const key = u.username.toLowerCase();
        const existing = userMap.get(key);
        if (!existing) {
          userMap.set(key, u);
        } else {
          const incomingTime = new Date(u.updatedAt || 0).getTime();
          const existingTime = new Date(existing.updatedAt || 0).getTime();
          if (incomingTime >= existingTime) {
            userMap.set(key, u);
          }
        }
      }

      const mergedUsers = Array.from(userMap.values());
      serverSyncStore = {
        users: mergedUsers,
        adminPassword: adminPassword || serverSyncStore?.adminPassword || 'admin',
        updatedAt: updatedAt || new Date().toISOString()
      };

      res.json(serverSyncStore);
    } catch (err: any) {
      console.error("Sync API error:", err);
      res.status(500).json({ error: err.message || "Failed to update sync store" });
    }
  });

  // Initialize Gemini AI SDK
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API endpoint for generating business topic & language reviews via Gemini AI
  app.post("/api/generate-review", async (req, res) => {
    try {
      const { businessName, topic, language, tagline } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ error: "Gemini API Key is not configured." });
      }

      const prompt = `Write 3 short, realistic 5-star Google Review lines for a business named "${businessName}" (${tagline || ''}).
Customer reviewing topic: "${topic}".
Requested language: "${language}".

BUSINESS CATEGORY ADAPTATION:
- If this is a food, restaurant, pizza shop, cafe, or bakery business: write enthusiastic food & taste reviews focusing on freshness, delicious flavor, crust/cheese/items, hygiene, ambiance, or fast service. NEVER use corporate jargon like "transparent process" or "component quality".
- If this is a service or professional business: focus on work quality, reliability, staff behavior, and satisfaction.

STRICT LANGUAGE RULES:
1. If requested language is "Gujarati", "Gujlish", or contains "guj": You MUST write ALL 3 reviews ONLY in GUJLISH (Gujarati language written using English/Roman Latin script, for example: "${businessName} nu food/service khub j saras chhe, fast delivery chhe!"). DO NOT write in English!
2. If requested language is "Hindi", "Hinglish", or contains "hin": You MUST write ALL 3 reviews ONLY in HINGLISH (Hindi language written using English/Roman Latin script, for example: "${businessName} ka food/service bahut badhiya hai, highly recommended!"). DO NOT write in English!
3. If requested language is "English": Write in standard natural English.

STRICT REQUIREMENT: Each review line MUST be concise, between 3 and 15 words long, natural and enthusiastic.
Return only a JSON array of 3 short strings without markdown formatting.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text || "[]";
      let reviews: string[] = [];
      try {
        reviews = JSON.parse(text);
      } catch (e) {
        reviews = [text.replace(/[\[\]"]/g, '').trim()];
      }

      res.json({ reviews });
    } catch (err: any) {
      console.error("Error generating AI review:", err);
      res.status(500).json({ error: err.message || "Failed to generate review" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
