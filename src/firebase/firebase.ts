import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBXVTeKhSvRq-6x5XeQKh9DVTYW8twa6nQ',
  authDomain: 'ymeets.com',
  projectId: 'studybuddy-392c7',
  storageBucket: 'studybuddy-392c7.appspot.com',
  messagingSenderId: '83459975838',
  appId: '1:83459975838:web:e638e85d7ad6594cfae98f',
  measurementId: 'G-YHLEEL521E'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

const analytics = getAnalytics(app)
const db = getFirestore(app)

export const SCOPES = 'https://www.googleapis.com/auth/calendar';
const googleProvider = new GoogleAuthProvider();

export {
  auth,
  db,
  analytics,
  googleProvider
}
