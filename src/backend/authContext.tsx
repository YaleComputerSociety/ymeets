import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useGoogleCalendar } from './useGoogleCalService';

// Split into two separate contexts - one for Firebase Auth, one for Google APIs
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: () => Promise<User>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Helper function to ensure user doc exists in Firestore
const ensureUserDocExists = async (user: User) => {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        email: user.email || '',
        name: user.displayName || '',
        selectedCalendarIDs: [user.email || ''],
        uid: user.uid,
        userEvents: [],
      });
      console.log('User document created for:', user.uid);
    }
  } catch (error) {
    console.error('Error ensuring user doc exists:', error);
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { disconnect } = useGoogleCalendar();

  // Check if user is authenticated on load - Firebase only
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Ensure user doc exists in Firestore (handles already logged-in users)
        await ensureUserDocExists(user);
      }
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Sign in with Google via Firebase
  const login = async (): Promise<User> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Ensure user doc exists in Firestore after login
      await ensureUserDocExists(result.user);
      
      return result.user;
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  // Sign out from Firebase
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      disconnect();
    } catch (error) {
      console.error('Error signing out from Firebase:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
