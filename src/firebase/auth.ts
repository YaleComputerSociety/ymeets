import { updateAnonymousUserToAuthUser } from './events';
import { auth, googleProvider } from './firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

// Google sign in
// returns error message
const signInWithGoogle = async () => {
    
    // Check if user is already signed in (anonymously)
    // if so, remember their unauthed name, then, on login success, overwrite it in the event object.
    let formerName = "";
    if (auth.currentUser?.isAnonymous) {
        console.log("User is already signed in anonymously");
        formerName = auth.currentUser.displayName || "";
    }

    try {
        const res = await signInWithPopup(auth, googleProvider);
        const user = res.user;
        
        if (formerName !== "") await updateAnonymousUserToAuthUser(formerName);
        return res;

    } catch (err: any) {
        console.error(err);
        return false;
    }
};

onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("Logged in ", user  )
    }else{
        console.log("Logged out");
    }
});

// logout
const logout = () => {
    console.log('signing out');
    signOut(auth);
};

export {
    signInWithGoogle,
    logout,
};
