import { BusinessUser } from '../types/user';
import { getStoredUsers, saveUsers, getAdminPassword, setAdminPassword } from './storage';

const PRIMARY_SYNC_API = '/api/sync';
const FALLBACK_KV_ENDPOINT = 'https://kvdb.io/goreview_saas_db_v2/master_payload';

export interface CloudPayload {
  users: BusinessUser[];
  adminPassword?: string;
  updatedAt: string;
}

export function mergeUserLists(localUsers: BusinessUser[], cloudUsers: BusinessUser[]): BusinessUser[] {
  const map = new Map<string, BusinessUser>();

  // Process cloud users first
  for (const u of cloudUsers) {
    if (u && u.username) {
      map.set(u.username.toLowerCase(), u);
    }
  }

  // Process local users, keeping the newest updated version or combining missing users
  for (const u of localUsers) {
    if (!u || !u.username) continue;
    const key = u.username.toLowerCase();
    const existing = map.get(key);
    if (!existing) {
      map.set(key, u);
    } else {
      const localTime = new Date(u.updatedAt || 0).getTime();
      const cloudTime = new Date(existing.updatedAt || 0).getTime();
      if (localTime >= cloudTime) {
        map.set(key, u);
      }
    }
  }

  return Array.from(map.values());
}

export async function fetchFromCloud(): Promise<CloudPayload | null> {
  // 1. Try primary Express API sync route first
  try {
    const res = await fetch(PRIMARY_SYNC_API, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data: CloudPayload = await res.json();
      if (data && Array.isArray(data.users) && data.users.length > 0) {
        return data;
      }
    }
  } catch (e) {
    // API endpoint unavailable, try fallback
  }

  // 2. Fallback to public KV endpoint for static GitHub Pages hosting
  try {
    const res = await fetch(FALLBACK_KV_ENDPOINT, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data: CloudPayload = await res.json();
      if (data && Array.isArray(data.users) && data.users.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Cloud sync fetch warning:', err);
  }
  return null;
}

export async function pushToCloud(users: BusinessUser[], adminPassword?: string): Promise<boolean> {
  const payload: CloudPayload = {
    users,
    adminPassword: adminPassword || getAdminPassword(),
    updatedAt: new Date().toISOString()
  };

  let success = false;

  // 1. Push to Express backend /api/sync
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

  // 2. Push to KV fallback
  try {
    await fetch(FALLBACK_KV_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    success = true;
  } catch (err) {
    // KV endpoint failed
  }

  return success;
}

/**
 * Perform bi-directional smart sync across mobile & desktop devices
 */
export async function syncOnStartup(): Promise<{ users: BusinessUser[]; updated: boolean }> {
  const localUsers = getStoredUsers();
  const cloudData = await fetchFromCloud();

  if (cloudData && cloudData.users && cloudData.users.length > 0) {
    const merged = mergeUserLists(localUsers, cloudData.users);
    saveUsers(merged);
    if (cloudData.adminPassword) {
      setAdminPassword(cloudData.adminPassword);
    }
    pushToCloud(merged, cloudData.adminPassword).catch(() => {});
    return { users: merged, updated: true };
  } else if (localUsers && localUsers.length > 0) {
    pushToCloud(localUsers, getAdminPassword()).catch(() => {});
  }

  return { users: localUsers, updated: false };
}

