import { FC, ReactNode, createContext, useEffect, useState } from 'react';
// import { REACT_APP_API_KEY_GAPI, REACT_APP_CLIENT_ID_GAPI } from './gapi_keys';
import { SCOPES, auth, googleProvider } from './firebase';
import { loadAuth2, loadGapiInsideDOM } from 'gapi-script';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

interface GAPIContextType {
  gapi: typeof globalThis.gapi | null;
  setGapi: React.Dispatch<React.SetStateAction<typeof globalThis.gapi | null>>;
  authInstance: gapi.auth2.GoogleAuthBase | null;
  setAuthInstance: React.Dispatch<
    React.SetStateAction<gapi.auth2.GoogleAuthBase | null>
  >;
  // user: gapi.auth2.GoogleUser | null,
  // setUser: React.Dispatch<React.SetStateAction<gapi.auth2.GoogleUser | null>>,
  GAPILoading: boolean;
  setGAPILoading: React.Dispatch<React.SetStateAction<boolean>>;
  handleIsSignedIn: (isSignedIn: boolean) => void;
}

export const GAPIContext = createContext<GAPIContextType>({
  gapi: null,
  setGapi: () => {},
  authInstance: null,
  setAuthInstance: () => {},
  // user: null,
  // setUser: () => {},
  GAPILoading: true,
  setGAPILoading: () => {},
  handleIsSignedIn: () => {},
});

const GAPI_CLIENT_NAME = 'client:auth2';

export const GAPIContextWrapper: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [gapi, setGapi] = useState<typeof globalThis.gapi | null>(null);
  const [authInstance, setAuthInstance] =
    useState<gapi.auth2.GoogleAuthBase | null>(null);
  const [user, setUser] = useState<gapi.auth2.GoogleUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Load gapi client after gapi script loaded
  const loadGapiClient = (gapiInstance: typeof globalThis.gapi) => {
    gapiInstance.load(GAPI_CLIENT_NAME, () => {
      try {
        gapiInstance.client.load('calendar', 'v3');
      } catch {
        gapiInstance.client
          .init({
            apiKey: process.env.REACT_APP_API_KEY_GAPI,
            clientId: process.env.REACT_APP_CLIENT_ID_GAPI,
            scope: SCOPES,
          })
          .then(() => {});
        gapiInstance.client.load('calendar', 'v3');
      }
    });
  };

  // Load gapi script and client
  useEffect(() => {
    async function loadGapi() {
      const newGapi = await loadGapiInsideDOM();
      loadGapiClient(newGapi);
      const newAuth2 = await loadAuth2(
        newGapi,
        process.env.REACT_APP_CLIENT_ID_GAPI || '',
        SCOPES
      );
      setGapi(newGapi);
      setAuthInstance(newAuth2);
      setLoading(false);
    }

    loadGapi().catch((err) => {
      console.error('Error loading Google Calendar API: ', err);
    });
  }, []);

  const handleIsSignedIn = (isSignedIn: boolean) => {
    return isSignedIn;

    // if (isSignedIn && gapi) {
    //   const auth2 = gapi.auth2.getAuthInstance();
    //   const currentUser = auth2.currentUser.get();
    //   const profile = currentUser.getBasicProfile();
    //   const authResponse = currentUser.getAuthResponse(true);
    //   const credential = GoogleAuthProvider.credential(
    //     authResponse.id_token,
    //     authResponse.access_token
    //   );
    //   signInWithCredential(auth, credential)
    //     .then(({ user }) => {})
    //     .catch((error: any) => {
    //       console.error('firebase: error signing in!', error);
    //     });
    // }
  };

  useEffect(() => {
    if (!gapi) {
      return;
    }
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.isSignedIn.listen(handleIsSignedIn);
    handleIsSignedIn(auth2.isSignedIn.get());
  }, [gapi]);

  return (
    <GAPIContext.Provider
      value={{
        gapi,
        setGapi,
        authInstance,
        setAuthInstance,
        // user: user,
        // setUser: setUser,
        GAPILoading: loading,
        setGAPILoading: setLoading,
        handleIsSignedIn,
      }}
    >
      {children}
    </GAPIContext.Provider>
  );
};
