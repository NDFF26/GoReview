import { BusinessUser } from '../types/user';
import { INITIAL_USERS } from '../data/defaultUsers';
import { getStoredReviewDataMap, saveReviewDataMap } from './reviewData';
import { decodeUserParam } from './urlUtils';
import { pushToCloud } from './cloudSync';

const STORAGE_KEY = 'goreview_business_users_v1';

export function getStoredUsers(): BusinessUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_USERS;
  } catch (err) {
    console.error('Error reading stored users:', err);
    return INITIAL_USERS;
  }
}

export function saveUsers(users: BusinessUser[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    // Asynchronously push to cloud sync server for cross-device synchronization
    pushToCloud(users, getAdminPassword()).catch(() => {});
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
  
  // Find target user to clean up review data map
  const targetUser = users.find((u) => {
    const cleanId = String(u.id).trim().toLowerCase();
    const cleanUsername = String(u.username).trim().toLowerCase();
    return cleanId === targetStr || cleanUsername === targetStr;
  });

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
  
  const updated = users.map((u) => {
    const cleanId = String(u.id).trim().toLowerCase();
    const cleanUsername = String(u.username).trim().toLowerCase();
    if (cleanId === targetStr || cleanUsername === targetStr) {
      return { ...u, isDisabled: !u.isDisabled, updatedAt: new Date().toISOString() };
    }
    return u;
  });

  saveUsers(updated);
  return updated;
}

export function resetToDefaults(): BusinessUser[] {
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

