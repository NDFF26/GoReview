import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { BusinessUser, BusinessReviewDataMap } from '../types/user';
import { saveUsers, getDeletedUsernames, addDeletedUsername } from './storage';
import { saveReviewDataMap, getStoredReviewDataMap } from './reviewData';

export async function fetchFromFirestore(): Promise<{
  users: BusinessUser[];
  deletedUsernames: string[];
  reviewDataMap: BusinessReviewDataMap;
} | null> {
  try {
    // 1. Fetch users collection
    const usersSnap = await getDocs(collection(db, 'users'));
    const users: BusinessUser[] = [];
    usersSnap.forEach((docSnap) => {
      if (docSnap.exists()) {
        users.push(docSnap.data() as BusinessUser);
      }
    });

    // 2. Fetch app_settings sync doc
    const settingsSnap = await getDocs(collection(db, 'app_settings'));
    let deletedUsernames: string[] = [];
    settingsSnap.forEach((docSnap) => {
      if (docSnap.id === 'sync' && docSnap.data().deletedUsernames) {
        deletedUsernames = docSnap.data().deletedUsernames;
      }
    });

    // 3. Fetch review_data collection
    const reviewSnap = await getDocs(collection(db, 'review_data'));
    const reviewDataMap: BusinessReviewDataMap = {};
    reviewSnap.forEach((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.username && data.data) {
          reviewDataMap[data.username.toLowerCase()] = data.data;
        }
      }
    });

    return { users, deletedUsernames, reviewDataMap };
  } catch (err) {
    console.warn('Firestore fetch warning:', err);
    return null;
  }
}

export async function pushToFirestore(
  users: BusinessUser[],
  deletedUsernames: string[] = [],
  reviewMap?: BusinessReviewDataMap
): Promise<boolean> {
  try {
    const batch = writeBatch(db);

    // 1. Write each active user
    for (const u of users) {
      if (u && (u.id || u.username)) {
        const docId = (u.id || u.username).toLowerCase();
        const userRef = doc(db, 'users', docId);
        batch.set(userRef, {
          ...u,
          updatedAt: u.updatedAt || new Date().toISOString()
        }, { merge: true });
      }
    }

    // 2. Write reviewDataMap
    const currentReviewMap = reviewMap || getStoredReviewDataMap();
    if (currentReviewMap) {
      Object.keys(currentReviewMap).forEach((username) => {
        const uName = username.toLowerCase();
        const revRef = doc(db, 'review_data', uName);
        batch.set(revRef, {
          username: uName,
          data: currentReviewMap[username],
          updatedAt: new Date().toISOString()
        }, { merge: true });
      });
    }

    // 3. Delete deleted users from Firestore
    for (const deleted of deletedUsernames) {
      if (deleted) {
        const dLower = deleted.toLowerCase();
        const userRef = doc(db, 'users', dLower);
        const revRef = doc(db, 'review_data', dLower);
        batch.delete(userRef);
        batch.delete(revRef);
      }
    }

    // 4. Save sync metadata
    const syncRef = doc(db, 'app_settings', 'sync');
    batch.set(syncRef, {
      deletedUsernames,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    await batch.commit();
    return true;
  } catch (err) {
    console.error('Failed to push to Firestore:', err);
    return false;
  }
}

export async function wipeFirestore(deletedUsernames: string[]): Promise<boolean> {
  try {
    // Fetch all current users and review documents to delete
    const usersSnap = await getDocs(collection(db, 'users'));
    const reviewSnap = await getDocs(collection(db, 'review_data'));

    const batch = writeBatch(db);

    usersSnap.forEach((d) => batch.delete(d.ref));
    reviewSnap.forEach((d) => batch.delete(d.ref));

    const syncRef = doc(db, 'app_settings', 'sync');
    batch.set(syncRef, {
      deletedUsernames,
      updatedAt: new Date().toISOString()
    });

    await batch.commit();
    return true;
  } catch (err) {
    console.error('Failed to wipe Firestore:', err);
    return false;
  }
}

/**
  Real-time Firestore listener setup across all connected clients (mobile, laptop, tabs)
 */
export function subscribeToFirestore(
  onUpdate: (data: { users: BusinessUser[]; reviewDataMap: BusinessReviewDataMap }) => void
): () => void {
  let activeUsersMap = new Map<string, BusinessUser>();
  let activeReviewMap: BusinessReviewDataMap = {};
  let deletedSet = new Set<string>();

  // Subscribe to app_settings sync doc for deleted usernames
  const unsubSettings = onSnapshot(doc(db, 'app_settings', 'sync'), (docSnap) => {
    if (docSnap.exists() && docSnap.data()?.deletedUsernames) {
      const deletedList: string[] = docSnap.data().deletedUsernames;
      deletedSet = new Set(deletedList.map((d) => d.toLowerCase()));
      deletedList.forEach((d) => addDeletedUsername(d));
    }
  });

  // Subscribe to users collection
  const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
    const updatedUsers: BusinessUser[] = [];
    snapshot.forEach((docSnap) => {
      if (docSnap.exists()) {
        const u = docSnap.data() as BusinessUser;
        const uId = (u.id || '').toLowerCase();
        const uName = (u.username || '').toLowerCase();
        if (!deletedSet.has(uId) && !deletedSet.has(uName)) {
          updatedUsers.push(u);
        }
      }
    });

    activeUsersMap.clear();
    updatedUsers.forEach((u) => {
      const key = (u.username || u.id).toLowerCase();
      activeUsersMap.set(key, u);
    });

    const userList = Array.from(activeUsersMap.values());
    saveUsers(userList);
    onUpdate({ users: userList, reviewDataMap: activeReviewMap });
  });

  // Subscribe to review_data collection
  const unsubReview = onSnapshot(collection(db, 'review_data'), (snapshot) => {
    snapshot.forEach((docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d && d.username && d.data) {
          const uName = d.username.toLowerCase();
          if (!deletedSet.has(uName)) {
            activeReviewMap[uName] = d.data;
          }
        }
      }
    });

    saveReviewDataMap(activeReviewMap);
    const userList = Array.from(activeUsersMap.values());
    if (userList.length > 0) {
      onUpdate({ users: userList, reviewDataMap: activeReviewMap });
    }
  });

  return () => {
    unsubSettings();
    unsubUsers();
    unsubReview();
  };
}
