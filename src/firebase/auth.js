import { auth, db, googleProvider } from './firebase';

// Google sign in
const signInWithGoogle = async () => {
    try {
        const res = await auth.signInWithPopup(googleProvider);
        const user = res.user;
        const query = await db
            .collection('users')
            .where('uid', '==', user.uid)
            .get();
        if (query.docs.length === 0) {
            await db.collection('users').add({
                uid: user.uid,
                name: user.displayName,
                authProvider: 'google',
                email: user.email,
            });
        }
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
};

// logout
const logout = () => {
    console.log('signing out');
    auth.signOut();
};

export {
    auth,
    db,
    signInWithGoogle,
    logout,
};
