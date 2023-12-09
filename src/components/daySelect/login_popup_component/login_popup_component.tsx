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
          <div className="popup-content p-10 mx-10">
            <p className="mb-5 text-xl">Please sign in before creating an event.</p>
            <div className="flex justify-center mb-1">
              <button
                className='font-bold rounded-full bg-blue-500 text-white py-4 px-7 text-lg w-fit place-self-center \
                            transform transition-transform hover:scale-90 active:scale-100e'
                onClick={handleSignInWithGoogle}
              >
                Continue with Google
              </button>
            </div>
          </div>
        </div>
    );
};
  