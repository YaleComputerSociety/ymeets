import React from 'react';
import { signInWithGoogle } from "../../../firebase/auth";
import { useNavigate } from 'react-router-dom';
import './login_popup_component.css';

interface LoginPopupProps {
    onClose: () => void;
   }   

export const LoginPopup: React.FC<LoginPopupProps> = ({ onClose }) => {
    const navigate = useNavigate();
  
    const handleSignInWithGoogle = () => {
      signInWithGoogle().then(() => {
        navigate('/dayselect');
        onClose(); 
        document.body.classList.remove('popup-open'); 
      });
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
          <div className="popup-content">
            <p className="mb-4">Please log in to make an event. Since you would like to create an event, you must sign in with Google.</p>
            <div className="flex justify-center mb-1">
              <button
                className='flex shadow-custom bg-blue-900 text-white justify-center rounded-lg cursor-pointer min-w-[40%] text-lg p-2 md:p-3 md:w-11/12 lg:min-w-[0%] lg:w-[40%] transform transition-transform hover:scale-95 active:scale-100 hover:shadow-none'
                onClick={handleSignInWithGoogle}
              >
                Sign In with Google
              </button>
            </div>
          </div>
        </div>
    );
};
  