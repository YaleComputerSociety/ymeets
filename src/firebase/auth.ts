import { MouseEventHandler, useContext } from 'react';
import { getAccountId, getAccountName, updateAnonymousUserToAuthUser } from './events';

import { auth, googleProvider } from './firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { GAPIContext } from './gapiContext';
import { get } from 'http';

// Google sign in
// returns error message

const signInWithGoogle = async (clickEvent?: any, gapi?: any, handleIsSignedIn?: ((arg0: boolean) => void)) => {
    return new Promise(async (resolve, reject) => {
        // Check if user is already signed in (anonymously)
        // if so, remember their unauthed name, then, on login success, overwrite it in the event object.
        let formerName = "";
        if (auth.currentUser?.isAnonymous) {
            console.log("User is already signed in anonymously");
            formerName = auth.currentUser.displayName || "";
        }

        try {
            const auth2 = gapi.auth2.getAuthInstance();
            auth2.signIn().then((googleUser: any) => {
                console.log('Signed in as: ' + googleUser);
                if (handleIsSignedIn) { handleIsSignedIn(true); }

                if (formerName !== "") {
                    updateAnonymousUserToAuthUser(formerName)
                        .then(() => resolve(true))
                        .catch((updateError) => reject(updateError));
                } else {
                    resolve(true);
                }
            });
        } catch (err) {
            console.error(err);
            reject(false);
        }
    });


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

onAuthStateChanged(auth, async (user) => {
    console.log(user);
    if (user) {
        console.log("Logged in ", user)
    } else{
        console.log("Logged out");
    }
});

// logout
const logout = (loadedGAPI: typeof globalThis.gapi | null) => {
    if (loadedGAPI === null) {
        try {
            gapi.auth2.getAuthInstance().signOut();
        } catch (err) {
            console.error("Error signing out (failing to load GAPI): ", err);
        }
        return
    }

    const auth2 = loadedGAPI.auth2.getAuthInstance()

    auth2.signOut().then(() => {
        signOut(auth);    
    });

    console.log('signed out');
};

export {
    signInWithGoogle,
    logout,
};
