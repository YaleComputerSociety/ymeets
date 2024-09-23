
import {HttpsError, onCall} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import serviceAccount from "./admin-key.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const firestore = admin.firestore();

export const createEvent = onCall(async (request) => {
  // check if user is logged in
    if(!request.auth) {
      throw new HttpsError('unauthenticated', 'You must be logged in to call this function');
      return;
    }
    const id = "ABCDEF"; // TODO: Generate a random ID on the **server** side
    const { title, description } = request.data;
    // TODO: pass in EVERY parameter, not just title and description
    // TODO: validate that they are in fact present in the data
    // TODO: validate that they are the right data type with `typeof`
    // TODO: handle errors with throw new HttpsError
    if(!title || !description) throw new HttpsError('invalid-argument', 'Title and description are required');
    
    const newData = {
        details: {
            name: title,
            description,
        },
        dates: [],
        publicId: id,
    };

    try {
        firestore.collection("events").doc(id).set(newData)
    } catch(e) {
        console.error(e);
        throw new HttpsError('internal', 'Failed to create event');
    }

    return {
        success: true,
        event: newData
    };
});
