import { useState, useCallback, useContext } from 'react';
import { getAccountId, getEventObjectForGCal } from '../../firebase/events';
import { GAPIContext } from '../../firebase/gapiContext';
import { signInWithGoogle } from '../../firebase/auth';
import { LoadingAnim } from '../utils/components/LoadingAnim';
import googleLogo from '../utils/components/LoginPopup/googlelogo.png';
import googleCalLogo from './google-calendar-icon.png';

/**
 * Facilitates exporting the event to the currently logged-in user's calendar
 *
 * @returns Page Support Component - Admin View
 */
function AddToGoogleCalendarButton(): JSX.Element {
  const { gapi, GAPILoading, handleIsSignedIn } = useContext(GAPIContext);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  const createCalendarEventUrl = useCallback((event: any) => {
    const startDateTime = new Date(event.start.dateTime)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, '');
    const endDateTime = new Date(event.end.dateTime)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, '');

    // Construct the Google Calendar event URL
    const baseUrl = 'https://calendar.google.com/calendar/render';
    const queryParams = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.summary,
      dates: `${startDateTime}/${endDateTime}`,
      details: event.description,
      location: event.location,
      sprop: 'website:https://example.com', // You can set your website or leave it empty
      spropname: 'Add Event',
    });

    return `${baseUrl}?${queryParams.toString()}`;
  }, []);

  const handleAddToCalendar = useCallback(async () => {
    const event = getEventObjectForGCal();
    const calendarEventUrl = createCalendarEventUrl(event);

    // Open the event in a new tab
    window.open(calendarEventUrl, '_blank');
  }, [createCalendarEventUrl]);

  if (GAPILoading) {
    return <LoadingAnim />;
  }

  return (
    <button
      className={`flex items-center font-bold rounded-full py-3 px-5 text-sm md:text-md w-full
      transform transition-transform ${loading ? 'bg-gray-200 text-gray-500' : 'bg-white text-black'} 
      ${!loading ? 'hover:scale-90 active:scale-100' : ''}`}
      onClick={
        getAccountId() !== ''
          ? handleAddToCalendar
          : () => {
              signInWithGoogle(undefined, gapi, handleIsSignedIn);
            }
      }
      disabled={loading}
    >
      {getAccountId() !== '' ? (
        <>
          <img
            src={googleCalLogo}
            alt="Google Calendar Logo"
            className="mr-2 h-6"
          />
          {status || 'Add to Participant Google Calendars'}
        </>
      ) : (
        <>
          <img src={googleLogo} alt="Google Logo" className="mr-2 h-6" />
          {status || 'Sign in with Google to add to GCal'}
        </>
      )}
    </button>
  );
}

export default AddToGoogleCalendarButton;
