import { checkIfAdmin } from "../../firebase/events";
import ParticipantGroupViewApp from "./ParticipantGroupViewApp";
import AdminGroupViewApp from "./AdminGroupViewApp";
import { useEffect, useState } from "react";
import { auth } from "../../firebase/firebase";

export default function GroupViewApp() {

    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     return auth.onAuthStateChanged((user) => {
    //             if (checkIfAdmin()) {
    //             // User is signed in.
    //             // Redirect to AdminGroupViewApp (probably with {useStateBoolean && AdminGroupViewApp})
    //             }
    //         });
    // }, []);

    return (
        <>
            {
                // TODO : Is there a better way?
                // Yes! Start with ParticipantGroupViewApp; use useEffect to add a listener on auth state change
                setTimeout(() => {
                    console.log("Check if admin: ", checkIfAdmin());
                    return checkIfAdmin()
                }, 5000) ? <div>
                    <AdminGroupViewApp />
                </div> : <div>
                    <ParticipantGroupViewApp />
                </div>
            }   
        </>
    )
}