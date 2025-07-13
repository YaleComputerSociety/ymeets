import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login_guest_popup.css';
import {
  UserCredential,
  signInAnonymously,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../../../../backend/firebase';
import LOGO from './googlelogo.png';
import { IconArrowLeft } from '@tabler/icons-react';
import { useAuth } from '../../../../backend/authContext';
import AlertPopup from '../AlertPopup'; // Import AlertPopup


interface LoginPopupProps {
  onClose: (successFlag?: boolean) => void;
  enableAnonymousSignIn?: boolean;
  code: string;
}

export const LoginPopup: React.FC<LoginPopupProps> = ({
  onClose,
  enableAnonymousSignIn = false,
  code,
}) => {
  const navigate = useNavigate();
  const [inputName, setInputName] = useState('');

  const { login, currentUser } = useAuth();

  const [alertMessage, setAlertMessage] = useState<string | null>(null); // Add state for AlertPopup

  const handleSignInWithGoogle = () => {
    login().then((loginSuccessful) => {
      if (loginSuccessful !== undefined) {
        if (code !== '') {
          navigate(`/timeselect/${code}`);
        }
        onClose();
        document.body.classList.remove('popup-open');
      }
    });
  };

  const handleSignInWithoutGoogle = () => {
    const trimmedName = inputName.trim();
    if (!validateInput(trimmedName)) {
      setAlertMessage(
        'Please enter a valid name (letters, numbers, and spaces only).'
      ); // Replace alert
      return;
    }
    signInAnonymously(auth).then((userCred: UserCredential) => {
      updateProfile(userCred.user, {
        displayName: trimmedName,
      })
        .then(() => {
          onClose(true);
          document.body.classList.remove('popup-open');
        })
        .catch(() => {
          setAlertMessage('Error setting name'); // Replace alert
          onClose(false);
        });
    });
  };

  const handleKeyPress = (e: any) => {
    if (e.key == 'Enter') {
      handleSignInWithoutGoogle();
    }
  };

  const [isValidInput, setIsValidInput] = useState(true);

  const validateInput = (input: string): boolean => {
    const trimmedInput = input.trim();
    const validNameRegex = /^[a-zA-Z0-9\s]+$/;
    return (
      trimmedInput.length > 0 &&
      trimmedInput.length <= 25 &&
      validNameRegex.test(trimmedInput)
    );
  };

  React.useEffect(() => {
    // Add the class when the component mounts
    document.body.classList.add('popup-open');

    // Remove the class when the component unmounts
    return () => {
      document.body.classList.remove('popup-open');
    };
  }, []);
  return (
    <div className="popup-overlay active flex items-center justify-center min-h-screen py-6 px-4 sm:px-6">
      {alertMessage && (
        <AlertPopup
          title="Alert"
          message={alertMessage}
          isOpen={!!alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}
      <div className="popup-content w-full max-w-md bg-white rounded-2xl shadow-lg relative">
        <button
          onClick={() => {
            navigate('/groupview/' + code);
          }}
          className="absolute top-4 left-4 p-2 flex items-center text-gray-500 hover:text-gray-800 transition-colors duration-200"
          aria-label="Go back"
        >
          <IconArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 sm:mb-8">
            Sign In
          </h2>

          <button
            className="w-full font-medium rounded-full shadow-md bg-white text-gray-700 py-3 px-4 sm:px-6 text-sm sm:text-base
                      border border-gray-200 hover:border-gray-300 transform transition-all duration-200 hover:shadow-lg 
                      active:scale-95 flex items-center justify-center"
            onClick={handleSignInWithGoogle}
          >
            <img src={LOGO} alt="Logo" className="mr-2 sm:mr-3 h-5 sm:h-6" />
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center w-full my-6 sm:my-8">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="px-3 sm:px-4 text-xs sm:text-sm font-medium text-gray-500">
              OR
            </span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <p className="text-center text-sm sm:text-base text-gray-600 mb-3">
            Enter Name to Continue as Guest
          </p>

          {enableAnonymousSignIn && (
            <div className="flex items-center w-full">
              <input
                className="rounded-l-lg py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base bg-white text-left 
                          border border-gray-300 focus:border-blue-400 focus:outline-none focus:ring-2 
                          focus:ring-blue-100 w-full transition-all duration-200"
                placeholder="Your Name"
                name="name"
                type="text"
                onChange={(event) => {
                  const newValue = event.target.value.slice(0, 25);
                  setInputName(newValue);
                  setIsValidInput(validateInput(newValue));
                }}
                onKeyDown={handleKeyPress}
                value={inputName}
                autoComplete="off"
                maxLength={25}
              />
              <button
                className={`
                  rounded-r-lg font-medium
                  py-2.5 sm:py-3 px-3 sm:px-4 min-w-[44px] sm:min-w-[48px]
                  transition-all duration-200 ease-in-out
                  ${
                    isValidInput && inputName.trim().length > 0
                      ? 'bg-primary hover:bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-300
                  active:transform active:scale-95
                `}
                onClick={handleSignInWithoutGoogle}
                disabled={!isValidInput || inputName.trim().length === 0}
              >
                <span className="text-lg sm:text-xl">&rarr;</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
