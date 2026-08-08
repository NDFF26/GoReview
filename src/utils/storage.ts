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
      const initialFiltered = INITIAL_USERS.filter(
        (u) => !deleted.includes(u.username.toLowerCase()) && !deleted.includes(u.id.toLowerCase())
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialFiltered));
      return initialFiltered;
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
    const initialFiltered = INITIAL_USERS.filter(
      (u) => !deleted.includes(u.username.toLowerCase()) && !deleted.includes(u.id.toLowerCase())
    );
    return initialFiltered;
  } catch (err) {
    console.error('Error reading stored users:', err);
    return INITIAL_USERS;
  }
}

export function saveUsers(users: BusinessUser[]): void {
  try {
    const deleted = getDeletedUsernames();
    const cleanUsers = users.filter(
      (u) =>
        u &&
        u.username &&
        !deleted.includes(String(u.username).toLowerCase()) &&
        !deleted.includes(String(u.id).toLowerCase())
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanUsers));

    // Also sync review topics map for each user into reviewDataMap
    const reviewMap = getStoredReviewDataMap();
    cleanUsers.forEach((u) => {
      if (u && u.username) {
        const uName = String(u.username).trim().toLowerCase();
        reviewMap[uName] = {
          businessName: u.businessName || '',
          topics: u.topics || [],
          languages: u.languages || ['English', 'Gujarati', 'Hindi'],
          reviews: reviewMap[uName]?.reviews || {}
        };
      }
    });
    saveReviewDataMap(reviewMap);

    // Asynchronously push to cloud sync server for cross-device synchronization
    pushToCloud(cleanUsers, getAdminPassword(), deleted, reviewMap).catch(() => {});
  } catch (err) {
    console.error('Error saving users to storage:', err);
  }
}

export function getUserByUsername(username: string): BusinessUser | undefined {
  const users = getStoredUsers();
  const clean = username.trim().toLowerCase();
  let found = users.find((u) => u.username.toLowerCase() === clean);

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
  const users = getStoredUsers();
  const cleanUsername = user.username.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '');
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
  saveUsers(INITIAL_USERS);
  return INITIAL_USERS;
}

export function incrementUserStat(username: string, statType: 'pageViews' | 'reviewClicks' | 'contactClicks'): void {
  const users = getStoredUsers();
  const clean = username.trim().toLowerCase();
  const user = users.find((u) => u.username.toLowerCase() === clean);
  if (user) {
    user[statType] = (user[statType] || 0) + 1;
    saveUsers(users);
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

export function wipeAllDataAndDatabase(password: string): { success: boolean; message: string } {
  if (!checkAdminPassword(password)) {
    return { success: false, message: 'Incorrect Admin Password! Wipe operation cancelled.' };
  }

  // 1. Gather all existing usernames to place on deleted list
  const currentUsers = getStoredUsers();
  const allUsernames = new Set<string>();

  currentUsers.forEach((u) => {
    if (u.id) allUsernames.add(u.id.toLowerCase());
    if (u.username) allUsernames.add(u.username.toLowerCase());
  });

  INITIAL_USERS.forEach((u) => {
    if (u.id) allUsernames.add(u.id.toLowerCase());
    if (u.username) allUsernames.add(u.username.toLowerCase());
  });

  try {
    const reviewMap = getStoredReviewDataMap();
    Object.keys(reviewMap).forEach((k) => allUsernames.add(k.toLowerCase()));
  } catch (e) {
    // Ignore map read errors
  }

  const deletedList = Array.from(allUsernames);

  // 2. Clear Local Storage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(DELETED_USERNAMES_KEY, JSON.stringify(deletedList));
  } catch (e) {
    console.error('Error clearing local storage users:', e);
  }

  // 3. Clear review data map in local storage
  clearStoredReviewDataMap();

  // 4. Wipe cloud store & database
  wipeCloudStore(getAdminPassword(), deletedList).catch((err) =>
    console.error('Failed to wipe cloud store:', err)
  );

  return { success: true, message: 'All users and database data cleared successfully!' };
}

