import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconDotsVertical, IconPencil, IconTrash } from '@tabler/icons-react';
import { deleteEvent } from '../../../backend/events';
import DeletePopup from './DeletePopup';

interface EventOptionsMenuProps {
  eventCode: string | undefined;
}

export default function EventOptionsMenu({ eventCode }: EventOptionsMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const nav = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    if (isMenuOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        const menuButton = document.getElementById('event-menu-button');
        const menuDropdown = document.getElementById('event-menu-dropdown');

        if (!menuButton?.contains(target) && !menuDropdown?.contains(target)) {
          setIsMenuOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isMenuOpen]);

  const handleDeleteEvent = async () => {
    if (eventCode) {
      await deleteEvent(eventCode);
      nav('/');
    }
  };

  return (
    <>
      <div className="relative flex-shrink-0">
        <button
          id="event-menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Event options"
        >
          <IconDotsVertical size={20} className="text-gray-500 dark:text-gray-400" />
        </button>
        {isMenuOpen && (
          <div
            id="event-menu-dropdown"
            className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            <button
              onClick={() => {
                setIsMenuOpen(false);
                nav(`/edit/${eventCode}`);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
            >
              <IconPencil size={16} />
              Edit Event
            </button>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                setShowDeletePopup(true);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
            >
              <IconTrash size={16} />
              Delete Event
            </button>
          </div>
        )}
      </div>

      <DeletePopup
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        isOpen={showDeletePopup}
        onConfirm={handleDeleteEvent}
        onCancel={() => setShowDeletePopup(false)}
      />
    </>
  );
}
