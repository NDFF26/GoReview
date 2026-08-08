import { BusinessUser } from '../types/user';
import { INITIAL_USERS } from '../data/defaultUsers';
import { getStoredReviewDataMap, saveReviewDataMap, clearStoredReviewDataMap } from './reviewData';
import { decodeUserParam } from './urlUtils';
import { pushToCloud, mergeUserLists, wipeCloudStore } from './cloudSync';

const STORAGE_KEY = 'goreview_business_users_v1';
const DELETED_USERNAMES_KEY = 'goreview_deleted_usernames_v1';

export function getDeletedUsernames(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_USERNAMES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function addDeletedUsername(nameOrId: string): void {
  try {
    const clean = String(nameOrId).trim().toLowerCase();
    if (!clean) return;
    const current = getDeletedUsernames();
    if (!current.includes(clean)) {
      current.push(clean);
      localStorage.setItem(DELETED_USERNAMES_KEY, JSON.stringify(current));
    }
  } catch (e) {
    console.error('Error saving deleted username:', e);
  }
}

export function removeDeletedUsername(nameOrId: string): void {
  try {
    const clean = String(nameOrId).trim().toLowerCase();
    if (!clean) return;
    const current = getDeletedUsernames();
    if (current.includes(clean)) {
      const updated = current.filter((item) => item !== clean);
      localStorage.setItem(DELETED_USERNAMES_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.error('Error removing deleted username:', e);
  }
}

export function clearDeletedUsernames(): void {
  try {
    localStorage.removeItem(DELETED_USERNAMES_KEY);
  } catch (e) {
    console.error('Error clearing deleted usernames:', e);
  }
}

export function getStoredUsers(): BusinessUser[] {
  try {
    const deleted = getDeletedUsernames();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const filtered = parsed.filter(
        (u) =>
          u &&
          u.username &&
          !deleted.includes(String(u.username).toLowerCase()) &&
          !deleted.includes(String(u.id).toLowerCase())
      );
      return filtered;
    }
    return [];
  } catch (err) {
    console.error('Error reading stored users:', err);
    return [];
  }
}

export function saveUsers(users: BusinessUser[], skipCloudPush: boolean = false): void {
  try {
    // 1. Gather all active usernames/IDs from provided users array
    const activeIdentifiers = new Set<string>();
    users.forEach((u) => {
      if (u) {
        if (u.id) activeIdentifiers.add(String(u.id).trim().toLowerCase());
        if (u.username) activeIdentifiers.add(String(u.username).trim().toLowerCase());
      }
    });

    // 2. Remove any active user from deleted list so they are never filtered out
    const currentDeleted = getDeletedUsernames();
    const cleanDeleted = currentDeleted.filter((d) => !activeIdentifiers.has(d));
    localStorage.setItem(DELETED_USERNAMES_KEY, JSON.stringify(cleanDeleted));

    // 3. Save users
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));

    // 4. Also sync review topics map for each user into reviewDataMap
    const reviewMap = getStoredReviewDataMap();
    users.forEach((u) => {
      if (u && u.username) {
        const uName = String(u.username).trim().toLowerCase();
        reviewMap[uName] = {
          businessName: u.businessName || '',
          topics: Array.isArray(u.topics) ? u.topics : [],
          languages: Array.isArray(u.languages) ? u.languages : ['English', 'Gujarati', 'Hindi'],
          reviews: reviewMap[uName]?.reviews || {}
        };
      }
    });
    saveReviewDataMap(reviewMap);

    // 5. Asynchronously push to cloud sync server ONLY when not skipped (e.g. from local user edits)
    if (!skipCloudPush) {
      pushToCloud(users, getAdminPassword(), cleanDeleted, reviewMap).catch(() => {});
    }
  } catch (err) {
    console.error('Error saving users to storage:', err);
  }
}

export function getUserByUsername(username: string, userList?: BusinessUser[]): BusinessUser | undefined {
  const users = userList && userList.length > 0 ? userList : getStoredUsers();
  const clean = username.trim().toLowerCase();
  let found = users.find((u) => u.username.toLowerCase() === clean || u.id.toLowerCase() === clean);

  if (!found && typeof window !== 'undefined') {
    try {
      const href = window.location.href;
      let paramVal = '';
      if (href.includes('?')) {
        const searchPart = href.split('?')[1];
        const params = new URLSearchParams(searchPart);
        paramVal = params.get('p') || params.get('data') || params.get('u') || '';
      }
      if (paramVal) {
        const decoded = decodeUserParam(paramVal);
        if (decoded && decoded.username && decoded.username.toLowerCase() === clean) {
          saveUser(decoded as BusinessUser);
          return decoded as BusinessUser;
        }
      }
    } catch (e) {
      console.error('Error auto-extracting user from URL parameter:', e);
    }
  }

  return found;
}

