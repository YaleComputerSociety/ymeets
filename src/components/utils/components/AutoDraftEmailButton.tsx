import { IconMail } from '@tabler/icons-react';

import { useParams } from 'react-router-dom';

type AutoDraftEmailProps = {
  customEventCode?: string;
  eventTitle?: string;
  yourName?: string;
  senderEmail: string;
};

export default function AutoDraftEmailButton({ customEventCode, eventTitle, yourName, senderEmail }: AutoDraftEmailProps) {
  const usedCode = customEventCode ?? '';
  const event = eventTitle ?? 'Unnamed Event';
  const userName = yourName ?? '';

  return (
    <button
      onClick={() => {
        const url = `https://ymeets.com/timeselect/${usedCode}`;

        const mailToUrl = `https://mail.google.com/mail/u/${senderEmail}/?view=cm&su=Invitation to Fill Out ymeets for ${encodeURIComponent(event)}&body=Hello%2C%0D%0A%0D%0AYou’ve%20been%20invited%20to%20fill%20out%20a%20ymeets%20to%20help%20find%20the%20best%20time%20for%20our%20meeting:%20%22${encodeURIComponent(event)}%22.%0D%0A%0D%0APlease%20click%20the%20link%20below%20to%20provide%20your%20availability:%0D%0A${encodeURIComponent(url)}%0D%0A%0D%0ALet%20me%20know%20if%20you%20have%20any%20questions.%20Looking%20forward%20to%20scheduling%20with%20you!%0D%0A%0D%0ABest,%0D%0A${encodeURIComponent(userName)}`

        window.open(mailToUrl, '_blank', 'noopener,noreferrer');
      }}
      className="text-sm lg:text-base flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-medium py-0.5 sm:py-1 lg:py-1.5 px-5 rounded-lg transition-colors relative"
    >
      <IconMail className="inline-block w-4 lg:w-5 mr-2" />
      AutoDraft Email
    </button>
  );
}
