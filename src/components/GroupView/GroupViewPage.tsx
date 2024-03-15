import { checkIfAdmin } from "../../firebase/events";
import ParticipantGroupViewPage from "./ParticipantGroupViewApp";
import AdminGroupViewPage from "./AdminGroupViewApp";
import { useEffect, useState } from "react";
import { auth } from "../../firebase/firebase";

/**
 * 
 * Determines which Group View to render depending on if an admin is logged in or not.
 * 
 * @returns Page Component
 */
export default function GroupViewApp() {

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