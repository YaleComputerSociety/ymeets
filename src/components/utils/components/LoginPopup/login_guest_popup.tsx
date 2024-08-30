import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login_guest_popup.css';
import {
  User,
  UserCredential,
  signInAnonymously,
  updateProfile,
} from 'firebase/auth';
import { signInWithGoogle } from '../../../../firebase/auth';
import { auth } from '../../../../firebase/firebase';
import LOGO from './googlelogo.png';

interface LoginPopupProps {
  onClose: (successFlag?: boolean) => void;
  enableAnonymousSignIn?: boolean;
}

export const LoginPopup: React.FC<LoginPopupProps> = ({
  onClose,
  enableAnonymousSignIn = false,
}) => {
  const navigate = useNavigate();
  const [inputName, setInputName] = useState('');

  const handleSignInWithGoogle = () => {
    signInWithGoogle().then((loginSuccessful) => {
      if (loginSuccessful !== false) {
        navigate('/dayselect');
        onClose();
        document.body.classList.remove('popup-open');
      }
    });
  };

  const handleSignInWithoutGoogle = () => {
    const trimmedName = inputName.trim();
    if (!validateInput(trimmedName)) {
      alert('Please enter a valid name (letters, numbers, and spaces only).');
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
          alert('Error setting name');
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
    <div className="popup-overlay active">
      <div className="popup-content p-10 mx-10 w-100">
        {/* <p className="mb-5 text-xl text-center">Please sign in.</p> */}

        <div className="flex flex-col items-center mb-1">
          <button
            className="sm:font-bold rounded-full shadow-md bg-white text-gray-600 py-4 px-6 sm:px-8 text-md sm:text-lg w-fit \
                          transform transition-transform hover:scale-90 active:scale-100e flex items-center"
            onClick={handleSignInWithGoogle}
          >
            <img src={LOGO} alt="Logo" className="mr-3 h-9" /> Continue with
            Google
          </button>

          <span className="mx-10 my-8 font-bold text-md sm:text-lg">
            — OR —
          </span>

          <span className="mx-4 text-sm sm:text-lg">
            Enter Name to Continue as Guest
          </span>

          {enableAnonymousSignIn && (
            <div className="flex items-center mt-3">
              <input
                className={`rounded-l-md py-2 px-4 text-md bg-white text-left border-2 ${
                  isValidInput ? 'border-gray-300' : 'border-red-500'
                }`}
                placeholder="Your Name"
                name="name"
                type="text"
                onChange={(event) => {
                  const newValue = event.target.value.slice(0, 25); // Cap at 25 characters
                  setInputName(newValue);
                  setIsValidInput(validateInput(newValue));
                }}
                onKeyDown={handleKeyPress}
                value={inputName}
                autoComplete="off"
                maxLength={25}
              />
              <button
                className={`rounded-r-md font-bold ${
                  isValidInput && inputName.trim().length > 0
                    ? 'bg-gray-300 text-white'
                    : 'bg-gray-100 text-gray-400'
                } py-2 px-4 text-lg hover:outline-blue-500 hover:outline-3`}
                onClick={handleSignInWithoutGoogle}
                disabled={!isValidInput || inputName.trim().length === 0}
              >
                <span className="text-l">&rarr;</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
