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
import { auth } from './firebase';
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { disconnect } = useGoogleCalendar();

  // Check if user is authenticated on load - Firebase only
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
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
      console.log('Logged out from Firebase successfully');
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
