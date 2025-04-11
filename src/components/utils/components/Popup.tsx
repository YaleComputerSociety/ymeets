import ButtonSmall from './ButtonSmall';

export const Popup = ({
  isOpen,
  onClose,
  children,
  onCloseAndSubmit,
  buttonText = 'Submit', // Default text for the button
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
              <ButtonSmall
                bgColor="primary"
                textColor="white"
                themeGradient={false}
                onClick={onCloseAndSubmit}
              >
                {buttonText}
              </ButtonSmall>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
