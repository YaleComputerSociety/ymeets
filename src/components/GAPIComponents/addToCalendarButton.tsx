import React, { useState, useEffect, useCallback, useContext } from 'react';
import { getAccountId, getEventObjectForGCal } from '../../firebase/events';
import { GAPIContext } from '../../firebase/gapiContext';
import { signInWithGoogle } from '../../firebase/auth';

// Credit to CourseTable team https://coursetable.com/about

const GAPI_CLIENT_NAME = 'client:auth2';

function AddToGoogleCalendarButton(): JSX.Element {
    const { gapi, GAPILoading, handleIsSignedIn } = useContext(GAPIContext);
    const [loading, setLoading] = useState(false);

    // TODO; if the user is anonymous, this should say "sign into Google to Add to GCAL" first. 
    // we should try to update them to an authed user first, then add to Google Calendar.
    // This should not say loading if the user is not signed in; it should say "Sign in to Google to Add to GCAL"



    // const [gapi, setGapi] = useState<typeof globalThis.gapi | null>(null);
    // const [authInstance, setAuthInstance] = useState<gapi.auth2.GoogleAuthBase | null>(null);
    // const [user, setUser] = useState<gapi.auth2.GoogleUser | null>(null);
    // const [loading, setLoading] = useState(true);

    // // Load gapi client after gapi script loaded
    // const loadGapiClient = (gapiInstance: typeof globalThis.gapi) => {
    //     gapiInstance.load(GAPI_CLIENT_NAME, () => {
    //     try {
    //         gapiInstance.client.load('calendar', 'v3');

    //     } catch {
    //     gapiInstance.client.init({
    //         apiKey: REACT_APP_API_KEY_GAPI,
    //         clientId: REACT_APP_CLIENT_ID_GAPI,
    //         scope: SCOPES,
    //     });
    //     gapiInstance.client.load('calendar', 'v3');

    //     }
    //     });
    // };

    // // Load gapi script and client
    // useEffect(() => {
    //     async function loadGapi() {
    //         const newGapi = await loadGapiInsideDOM();
    //         loadGapiClient(newGapi);
    //         const newAuth2 = await loadAuth2(
    //             newGapi,
    //             REACT_APP_CLIENT_ID_GAPI || "",
    //             SCOPES,
    //         );
    //         setGapi(newGapi);
    //         setAuthInstance(newAuth2);
    //         setLoading(false);
    //     }

    //     loadGapi().catch((err) => {
    //         console.error("Error loading Google Calendar API: ", err);
    //     });
    // }, []);

    const createCalendarEvent = useCallback(
        async (event: any) => { 
            if (!gapi) {
                alert('gapi not loaded');
                return;
            }
            setLoading(true);

        try {
            // Create event
            // @ts-ignore
            const request = await gapi.client.calendar.events.insert({
                'calendarId': 'primary',
                'resource': event
              });
              console.log(request);

            // Retrieve user calendar events
            // @ts-ignore
            // const event_list = await gapi.client.calendar.events.list({
            //     calendarId: 'primary',
            //     timeMin: new Date('2023-08-30').toISOString(),
            //     timeMax: new Date('2023-09-06').toISOString(),
            //     singleEvents: true,
            //     orderBy: 'startTime',
            // });
            // console.log(event_list);

        } catch (e) {
            // alert('[GCAL]: Error creating user event: ' + JSON.stringify(e));
            console.error("Error creating user event: ", e);
            setLoading(false);
            return;
        }
           
        setLoading(false);
        alert('Exporting to Google Calendar!');

    }, [gapi]);

    // useEffect(() => {
    //     if (!authInstance) {
    //         return;

    //     }
    //     if (authInstance.isSignedIn.get()) {
    //         setUser(authInstance.currentUser.get());

    //     } else {
    //         const signInButton = document.getElementById('auth');
    //         authInstance.attachClickHandler(
    //             signInButton,
    //             {},
    //             (googleUser) => {
    //                 if (signInButton && signInButton.id == 'auth') {
    //                     setUser(googleUser);
    //                     createCalendarEvent(getEventObjectForGCal());
    //                     signInButton.id = 'sync';
    //                 }
    //             },
    //             (error) => {
    //                 console.log("Error: ", error);
    //                 // alert('[GCAL]: Error signing in to Google Calendar: ' + error);
    //             },
    //         );
    //     }
    // }, [authInstance, user, createCalendarEvent]);

    if (loading || GAPILoading) {
        return (
            <p>Loading...</p>
        );
    }

    return (<>
        <button className="font-bold rounded-full bg-white text-black py-3 px-5 text-sm mb-8 w-fit 
        transform transition-transform hover:scale-90 active:scale-100e"
            onClick={getAccountId() !== "" ? () => createCalendarEvent(getEventObjectForGCal()) : () => {signInWithGoogle(undefined, gapi, handleIsSignedIn)}}>
                {getAccountId() !== "" ? "Add to Google Calendar" : "Sign in to Google to Add to GCAL"}
        </button>
    </>);
}

export default AddToGoogleCalendarButton;