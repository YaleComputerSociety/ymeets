import { Popup } from './Popup';

export const AddGoogleCalendarPopup = ({
  isOpen,
  onClose,
  onCloseAndSubmit,
  children,
}: any) => {
  const handleContinue = () => {
    if (onCloseAndSubmit) {
      onCloseAndSubmit();
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
