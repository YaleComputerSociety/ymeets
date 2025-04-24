/* eslint-disable */
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { getEventById } from '../../firebase/events';
import graphic from './calendargraphic.png';
import LoginPopup from '../utils/components/LoginPopup';
import Footer from '../utils/components/Footer';
import Button from '../utils/components/Button';
import EventTypePopup from '../poll/EventTypePopup';
import { IconChartBar } from '@tabler/icons-react';
import { IconClock } from '@tabler/icons-react';

import {
  IconMapPinFilled,
  IconBrandGoogle,
  IconLock,
} from '@tabler/icons-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [showInput, setShowInput] = React.useState(true);
  const [eventCode, setEventCode] = React.useState('');
  const [showLoginPopup, setShowLoginPopup] = React.useState<boolean>(false);
  const [showDoodlePopup, setShowDoodlePopup] = React.useState<boolean>(false);
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
      goToEvent();
    }
  };

  const handleDoodlePopupClose = () => {
    setShowDoodlePopup(false);
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
            <div
              className="flex flex-col justify-center items-center space-y-5 \
                                    md:flex-row md:justify-start md:items-left md:space-x-12 md:space-y-0"
            >
              <Button
                bgColor="primary"
                textColor="white"
                onClick={() => {
                  console.log('clicked');
                  setShowDoodlePopup(true);
                }}
                // onClick={() => navigate('/dayselect')}
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
        {showDoodlePopup && (
          <EventTypePopup
            isOpen={showDoodlePopup}
            onClose={handleDoodlePopupClose}
          >
            <div className="flex flex-col items-center justify-center space-y-8 py-8 px-4">
              <h2 className="text-3xl font-bold text-text dark:text-text-dark mb-2">
                Choose Your Event Type
              </h2>

              <div
                onClick={() => navigate('/dayselect')}
                className="w-full max-w-md rounded-lg p-6 transition-all duration-200
                border-2 border-primary hover:scale-102 cursor-pointer
                hover:bg-primary hover:text-white group"
              >
                <div className="flex items-center gap-4">
                  <IconClock className="w-12 h-12 group-hover:text-white" />
                  <div>
                    <h3 className="text-xl font-semibold mb-1">
                      Standard ymeet
                    </h3>
                    <p className="text-gray-600 group-hover:text-gray-200">
                      Find the perfect meeting time with an enhanced when2meet
                      experience
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => navigate('/poll/create')}
                className="w-full max-w-md rounded-lg p-6 transition-all duration-200
                border-2 border-primary hover:scale-102 cursor-pointer
                hover:bg-primary hover:text-white group"
              >
                <div className="flex items-center gap-4">
                  <IconChartBar className="w-12 h-12 group-hover:text-white" />
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Quick Poll</h3>
                    <p className="text-gray-600 group-hover:text-gray-200">
                      Create a poll with custom options for quick decisions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </EventTypePopup>
        )}
        <Footer />
      </div>
    </>
  );
}
