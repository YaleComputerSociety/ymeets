/* eslint-disable */
import * as React from 'react';
// import background from '../landingpage/landingbackground.jpg'
import { useNavigate } from 'react-router-dom';
import { checkIfLoggedIn, getEventById } from '../../backend/events';
import graphic from './calendargraphic.png';
import LoginPopup from '../utils/components/LoginPopup';
import Footer from '../utils/components/Footer';
import Button from '../utils/components/Button';
import TutorialModal from '../utils/components/TutorialModal/TutorialModal';

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
import { sendAvailabilityUpdatedEmail } from '../../emails/sendEmailHelpers';

export default function HomePage() {
  const navigate = useNavigate();
  const [showInput, setShowInput] = React.useState(true);
  const [eventCode, setEventCode] = React.useState('');
  const [showLoginPopup, setShowLoginPopup] = React.useState<boolean>(false);
  const [showFormValidation, setShowFormValidation] =
    React.useState<boolean>(false);
  const [formErrorMessage, setFormErrorMessage] = React.useState('');
  const [emailStatus, setEmailStatus] = React.useState<
    'idle' | 'sending' | 'sent' | 'error'
  >('idle');

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
        navigate('/dashboard/' + eventCode);
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

  const [showTutorial, setTutorial] = React.useState<boolean>(false);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="h-1 md:h-8"></div>

      {showTutorial && (
        <TutorialModal
          isOpen={!!showTutorial}
          onClose={() => setTutorial(false)}
        />
      )}

      <div className="flex-grow w-full overflow-auto px-8 sm:p-14 pt-0 md:px-16 md:pt-14 lg:px-40 xl:px-60 mb-3">
        <div className="flex-col-reverse justify-center md:flex-row flex md:h-1/2 mb-10">
          <div className="justify-center self-center space-y-5 md:space-y-12 max-w-full mb-4 min-w-[70%] md:w-[90%]">
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

            <div className="flex flex-col justify-center items-center space-y-5 md:flex-row md:justify-start md:items-left md:space-x-12 md:space-y-0">
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
                bolded={false}
              >
                View My Events
              </Button>
            </div>

            <h1 className="text-text dark:text-text-dark">
              <b>New to ymeets? →  </b>
              <span 
              className='cursor-pointer hover:text-primary transition'
              onClick={() => setTutorial(true)}>
                <u>Click here for a quick walkthrough!</u>
              </span>
            </h1>

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
      </div>

      {/* Footer always at bottom */}
      <Footer />
    </div>
  );
}
