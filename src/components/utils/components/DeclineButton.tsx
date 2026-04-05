import { wrappedSaveDeclinedParticipantDetails } from '../../../backend/events';

interface DeclineButtonProps {
  onDecline: () => void;
}

export default function DeclineButton({ onDecline }: DeclineButtonProps) {
  return (
    <button
      className="w-full text-sm bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 dark:border-red-800 py-2.5 px-4 rounded-lg transition-all duration-200 font-medium"
      onClick={async () => {
        await wrappedSaveDeclinedParticipantDetails();
        onDecline();
      }}
    >
      Decline
    </button>
  );
}
