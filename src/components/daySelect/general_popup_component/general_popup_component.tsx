import React from 'react';
import { signInWithGoogle } from "../../../firebase/auth";
import { useNavigate } from 'react-router-dom';
import './general_popup_component.css';

interface GeneralPopupProps {
    onClose: () => void;
    message: string;
    isLogin: boolean;
}

export const GeneralPopup: React.FC<GeneralPopupProps> = ({ onClose, message, isLogin }) => {
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
          <div className="popup-content p-10 mx-10 relative">
            {!isLogin && (<button onClick={onClose} className="absolute top-1 right-3 h-fit">&times;</button>)}
            <p className="text-xl">{message}</p>
            {isLogin && (
              <div className="flex justify-center mb-1 mt-5">
                <button
                  className='font-bold rounded-full bg-blue-500 text-white py-4 px-7 text-lg w-fit place-self-center \
                              transform transition-transform hover:scale-90 active:scale-100e'
                  onClick={handleSignInWithGoogle}
                >
                  Continue with Google
                </button>
              </div>
            )}
          </div>
        </div>
    );
};
  