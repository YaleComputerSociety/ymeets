// import {
//   FC,
//   ReactNode,
//   createContext,
//   useEffect,
//   useState,
//   useCallback,
// } from 'react';
// import { SCOPES, auth } from './firebase';
// import { loadAuth2, loadGapiInsideDOM } from 'gapi-script';
// import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
// import React from 'react';

// interface GAPIContextType {
//   gapi: typeof globalThis.gapi | null;
//   setGapi: React.Dispatch<React.SetStateAction<typeof globalThis.gapi | null>>;
//   authInstance: gapi.auth2.GoogleAuthBase | null;
//   setAuthInstance: React.Dispatch<
//     React.SetStateAction<gapi.auth2.GoogleAuthBase | null>
//   >;
//   GAPILoading: boolean;
//   setGAPILoading: React.Dispatch<React.SetStateAction<boolean>>;
//   handleIsSignedIn: (isSignedIn: boolean) => void;
//   isGapiInitialized: boolean;
//   initializeGapi: () => Promise<void>;
//   gapiError: Error | null;
// }

// export const GAPIContext = createContext<GAPIContextType>({
//   gapi: null,
//   setGapi: () => {},
//   authInstance: null,
//   setAuthInstance: () => {},
//   GAPILoading: true,
//   setGAPILoading: () => {},
//   handleIsSignedIn: () => {},
//   isGapiInitialized: false,
//   initializeGapi: async () => {},
//   gapiError: null,
// });

// // Store GAPI initialization status in localStorage
// const GAPI_INITIALIZED_KEY = 'isGapiInitialized';

// const GAPI_CLIENT_NAME = 'client:auth2';

// export const GAPIContextWrapper: FC<{ children: ReactNode }> = ({
//   children,
// }) => {
//   const [gapi, setGapi] = useState<typeof globalThis.gapi | null>(null);
//   const [authInstance, setAuthInstance] =
//     useState<gapi.auth2.GoogleAuthBase | null>(null);
//   const [loading, setLoading] = useState(true);
//   // Initialize from localStorage if available
//   const [isGapiInitialized, setIsGapiInitialized] = useState<boolean>(() => {
//     const stored = localStorage.getItem(GAPI_INITIALIZED_KEY);
//     return stored === 'true';
//   });
//   const [gapiError, setGapiError] = useState<Error | null>(null);

//   // Update localStorage when isGapiInitialized changes
//   useEffect(() => {
//     localStorage.setItem(GAPI_INITIALIZED_KEY, isGapiInitialized.toString());
//   }, [isGapiInitialized]);

//   // Load gapi client after gapi script loaded
//   const loadGapiClient = async (
//     gapiInstance: typeof globalThis.gapi
//   ): Promise<void> => {
//     return new Promise((resolve, reject) => {
//       // Verify environment variables
//       const apiKey = process.env.REACT_APP_API_KEY_GAPI;
//       const clientId = process.env.REACT_APP_CLIENT_ID_GAPI;

//       if (!apiKey || !clientId) {
//         const error = new Error(
//           'Missing API key or Client ID. Check your environment variables.'
//         );
//         console.error(error);
//         setGapiError(error);
//         reject(error);
//         return;
//       }

//       gapiInstance.load(GAPI_CLIENT_NAME, async () => {
//         try {
//           // Initialize the client with your API key and client ID
//           await gapiInstance.client.init({
//             apiKey,
//             clientId,
//             scope: SCOPES,
//             discoveryDocs: [
//               'https://content.googleapis.com/discovery/v1/apis/calendar/v3/rest',
//             ],
//           });

//           // No need for the second calendar load as it's included in discoveryDocs
//           setIsGapiInitialized(true);
//           resolve();
//         } catch (error) {
//           console.error('Error initializing gapi client:', error);
//           setGapiError(
//             error instanceof Error ? error : new Error(String(error))
//           );
//           reject(error);
//         }
//       });
//     });
//   };

//   // Try to restore auth session from existing tokens if available
//   const tryRestoreSession = useCallback(async () => {
//     if (!gapi || !isGapiInitialized) return;

//     try {
//       const auth2 = gapi.auth2.getAuthInstance();
//       if (auth2 && auth2.isSignedIn.get()) {
//         // Already signed in, update state
//         handleIsSignedIn(true);
//         return;
//       }

//       // Check for stored session
//       const token = localStorage.getItem('gapi_access_token');
//       const expires = localStorage.getItem('gapi_expires_at');

//       if (token && expires) {
//         const expiresAt = parseInt(expires, 10);
//         // Only try to restore if token hasn't expired (with 5 min buffer)
//         if (expiresAt > Date.now() + 5 * 60 * 1000) {
//           console.log('Attempting to restore GAPI session from stored token');
//           // This is a simplified version - in practice you'd need to implement full token restoration
//           // which may require additional handling with GAPI library
//         }
//       }
//     } catch (err) {
//       console.error('Error restoring GAPI session:', err);
//     }
//   }, [gapi, isGapiInitialized]);

