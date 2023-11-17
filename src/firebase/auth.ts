import { auth, googleProvider } from './firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

// Google sign in
// returns error message
const signInWithGoogle = async () => {
    try {
        const res = await signInWithPopup(auth, googleProvider);
        const user = res.user;
        // const query = await db
        //     .collection('users')
        //     .where('uid', '==', user.uid)
        //     .get();
        // if (query.docs.length === 0) {
        //     await db.collection('users').add({
        //         uid: user.uid,
        //         name: user.displayName,
        //         authProvider: 'google',
        //         email: user.email,
        //     });
        // }
        return res;
    } catch (err: any) {
        console.error(err);
        alert(err.message);
        return err;
    }
};

onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("Logged in ", user)
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
