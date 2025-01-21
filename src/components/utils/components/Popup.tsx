// /* eslint-disable */
// import React, { useState } from 'react';
// import GEMINI_ICON from '../../../static/gemini-icon.png'; // Replace with the actual path to your Gemini icon

// export const Popup = ({
//   isOpen,
//   onClose,
//   children,
//   onCloseAndSubmit,
//   onCloseAndAutofillAndSubmit,
//   isFillingAvailability,
// }: any) => {
//   // State to track if autofill has been clicked
//   const [isAutofillSubmitted, setIsAutofillSubmitted] = useState(false);

//   const handleAutofillAndSubmit = () => {
//     setIsAutofillSubmitted(true);
//     onCloseAndAutofillAndSubmit();
//   };

//   return (
//     <>
//       {isOpen && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="flex items-center justify-center min-h-screen">
//             <div
//               className="fixed inset-0 bg-black opacity-50"
//               onClick={onClose}
//             />
//             <div className="relative bg-white p-8 rounded-lg shadow-md text-center z-60">
//               <span
//                 className="absolute top-0 right-0 m-4 text-lg cursor-pointer"
//                 onClick={onClose}
//               >
//                 &times;
//               </span>
//               {children}
//               <br />
//               {/* Container for buttons */}
//               <div className="relative mt-6 space-y-3">
//                 {/* "Submit & Autofill Availabilities" Button */}
//                 <div className="flex justify-center">
//                   <button
//                     className="text-sm bg-gray-100 text-gray-700 font-medium py-1 px-4 rounded shadow-md hover:bg-gray-200 transition-colors"
//                     onClick={handleAutofillAndSubmit}
//                     disabled={isFillingAvailability}
//                     title={
//                       isAutofillSubmitted
//                         ? 'Submit and Update Autofill Availabilities'
//                         : 'Submit and Autofill Availabilities'
//                     }
//                   >
//                     {isAutofillSubmitted
//                       ? 'Submit and Update Autofill Availabilities'
//                       : 'Submit and Autofill Availabilities'}
//                   </button>
//                 </div>

//                 {/* Centered Submit Button with Spinner */}
//                 <div className="flex justify-center items-center space-x-4 mt-4">
//                   <button
//                     className="text-lg bg-primary w-fit text-white font-medium py-2 px-5 rounded-lg hover:bg-ymeets-med-blue active:bg-ymeets-light-blue transition-colors"
//                     onClick={onCloseAndSubmit}
//                   >
//                     Submit
//                   </button>
//                   {isFillingAvailability && (
//                     <div className="w-6 h-6 border-4 border-t-primary border-gray-200 rounded-full animate-spin"></div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

export const Popup = ({ isOpen, onClose, children, onCloseAndSubmit }: any) => {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div
              className="fixed inset-0 bg-black opacity-50"
              onClick={onClose}
            />
            <div className="relative bg-white p-8 rounded-lg shadow-md text-center z-60">
              <span
                className="absolute top-0 right-0 m-4 text-lg cursor-pointer"
                onClick={onClose}
              >
                &times;
              </span>
              {children}
              <br />
              <button
                className="text-lg bg-primary w-fit text-white font-medium py-2 px-5 rounded-lg mt-4 hover:bg-ymeets-med-blue active:bg-ymeets-light-blue transition-colors"
                onClick={onCloseAndSubmit}
              >
                Fill In Availabilities Manually
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
