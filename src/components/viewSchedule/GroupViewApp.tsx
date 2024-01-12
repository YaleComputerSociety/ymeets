import { checkIfAdmin } from "../../firebase/events";
import ParticipantGroupViewApp from "./ParticipantGroupViewApp";
import AdminGroupViewApp from "./AdminGroupViewApp";
import { useState } from "react";

export default function GroupViewApp() {

    const [loading, setLoading] = useState(true);

    return (
        <>
            {
                // TODO : Is there a better way?
                setTimeout(() => {
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