export function saveUser(user: BusinessUser): BusinessUser[] {
  if (user.id) removeDeletedUsername(user.id);
  if (user.username) removeDeletedUsername(user.username);

  const users = getStoredUsers();
  const cleanUsername = user.username.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '');
  
  if (cleanUsername) removeDeletedUsername(cleanUsername);

  const updatedUser: BusinessUser = {
    ...user,
    username: cleanUsername,
    updatedAt: new Date().toISOString()
  };

  const existingIndex = users.findIndex((u) => u.id === user.id || u.username.toLowerCase() === cleanUsername);
  
  let newUsers: BusinessUser[];
  if (existingIndex >= 0) {
    newUsers = [...users];
    newUsers[existingIndex] = updatedUser;
  } else {
    newUsers = [updatedUser, ...users];
  }

  saveUsers(newUsers);
  return newUsers;
}

export function deleteUser(userId: string): BusinessUser[] {
  const users = getStoredUsers();
  const targetStr = String(userId).trim().toLowerCase();
  
  // Find target user to clean up review data map and add to deleted list
  const targetUser = users.find((u) => {
    const cleanId = String(u.id).trim().toLowerCase();
    const cleanUsername = String(u.username).trim().toLowerCase();
    return cleanId === targetStr || cleanUsername === targetStr;
  });

  if (targetUser) {
    if (targetUser.id) addDeletedUsername(targetUser.id);
    if (targetUser.username) addDeletedUsername(targetUser.username);
  } else {
    addDeletedUsername(targetStr);
  }

  const filtered = users.filter((u) => {
    const cleanId = String(u.id).trim().toLowerCase();
    const cleanUsername = String(u.username).trim().toLowerCase();
    return cleanId !== targetStr && cleanUsername !== targetStr;
  });

  saveUsers(filtered);

  // Clean up review data map for deleted username
  if (targetUser && targetUser.username) {
    try {
      const reviewMap = getStoredReviewDataMap();
      const cleanUname = targetUser.username.toLowerCase();
      if (reviewMap[cleanUname]) {
        delete reviewMap[cleanUname];
        saveReviewDataMap(reviewMap);
      }
    } catch (e) {
      console.error('Failed to cleanup review map on user delete:', e);
    }
  }

  return filtered;
}

export function toggleDisableUser(userId: string): BusinessUser[] {
  const users = getStoredUsers();
  const targetStr = String(userId).trim().toLowerCase();
  const now = new Date().toISOString();
  
  const updated = users.map((u) => {
    const cleanId = String(u.id).trim().toLowerCase();
    const cleanUsername = String(u.username).trim().toLowerCase();
    if (cleanId === targetStr || cleanUsername === targetStr) {
      return { ...u, isDisabled: !u.isDisabled, updatedAt: now };
    }
    return u;
  });

  saveUsers(updated);
  return updated;
}

export function resetToDefaults(): BusinessUser[] {
  clearDeletedUsernames();
  saveUsers([]);
  return [];
}

export function incrementUserStat(username: string, statType: 'pageViews' | 'reviewClicks' | 'contactClicks'): void {
  const users = getStoredUsers();
  const clean = username.trim().toLowerCase();
  const user = users.find((u) => u.username.toLowerCase() === clean);
  if (user) {
    user[statType] = (user[statType] || 0) + 1;
    saveUsers(users, true);
  }
}

// Admin Password Management
const ADMIN_PASSWORD_KEY = 'goreview_admin_password_v1';
const DEFAULT_ADMIN_PASSWORD = 'admin';

export function getAdminPassword(): string {
  try {
    const pwd = localStorage.getItem(ADMIN_PASSWORD_KEY);
    return pwd || DEFAULT_ADMIN_PASSWORD;
  } catch (err) {
    return DEFAULT_ADMIN_PASSWORD;
  }
}

export function setAdminPassword(newPassword: string): void {
  try {
    const clean = newPassword.trim();
    localStorage.setItem(ADMIN_PASSWORD_KEY, clean);
    pushToCloud(getStoredUsers(), clean).catch(() => {});
  } catch (err) {
    console.error('Error saving admin password:', err);
  }
}

export function checkAdminPassword(input: string): boolean {
  const stored = getAdminPassword();
  const clean = input.trim();
  return clean === stored;
}

export function performFreshStart(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(DELETED_USERNAMES_KEY, JSON.stringify([]));
    clearStoredReviewDataMap();
    wipeCloudStore(getAdminPassword(), []).catch(() => {});
    localStorage.setItem('goreview_fresh_start_done_v2', 'true');
  } catch (e) {
    console.error('Error performing fresh start:', e);
  }
}

export function wipeAllDataAndDatabase(password: string): { success: boolean; message: string } {
  if (!checkAdminPassword(password)) {
    return { success: false, message: 'Incorrect Admin Password! Wipe operation cancelled.' };
  }

  performFreshStart();

  return { success: true, message: 'All users and Firebase database data cleared successfully!' };
}