//   // Initialize GAPI function that can be called from components
//   const initializeGapi = useCallback(async () => {
//     // Skip if already initialized and gapi instance exists
//     if (isGapiInitialized && gapi && (await gapi.auth2?.getAuthInstance())) {
//       console.log('GAPI already initialized, skipping initialization');
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     setGapiError(null);

//     try {
//       console.log('Loading new GAPI instance');
//       const newGapi = await loadGapiInsideDOM();

//       // Load Auth2 first before initializing client
//       const newAuth2 = await loadAuth2(
//         newGapi,
//         process.env.REACT_APP_CLIENT_ID_GAPI || '',
//         SCOPES
//       );

//       // Then load the client
//       await loadGapiClient(newGapi);

//       setGapi(newGapi);
//       setAuthInstance(newAuth2);
//       setIsGapiInitialized(true);

//       // Try to restore session after initialization
//       setTimeout(() => tryRestoreSession(), 100);
//     } catch (err) {
//       console.error('Error initializing Google Calendar API: ', err);
//       setGapiError(err instanceof Error ? err : new Error(String(err)));
//       setIsGapiInitialized(false);
//     } finally {
//       setLoading(false);
//     }
//   }, [tryRestoreSession]);

//   // Initial load of GAPI
//   useEffect(() => {
//     // Add a small delay to ensure DOM is fully loaded
//     const timer = setTimeout(() => {
//       initializeGapi();
//     }, 100);

//     // Add event listener for when page becomes visible again (tab switch, etc.)
//     const handleVisibilityChange = () => {
//       if (document.visibilityState === 'visible') {
//         console.log('Page became visible, checking GAPI status');
//         // Check if GAPI is still valid
//         if (gapi && gapi.auth2) {
//           try {
//             const auth2 = gapi.auth2.getAuthInstance();
//             if (!auth2 || !auth2.isSignedIn) {
//               console.log('GAPI instance invalid, reinitializing');
//               initializeGapi();
//             }
//           } catch (e) {
//             console.log('Error checking GAPI instance, reinitializing', e);
//             initializeGapi();
//           }
//         } else if (!isGapiInitialized) {
//           initializeGapi();
//         }
//       }
//     };

//     document.addEventListener('visibilitychange', handleVisibilityChange);

//     return () => {
//       clearTimeout(timer);
//       document.removeEventListener('visibilitychange', handleVisibilityChange);
//     };
//   }, [initializeGapi, isGapiInitialized, gapi]);

//   const handleIsSignedIn = useCallback(
//     (isSignedIn: boolean) => {
//       // Handle sign-in state changes
//       console.log('Sign-in state changed:', isSignedIn);

//       // Store token if signed in
//       if (isSignedIn && gapi) {
//         try {
//           const auth2 = gapi.auth2.getAuthInstance();
//           const currentUser = auth2.currentUser.get();
//           const authResponse = currentUser.getAuthResponse(true);

//           // Store tokens in localStorage for session restoration
//           localStorage.setItem('gapi_access_token', authResponse.access_token);
//           const expiresAt = Date.now() + authResponse.expires_in * 1000;
//           localStorage.setItem('gapi_expires_at', expiresAt.toString());

//           // Optional: Connect with Firebase
//           const credential = GoogleAuthProvider.credential(
//             authResponse.id_token,
//             authResponse.access_token
//           );

//           signInWithCredential(auth, credential)
//             .then(({ user }) => {
//               console.log('User signed in to Firebase:', user);
//             })
//             .catch((error) => {
//               console.error('Firebase: error signing in!', error);
//             });
//         } catch (err) {
//           console.error('Error storing token info:', err);
//         }
//       } else if (!isSignedIn) {
//         // Clear stored tokens
//         localStorage.removeItem('gapi_access_token');
//         localStorage.removeItem('gapi_expires_at');
//       }

//       return isSignedIn;
//     },
//     [gapi]
//   );

//   // Set up sign-in listener once gapi is loaded
//   useEffect(() => {
//     if (!gapi || !isGapiInitialized) {
//       return;
//     }

//     try {
//       const auth2 = gapi.auth2.getAuthInstance();
//       auth2.isSignedIn.listen(handleIsSignedIn);
//       handleIsSignedIn(auth2.isSignedIn.get());
//     } catch (err) {
//       console.error('Error setting up sign-in listener:', err);
//     }
//   }, [gapi, isGapiInitialized, handleIsSignedIn]);

//   return (
//     <GAPIContext.Provider
//       value={{
//         gapi,
//         setGapi,
//         authInstance,
//         setAuthInstance,
//         GAPILoading: loading,
//         setGAPILoading: setLoading,
//         handleIsSignedIn,
//         isGapiInitialized,
//         initializeGapi,
//         gapiError,
//       }}
//     >
//       {children}
//     </GAPIContext.Provider>
//   );
// };

// // // Add this type to the global Window interface
// // declare global {
// //   interface Window {
// //     gapi: typeof globalThis.gapi;
// //   }
// // }

export {};
