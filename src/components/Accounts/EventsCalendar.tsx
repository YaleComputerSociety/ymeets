import { LabelBadges } from './EventLabels';
import { useState } from 'react';
import type { AccountsPageEvent } from './AccountsPage';
import { datedDays, monthDays, occursOn, sameDay } from './eventCalendar';

export default function EventsCalendar({
  events,
  today,
  onOpen,
}: {
  events: AccountsPageEvent[];
  today: Date;
  onOpen: (id: string) => void;
}) {
  const [month, setMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const undated = events.filter((event) => !datedDays(event).length);
  return (
    <section
      className="text-gray-900 dark:text-gray-100 space-y-4"
      aria-label="Events calendar"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-semibold" aria-live="polite">
          {month.toLocaleDateString(undefined, {
            month: 'long',
            year: 'numeric',
          })}
        </h3>
        <div className="flex gap-4">
          <button
            aria-label="Previous month"
            onClick={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
            }
          >
            ←
          </button>
          <button
            onClick={() =>
              setMonth(new Date(today.getFullYear(), today.getMonth(), 1))
            }
          >
            Today
          </button>
          <button
            aria-label="Next month"
            onClick={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
            }
          >
            →
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Dates are shown in your local time zone. Proposed dates are marked
        “Proposed”.
      </p>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 min-w-[700px] border-l border-t border-gray-300 dark:border-gray-600">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="p-2 text-center border-r border-b border-gray-300 dark:border-gray-600 font-medium"
            >
              {day}
            </div>
          ))}
          {monthDays(month).map((day) => (
            <div
              key={day.toISOString()}
              className={`min-h-[120px] p-2 border-r border-b border-gray-300 dark:border-gray-600 ${day.getMonth() !== month.getMonth() ? 'bg-gray-100 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'}`}
            >
              <time
                dateTime={`${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`}
                aria-current={sameDay(day, today) ? 'date' : undefined}
                className={`inline-flex w-7 h-7 items-center justify-center rounded-full ${sameDay(day, today) ? 'bg-primary text-white' : ''}`}
              >
                {day.getDate()}
              </time>
              {events
                .filter((event) => occursOn(event, day))
                .map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onOpen(event.id)}
                    className="block text-left w-full rounded bg-blue-100 text-blue-900 p-1 mt-1 text-xs break-words"
                  >
                    {event.name}
                    {!event.confirmedStart && (
                      <span className="block">Proposed</span>
                    )}
                    {event.labels.length > 0 && (
                      <LabelBadges event={event} />
                    )}
                  </button>
                ))}
            </div>
          ))}
        </div>
      </div>
      {!events.some((event) =>
        monthDays(month).some((day) => occursOn(event, day))
      ) && <p>No dated events in this month.</p>}
      {undated.length > 0 && (
        <div>
          <h4 className="font-semibold">
            General weekdays / no scheduled date
          </h4>
          <div className="flex flex-wrap gap-3 mt-2">
            {undated.map((event) => (
              <button
                className="underline"
                key={event.id}
                onClick={() => onOpen(event.id)}
              >
                {event.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
