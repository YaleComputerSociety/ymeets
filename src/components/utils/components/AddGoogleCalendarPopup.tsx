import { useState } from 'react';
import { Popup } from './Popup';
import { IoSparkles } from 'react-icons/io5';

export const AddGoogleCalendarPopup = ({
  isOpen,
  onClose,
  onCloseAndSubmit,
  onCloseAndAutofillAndSubmit,
  isFillingAvailability,
  children,
}: any) => {
  const [isAutofillSubmitted, setIsAutofillSubmitted] = useState(false);

  const handleAutofillAndSubmit = () => {
    setIsAutofillSubmitted(true);
    if (onCloseAndAutofillAndSubmit) {
      onCloseAndAutofillAndSubmit();
    }
  };

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      onCloseAndSubmit={onCloseAndSubmit}
    >
      {children}
      <div className="relative mt-6 space-y-3">
        <div className="flex justify-center">
          <button
            className="group relative flex items-center justify-center text-sm font-medium py-3 px-6 rounded-lg
                       bg-gradient-to-r from-blue-500 to-purple-600 
                       text-white
                       transition-all duration-300
                       shadow-lg shadow-blue-500/25
                       hover:shadow-xl hover:shadow-blue-500/40 hover:scale-102
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            onClick={handleAutofillAndSubmit}
            disabled={isFillingAvailability}
            title={
              isAutofillSubmitted
                ? 'Submit and Update Autofill Availabilities'
                : 'Submit and Autofill Availabilities'
            }
          >
            <div
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 
                          group-hover:opacity-20 transition-opacity duration-300"
            ></div>
            <IoSparkles className="mr-2 text-lg animate-pulse text-white" />
            {isAutofillSubmitted
              ? 'Submit and Update Autofill Availabilities'
              : 'Submit and Autofill Availabilities'}
          </button>
        </div>
        {isFillingAvailability && (
          <div className="flex justify-center mt-3">
            <div className="w-6 h-6 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </Popup>
  );
};
