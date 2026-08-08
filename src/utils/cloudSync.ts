import { BusinessUser } from '../types/user';
import {
  getStoredUsers,
  saveUsers,
  getAdminPassword,
  setAdminPassword,
  getDeletedUsernames,
  addDeletedUsername
} from './storage';

const PRIMARY_SYNC_API = '/api/sync';
const PUBLIC_CLOUD_OBJECT_URL = 'https://api.restful-api.dev/objects/ff8081819f7e10ae019fe14562b7114c';

export interface CloudPayload {
  users: BusinessUser[];
  deletedUsernames?: string[];
  adminPassword?: string;
  updatedAt: string;
}

export function mergeUserLists(
  localUsers: BusinessUser[],
  cloudUsers: BusinessUser[],
  deletedUsernames: string[] = []
): BusinessUser[] {
  const deletedSet = new Set(deletedUsernames.map((d) => String(d).trim().toLowerCase()));
  const map = new Map<string, BusinessUser>();

  // Process cloud users first
  if (Array.isArray(cloudUsers)) {
    for (const u of cloudUsers) {
      if (u && u.username) {
        const uName = String(u.username).trim().toLowerCase();
        const uId = String(u.id || '').trim().toLowerCase();
        if (!deletedSet.has(uName) && !deletedSet.has(uId)) {
          map.set(uName, u);
        }
      }
    }
  }

  // Process local users, keeping the newest updated version
  if (Array.isArray(localUsers)) {
    for (const u of localUsers) {
      if (!u || !u.username) continue;
      const uName = String(u.username).trim().toLowerCase();
      const uId = String(u.id || '').trim().toLowerCase();
      if (deletedSet.has(uName) || deletedSet.has(uId)) {
        continue;
      }
      const existing = map.get(uName);
      if (!existing) {
        map.set(uName, u);
      } else {
        const localTime = new Date(u.updatedAt || 0).getTime();
        const cloudTime = new Date(existing.updatedAt || 0).getTime();
        if (localTime >= cloudTime) {
          map.set(uName, u);
        }
      }
    }
  }

  return Array.from(map.values());
}

export async function fetchFromCloud(): Promise<CloudPayload | null> {
  // 1. Try primary Express API sync route first (when running on Cloud Run / local server)
  try {
    const res = await fetch(PRIMARY_SYNC_API, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data: CloudPayload = await res.json();
      if (data && Array.isArray(data.users)) {
        return data;
      }
    }
  } catch (e) {
    // API endpoint unavailable (e.g. GitHub Pages)
  }

  // 2. Fallback to public CORS-enabled cloud store for static GitHub Pages & mobile browsers
  try {
    const res = await fetch(PUBLIC_CLOUD_OBJECT_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && Array.isArray(json.data.users)) {
        return json.data as CloudPayload;
      }
    }
  } catch (err) {
    console.warn('Public cloud sync fetch warning:', err);
  }
  return null;
}

export async function pushToCloud(
  users: BusinessUser[],
  adminPassword?: string,
  deletedUsernames?: string[]
): Promise<boolean> {
  const deleted = deletedUsernames || getDeletedUsernames();
  const payload: CloudPayload = {
    users,
    deletedUsernames: deleted,
    adminPassword: adminPassword || getAdminPassword(),
    updatedAt: new Date().toISOString()
  };

  let success = false;

  // 1. Push to Express backend /api/sync if available
  try {
    const res = await fetch(PRIMARY_SYNC_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      success = true;
    }
  } catch (e) {
    // Express backend not available
  }

  // 2. Push to public CORS-enabled cloud object for GitHub Pages & mobile sync
  try {
    const res = await fetch(PUBLIC_CLOUD_OBJECT_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'GoReview SAAS Database',
        data: payload
      })
    });
    if (res.ok) {
      success = true;
    }
  } catch (err) {
    console.warn('Public cloud push warning:', err);
  }

  return success;
}

/**
 * Perform bi-directional smart sync across mobile, laptop & GitHub Pages
 */
export async function syncOnStartup(): Promise<{ users: BusinessUser[]; updated: boolean }> {
  const localUsers = getStoredUsers();
  const localDeleted = getDeletedUsernames();
  const cloudData = await fetchFromCloud();

  if (cloudData && Array.isArray(cloudData.users)) {
    const cloudDeleted = cloudData.deletedUsernames || [];
    const combinedDeleted = Array.from(
      new Set([...localDeleted, ...cloudDeleted].map((s) => String(s).trim().toLowerCase()))
    );

    // Save combined deleted list locally
    combinedDeleted.forEach((d) => addDeletedUsername(d));

    const merged = mergeUserLists(localUsers, cloudData.users, combinedDeleted);
    saveUsers(merged);

    if (cloudData.adminPassword) {
      setAdminPassword(cloudData.adminPassword);
    }

    pushToCloud(merged, cloudData.adminPassword, combinedDeleted).catch(() => {});
    return { users: merged, updated: true };
  } else if (localUsers && localUsers.length > 0) {
    pushToCloud(localUsers, getAdminPassword(), localDeleted).catch(() => {});
  }

  return { users: localUsers, updated: false };
}


