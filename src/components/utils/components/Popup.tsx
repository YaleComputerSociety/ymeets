// /* eslint-disable */
// export const Popup = ({ isOpen, onClose, children, onCloseAndSubmit, onSelectAllAndFill }: any) => {
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
//               <button
//                 className="text-lg bg-blue-500 w-fit text-white font-medium py-2 px-5 rounded-lg mt-4 hover:bg-ymeets-med-blue active:bg-ymeets-light-blue transition-colors"
//                 onClick={onCloseAndSubmit}
//               >
//                 Submit
//               </button>


//               {/* New "Select All & Fill Availability" Button */}
//               <button
//                 className="text-lg bg-green-500 w-fit text-white font-medium py-2 px-5 rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors"
//                 onClick={onSelectAllAndFill}
//               >
//                 Select All & Fill
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };


/* eslint-disable */
import GEMINI_ICON from '../../../static/gemini-icon.png'; // Replace with the actual path to your Gemini icon

export const Popup = ({
  isOpen,
  onClose,
  children,
  onCloseAndSubmit,
  onSelectAllAndFill,
  isFillingAvailability,
}: any) => {
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
              {/* Container for buttons */}
              <div className="relative mt-6">
                {/* Centered Submit Button */}
                <div className="flex justify-center">
                  <button
                    className="text-lg bg-blue-500 w-fit text-white font-medium py-2 px-5 rounded-lg mt-4 hover:bg-ymeets-med-blue active:bg-ymeets-light-blue transition-colors"
                    onClick={onCloseAndSubmit}
                  >
                    Submit
                  </button>
                </div>

                {/* "Select All & Fill" Button and Spinner */}
                <div className="absolute top-0 right-0 flex items-center mt-4">
                  {/* "Select All & Fill" Button */}
                  <button
                    className="rounded-full bg-white p-2 shadow-md mr-2"
                    onClick={onSelectAllAndFill}
                    disabled={isFillingAvailability}
                    title="Select All and Fill Availability"
                  >
                    <img
                      src={GEMINI_ICON}
                      alt="Select All and Fill"
                      className="h-6 w-6"
                    />
                  </button>

                  {/* Loading Spinner */}
                  {isFillingAvailability && (
                    <div className="w-6 h-6 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
