import React, { useContext } from 'react';
import { signInWithGoogle } from '../../../firebase/auth';
import { useNavigate } from 'react-router-dom';
import './general_popup_component.css';
import LOGO from './googlelogo.png';
import { GAPIContext } from '../../../firebase/gapiContext';

interface GeneralPopupProps {
  onClose: () => void;
  message: string;
  isLogin: boolean;
}

export const GeneralPopup: React.FC<GeneralPopupProps> = ({
  onClose,
  message,
  isLogin,
}) => {
  const navigate = useNavigate();

  const gapiContext = useContext(GAPIContext);

  // Access properties or functions from the context
  const {
    gapi,
    setGapi,
    authInstance,
    setAuthInstance,
    GAPILoading,
    setGAPILoading,
    handleIsSignedIn,
  } = gapiContext;

  const handleSignInWithGoogle = () => {
    signInWithGoogle(undefined, undefined, handleIsSignedIn).then(
      (loginSuccessful) => {
        if (loginSuccessful !== false) {
          navigate('/dayselect');
          onClose();
          document.body.classList.remove('popup-open');
        }
      }
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
    <div className="popup-overlay active z-100">
      <div className="popup-content p-10 mx-10 w-100">
        <div className="flex flex-col items-center mb-1">
          {!isLogin && (
            <button onClick={onClose} className="absolute top-1 right-3 h-fit">
              &times;
            </button>
          )}
          <p className="text-xl">{message}</p>
          {isLogin && (
            <div className="mb-1 mt-5 text-center">
              <button
                className="sm:font-bold rounded-full shadow-md bg-white text-gray-600 py-4 px-6 sm:px-8 text-md sm:text-lg w-fit \
                              transform transition-transform hover:scale-90 active:scale-100e flex items-center"
                onClick={handleSignInWithGoogle}
              >
                <img src={LOGO} alt="Logo" className="mr-3 h-9" /> Continue with
                Google
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
