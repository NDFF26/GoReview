import { BusinessUser } from '../types/user';
import { getStoredUsers, saveUsers, getAdminPassword, setAdminPassword } from './storage';

// Public CORS-enabled KV sync endpoint for cross-device SAAS data persistence on GitHub Pages & Cloud Run
const CLOUD_SYNC_ENDPOINT = 'https://kvdb.io/goreview_saas_db_v2/master_payload';

export interface CloudPayload {
  users: BusinessUser[];
  adminPassword?: string;
  updatedAt: string;
}

export async function fetchFromCloud(): Promise<CloudPayload | null> {
  try {
    const res = await fetch(CLOUD_SYNC_ENDPOINT, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      // Endpoint might not exist yet or empty
      return null;
    }

    const data: CloudPayload = await res.json();
    if (data && Array.isArray(data.users) && data.users.length > 0) {
      return data;
    }
    return null;
  } catch (err) {
    console.warn('Cloud sync fetch warning (using local fallback):', err);
    return null;
  }
}

export async function pushToCloud(users: BusinessUser[], adminPassword?: string): Promise<boolean> {
  try {
    const payload: CloudPayload = {
      users,
      adminPassword: adminPassword || getAdminPassword(),
      updatedAt: new Date().toISOString()
    };

    const res = await fetch(CLOUD_SYNC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    return res.ok;
  } catch (err) {
    console.warn('Cloud sync push warning:', err);
    return false;
  }
}

/**
 * Perform bi-directional sync on app startup
 */
export async function syncOnStartup(): Promise<{ users: BusinessUser[]; updated: boolean }> {
  const localUsers = getStoredUsers();
  const cloudData = await fetchFromCloud();

  if (cloudData && cloudData.users && cloudData.users.length > 0) {
    // If cloud data exists, merge or apply cloud users
    saveUsers(cloudData.users);
    if (cloudData.adminPassword) {
      setAdminPassword(cloudData.adminPassword);
    }
    return { users: cloudData.users, updated: true };
  } else if (localUsers && localUsers.length > 0) {
    // Push initial local data to cloud so other devices can read it
    pushToCloud(localUsers, getAdminPassword());
  }

  return { users: localUsers, updated: false };
}
