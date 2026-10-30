import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  deleteUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';

import { getStorage } from 'firebase/storage';
import { 
  getDatabase, 
  ref as rtdbRef, 
  set as rtdbSet, 
  onValue as rtdbOnValue, 
  onDisconnect as rtdbOnDisconnect, 
  serverTimestamp as rtdbServerTimestamp 
} from 'firebase/database';
import { 
  getMessaging, 
  getToken as getFcmToken, 
  onMessage as onFcmMessage, 
  isSupported as isMessagingSupported 
} from 'firebase/messaging';

import { ENV } from '../config/env';

// Firebase Configuration (loaded securely from centralized config)
const firebaseConfig = {
  apiKey: ENV.FIREBASE.API_KEY,
  authDomain: ENV.FIREBASE.AUTH_DOMAIN,
  projectId: ENV.FIREBASE.PROJECT_ID,
  storageBucket: ENV.FIREBASE.STORAGE_BUCKET,
  messagingSenderId: ENV.FIREBASE.MESSAGING_SENDER_ID,
  appId: ENV.FIREBASE.APP_ID,
  measurementId: ENV.FIREBASE.MEASUREMENT_ID
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Safe Realtime Database initialization
let rtdbInstance = null;
try {
  rtdbInstance = getDatabase(app);
} catch (e) {
  console.warn('Firebase Realtime Database notice:', e);
}
export const rtdb = rtdbInstance;

// ── 1. Firebase Auth Helpers ──────────────────────────────

/**
 * Setup invisible reCAPTCHA for Phone Auth OTP
 */
export function setupRecaptcha(containerId = 'recaptcha-container') {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: (response) => {
        console.log('Recaptcha verified for Phone Auth:', response);
      }
    });
  }
  return window.recaptchaVerifier;
}

/**
 * Send Phone OTP via Firebase Auth
 */
export async function sendPhoneOtpFirebase(phoneNumber) {
  try {
    const verifier = setupRecaptcha();
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
    window.confirmationResult = confirmationResult;
    return { success: true, confirmationResult };
  } catch (error) {
    console.warn('Firebase Phone Auth notice (using API bridge fallback):', error);
    return { success: false, error: error.message };
  }
}

/**
 * Confirm Phone OTP via Firebase Auth
 */
