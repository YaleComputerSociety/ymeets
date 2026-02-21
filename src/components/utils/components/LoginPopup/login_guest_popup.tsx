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
  onOverlayClick?: () => void;
}

export const LoginPopup: React.FC<LoginPopupProps> = ({
  onClose,
  enableAnonymousSignIn = false,
  code,
  onOverlayClick,
}) => {
  const navigate = useNavigate();
  const [inputName, setInputName] = useState('');

  const { login, currentUser } = useAuth();

  const [alertMessage, setAlertMessage] = useState<string | null>(null); // Add state for AlertPopup
  const [showManualInput, setShowManualInput] = useState(false);

  const handleSignInWithGoogle = () => {
    login().then((loginSuccessful) => {
      if (loginSuccessful !== undefined) {
        if (code !== '') {
          // navigate(`/timeselect/${code}`);
          navigate('/dashboard/' + code, { state: { isEditing: true } });
        }
        onClose(true);
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
    <div
      className="popup-overlay active flex items-center justify-center min-h-screen py-6 px-4 sm:px-6"
      onClick={() => (onOverlayClick ? onOverlayClick() : onClose())}
    >
      {alertMessage && (
        <AlertPopup
          title="Alert"
          message={alertMessage}
          isOpen={!!alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}
      <div
        className="popup-content w-full max-w-md bg-white rounded-2xl shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {
            onClose();
            navigate('/dashboard/' + code);
          }}
          className="absolute top-4 left-4 p-2 flex items-center text-gray-500 hover:text-gray-800 transition-colors duration-200"
          aria-label="Go back"
        >
          <IconArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center w-full px-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 mt-2 text-center">
            Add your availability
          </h2>
          <p className="text-gray-500 text-base mb-4 text-center">
            How do you want to add your availability?
          </p>
          <button
            className="w-full flex items-center justify-center gap-3 font-medium rounded-xl shadow bg-white text-gray-800 py-3 px-4 mt-4 mb-2 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition"
            onClick={handleSignInWithGoogle}
          >
            <img src={LOGO} alt="Google" className="h-6 w-6" />
            <span className="text-center w-full">
              Autofill with Google Calendar
            </span>
          </button>
          <p className="text-xs text-gray-500 text-center mt-1">
            You can manually edit your availability after.
          </p>
          <div className="flex items-center w-full my-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="px-3 text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          {!showManualInput ? (
            <button
              className="w-full font-medium rounded-xl shadow bg-white text-gray-800 py-3 px-4 mb-2 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition"
              onClick={() => setShowManualInput(true)}
            >
              Manually
            </button>
          ) : (
            <div className="w-full flex items-center gap-2 mb-2">
              <input
                className="rounded-lg py-2 px-3 text-base bg-white text-left border border-gray-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 flex-1 min-w-0 transition-all duration-200"
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
                className={`rounded-lg font-medium py-2 px-3 w-24 min-w-0 transition-all duration-200 text-sm ${
                  isValidInput && inputName.trim().length > 0
                    ? 'bg-primary text-white hover:bg-blue-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                onClick={handleSignInWithoutGoogle}
                disabled={!isValidInput || inputName.trim().length === 0}
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
