/* eslint-disable */
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
                className="text-lg bg-blue-500 w-fit text-white font-medium py-2 px-5 rounded-lg mt-4 hover:bg-ymeets-med-blue active:bg-ymeets-light-blue transition-colors"
                onClick={onCloseAndSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
