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
        copy(`${window.location.origin}/groupview/${usedCode}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={`text-sm lg:text-base flex items-center justify-center truncate max-w-[160px] ${
        copied
          ? 'bg-green-500 hover:bg-green-500 border-green-500 hover:border-green-500 text-white'
          : 'bg-slate-100 hover:bg-slate-200 border-slate-300 hover:border-slate-300 text-slate-700'
      } border font-medium py-0.5 sm:py-1 lg:py-1.5 px-3 rounded-lg transition-colors relative`}
    >
      {<IconCopy className="inline-block w-4 lg:w-5 mr-2" />}
      {copied ? 'Copied!' : `${usedCode}`}
    </button>
  );
}
