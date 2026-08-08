import { BusinessUser } from '../types/user';
import { INITIAL_USERS } from '../data/defaultUsers';

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
  } catch (err) {
    console.error('Error saving users to storage:', err);
  }
}

export function getUserByUsername(username: string): BusinessUser | undefined {
  const users = getStoredUsers();
  const clean = username.trim().toLowerCase();
  return users.find((u) => u.username.toLowerCase() === clean);
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
  
  const filtered = users.filter((u) => {
    const cleanId = String(u.id).trim().toLowerCase();
    const cleanUsername = String(u.username).trim().toLowerCase();
    return cleanId !== targetStr && cleanUsername !== targetStr;
  });

  saveUsers(filtered);
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
