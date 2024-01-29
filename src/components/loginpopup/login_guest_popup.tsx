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
      signInWithGoogle().then(() => {
        navigate('/dayselect');
        onClose(); 
        document.body.classList.remove('popup-open'); 
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
          <p className="mb-5 text-xl text-center">Please sign in.</p>
    
          <div className="flex flex-col items-center mb-1">
    
            <button
              className='font-bold rounded bg-gray-200 text-gray-600 py-4 px-8 text-lg w-fit \
                          transform transition-transform hover:scale-90 active:scale-100e flex items-center'
              onClick={handleSignInWithGoogle}
            >
              <img src={LOGO} alt="Logo" className="mr-3 h-9" /> Continue with Google
            </button>
            
            <span className="mx-10 font-bold text-lg">—OR—</span>

            <span className="mx-4 text-lg">Enter name to Continue as Guest</span>
    
      {enableAnonymousSignIn && (
          <div className="flex items-center mt-4">
            <input
              className="rounded-l text-center py-4 px-4 text-lg bg-gray-200"
              placeholder="Name"
              name="name"
              type="text"
              onChange={(event) => setInputName(event.target.value)}
              value={inputName}
              autoComplete="off"
            />
            <button
              className="rounded-r font-bold bg-gray-400 text-white disabled:text-opacity-60 py-4 px-4 text-lg hover:outline-blue-500 hover:outline-3"
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