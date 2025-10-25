import { IconCopy, IconShare } from '@tabler/icons-react';
import copy from 'clipboard-copy';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

type CopyCodeButtonProps = {
  customEventCode?: string;
  className?: string;
  showAsShareButton?: boolean; // New prop to control button appearance
};

export default function CopyCodeButton({
  customEventCode,
  className = '',
  showAsShareButton = true, // Default to share button style
}: CopyCodeButtonProps = {}) {
  const [copied, setCopied] = useState(false);
  const { code } = useParams();
  const usedCode = customEventCode ?? code ?? '';

  return (
    <button
      onClick={() => {
        copy(`${window.location.origin}/dashboard/${usedCode}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={`text-sm lg:text-base flex items-center justify-center border font-medium py-0.5 sm:py-1 lg:py-1.5 px-5 rounded-lg transition-colors relative
        ${copied
          ? 'bg-green-500 text-white border-green-500'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:border-gray-600'
        }
        ${className}`}
    >
      {showAsShareButton ? (
        <>
          <IconCopy className="inline-block w-4 lg:w-5 mr-2" />
          {copied ? 'Copied!' : 'Copy Link'}
        </>
      ) : (
        <>
          <IconCopy className="inline-block w-4 lg:w-5 mr-2" />
          {copied ? 'Copied!' : usedCode}
        </>
      )}
    </button>
  );
}