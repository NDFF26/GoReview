import { BusinessUser, BusinessReviewDataMap } from '../types/user';
import {
  getStoredUsers,
  saveUsers,
  getAdminPassword,
  setAdminPassword,
  getDeletedUsernames,
  addDeletedUsername
} from './storage';
import { getStoredReviewDataMap, saveReviewDataMap } from './reviewData';
import { fetchFromFirestore, pushToFirestore, wipeFirestore } from './firebaseSync';

const PRIMARY_SYNC_API = '/api/sync';

export interface CloudPayload {
  users: BusinessUser[];
  deletedUsernames?: string[];
  reviewDataMap?: BusinessReviewDataMap;
  adminPassword?: string;
  updatedAt: string;
}

export function mergeUserLists(
  localUsers: BusinessUser[],
  cloudUsers: BusinessUser[],
  deletedUsernames: string[] = []
): BusinessUser[] {
  // Collect active identifiers from local and cloud users
  const activeIdentifiers = new Set<string>();
  if (Array.isArray(localUsers)) {
    localUsers.forEach((u) => {
      if (u) {
        if (u.id) activeIdentifiers.add(String(u.id).trim().toLowerCase());
        if (u.username) activeIdentifiers.add(String(u.username).trim().toLowerCase());
      }
    });
  }
  if (Array.isArray(cloudUsers)) {
    cloudUsers.forEach((u) => {
      if (u) {
        if (u.id) activeIdentifiers.add(String(u.id).trim().toLowerCase());
        if (u.username) activeIdentifiers.add(String(u.username).trim().toLowerCase());
      }
    });
  }

  // Ensure deleted set does NOT contain any username/ID that exists in active local/cloud lists
  const deletedSet = new Set(
    deletedUsernames
      .map((d) => String(d).trim().toLowerCase())
      .filter((d) => !activeIdentifiers.has(d))
  );

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
      if (deletedSet.has(uName) && deletedSet.has(uId)) {
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

export function mergeReviewDataMaps(
  localMap: BusinessReviewDataMap = {},
  cloudMap: BusinessReviewDataMap = {},
  deletedUsernames: string[] = []
): BusinessReviewDataMap {
  const deletedSet = new Set(deletedUsernames.map((d) => String(d).trim().toLowerCase()));
  const resultMap: BusinessReviewDataMap = { ...localMap, ...cloudMap };

  const allKeys = new Set([...Object.keys(localMap || {}), ...Object.keys(cloudMap || {})]);
  for (const key of allKeys) {
    const kLower = key.toLowerCase();
    if (deletedSet.has(kLower)) {
      delete resultMap[key];
      delete resultMap[kLower];
      continue;
    }

    const localEntry = localMap[key] || localMap[kLower];
    const cloudEntry = cloudMap[key] || cloudMap[kLower];

    if (localEntry && cloudEntry) {
      resultMap[key] = {
        businessName: cloudEntry.businessName || localEntry.businessName || '',
        topics: Array.isArray(cloudEntry.topics) ? cloudEntry.topics : (Array.isArray(localEntry.topics) ? localEntry.topics : []),
        languages: Array.isArray(cloudEntry.languages) ? cloudEntry.languages : (Array.isArray(localEntry.languages) ? localEntry.languages : ['English', 'Gujarati', 'Hindi']),
        reviews: { ...(localEntry.reviews || {}), ...(cloudEntry.reviews || {}) }
      };
    } else if (cloudEntry) {
      resultMap[key] = cloudEntry;
    } else if (localEntry) {
      resultMap[key] = localEntry;
    }
  }

  // Remove deleted keys
  for (const d of deletedSet) {
    delete resultMap[d];
  }

  return resultMap;
}

export async function fetchFromCloud(): Promise<CloudPayload | null> {
  // 1. Try Firebase Firestore first for real-time multi-device cloud database
  try {
    const fsData = await fetchFromFirestore();
    if (fsData && Array.isArray(fsData.users) && fsData.users.length > 0) {
      return {
        users: fsData.users,
        deletedUsernames: fsData.deletedUsernames,
        reviewDataMap: fsData.reviewDataMap,
        updatedAt: new Date().toISOString()
      };
    }
  } catch (e) {
    // Firestore fetch error ignored
  }

  // 2. Try primary Express API sync route next
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
    // API endpoint unavailable
  }

  return null;
}

export async function pushToCloud(
  users: BusinessUser[],
  adminPassword?: string,
  deletedUsernames?: string[],
  reviewDataMap?: BusinessReviewDataMap
): Promise<boolean> {
  const deleted = deletedUsernames || getDeletedUsernames();
  const currentReviewMap = reviewDataMap || getStoredReviewDataMap();

  const payload: CloudPayload = {
    users,
    deletedUsernames: deleted,
    reviewDataMap: currentReviewMap,
    adminPassword: adminPassword || getAdminPassword(),
    updatedAt: new Date().toISOString()
  };

  let success = false;

  // 1. Push to Firebase Firestore
  try {
    const fsOk = await pushToFirestore(users, deleted, currentReviewMap);
    if (fsOk) success = true;
  } catch (e) {
    // Firebase Firestore push error ignored
  }

  // 2. Push to Express backend /api/sync if available
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

  return success;
}

export async function wipeCloudStore(adminPassword: string, deletedUsernames: string[]): Promise<boolean> {
  const payload: CloudPayload = {
    users: [],
    deletedUsernames,
    reviewDataMap: {},
    adminPassword,
    updatedAt: new Date().toISOString()
  };

  let success = false;

  // 1. Wipe Firebase Firestore
  try {
    const fsWipe = await wipeFirestore(deletedUsernames);
    if (fsWipe) success = true;
  } catch (e) {
    // Failed to wipe Firestore
  }

  // 2. Send clear to Express backend server
  try {
    const res = await fetch('/api/sync/clear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword, deletedUsernames, isWipe: true })
    });
    if (res.ok) success = true;
  } catch (e) {
    // Failed to clear Express sync API
  }

  return success;
}

