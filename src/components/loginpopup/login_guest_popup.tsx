import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login_guest_popup.css';
import { User, UserCredential, signInAnonymously, updateProfile } from 'firebase/auth';
import { signInWithGoogle } from '../../firebase/auth';
import { auth } from '../../firebase/firebase';

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
              { enableAnonymousSignIn &&
              <>
                <input className="rounded-l-full text-center ml-4 py-4 px-4 text-lg bg-ymeets-light-blue"
                  placeholder="Name"
                  name="name"
                  type="text"
                  onChange={(event) => setInputName(event.target.value)}
                  value={inputName}
                  autoComplete="off"
                  />
                <button className="rounded-r-full font-bold bg-ymeets-light-blue text-black disabled:text-opacity-60 py-4 px-4 text-lg hover:outline-blue-500 hover:outline-3"
                  onClick={handleSignInWithoutGoogle}
                  disabled={inputName === ""}
                  >
                    Continue without Google
                </button>
              </>
              }
            </div>
          </div>
        </div>
    );
};
  