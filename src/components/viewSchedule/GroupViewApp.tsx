import { checkIfAdmin } from "../../firebase/events";
import ParticipantGroupViewApp from "./ParticipantGroupViewApp";
import AdminGroupViewApp from "./AdminGroupViewApp";
import { useEffect, useState } from "react";
import { auth } from "../../firebase/firebase";

export default function GroupViewApp() {

    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(null);

    useEffect(() => {
        const timerId = setTimeout(() => {
            let isAdminResult = checkIfAdmin();
            console.log(isAdminResult);
            //@ts-ignore
            setIsAdmin(isAdminResult);
        }, 5000);

        // Clear the timer to avoid memory leaks
        return () => clearTimeout(timerId);
    }, []); // The empty dependency array ensures that the effect runs only once

    return (
        <>
            {isAdmin === null ? (
                <div>Loading...</div>
            ) : isAdmin ? (
                <div>
                    <AdminGroupViewApp />
                </div>
            ) : (
                <div>
                    <ParticipantGroupViewApp />
                </div>
            )}
        </>
    );
}