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

// Google sign in
// returns error message
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
              updateAnonymousUserToAuthUser(formerName)
                .then(() => {
                  // Add user to database after successful sign-in
                  handleAddingUserToDB()
                    .then(() => {
                      resolve(true);
                    })
                    .catch((dbError) => {
                      console.error('Error adding user to database:', dbError);
                      resolve(true); // Still resolve true since login succeeded
                    });
                })
                .catch((updateError) => {
                  reject(updateError);
                });
            } else {
              // Add user to database after successful sign-in
              handleAddingUserToDB()
                .then(() => {
                  resolve(true);
                })
                .catch((dbError) => {
                  console.error('Error adding user to database:', dbError);
                  resolve(true); // Still resolve true since login succeeded
                });
            }
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
                updateAnonymousUserToAuthUser(formerName)
                  .then(() => {
                    // Add user to database after successful sign-in
                    handleAddingUserToDB()
                      .then(() => {
                        resolve(true);
                      })
                      .catch((dbError) => {
                        console.error(
                          'Error adding user to database:',
                          dbError
                        );
                        resolve(true); // Still resolve true since login succeeded
                      });
                  })
                  .catch((updateError) => {
                    resolve(false);
                  });
              } else {
                // Add user to database after successful sign-in
                handleAddingUserToDB()
                  .then(() => {
                    resolve(true);
                  })
                  .catch((dbError) => {
                    console.error('Error adding user to database:', dbError);
                    resolve(true); // Still resolve true since login succeeded
                  });
              }
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

// logout
const logout = (loadedGAPI: typeof globalThis.gapi | null) => {
  if (loadedGAPI === null) {
    signOut(auth);
  } else {
    const auth2 = loadedGAPI.auth2.getAuthInstance();
    auth2.signOut().then(() => {
      signOut(auth);
    });
  }
};

export { signInWithGoogle, logout };
