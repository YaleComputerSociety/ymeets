import { useState, useCallback, useContext } from 'react';
import { getAccountId, getEventObjectForGCal } from '../../firebase/events';
import { GAPIContext } from '../../firebase/gapiContext';
import { signInWithGoogle } from '../../firebase/auth';
import { LoadingAnim } from '../utils/components/LoadingAnim';
import googleLogo from '../utils/components/LoginPopup/googlelogo.png';
import googleCalLogo from './google-calendar-icon.png';

/**
 *
 * Facilitates exporting the event to the currently logged in user's calandear
 *
 * @returns Page Support Component - Admin View
 */
function AddToGoogleCalendarButton(): JSX.Element {
  const { gapi, GAPILoading, handleIsSignedIn } = useContext(GAPIContext);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  const createCalendarEvent = useCallback(
    async (event: any) => {
      if (!gapi) {
        alert('gapi not loaded');
        return;
      }
      setLoading(true);
      setStatus('Adding Event...');

      try {
        // @ts-expect-error
        await gapi.client.calendar.events.insert({
          calendarId: 'primary',
          resource: event,
          sendUpdates: 'all',
        });
        setStatus('Event Added!');
      } catch (e) {
        console.error('Error creating user event: ', e);
        setStatus('Event could not be added');
      } finally {
        setLoading(false);
      }
    },
    [gapi]
  );

  if (GAPILoading) {
    return <LoadingAnim />;
  }

  return (
    <button
      className={`flex items-center font-bold rounded-full py-3 px-5 text-sm md:text-md w-full
      transform transition-transform ${loading ? 'bg-gray-200 text-gray-500' : 'bg-white text-black'} 
      ${!loading ? 'hover:scale-90 active:scale-100e' : ''}`}
      onClick={
        getAccountId() !== ''
          ? async () => {
              await createCalendarEvent(getEventObjectForGCal());
            }
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
