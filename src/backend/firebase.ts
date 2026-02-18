import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Analytics can fail to initialize when offline or in unsupported environments.
// Guard the call so we don't throw a runtime error in development / offline usage.
let analytics: any;
if (
  typeof window !== 'undefined' &&
  typeof navigator !== 'undefined' &&
  navigator.onLine &&
  !!firebaseConfig.measurementId
) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    // Swallow analytics initialization errors so the app can keep running.
    // eslint-disable-next-line no-console
    console.warn('Firebase analytics could not be initialized:', error);
  }
}

const db = getFirestore(app);

export const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const googleProvider = new GoogleAuthProvider();

export { auth, db, analytics, googleProvider };
