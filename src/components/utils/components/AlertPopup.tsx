import { useState, useEffect } from 'react';
import { IconInfoCircle, IconX } from '@tabler/icons-react';

interface AlertPopupProps {
  title: string;
  message: string;
  isOpen: boolean;
  onClose: () => void;
  confirmText?: string;
}

export default function AlertPopup({
  title,
  message,
  isOpen,
  onClose,
  confirmText = 'OK',
}: AlertPopupProps) {
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

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <div
        className={`relative bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isAnimating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close"
        >
          <IconX size={18} stroke={1.5} />
        </button>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <IconInfoCircle
                size={22}
                className="text-blue-600 dark:text-blue-400"
                stroke={1.5}
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>

          <p className="text-md text-gray-600 dark:text-gray-300 leading-relaxed">
            {message}
          </p>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
