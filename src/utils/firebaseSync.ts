import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { BusinessUser, BusinessReviewDataMap } from '../types/user';
import { saveUsers, addDeletedUsername } from './storage';
import { saveReviewDataMap, getStoredReviewDataMap } from './reviewData';

let isFirestoreQuotaExhausted = false;

export async function fetchFromFirestore(): Promise<{
  users: BusinessUser[];
  deletedUsernames: string[];
  reviewDataMap: BusinessReviewDataMap;
} | null> {
  if (isFirestoreQuotaExhausted) return null;

  try {
    // 1. Try reading single consolidated global_payload doc first
    const globalSnap = await getDocs(collection(db, 'app_settings'));
    let payloadDoc: any = null;
    globalSnap.forEach((d) => {
      if (d.id === 'global_payload') payloadDoc = d.data();
    });

    if (payloadDoc && Array.isArray(payloadDoc.users)) {
      return {
        users: payloadDoc.users,
        deletedUsernames: Array.isArray(payloadDoc.deletedUsernames) ? payloadDoc.deletedUsernames : [],
        reviewDataMap: payloadDoc.reviewDataMap || {}
      };
    }

    // 2. Fallback: Fetch users collection
    const usersSnap = await getDocs(collection(db, 'users'));
    const users: BusinessUser[] = [];
    usersSnap.forEach((docSnap) => {
      if (docSnap.exists()) {
        users.push(docSnap.data() as BusinessUser);
      }
    });

    // 3. Fetch app_settings sync doc
    let deletedUsernames: string[] = [];
    globalSnap.forEach((docSnap) => {
      if (docSnap.id === 'sync' && docSnap.data().deletedUsernames) {
        deletedUsernames = docSnap.data().deletedUsernames;
      }
    });

    // 4. Fetch review_data collection
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
  } catch (err: any) {
    if (err?.code === 'resource-exhausted' || String(err).includes('Quota limit exceeded')) {
      isFirestoreQuotaExhausted = true;
    }
    console.warn('Firestore fetch notice:', err?.message || err);
    return null;
  }
}

export async function pushToFirestore(
  users: BusinessUser[],
  deletedUsernames: string[] = [],
  reviewMap?: BusinessReviewDataMap
): Promise<boolean> {
  if (isFirestoreQuotaExhausted) {
    return false;
  }

  try {
    const currentReviewMap = reviewMap || getStoredReviewDataMap();
    const batch = writeBatch(db);

    // Consolidated single payload doc (1 write unit instead of dozens)
    const globalRef = doc(db, 'app_settings', 'global_payload');
    batch.set(globalRef, {
      users,
      deletedUsernames,
      reviewDataMap: currentReviewMap,
      updatedAt: new Date().toISOString()
    });

    const syncRef = doc(db, 'app_settings', 'sync');
    batch.set(syncRef, {
      deletedUsernames,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    await batch.commit();
    return true;
  } catch (err: any) {
    if (err?.code === 'resource-exhausted' || String(err).includes('Quota limit exceeded')) {
      isFirestoreQuotaExhausted = true;
      console.warn('Firestore write quota reached; seamlessly using backend API sync.');
    } else {
      console.warn('Firestore push notice:', err?.message || err);
    }
    return false;
  }
}

export async function wipeFirestore(deletedUsernames: string[]): Promise<boolean> {
  if (isFirestoreQuotaExhausted) return false;

  try {
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

    const globalRef = doc(db, 'app_settings', 'global_payload');
    batch.set(globalRef, {
      users: [],
      deletedUsernames,
      reviewDataMap: {},
      updatedAt: new Date().toISOString()
    });

    await batch.commit();
    return true;
  } catch (err: any) {
    if (err?.code === 'resource-exhausted' || String(err).includes('Quota limit exceeded')) {
      isFirestoreQuotaExhausted = true;
    }
    console.warn('Firestore wipe notice:', err?.message || err);
    return false;
  }
}

/**
  Real-time Firestore listener setup across all connected clients
 */
export function subscribeToFirestore(
  onUpdate: (data: { users: BusinessUser[]; reviewDataMap: BusinessReviewDataMap }) => void
): () => void {
  if (isFirestoreQuotaExhausted) return () => {};

  let activeUsersMap = new Map<string, BusinessUser>();
  let activeReviewMap: BusinessReviewDataMap = {};
  let deletedSet = new Set<string>();

  // Subscribe to app_settings sync doc for deleted usernames & global payload
  const unsubSettings = onSnapshot(
    doc(db, 'app_settings', 'sync'),
    (docSnap) => {
      if (docSnap.exists() && docSnap.data()?.deletedUsernames) {
        const deletedList: string[] = docSnap.data().deletedUsernames;
        deletedSet = new Set(deletedList.map((d) => d.toLowerCase()));
        deletedList.forEach((d) => addDeletedUsername(d));
      }
    },
    (err) => {
      if (err?.code === 'resource-exhausted' || String(err).includes('Quota limit exceeded')) {
        isFirestoreQuotaExhausted = true;
      }
      console.warn('Firestore sync settings warning:', err?.message || err);
    }
  );

  // Subscribe to users collection
  const unsubUsers = onSnapshot(
    collection(db, 'users'),
    (snapshot) => {
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
      saveUsers(userList, true);
      onUpdate({ users: userList, reviewDataMap: activeReviewMap });
    },
    (err) => {
      if (err?.code === 'resource-exhausted' || String(err).includes('Quota limit exceeded')) {
        isFirestoreQuotaExhausted = true;
      }
      console.warn('Firestore users sync warning:', err?.message || err);
    }
  );

  // Subscribe to review_data collection
  const unsubReview = onSnapshot(
    collection(db, 'review_data'),
    (snapshot) => {
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
    },
    (err) => {
      if (err?.code === 'resource-exhausted' || String(err).includes('Quota limit exceeded')) {
        isFirestoreQuotaExhausted = true;
      }
      console.warn('Firestore review data sync warning:', err?.message || err);
    }
  );

  return () => {
    unsubSettings();
    unsubUsers();
    unsubReview();
  };
}
