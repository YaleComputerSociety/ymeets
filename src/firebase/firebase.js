import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBXVTeKhSvRq-6x5XeQKh9DVTYW8twa6nQ",
  authDomain: "studybuddy-392c7.firebaseapp.com",
  projectId: "studybuddy-392c7",
  storageBucket: "studybuddy-392c7.appspot.com",
  messagingSenderId: "83459975838",
  appId: "1:83459975838:web:e638e85d7ad6594cfae98f",
  measurementId: "G-YHLEEL521E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = app.auth();
const db = app.firestore();

const googleProvider = new firebase.auth.GoogleAuthProvider();

export {
    auth,
    db,
    analytics,
    googleProvider,
};
