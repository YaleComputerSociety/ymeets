import { IconUsers } from '@tabler/icons-react';
import { useState } from 'react';
import InviteModal from './InviteModal';

type InviteButtonProps = {
  eventCode: string;
  eventTitle: string;
  senderName: string;
  className?: string;
};

export default function InviteButton({
  eventCode,
  eventTitle,
  senderName,
  className = '',
}: InviteButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`text-sm lg:text-base flex items-center justify-center border font-medium py-0.5 sm:py-1 lg:py-1.5 px-5 rounded-lg transition-colors whitespace-nowrap
          bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300
          dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:border-gray-600
          ${className}`}
      >
        <IconUsers className="inline-block w-5 h-5 lg:w-6 lg:h-6 mr-2" />
        Invite
      </button>

      <InviteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventCode={eventCode}
        eventTitle={eventTitle}
        senderName={senderName}
      />
    </>
  );
}
