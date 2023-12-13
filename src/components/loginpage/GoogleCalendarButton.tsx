import React, { useState, useEffect, useCallback } from 'react';
import { loadGapiInsideDOM, loadAuth2 } from 'gapi-script';
import { SCOPES } from '../../firebase/firebase';

// Credit to CourseTable team https://coursetable.com/about

const GAPI_CLIENT_NAME = 'client:auth2';

function GoogleCalendarButton(): JSX.Element {
    const [gapi, setGapi] = useState<typeof globalThis.gapi | null>(null);
    const [authInstance, setAuthInstance] = useState<gapi.auth2.GoogleAuthBase | null>(null);
    const [user, setUser] = useState<gapi.auth2.GoogleUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Load gapi client after gapi script loaded
    const loadGapiClient = (gapiInstance: typeof globalThis.gapi) => {
        gapiInstance.load(GAPI_CLIENT_NAME, () => {
        try {
            gapiInstance.client.load('calendar', 'v3');

        } catch {
        gapiInstance.client.init({
            apiKey: process.env.REACT_APP_API_KEY_GAPI,
            clientId: process.env.REACT_APP_CLIENT_ID_GAPI,
            scope: SCOPES,
        });
        gapiInstance.client.load('calendar', 'v3');

        }
        });
    };

    // Load gapi script and client
    useEffect(() => {
        console.log(process.env.REACT_APP_CLIENT_ID_GAPI); // TODO
        async function loadGapi() {
            const newGapi = await loadGapiInsideDOM();
            loadGapiClient(newGapi);
            const newAuth2 = await loadAuth2(
                newGapi,
                process.env.REACT_APP_CLIENT_ID_GAPI || "",
                SCOPES,
            );
            setGapi(newGapi);
            setAuthInstance(newAuth2);
            setLoading(false);
        }
        loadGapi();
    }, []);

    const createCalendarEvent = useCallback(async () => {
        if (!gapi) {
            alert('gapi not loaded');
            return;
        }
        setLoading(true);

        try {

            // const event = {
            //     'summary': 'Google I/O 2015',
            //     'location': '800 Howard St., San Francisco, CA 94103',
            //     'description': 'A chance to hear more about Google\'s developer products.',
            //     'start': {
            //       'dateTime': '2023-12-13T09:00:00-07:00',
            //       'timeZone': 'America/Los_Angeles'
            //     },
            //     'end': {
            //       'dateTime': '2015-05-28T17:00:00-07:00',
            //       'timeZone': 'America/Los_Angeles'
            //     },
            //     'recurrence': [
            //       'RRULE:FREQ=DAILY;COUNT=2'
            //     ],
            //     'attendees': [
            //       {'email': 'lpage@example.com'},
            //       {'email': 'sbrin@example.com'}
            //     ],
            //     'reminders': {
            //       'useDefault': false,
            //       'overrides': [
            //         {'method': 'email', 'minutes': 24 * 60},
            //         {'method': 'popup', 'minutes': 10}
            //       ]
            //     }
            //   };
              
            //     // @ts-ignore
            //   const request = await gapi.client.calendar.events.insert({
            //     'calendarId': 'primary',
            //     'resource': event
            //   });

            //   console.log(request);


            // AS DEMONSTRATION, THIS WORKS
            // get all events in the last few days
            // @ts-ignore
            const event_list = await gapi.client.calendar.events.list({
                calendarId: 'primary',
                timeMin: new Date('2023-08-30').toISOString(),
                timeMax: new Date('2023-09-06').toISOString(),
                singleEvents: true,
                orderBy: 'startTime',
            });
            console.log(event_list);

        } catch (e) {
            alert('[GCAL]: Error creating user event: ' + e );
            console.log("Error creating user event: ", e);
            setLoading(false);
            return;
        }

        setLoading(false);
        alert('Exporting to Google Calendar!');
    }, [gapi]);

    useEffect(() => {
        if (!authInstance) {
            return;
        }
        if (authInstance.isSignedIn.get()) {
            setUser(authInstance.currentUser.get());
        } else {
            const signInButton = document.getElementById('auth');
            authInstance.attachClickHandler(
                signInButton,
                {},
                (googleUser) => {
                if (signInButton && signInButton.id == 'auth') {
                    setUser(googleUser);
                    createCalendarEvent();
                    signInButton.id = 'sync';
                }
                },
                (error) => {
                console.log("ERRoR is", error);
                alert(
                    ('[GCAL]: Error signing in to Google Calendar: ' + error),
                );
                },
            );
        }
    }, [authInstance, user, createCalendarEvent]);

    if (loading) {
        return (
            <p>Loading...</p>
        );
    }

    return (
        <button className="rounded-r-full font-bold bg-white text-black py-4 px-4 text-lg hover:text-blue-500"
            id={user ? 'sync' : 'auth'}
            onClick={user ? createCalendarEvent : undefined}>
                Test Calendar API 
        </button>
    );
}

export default GoogleCalendarButton;