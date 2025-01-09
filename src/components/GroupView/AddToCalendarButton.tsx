import { getAccountId } from '../../firebase/events';
import googleLogo from '../utils/components/LoginPopup/googlelogo.png';
import googleCalLogo from './google-calendar-icon.png';

interface AddToGoogleCalendarButtonProps {
  onClick: () => void;
}

/**
 * Facilitates exporting the event to the currently logged-in user's calendar
 *
 * @param props - Props containing an optional onClick handler
 * @returns Page Support Component - Admin View
 */
function AddToGoogleCalendarButton({
  onClick,
}: AddToGoogleCalendarButtonProps): JSX.Element {
  const loading = false;

  return (
    <button
      className={`mr-3 lg:mr-0 flex items-center justify-center font-bold rounded-full  py-3 px-4 lg:py-3 lg:px-5 text-sm md:text-md w-fit transform transition-transform
        ${loading ? 'bg-gray-200 text-gray-500' : 'bg-white text-black'} 
        ${!loading ? 'hover:scale-95 active:scale-100' : ''}`}
      onClick={onClick}
      disabled={loading}
    >
      {getAccountId() !== '' ? (
        <>
          <img
            src={googleCalLogo}
            alt="Google Calendar Logo"
            className="mr-1 lg:mr-2 h-4 sm:h-6"
          />
          {'Export to GCal'}
        </>
      ) : (
        <>
          <img
            src={googleLogo}
            alt="Google Logo"
            className="mr-1 lg:mr-2 h-4 sm:h-6"
          />
          {'Sign in to View GCals'}
        </>
      )}
    </button>
  );
}

export default AddToGoogleCalendarButton;
