import { useState } from 'react';
import {
  canCurrentUserRequestInvite,
  clearChosenTime,
  getAccountEmail,
  getAccountName,
  getChosenDayAndTime,
  getChosenLocation,
  getEmailAdminLateRequests,
  getPendingInviteRequests,
  getWorkingEvent,
  hasCurrentUserRequestedInvite,
  isCurrentUserInvited,
  markInvited,
  requestInvite,
} from '../../backend/events';
import { notifyAdminOfInviteRequest } from '../../emails/sendEmailHelpers';
import { getAddToCalendarUrl } from '../utils/functions/googleCalendarExport';
import ConfirmPopup from '../utils/components/ConfirmPopup';

interface MeetingScheduledCardProps {
  isAdmin: boolean;
  /** Reloads the event after a change, so everything shows the new state. */
  onChanged: () => void;
}

const button =
  'block w-full text-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50';
const primaryButton = `${button} bg-primary text-white hover:bg-blue-500`;
const secondaryButton = `${button} border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700`;
const note = 'text-xs text-gray-600 dark:text-gray-300';

function formatRange(start: Date, end: Date): string {
  const day = start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const time = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  // Labeled with the viewer's zone, since the grid may be showing another one
  const zone = end
    .toLocaleTimeString('en-US', { timeZoneName: 'short' })
    .split(' ')
    .pop();
  return `${day}, ${time(start)} – ${time(end)} ${zone}`;
}

/** The finalized meeting, shown to everyone once the admin has sent the invite. */
export default function MeetingScheduledCard({ isAdmin, onChanged }: MeetingScheduledCardProps) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const range = getChosenDayAndTime();
  if (!range) return null;
  const [start, end] = range;
  const location = getChosenLocation();

  /** Runs an action, then reloads the event. */
  const run = async (action: () => Promise<void>, failure: string) => {
    setBusy(true);
    setMessage(null);
    try {
      await action();
      onChanged();
    } catch (error) {
      console.error(error);
      setMessage(failure);
    } finally {
      setBusy(false);
    }
  };

  const askToBeAdded = () =>
    run(async () => {
      await requestInvite();
      const event = getWorkingEvent();
      if (getEmailAdminLateRequests()) {
        notifyAdminOfInviteRequest(
          event.details.adminAccountId,
          getAccountName(),
          getAccountEmail(),
          event.details.name,
          event.publicId
        );
      }
    }, 'Could not send your request. Please try again.');

  let actions: JSX.Element | null;
  if (isAdmin) {
    const pending = getPendingInviteRequests();
    const emails = pending.map((p) => p.email!);
    actions = (
      <div className="space-y-2">
        {pending.length > 0 && (
          <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-2 space-y-2">
            <p className="text-xs text-amber-900 dark:text-amber-200">
              <strong>
                {pending.length} {pending.length === 1 ? 'person' : 'people'} asked to be added:
              </strong>{' '}
              {pending.map((p) => `${p.name} (${p.email})`).join(', ')}
            </p>
            <button
              type="button"
              className={secondaryButton}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(emails.join(', '));
                  setMessage('Copied. Add them to the event in Google Calendar.');
                } catch {
                  setMessage("Couldn't copy. Their emails are listed above.");
                }
              }}
            >
              Copy their emails
            </button>
            <button
              type="button"
              className={primaryButton}
              disabled={busy}
              onClick={() => run(() => markInvited(emails), 'Could not save that. Please try again.')}
            >
              I added them in Google Calendar
            </button>
          </div>
        )}
        <button
          type="button"
          className={secondaryButton}
          disabled={busy}
          onClick={() => setConfirmClear(true)}
        >
          Clear meeting time
        </button>
      </div>
    );
  } else {
    let request: JSX.Element | null = null;
    if (isCurrentUserInvited()) {
      request = <p className={note}>You're on the invite. Check your email or Google Calendar.</p>;
    } else if (hasCurrentUserRequestedInvite()) {
      request = <p className={note}>Requested. The host will add you to the invite.</p>;
    } else if (canCurrentUserRequestInvite()) {
      request = (
        <button type="button" className={primaryButton} disabled={busy} onClick={askToBeAdded}>
          Ask to be added to the invite
        </button>
      );
    }
    actions = (
      <div className="space-y-2">
        {request}
        <a
          href={getAddToCalendarUrl(start, end, location)}
          target="_blank"
          rel="noopener noreferrer"
          className={secondaryButton}
        >
          Add to my calendar
        </a>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ConfirmPopup
        isOpen={confirmClear}
        title="Clear the meeting time?"
        message="The meeting time disappears for everyone. The Google Calendar event isn't changed."
        confirmText="Clear"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          setConfirmClear(false);
          run(clearChosenTime, 'Could not clear the meeting time. Please try again.');
        }}
      />
      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        Meeting scheduled
      </div>
      <div className="rounded-lg p-3 border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20 space-y-2">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatRange(start, end)}</p>
        {location && <p className={note}>{location}</p>}
        {actions}
        {message && <p className={note}>{message}</p>}
      </div>
    </div>
  );
}
