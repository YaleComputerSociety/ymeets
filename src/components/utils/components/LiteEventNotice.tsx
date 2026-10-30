import { getExpireAt, isLiteEvent } from '../../../backend/events';

/**
 * Explains the limits of a lite event (one created without signing in). Renders nothing for full events.
 */
export default function LiteEventNotice() {
  if (!isLiteEvent()) return null;

  const expireAt = getExpireAt();

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
      <span className="font-semibold">Quick event.</span> Anyone with the link
      can respond, but it can&apos;t be edited
      {expireAt
        ? ` and it will be deleted after ${expireAt.toLocaleDateString()}`
        : ''}
      .
    </div>
  );
}
