import { useState, useCallback, useContext } from 'react';
import { getAccountId, getEventObjectForGCal } from '../../firebase/events';
import { GAPIContext } from '../../firebase/gapiContext';
import { signInWithGoogle } from '../../firebase/auth';
import { LoadingAnim } from '../utils/components/LoadingAnim';
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

  // if (GAPILoading) {
  //   return <LoadingAnim />;
  // }

  return (
    <button
      className={`flex items-center justify-center font-bold rounded-full py-3 px-5 text-sm md:text-md w-full
  transform transition-transform ${loading ? 'bg-gray-200 text-gray-500' : 'bg-white text-black'} 
  ${!loading ? 'hover:scale-90 active:scale-100' : ''}`}
      onClick={onClick}
      disabled={loading}
    >
      {getAccountId() !== '' ? (
        <>
          <img
            src={googleCalLogo}
            alt="Google Calendar Logo"
            className="mr-2 h-6"
          />
          {'Submit Selection to GCal'}
        </>
      ) : (
        <>
          <img src={googleLogo} alt="Google Logo" className="mr-2 h-6" />
          {'Sign in with Google to add to GCal'}
        </>
      )}
    </button>
  );
}

export default AddToGoogleCalendarButton;