/**
 * Perform bi-directional smart sync across mobile, laptop & GitHub Pages
 */
export async function syncOnStartup(): Promise<{ users: BusinessUser[]; updated: boolean }> {
  const localUsers = getStoredUsers();
  const localDeleted = getDeletedUsernames();
  const localReviewMap = getStoredReviewDataMap();
  const cloudData = await fetchFromCloud();

  if (cloudData && Array.isArray(cloudData.users)) {
    const cloudDeleted = cloudData.deletedUsernames || [];
    const combinedDeleted = Array.from(
      new Set([...localDeleted, ...cloudDeleted].map((s) => String(s).trim().toLowerCase()))
    );

    // Save combined deleted list locally
    combinedDeleted.forEach((d) => addDeletedUsername(d));

    const mergedUsers = mergeUserLists(localUsers, cloudData.users, combinedDeleted);

    // Save merged users locally skipping cloud push to avoid duplicate push loop
    saveUsers(mergedUsers, true);

    // Merge reviewDataMap
    const cloudReviewMap = cloudData.reviewDataMap || {};
    const mergedReviewMap = mergeReviewDataMaps(localReviewMap, cloudReviewMap, combinedDeleted);

    // Ensure all merged users have their topics and languages populated in reviewMap
    mergedUsers.forEach((u) => {
      if (u && u.username) {
        const uName = String(u.username).trim().toLowerCase();
        mergedReviewMap[uName] = {
          businessName: u.businessName || '',
          topics: Array.isArray(u.topics) ? u.topics : [],
          languages: Array.isArray(u.languages) ? u.languages : ['English', 'Gujarati', 'Hindi'],
          reviews: mergedReviewMap[uName]?.reviews || {}
        };
      }
    });

    saveReviewDataMap(mergedReviewMap);

    if (cloudData.adminPassword) {
      setAdminPassword(cloudData.adminPassword);
    }

    return { users: mergedUsers, updated: true };
  } else if (localUsers && localUsers.length > 0) {
    pushToCloud(localUsers, getAdminPassword(), localDeleted, localReviewMap).catch(() => {});
  }

  return { users: localUsers, updated: false };
}


