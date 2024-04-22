import { useState, useCallback, useContext, useEffect } from 'react';
import { getAccountId, getCalendarEventId, getEventObjectForGCal } from '../../firebase/events';
import { GAPIContext } from '../../firebase/gapiContext';
import { signInWithGoogle } from '../../firebase/auth';

/**
 * 
 * Facilitates exporting the event to the currently logged in user's calandear
 * 
 * @returns Page Support Component - Admin View
 */
function AddToGoogleCalendarButton(): JSX.Element {
    const { gapi, GAPILoading, handleIsSignedIn } = useContext(GAPIContext);
    const [loading, setLoading] = useState(false);
    const [ eventAdded, setEventAdded ] = useState(false);

    // Check if event already exists in user's calendar
    useEffect(() => {

        const checkIfCalendarExists = async () => {
            if (!gapi) {
                alert('gapi not loaded');
                return;
            }
            setLoading(true);

            // @ts-ignore
            const request = await gapi.client.calendar.events.get({
                'calendarId': 'primary',
                'eventId': getCalendarEventId(),
            });
            // console.log(JSON.parse(request.body).id);
            try {
                setEventAdded(JSON.parse(request.body).id === getCalendarEventId());
            } catch (e) {
                setEventAdded(false);
            }

        }
        checkIfCalendarExists();
    }, [gapi])

    const createCalendarEvent = useCallback(
        async (event: any) => { 
            if (!gapi) {
                alert('gapi not loaded');
                return;
            }
            setLoading(true);

        try {

            // TODO Calling insert throw an error if event has already been added
            // because id is specified in the event object and will be a duplicate;
            // however, we'd prefer to overwrite the old event. Assuming we want to
            // allow events to be updated (REQUIRES DISCUSSION), working plan is to
            // use eventAdded ReactState to check if event already exists and then call
            // update instead of insert, using etags to ensure atomicity.
            // https://developers.google.com/calendar/api/v3/reference/events/update
            // @ts-ignore
            const request = await gapi.client.calendar.events.insert({
                'calendarId': 'primary',
                'resource': event
              });
              console.log(request);

        } catch (e) {
            console.error("Error creating user event: ", e);
            setLoading(false);
            return;
        }
           
        setLoading(false);
        alert('Exporting to Google Calendar!');

    }, [gapi]);

    if (loading || GAPILoading) {
        return (
            <p>Loading...</p>
        );
    }

    return (<>
        <button className="font-bold rounded-full bg-white text-black py-3 px-5 text-sm w-full   
        transform transition-transform hover:scale-90 active:scale-100e"
            onClick={getAccountId() !== "" ? () => createCalendarEvent(getEventObjectForGCal()) : () => {signInWithGoogle(undefined, gapi, handleIsSignedIn)}}>
                {getAccountId() !== "" ? "Add to Google Calendar" : "Sign in to Google to Add to GCAL"}
        </button>
    </>);
}

export default AddToGoogleCalendarButton;