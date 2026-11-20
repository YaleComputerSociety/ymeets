import { IconInfoCircle, IconX } from '@tabler/icons-react';

interface ConfirmPopupProps {
  title: string;
  message: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

/** A yes/no dialog styled like AlertPopup. */
export default function ConfirmPopup({
  title,
  message,
  isOpen,
  onConfirm,
  onCancel,
  confirmText = 'Yes',
  cancelText = 'Cancel',
}: ConfirmPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close"
        >
          <IconX size={18} stroke={1.5} />
        </button>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <IconInfoCircle size={22} className="text-blue-600 dark:text-blue-400" stroke={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          </div>
          <p className="text-md text-gray-600 dark:text-gray-300 leading-relaxed">{message}</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-5 py-2.5 font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
