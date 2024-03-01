import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login_guest_popup.css';
import { User, UserCredential, signInAnonymously, updateProfile } from 'firebase/auth';
import { signInWithGoogle } from '../../firebase/auth';
import { auth } from '../../firebase/firebase';
import LOGO from "./googlelogo.png";

interface LoginPopupProps {
    onClose: (successFlag?: boolean) => void;
    enableAnonymousSignIn?: boolean;
   }   

export const LoginPopup: React.FC<LoginPopupProps> = ({ onClose, enableAnonymousSignIn = false }) => {
    const navigate = useNavigate();
    const [ inputName, setInputName ] = useState("");
  
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
      signInAnonymously(auth).then((userCred: UserCredential) => {
        updateProfile(userCred.user, {
          displayName: inputName
        }).then(() => {
          onClose(true); 
          document.body.classList.remove('popup-open'); 
        }).catch(() => {
          alert("Error setting name");
          onClose(false); 
        });
      });
    };

    const handleKeyPress = (e: any) => {
      if (e.key == 'Enter') {
          handleSignInWithoutGoogle();
        }
    }
  
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
              className='sm:font-bold rounded-full shadow-md bg-white text-gray-600 py-4 px-6 sm:px-8 text-md sm:text-lg w-fit \
                          transform transition-transform hover:scale-90 active:scale-100e flex items-center'
              onClick={handleSignInWithGoogle}
            >
              <img src={LOGO} alt="Logo" className="mr-3 h-9" /> Continue with Google
            </button>
            
            <span className="mx-10 my-8 font-bold text-md sm:text-lg">— OR —</span>

            <span className="mx-4 text-sm sm:text-lg">Enter Name to Continue as Guest</span>
            
      {enableAnonymousSignIn && (
          <div className="flex items-center mt-3">
            <input
              className="rounded-l-md py-2 px-4 text-md bg-white text-left border-gray-300 border-2"
              placeholder="Your Name"
              name="name"
              type="text"
              onChange={(event) => setInputName(event.target.value)}
              onKeyDown={handleKeyPress}
              value={inputName}
              autoComplete="off"
            />
            <button
              className="rounded-r-md font-bold bg-gray-300 text-white disabled:text-opacity-60 py-2 px-4 text-lg hover:outline-blue-500 hover:outline-3"
              onClick={handleSignInWithoutGoogle}
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