import { checkIfAdmin } from "../../firebase/events";
import ParticipantGroupViewPage from "./ParticipantGroupViewApp";
import AdminGroupViewPage from "./AdminGroupViewApp";
import { useEffect, useState } from "react";
import { auth } from "../../firebase/firebase";

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