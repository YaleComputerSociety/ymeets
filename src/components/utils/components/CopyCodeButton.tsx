import { IconCopy } from '@tabler/icons-react';
import copy from 'clipboard-copy';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

type CopyCodeButtonProps = {
  customEventCode?: string;
  className?: string;
};

export default function CopyCodeButton({
  customEventCode,
  className = '',
}: CopyCodeButtonProps = {}) {
  const [copied, setCopied] = useState(false);
  const { code } = useParams();
  const usedCode = customEventCode ? customEventCode : code;

  return (
    <button
      onClick={() => {
        copy(`${window.location.origin}/timeselect/${usedCode}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={`text-sm lg:text-base flex items-center justify-center truncate max-w-[160px] ${
        copied
          ? 'bg-green-500 text-white dark:bg-green-600' // Remove hover from copied state
          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
      } border border-slate-300 dark:border-gray-600 font-medium py-0.5 sm:py-1 lg:py-1.5 px-5 rounded-lg transition-colors relative ${className}`}
    >
      <IconCopy className="inline-block w-4 lg:w-5 mr-2" />
      {copied ? 'Copied Link' : `${usedCode}`}
    </button>
  );
}
