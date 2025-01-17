import { useState } from 'react';
import { Popup } from './Popup'; // Import the base Popup component

export const AddGoogleCalendarPopup = ({
  isOpen,
  onClose,
  onCloseAndSubmit,
  onCloseAndAutofillAndSubmit,
  isFillingAvailability,
  children,
}: any) => {
  // State to track if autofill has been clicked
  const [isAutofillSubmitted, setIsAutofillSubmitted] = useState(false);

  // Handle autofill submission
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
      <div className="relative mt-6 space-y-3 ">
        <div className="flex justify-center">
          <button
            className="text-sm bg-gray-100 text-gray-700 font-medium py-1 px-4 rounded shadow-md hover:bg-gray-200 transition-colors"
            onClick={handleAutofillAndSubmit}
            disabled={isFillingAvailability}
            title={
              isAutofillSubmitted
                ? 'Submit and Update Autofill Availabilities'
                : 'Submit and Autofill Availabilities'
            }
          >
            {isAutofillSubmitted
              ? 'Submit and Update Autofill Availabilities'
              : 'Submit and Autofill Availabilities'}
          </button>
        </div>
        {isFillingAvailability && (
          <div className="w-6 h-6 border-4 border-t-primary border-gray-200 rounded-full animate-spin"></div>
        )}
      </div>
    </Popup>
  );
};
