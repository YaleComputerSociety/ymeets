import { Popup } from './Popup';

export const AddGoogleCalendarPopup = ({
  isOpen,
  onClose,
  onCloseAndSubmit,
  children,
}: any) => {
  const handleContinue = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      onCloseAndSubmit={handleContinue}
      buttonText="Continue"
    >
      {children}
    </Popup>
  );
};
