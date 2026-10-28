import { useState, useEffect } from 'react';
import { IconAlertTriangle, IconX } from '@tabler/icons-react';

interface UnsavedChangesPopupProps {
  isOpen: boolean;
  isSaving: boolean;
  error?: string;
  onSaveAndLeave: () => void;
  onLeave: () => void;
  onStay: () => void;
}

export default function UnsavedChangesPopup({
  isOpen,
  isSaving,
  error,
  onSaveAndLeave,
  onLeave,
  onStay,
}: UnsavedChangesPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
      setTimeout(() => setIsAnimating(true), 10);
    } else if (isVisible) {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = '';
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isVisible]);

  // Proceeding with navigation unmounts this while open, so restore scrolling
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={isSaving ? undefined : onStay}
      />

      <div
        className={`relative bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl dark:shadow-[0_0_80px_20px_rgba(0,0,0,0.7)] border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isAnimating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        <button
          onClick={onStay}
          disabled={isSaving}
          className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close"
        >
          <IconX size={18} stroke={1.5} />
        </button>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <IconAlertTriangle
                size={22}
                className="text-yellow-600 dark:text-yellow-400"
                stroke={1.5}
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Unsaved changes
            </h3>
          </div>

          <p className="text-md text-gray-600 dark:text-gray-300 leading-relaxed">
            You have changes to your availability that haven&apos;t been saved.
            Do you want to save them before leaving?
          </p>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex flex-wrap justify-end gap-3">
            <button
              onClick={onStay}
              disabled={isSaving}
              className="px-5 py-2.5 font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 transition-all disabled:opacity-50"
            >
              Stay
            </button>
            <button
              onClick={onLeave}
              disabled={isSaving}
              className="px-5 py-2.5 font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-700 transition-all disabled:opacity-50"
            >
              Discard
            </button>
            <button
              onClick={onSaveAndLeave}
              disabled={isSaving}
              className="px-5 py-2.5 font-medium bg-primary text-white rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save & leave'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