export async function verifyPhoneOtpFirebase(otpCode) {
  try {
    if (!window.confirmationResult) {
      throw new Error('No OTP request found. Please request OTP first.');
    }
    const result = await window.confirmationResult.confirm(otpCode);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ── 2. Firestore Database Operations ─────────────────────

// User Profile Operations
export async function saveUserProfileFirestore(userId, userData) {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { success: true };
  } catch (err) {
    console.error('Error saving user profile to Firestore:', err);
    return { success: false, error: err.message };
  }
}

export async function getUserProfileFirestore(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
      return { success: true, data: snapshot.data() };
    }
    return { success: false, error: 'User not found' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Venues Operations
export async function fetchVenuesFirestore(filters = {}) {
  try {
    const venuesRef = collection(db, 'venues');
    let q = query(venuesRef);
    
    if (filters.ownerId) {
      q = query(venuesRef, where('owner_id', '==', filters.ownerId));
    }
    
    const snapshot = await getDocs(q);
    const venues = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return venues;
  } catch (err) {
    console.warn('Firestore fetchVenues warning (falling back to REST API):', err);
    return null;
  }
}

export async function createVenueFirestore(venueData) {
  try {
    const venuesRef = collection(db, 'venues');
    const docRef = await addDoc(venuesRef, {
      ...venueData,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (err) {
    console.error('Firestore createVenue error:', err);
    return { success: false, error: err.message };
  }
}

// Bookings Operations
export async function createBookingFirestore(bookingData) {
  try {
    const bookingsRef = collection(db, 'bookings');
    const docRef = await addDoc(bookingsRef, {
      ...bookingData,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (err) {
    console.error('Firestore createBooking error:', err);
    return { success: false, error: err.message };
  }
}

// Real-time Community Messages (Cross-device instant sync)
export function subscribeToMessagesFirestore(chatId, onUpdate) {
  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      onUpdate(msgs);
    });
  } catch (err) {
    console.warn('Firestore real-time subscription notice:', err);
    return () => {};
  }
}

export async function sendMessageFirestore(chatId, messageData) {
  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const docRef = await addDoc(messagesRef, {
      ...messageData,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (err) {
    console.error('Firestore sendMessage error:', err);
    return { success: false, error: err.message };
  }
}

// Clubs Operations
export async function createClubFirestore(clubData) {
  try {
    const clubsRef = collection(db, 'clubs');
    const docRef = await addDoc(clubsRef, {
      ...clubData,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (err) {
    console.error('Firestore createClub error:', err);
    return { success: false, error: err.message };
  }
}

export async function fetchClubsFirestore() {
  try {
    const clubsRef = collection(db, 'clubs');
    const q = query(clubsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Firestore fetchClubs error:', err);
    return [];
  }
}

// Stories Operations
export async function createStoryFirestore(storyData) {
  try {
    const storiesRef = collection(db, 'stories');
    const docRef = await addDoc(storiesRef, {
      ...storyData,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (err) {
    console.error('Firestore createStory error:', err);
    return { success: false, error: err.message };
  }
}

export async function fetchStoriesFirestore() {
  try {
    const storiesRef = collection(db, 'stories');
    const q = query(storiesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Firestore fetchStories error:', err);
    return [];
  }
}

// ── 3. Realtime Database Presence & Online Status ─────────

/**
 * Update user online presence using Firebase Realtime Database
 */
export function updateUserOnlinePresenceRTDB(userId, userName = 'Athlete') {
  if (!rtdb || !userId) return () => {};
  try {
    const userStatusRef = rtdbRef(rtdb, `/status/${userId}`);
    const connectedRef = rtdbRef(rtdb, '.info/connected');

    return rtdbOnValue(connectedRef, (snap) => {
      if (snap.val() === false) return;
      rtdbOnDisconnect(userStatusRef)
        .set({
          state: 'offline',
          last_changed: rtdbServerTimestamp()
        })
        .then(() => {
          rtdbSet(userStatusRef, {
            state: 'online',
            name: userName,
            last_changed: rtdbServerTimestamp()
          });
        })
        .catch(() => {});
    });
  } catch (e) {
    return () => {};
  }
}

/**
 * Subscribe to online presence for a specific user via RTDB
 */
export function subscribeToUserPresenceRTDB(userId, callback) {
  if (!rtdb || !userId) return () => {};
  try {
    const userStatusRef = rtdbRef(rtdb, `/status/${userId}`);
    return rtdbOnValue(userStatusRef, (snapshot) => {
      const data = snapshot.val();
      if (callback) callback(data ? data.state === 'online' : false);
    });
  } catch (e) {
    return () => {};
  }
}

// ── 4. Push Notifications via Firebase Cloud Messaging ─────

/**
 * Request notification permissions and register for FCM push notifications
 */
export async function setupPushNotifications(onNotificationReceived) {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { success: false, reason: 'Notifications not supported' };
    }

    const isFCMSupported = await isMessagingSupported().catch(() => false);
    if (!isFCMSupported) {
      // Browser notification fallback
      const perm = await Notification.requestPermission();
      return { success: perm === 'granted', token: null, isFallback: true };
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, reason: 'Permission denied' };
    }

    const messaging = getMessaging(app);
    let token = null;
    try {
      token = await getFcmToken(messaging, {
        vapidKey: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuYKrVBs4hNI9N0QCfuE86gODQ'
      }).catch(() => null);
    } catch (e) {}

    onFcmMessage(messaging, (payload) => {
      if (onNotificationReceived) {
        onNotificationReceived(payload);
      }
    });

    return { success: true, token };
  } catch (err) {
    console.warn('Push notification setup notice:', err);
    return { success: false, error: err.message };
  }
}

export default app;

