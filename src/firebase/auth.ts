// /* eslint-disable */

// import { MouseEventHandler, useContext } from 'react';
// import { signInWithCredential } from 'firebase/auth';

// import { GoogleAuthProvider } from 'firebase/auth';
// import {
//   getAccountId,
//   getAccountName,
//   updateAnonymousUserToAuthUser,
// } from './events';

// import { auth, googleProvider } from './firebase';
// import {
//   onAuthStateChanged,
//   signInWithPopup,
//   signInWithRedirect,
//   signOut,
// } from 'firebase/auth';
// import { GAPIContext } from './gapiContext';
// import { get } from 'http';

// // Google sign in
// // returns error message

// const signInWithGoogle = async (
//   clickEvent?: any,
//   gapi?: any,
//   handleIsSignedIn?: (arg0: boolean) => void,
//   includeCalendarScope: boolean = false
// ) => {
//   try {
//     // Check if user is already signed in anonymously
//     let formerName = '';
//     if (auth?.currentUser?.isAnonymous) {
//       formerName = auth.currentUser.displayName || '';
//     }

//     // Define base scopes for authentication
//     let scopes = ['profile', 'email'];
    
//     // Add calendar scopes if requested
//     if (includeCalendarScope) {
//       scopes.push('https://www.googleapis.com/auth/calendar.readonly');
//     }

//     if (gapi && gapi.auth2) {
//       // Using GAPI for authentication
//       try {
//         const auth2 = gapi.auth2.getAuthInstance();
        
//         // Configure scopes
//         const options = {
//           scope: scopes.join(' '),
//           prompt: includeCalendarScope ? 'consent' : undefined
//         };
        
//         const googleUser = await auth2.signIn(options);
//         const authResponse = googleUser.getAuthResponse(true);
        
//         // Set token in gapi.client for API calls
//         gapi.client.setToken({
//           access_token: authResponse.access_token
//         });
        
//         // Sign in to Firebase with the Google credential
//         const credential = GoogleAuthProvider.credential(
//           authResponse.id_token,
//           authResponse.access_token
//         );
//         await signInWithCredential(auth, credential);
        
//         if (handleIsSignedIn) {
//           handleIsSignedIn(true);
//         }
        
//         // Update user info if previously anonymous
//         if (formerName !== '') {
//           await updateAnonymousUserToAuthUser(formerName);
//         }
        
//         // // If calendar scope was requested, update the local state
//         // if (includeCalendarScope) {
//         //   const hasCalendarScope = await checkIfUserHasCalendarScope();
//         //   setHasGCalScope(hasCalendarScope);
          
//         //   if (hasCalendarScope) {
//         //     await fetchUserCalendars();
//         //   }
//         // }
        
//         return true;
//       } catch (error) {
//         console.error('GAPI sign-in error:', error);
//         throw error;
//       }
//     } else {
//       // Fallback to Firebase auth if GAPI is not available
//       try {
//         // For Firebase popup, we can't request Google Calendar scopes directly
//         // So only do the basic auth here
//         const googleProvider = new GoogleAuthProvider();
//         for (const scope of scopes) {
//           googleProvider.addScope(scope);
//         }
        
//         return new Promise<boolean>((resolve, reject) => {
//           signInWithPopup(auth, googleProvider)
//           .then((result) => {
//             if (handleIsSignedIn) {
//               handleIsSignedIn(true);
//             }

//             if (formerName !== '') {
//               updateAnonymousUserToAuthUser(formerName)
//                 .then(() => {
//                   resolve(true);
//                 })
//                 .catch((updateError) => {
//                   resolve(false);
//                 });
//             } else {
//               resolve(true);
//             }
//           })
//           .catch((error) => {
//             console.error(error);
//             resolve(false);
//           });
//         });
//       } catch (error) {
//         console.error('Firebase sign-in error:', error);
//         throw error;
//       }
//     }
//   } catch (err) {
//     console.error('Google sign-in failed:', err);
//     return false;
//   }
// };

// // useEffect(() => {
// //     if (!authInstance) {
// //         return;

// //     }
// //     if (authInstance.isSignedIn.get()) {
// //         setUser(authInstance.currentUser.get());

// //     } else {
// //         const signInButton = document.getElementById('auth');
// //         authInstance.attachClickHandler(
// //             signInButton,
// //             {},
// //             (googleUser) => {
// //                 if (signInButton && signInButton.id == 'auth') {
// //                     setUser(googleUser);
// //                     createCalendarEvent(getEventObjectForGCal());
// //                     signInButton.id = 'sync';
// //                 }
// //             },
// //             (error) => {
// //                 console.log("Error: ", error);
// //                 // alert('[GCAL]: Error signing in to Google Calendar: ' + error);
// //             },
// //         );
// //     }
// // }, [authInstance, user, createCalendarEvent]);

// // logout
// const logout = (loadedGAPI: typeof globalThis.gapi | null) => {
//   if (loadedGAPI === null) {
//     signOut(auth);
//   } else {
//     const auth2 = loadedGAPI.auth2.getAuthInstance();
//     auth2.signOut().then(() => {
//       signOut(auth);
//       localStorage.removeItem("isGoogleLoggedIn");
//     });
//   }
// };

// export { signInWithGoogle, logout };

export {}
