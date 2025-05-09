import {
  FC,
  ReactNode,
  createContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { SCOPES, auth } from './firebase';
import { loadAuth2, loadGapiInsideDOM } from 'gapi-script';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

interface GAPIContextType {
  gapi: typeof globalThis.gapi | null;
  setGapi: React.Dispatch<React.SetStateAction<typeof globalThis.gapi | null>>;
  authInstance: gapi.auth2.GoogleAuthBase | null;
  setAuthInstance: React.Dispatch<
    React.SetStateAction<gapi.auth2.GoogleAuthBase | null>
  >;
  GAPILoading: boolean;
  setGAPILoading: React.Dispatch<React.SetStateAction<boolean>>;
  handleIsSignedIn: (isSignedIn: boolean) => void;
  isGapiInitialized: boolean;
  initializeGapi: () => Promise<void>;
  gapiError: Error | null;
}

export const GAPIContext = createContext<GAPIContextType>({
  gapi: null,
  setGapi: () => {},
  authInstance: null,
  setAuthInstance: () => {},
  GAPILoading: true,
  setGAPILoading: () => {},
  handleIsSignedIn: () => {},
  isGapiInitialized: false,
  initializeGapi: async () => {},
  gapiError: null,
});

const GAPI_CLIENT_NAME = 'client:auth2';

export const GAPIContextWrapper: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [gapi, setGapi] = useState<typeof globalThis.gapi | null>(null);
  const [authInstance, setAuthInstance] =
    useState<gapi.auth2.GoogleAuthBase | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGapiInitialized, setIsGapiInitialized] = useState(false);
  const [gapiError, setGapiError] = useState<Error | null>(null);

  // Load gapi client after gapi script loaded
  const loadGapiClient = async (
    gapiInstance: typeof globalThis.gapi
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      gapiInstance.load(GAPI_CLIENT_NAME, async () => {
        try {
          // Initialize the client with your API key and client ID
          await gapiInstance.client.init({
            apiKey: process.env.REACT_APP_API_KEY_GAPI,
            clientId: process.env.REACT_APP_CLIENT_ID_GAPI,
            scope: SCOPES,
            discoveryDocs: [
              'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
            ],
          });

          // Load the calendar API specifically
          await new Promise<void>((resolveCalendar) => {
            gapiInstance.client.load('calendar', 'v3', () => {
              console.log('Calendar API loaded successfully');
              resolveCalendar();
            });
          });

          setIsGapiInitialized(true);
          resolve();
        } catch (error) {
          console.error('Error initializing gapi client:', error);
          setGapiError(
            error instanceof Error ? error : new Error(String(error))
          );
          reject(error);
        }
      });
    });
  };

  // Initialize GAPI function that can be called from components
  const initializeGapi = useCallback(async () => {
    setLoading(true);
    setGapiError(null);

    try {
      console.log('Loading new GAPI instance');
      const newGapi = await loadGapiInsideDOM();
      await loadGapiClient(newGapi);

      const newAuth2 = await loadAuth2(
        newGapi,
        process.env.REACT_APP_CLIENT_ID_GAPI || '',
        SCOPES
      );

      setGapi(newGapi);
      setAuthInstance(newAuth2);
      setIsGapiInitialized(true);
    } catch (err) {
      console.error('Error initializing Google Calendar API: ', err);
      setGapiError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load of GAPI
  useEffect(() => {
    initializeGapi();

    // Add event listener for when page becomes visible again (tab switch, etc.)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isGapiInitialized) {
        console.log('Page became visible, checking GAPI status');
        initializeGapi();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [initializeGapi, isGapiInitialized]);

  const handleIsSignedIn = useCallback((isSignedIn: boolean) => {
    // Handle sign-in state changes
    console.log('Sign-in state changed:', isSignedIn);
    return isSignedIn;

    // Uncomment to enable Firebase integration
    /*
    if (isSignedIn && gapi) {
      const auth2 = gapi.auth2.getAuthInstance();
      const currentUser = auth2.currentUser.get();
      const authResponse = currentUser.getAuthResponse(true);
      const credential = GoogleAuthProvider.credential(
        authResponse.id_token,
        authResponse.access_token
      );
      signInWithCredential(auth, credential)
        .then(({ user }) => {
          console.log('User signed in to Firebase:', user);
        })
        .catch((error) => {
          console.error('Firebase: error signing in!', error);
        });
    }
    */
  }, []);

  // Set up sign-in listener once gapi is loaded
  useEffect(() => {
    if (!gapi || !isGapiInitialized) {
      return;
    }

    try {
      const auth2 = gapi.auth2.getAuthInstance();
      auth2.isSignedIn.listen(handleIsSignedIn);
      handleIsSignedIn(auth2.isSignedIn.get());
    } catch (err) {
      console.error('Error setting up sign-in listener:', err);
    }
  }, [gapi, isGapiInitialized, handleIsSignedIn]);

  return (
    <GAPIContext.Provider
      value={{
        gapi,
        setGapi,
        authInstance,
        setAuthInstance,
        GAPILoading: loading,
        setGAPILoading: setLoading,
        handleIsSignedIn,
        isGapiInitialized,
        initializeGapi,
        gapiError,
      }}
    >
      {children}
    </GAPIContext.Provider>
  );
};

// Add this type to the global Window interface
declare global {
  interface Window {
    gapi: typeof globalThis.gapi;
  }
}
