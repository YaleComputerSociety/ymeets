import { Popup } from '../utils/components/Popup';

export default function EventTypePopup({
  isOpen,
  onClose,
  onCloseAndSubmit,
  showSubmitButton = false,
  children,
}: any) {
  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      onCloseAndSubmit={onCloseAndSubmit}
      showSubmitButton={showSubmitButton}
    >
      {children}
    </Popup>
  );
}
