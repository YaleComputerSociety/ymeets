/* eslint-disable */
import * as React from 'react';
// import background from '../landingpage/landingbackground.jpg'
import { useNavigate } from 'react-router-dom';
import { checkIfLoggedIn, getEventById } from '../../firebase/events';
import graphic from './calendargraphic.png';
import LoginPopup from '../utils/components/LoginPopup';
import Footer from '../utils/components/Footer';
import Button from '../utils/components/Button';

// import { SiGooglecalendar } from 'react-icons/si';
// import { FaLock } from 'react-icons/fa';
// import { CiLocationOn } from 'react-icons/ci';

import {
  IconMapPinFilled,
  IconMapPin,
  IconBrandGoogle,
  IconLockAccessOff,
  IconLock,
} from '@tabler/icons-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [showInput, setShowInput] = React.useState(true);
  const [eventCode, setEventCode] = React.useState('');
  const [showLoginPopup, setShowLoginPopup] = React.useState<boolean>(false);
  const [showFormValidation, setShowFormValidation] =
    React.useState<boolean>(false);
  const [formErrorMessage, setFormErrorMessage] = React.useState('');

  function formValidationPopup(message: string) {
    setShowFormValidation(true);
    setFormErrorMessage(message);
  }

  const showEventInput = () => {
    setShowInput(!showInput);
  };
  const updateEventCode = (event: React.BaseSyntheticEvent<KeyboardEvent>) => {
    setEventCode(event.target.value);
  };
  const handleKeyPress = (e: any) => {
    if (e.key == 'Enter') {
      validateAndGoToEvent();
    }
  };

  const goToEvent = () => {
    getEventById(eventCode)
      .then((result) => {
        navigate('/groupview/' + eventCode);
      })
      .catch((err) => {
        formValidationPopup('Code is invalid.');
      });
  };

  const validateAndGoToEvent = () => {
    if (eventCode.length != 6) {
      formValidationPopup('Codes are 6 characters long.');
    } else {
      goToEvent();
    }
  };

  const handleLoginPopupClose = (successFlag?: boolean) => {
    setShowLoginPopup(false);
    if (successFlag) {
      // instead of checkIfLoggedIn because login is async
      goToEvent();
    }
  };

  return (
    <>
      <div className="h-1 md:h-8"></div>
      <div
        className="h-fit w-full overflow-autop-8 sm:p-14 pt-0 \
                        md:px-16 md:pt-14 lg:px-40 xl:px-60 mb-3"
      >
        <div
          className="flex-col-reverse justify-center \ 
                            md:flex-row flex md:h-1/2 mb-10"
        >
          <div className="justify-center self-center space-y-10 md:space-y-12 max-w-full mb-4 min-w-[70%] md:w-[90%]">
            <div className="flex flex-col space-y-3 md:space-y-7 w-full md:justify-end">
              <h1 className="text-text dark:text-text-dark font-bold text-center text-3xl sm:text-5xl md:text-left lg:text-left xl:text-5xl md:pr-8 mt-2 md:mt-0 p-2 lg:p-0">
                A cleaner, faster way to schedule meetings on Yale's campus.
              </h1>
              <h3 className="md:block text-text dark:text-text-dark text-lg sm:text-2xl md:text-left xl:text-2xl md:pr-8">
                <div className="hidden lg:flex flex-col gap-1 text-[90%]">
                  <div className="flex flex-row text-md gap-3 items-center">
                    <IconBrandGoogle />
                    <p>GCal integration</p>
                  </div>
                  <div className="flex flex-row text-md gap-3 items-center">
                    <IconMapPinFilled />
                    <p className="hidden md:block">
                      Vote on a preferred campus meeting place
                    </p>
                    <p className="md:hidden">
                      Vote on a preferred meeting place
                    </p>
                  </div>
                  <div className="flex flex-row text-md gap-3 items-center">
                    <IconLock />
                    <p>
                      Lock in the best time and place to gather with a selection
                    </p>
                  </div>
                </div>
              </h3>
            </div>
            <div
              className="flex flex-col justify-center items-center space-y-5 \
                                    md:flex-row md:justify-start md:items-left md:space-x-12 md:space-y-0"
            >
              <Button
                bgColor="primary"
                textColor="white"
                onClick={() => navigate('/dayselect')}
              >
                Create Event
              </Button>

              <Button
                bgColor="white"
                textColor="black"
                themeGradient={false}
                onClick={() => navigate('/useraccount')}
              >
                View My Events
              </Button>

              {/* jeet: this was from legacy im a participant */}
              
              {/* <div
                className={showInput ? 'hidden' : 'flex flex-nowrap relative'}
              >
                <label className="hidden" htmlFor="eventCode">
                  Event Code
                </label>
                <input
                  className="rounded-l-full text-center py-4 px-4 text-lg focus:outline-primary"
                  placeholder="Enter your event code"
                  name="eventCode"
                  onInput={updateEventCode}
                  onKeyDown={handleKeyPress}
                  autoComplete="off"
                />
                <button
                  className="rounded-r-full font-bold bg-white text-black py-4 px-4 text-lg hover:text-primary"
                  onClick={validateAndGoToEvent}
                >
                  Join
                </button>
                <div
                  className={
                    !showFormValidation
                      ? 'hidden'
                      : 'text-primary absolute -bottom-10 mb-2 text-center w-full'
                  }
                >
                  Try Again: {formErrorMessage}
                </div>
              </div> */}
            </div>
          </div>
          <div className="flex md:w-[40%] justify-center pb-1 md:pb-4 sm:pb-7 md:pb-0 md:pl-0">
            <img
              src={graphic}
              alt="graphic"
              className="opacity-80 w-[75%] sm:w-2/3 max-w-xs sm:h-auto sm:w-full self-center lg:w-[100%]"
            />
          </div>
        </div>
        {showLoginPopup && (
          <LoginPopup
            onClose={handleLoginPopupClose}
            enableAnonymousSignIn={true}
            code={eventCode}
          />
        )}
        <Footer />
      </div>
    </>
  );
}
