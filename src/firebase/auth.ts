/* eslint-disable */

import { MouseEventHandler, useContext } from 'react';
import {
  getAccountId,
  getAccountName,
  getAccountEmail,
  checkIfLoggedIn,
  updateAnonymousUserToAuthUser,
} from './events';

import { db, auth, googleProvider } from './firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { GAPIContext } from './gapiContext';
import { get } from 'http';

// Google sign in
// returns error message

const handleAddingUserToDB = async () => {
  try {
    const userId = getAccountId();
    const userEmail = getAccountEmail();
    const userDocRef = doc(db, 'users', userId);

    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        email: userEmail, // Set email from Google profile
        name: getAccountName() || '', // Set first name from Google profile
        selectedCalendarIDs: [userEmail], // Defaul value in user's email (primary cal)
        uid: userId, // Set the UID
        userEvents: [], // Initialize as empty array
      });
    }
  } catch (err) {
    console.error(err);
  }
};

const signInWithGoogle = async (
  clickEvent?: any,
  gapi?: any,
  handleIsSignedIn?: (arg0: boolean) => void
) => {
  return await new Promise(async (resolve, reject) => {
    // Check if user is already signed in (anonymously)
    // if so, remember their unauthed name, then, on login success, overwrite it in the event object.
    let formerName = '';
    if (auth?.currentUser?.isAnonymous) {
      formerName = auth.currentUser.displayName || '';
    }

    try {
      if (gapi) {
        const auth2 = gapi.auth2.getAuthInstance();
        auth2
          .signIn()
          .then((googleUser: any) => {
            if (handleIsSignedIn) {
              handleIsSignedIn(true);
            }

            if (formerName !== '') {
              updateAnonymousUserToAuthUser(formerName).catch((updateError) => {
                reject(updateError);
              });
            }

            handleAddingUserToDB().catch((dbError) => {
              reject(dbError);
            });

            resolve(true);
          })
          .catch((error: any) => {
            console.error(error);
            resolve(false);
          });
      } else {
        // try signing in with firebase (gapi not working...such as mobile???)
        try {
          signInWithPopup(auth, googleProvider)
            .then((googleUser: any) => {
              if (handleIsSignedIn) {
                handleIsSignedIn(true);
              }

              if (formerName !== '') {
                updateAnonymousUserToAuthUser(formerName).catch(
                  (updateError) => {
                    reject(updateError);
                  }
                );
              }

              handleAddingUserToDB().catch((dbError) => {
                reject(dbError);
              });

              resolve(true);
            })
            .catch((error) => {
              console.error(error);
              resolve(false);
            });
        } catch (err) {
          console.error(err);
          resolve(false);
        }
      }
    } catch (err) {
      console.error(err);
      resolve(false);
    }
  });
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
    try {
      gapi.auth2.getAuthInstance().signOut();
    } catch (err) {
      console.error('Error signing out (failing to load GAPI): ', err);
    }
    return;
  }

  const auth2 = loadedGAPI.auth2.getAuthInstance();

  auth2.signOut().then(() => {
    signOut(auth);
  });
};

export { signInWithGoogle, logout };
