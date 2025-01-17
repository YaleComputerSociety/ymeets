import { IconCopy } from '@tabler/icons-react';
import copy from 'clipboard-copy';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function CopyCodeButton() {
  const [copied, setCopied] = useState(false);
  const { code } = useParams();

  return (
    <button
      onClick={() => {
        copy(`${window.location.origin}/timeselect/${code}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={`text-sm lg:text-base flex items-center justify-center ${
        copied
          ? 'bg-green-500 hover:bg-green-500 text-white'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
      } border border-slate-300 font-medium py-0.5 sm:py-1 lg:py-1.5 px-5 rounded-lg transition-colors relative`}
    >
      {<IconCopy className="inline-block w-4 lg:w-5 mr-2" />}
      {copied ? 'Copied to Clipboard' : `Share Link: ${code}`}
    </button>
  );
}
