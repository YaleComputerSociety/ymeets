import { checkIfAdmin } from "../../firebase/events";
import ParticipantGroupViewPage from "./ParticipantGroupViewApp";
import AdminGroupViewPage from "./AdminGroupViewApp";
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
        }, 1000);

        return () => clearTimeout(timerId);
    }, []); 

    return (
        <>
            {checkIfAdmin() ? (
                <div>
                    <AdminGroupViewPage />
                </div>
            ) : (
                <div>
                    <ParticipantGroupViewPage />
                </div>
            )}
        </>
    );
}