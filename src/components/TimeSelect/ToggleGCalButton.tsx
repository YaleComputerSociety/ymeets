import React from 'react';
import { auth } from '../../firebase/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  getRedirectResult,
} from 'firebase/auth';
import ButtonSmall from '../utils/components/ButtonSmall';

const ToggleGoogleCalendarButton = () => {
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();

    // Add the default 'email' scope and the Google Calendar scope
    provider.addScope('https://www.googleapis.com/auth/calendar.readonly');

    try {
      // Sign in with a popup
      const result = await signInWithPopup(auth, provider);

      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      if (token) {
        // Check if the scope is already granted
        const grantedScopes = result.user?.providerData[0]?.providerId;

        if (
          !grantedScopes?.includes(
            'https://www.googleapis.com/auth/calendar.readonly'
          )
        ) {
          // Request additional scopes if not granted
          provider.addScope(
            'https://www.googleapis.com/auth/calendar.readonly'
          );

          await signInWithPopup(auth, provider);

          // Fetch user calendars after requesting scopes
          fetchUserCalendars();
        } else {
          // Fetch user calendars if already granted
          fetchUserCalendars();
        }
      }
    } catch (error) {
      console.error(
        'Error signing in or requesting additional permissions:',
        error
      );
    }
  };

  const fetchUserCalendars = async () => {
    try {
      // Your logic to fetch user calendars goes here
      console.log('Fetching user calendars...');
    } catch (error) {
      console.error('Error fetching Google Calendars:', error);
    }
  };

  return (
    <ButtonSmall
      bgColor="blue-500"
      textColor="white"
      onClick={handleGoogleSignIn}
    >
      Toggle GCal Availabilities
    </ButtonSmall>
  );
};

export default ToggleGoogleCalendarButton;