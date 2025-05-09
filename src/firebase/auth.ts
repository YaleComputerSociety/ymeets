/* eslint-disable */

import { MouseEventHandler, useContext } from 'react';
import { signInWithCredential } from 'firebase/auth';

import { GoogleAuthProvider } from 'firebase/auth';
import {
  getAccountId,
  getAccountName,
  updateAnonymousUserToAuthUser,
} from './events';

import { auth, googleProvider } from './firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { GAPIContext } from './gapiContext';
import { get } from 'http';

// Google sign in
// returns error message

const signInWithGoogle = async (
  clickEvent?: any,
  gapi?: any,
  handleIsSignedIn?: (arg0: boolean) => void
) => {
  try {
    // Check if user is already signed in (anonymously)
    // if so, remember their unauthed name, then, on login success, overwrite it in the event object.
    let formerName = '';
    if (auth?.currentUser?.isAnonymous) {
      formerName = auth.currentUser.displayName || '';
    }

    // Define required scopes for Google Calendar
    const calendarScopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
    ];

    if (gapi && gapi.auth2) {
      // Using GAPI for authentication
      try {
        const auth2 = gapi.auth2.getAuthInstance();
        
        // Configure additional scopes if needed
        const options = {
          scope: calendarScopes.join(' ')
        };
        
        const googleUser = await auth2.signIn(options);
        const authResponse = googleUser.getAuthResponse(true);
        
        // Important: Set the token in gapi.client for API calls
        gapi.client.setToken({
          access_token: authResponse.access_token
        });
        
        // Get the ID token for Firebase authentication
        const idToken = authResponse.id_token;
        
        // Sign in to Firebase with the Google credential
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
        
        
        if (handleIsSignedIn) {
          handleIsSignedIn(true);
        }
        
        // Update user info if previously anonymous
        if (formerName !== '') {
          await updateAnonymousUserToAuthUser(formerName);
        }
        
        return true;
      } catch (error) {
        console.error('GAPI sign-in error:', error);
        throw error;
      }
    } else {
      
      try {
        return new Promise<boolean>((resolve, reject) => {
          signInWithPopup(auth, googleProvider)
          .then((googleUser: any) => {
            if (handleIsSignedIn) {
              handleIsSignedIn(true);
            }

            if (formerName !== '') {
              updateAnonymousUserToAuthUser(formerName)
                .then(() => {
                  resolve(true);
                })
                .catch((updateError) => {
                  resolve(false);
                });
            } else {
              resolve(true);
            }
          })
          .catch((error) => {
            console.error(error);
            resolve(false);
          });
        });
      } catch (error) {
        console.error('Firebase sign-in error:', error);
        throw error;
      }
    }
  } catch (err) {
    console.error('Google sign-in failed:', err);
    return false;
  }
};

// useEffect(() => {
//     if (!authInstance) {
//         return;

//     }
//     if (authInstance.isSignedIn.get()) {
//         setUser(authInstance.currentUser.get());

//     } else {
//         const signInButton = document.getElementById('auth');
//         authInstance.attachClickHandler(
//             signInButton,
//             {},
//             (googleUser) => {
//                 if (signInButton && signInButton.id == 'auth') {
//                     setUser(googleUser);
//                     createCalendarEvent(getEventObjectForGCal());
//                     signInButton.id = 'sync';
//                 }
//             },
//             (error) => {
//                 console.log("Error: ", error);
//                 // alert('[GCAL]: Error signing in to Google Calendar: ' + error);
//             },
//         );
//     }
// }, [authInstance, user, createCalendarEvent]);

// logout
const logout = (loadedGAPI: typeof globalThis.gapi | null) => {
  if (loadedGAPI === null) {
    signOut(auth);
  } else {
    const auth2 = loadedGAPI.auth2.getAuthInstance();
    auth2.signOut().then(() => {
      signOut(auth);
      localStorage.removeItem("isGoogleLoggedIn");
    });
  }
};

export { signInWithGoogle, logout };
