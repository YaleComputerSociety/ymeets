import EventSelect from './EventSelect';
import { useState, useEffect, useRef, useMemo } from 'react';
import {
  IconPlus,
  IconSearch,
  IconTrash,
  IconEdit,
  IconChevronDown,
  IconLayoutGrid,
  IconLayoutList,
  IconCalendar,
} from '@tabler/icons-react';

import {
  getAccountId,
  deleteEvent,
  getParsedAccountPageEventsForUser,
} from '../../backend/events';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../backend/firebase';
import { LoadingAnim } from '../utils/components/LoadingAnim';
import CopyCodeButton from '../utils/components/CopyCodeButton';
import Button from '../utils/components/Button';
import DeletePopup from '../utils/components/DeletePopup';

import EventsCalendar from './EventsCalendar';
import EventLabels, { LabelBadges, LabelColors } from './EventLabels';
import { eventPeriod } from './eventCalendar';

export interface AccountsPageEvent {
  calendarDates: Date[];
  confirmedStart?: Date;
  confirmedEnd?: Date;
  labels: string[];
  labelColors?: LabelColors;
  name: string;
  id: string;
  dates: string;
  startTime: string;
  endTime: string;
  location: string;
  iAmCreator: boolean;
  dateCreated: Date;
  lastModified: Date;
}

/**
 * Page Component. Renders the events associated with a logged in Google account.
 * Renders nothing if no events are associated or the user is logged in anonymously
 * or not at all
 * @returns Page Component Render
 */
export default function AccountsPage() {
  useEffect(() => {
    const retrieveAndSetEvents = async () => {
      const accountID = getAccountId();

      if (accountID && accountID !== '') {
        await getParsedAccountPageEventsForUser(accountID).then(
          (parsedEvents) => {
            setEvents(parsedEvents);
          }
        );
      } else {
        setEvents([]);
      }
    };

    return auth.onAuthStateChanged(() => {
      retrieveAndSetEvents();
    });
  }, []);

  const nav = useNavigate();
  const [filter, setFilter] = useState('');
  const [events, setEvents] = useState<AccountsPageEvent[] | undefined>();
  const [hasDeletedEvent, setHasDeletedEvent] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<
    'dateCreated' | 'lastModified' | 'label' | ''
  >('');
  const [selectedEventToDelete, setSelectedEventToDelete] =
    useState<AccountsPageEvent | null>(null);
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>(
    'grid'
  );
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'participant'>(
    'all'
  );

  const handleInputChange = (e: any) => {
    setFilter(e.target.value.toLowerCase());
  };

  const [period, setPeriod] = useState('all');
  const [labelFilter, setLabelFilter] = useState('');
  const [today, setToday] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setToday(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const filledOutRef = useRef<HTMLDivElement>(null);
  const labels = Array.from(
    new Set((events || []).flatMap((event) => event.labels))
  ).sort((a, b) => a.localeCompare(b));
  const flatFilteredEvents = useMemo(
    () =>
      (events || [])
        .filter((event) => {
          return (
            (event.id.toLowerCase().includes(filter) ||
              event.name.toLowerCase().includes(filter)) &&
            (roleFilter === 'all' ||
              (roleFilter === 'admin'
                ? event.iAmCreator
                : !event.iAmCreator)) &&
            (period === 'all' || eventPeriod(event, today) === period) &&
            (!labelFilter || event.labels.includes(labelFilter))
          );
        })
        .sort((a, b) => {
          if (sortBy === 'label') {
            const first = [...a.labels].sort().join(', ');
            const second = [...b.labels].sort().join(', ');
            return (
              (first && !second
                ? -1
                : !first && second
                  ? 1
                  : first.localeCompare(second)) || a.name.localeCompare(b.name)
            );
          }
          return (
            new Date(
              sortBy === 'dateCreated' ? b.dateCreated : b.lastModified
            ).getTime() -
            new Date(
              sortBy === 'dateCreated' ? a.dateCreated : a.lastModified
            ).getTime()
          );
        }),
    [events, filter, roleFilter, period, labelFilter, sortBy, today]
  );
  const createdCount = flatFilteredEvents.filter(
    (event) => event.iAmCreator
  ).length;
  const filledCount = flatFilteredEvents.filter(
    (event) => !event.iAmCreator
  ).length;
  const renderLabels = (event: AccountsPageEvent) => (
    <EventLabels
      event={event}
      onSave={(labels, labelColors) =>
        setEvents((previous) =>
          previous?.map((item) =>
            item.id === event.id ? { ...item, labels, labelColors } : item
          )
        )
      }
    />
  );

  const showCreated = roleFilter === 'all' || roleFilter === 'admin';
  const showFilled = roleFilter === 'all' || roleFilter === 'participant';

  return (
    <div className="min-h-screen flex flex-col items-center">
      <DeletePopup
        title="Confirm Deletion"
        message="Are you sure you want to delete this event? This action cannot be undone."
        isOpen={selectedEventToDelete !== null && !dontAskAgain}
        onConfirm={() => {
          if (selectedEventToDelete) {
            deleteEvent(selectedEventToDelete.id)
              .then(() => {
                setHasDeletedEvent(true);
                setEvents(
                  events?.filter((e) => e.id !== selectedEventToDelete.id)
                );
              })
              .catch((err) => {});
            setSelectedEventToDelete(null);
          }
        }}
        onCancel={() => setSelectedEventToDelete(null)}
        showCheckbox={true}
        onCheckboxChange={() => setDontAskAgain(true)}
      />
      <div className="w-full max-w-full pt-2 sm:pt-4 pb-10 sm:pb-14 px-5 xs:px-8 md:px-12 lg:px-16 xl:px-20 max-w-8xl flex flex-col gap-6 xs:gap-8 sm:gap-10 flex-grow w-full">
        <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6 md:gap-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-text dark:text-text-dark whitespace-nowrap mr-10">
              Your Events
            </h2>
            <Button
              onClick={() => nav('/dayselect')}
              textColor="white"
              bgColor="primary"
              className="sm:hidden"
            >
              <span className="flex items-center justify-center">
                <IconPlus className="w-5 h-5" />
              </span>
            </Button>
          </div>

          <div className="flex flex-row flex-wrap items-center gap-2 w-full">
            <div className="relative w-full sm:w-50 flex-1 min-w-0">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <IconSearch className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search events..."
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2.5 md:py-4 text-sm md:text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg transition-all
                  focus:border-primary focus:ring-2 focus:ring-primary/20
                  hover:border-gray-400 dark:hover:border-gray-500
                  placeholder-gray-400 dark:placeholder-gray-500
                  dark:text-white min-h-[40px] md:min-h-[60px]"
              />
            </div>

            <Button
              onClick={() => nav('/dayselect')}
              textColor="white"
              bgColor="primary"
              className="hidden sm:block"
            >
              <span className="flex items-center justify-center gap-2">
                <IconPlus className="w-5 h-5 md:w-6 md:h-6" />
                Create Event
              </span>
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">View</span>
              <div
                className="flex gap-1 rounded-lg bg-gray-100 dark:bg-gray-900 p-1"
                role="group"
                aria-label="Event view"
              >
                {(
                  [
                    { value: 'grid', label: 'Cards', Icon: IconLayoutGrid },
                    { value: 'list', label: 'List', Icon: IconLayoutList },
                    {
                      value: 'calendar',
                      label: 'Calendar',
                      Icon: IconCalendar,
                    },
                  ] as const
                ).map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    onClick={() => setViewMode(value)}
                    aria-pressed={viewMode === value}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors ${viewMode === value ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-primary'}`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <span
              className="text-xs text-gray-500 dark:text-gray-400"
              aria-live="polite"
            >
              {flatFilteredEvents.length} events
            </span>
          </div>
          <details className="group border-t border-gray-100 dark:border-gray-700">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
              <span>
                Filter &amp; sort
                {(period !== 'all' || roleFilter !== 'all' || labelFilter) && (
                  <span className="ml-2 rounded-full bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 text-xs text-primary">
                    {
                      [
                        period !== 'all',
                        roleFilter !== 'all',
                        !!labelFilter,
                      ].filter(Boolean).length
                    }{' '}
                    active
                  </span>
                )}
              </span>
              <IconChevronDown className="h-4 w-4 mr-1 transition-transform group-open:rotate-180" />
            </summary>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 pb-4">
              <label className="space-y-1.5 text-xs font-medium">
                <span>Dates</span>
                <EventSelect
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option value="all">All dates</option>
                  <option value="past">Past events</option>
                  <option value="upcoming">Current &amp; future</option>
                  <option value="undated">General weekdays / undated</option>
                </EventSelect>
              </label>
              <label className="space-y-1.5 text-xs font-medium">
                <span>Your role</span>
                <EventSelect
                  value={roleFilter}
                  onChange={(e) =>
                    setRoleFilter(e.target.value as typeof roleFilter)
                  }
                >
                  <option value="all">All roles</option>
                  <option value="admin">Admin</option>
                  <option value="participant">Participant</option>
                </EventSelect>
              </label>
              <label className="space-y-1.5 text-xs font-medium">
                <span>Label</span>
                <EventSelect
                  value={labelFilter}
                  onChange={(e) => setLabelFilter(e.target.value)}
                >
                  <option value="">All labels</option>
                  {Array.from(
                    new Set([...labels, ...(labelFilter ? [labelFilter] : [])])
                  ).map((label) => (
                    <option key={label} value={label}>
                      {label}
                    </option>
                  ))}
                </EventSelect>
              </label>
              <label className="space-y-1.5 text-xs font-medium">
                <span>Order</span>
                <EventSelect
                  disabled={viewMode === 'calendar'}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                >
                  <option value="">Recently updated</option>
                  <option value="dateCreated">Newest created</option>
                  <option value="label">Label A–Z</option>
                </EventSelect>
                {viewMode === 'calendar' && (
                  <span className="block text-gray-400">
                    Calendar uses date order
                  </span>
                )}
              </label>
            </div>
            <div className="px-4 pb-3">
              <button
                className="text-xs text-primary hover:underline"
                onClick={() => {
                  setPeriod('all');
                  setRoleFilter('all');
                  setLabelFilter('');
                  setSortBy('');
                }}
              >
                Reset filters &amp; sort
              </button>
            </div>
          </details>
        </div>

        {events === undefined ? (
          <div className="flex items-center justify-center">
            <LoadingAnim />
          </div>
        ) : undefined}

        {events && events.length !== 0 ? (
          <>
            {viewMode === 'calendar' ? (
              <EventsCalendar
                events={flatFilteredEvents}
                today={today}
                onOpen={(id) => nav(`/dashboard/${id}`)}
              />
            ) : viewMode === 'list' ? (
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 text-left text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {flatFilteredEvents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-6 text-center text-gray-400 dark:text-gray-500 italic"
                        >
                          No events match your search or filter.
                        </td>
                      </tr>
                    ) : (
                      flatFilteredEvents.map((event) => (
                        <tr
                          key={event.id}
                          className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 max-w-[200px] truncate">
                            {event.name}
                            <LabelBadges event={event} />
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full
                            ${
                              event.iAmCreator
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${event.iAmCreator ? 'bg-blue-500' : 'bg-green-500'}`}
                              />
                              {event.iAmCreator ? 'Admin' : 'Participant'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              {renderLabels(event)}
                              <button
                                onClick={() => nav(`/dashboard/${event.id}`)}
                                className={`px-3 py-1.5 rounded-lg text-white text-xs font-medium transition-colors
                                ${event.iAmCreator ? 'bg-primary hover:bg-blue-400' : 'bg-green-500 hover:bg-green-400'}`}
                              >
                                Open
                              </button>
                              <CopyCodeButton
                                customEventCode={event.id}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors"
                              />
                              {event.iAmCreator && (
                                <>
                                  <button
                                    onClick={() =>
                                      nav(`/edit/${event.id}`, {
                                        state: { isEditMode: true },
                                      })
                                    }
                                    className="p-1.5 rounded-md text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    aria-label="Edit event"
                                  >
                                    <IconEdit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (dontAskAgain) {
                                        deleteEvent(event.id)
                                          .then(() => {
                                            setHasDeletedEvent(true);
                                            setEvents(
                                              events?.filter(
                                                (e) => e.id !== event.id
                                              )
                                            );
                                          })
                                          .catch((err) => {});
                                      } else {
                                        setSelectedEventToDelete(event);
                                      }
                                    }}
                                    className="p-1.5 rounded-md text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                                    aria-label="Delete event"
                                  >
                                    <IconTrash className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Existing grid view — unchanged except roleFilter gates each section */
              <div className="flex flex-col gap-10">
                {showCreated && (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-primary flex-shrink-0" />
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                          Created by You
                        </h3>
                        <span className="text-sm text-gray-600 dark:text-gray-500">
                          ({createdCount})
                        </span>
                      </div>
                      {showFilled && (
                        <button
                          onClick={() =>
                            filledOutRef.current?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'start',
                            })
                          }
                          className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-500 hover:text-primary dark:hover:text-primary transition-colors group"
                        >
                          Jump to Filled Out
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 group-hover:translate-y-0.5 transition-transform"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                    {createdCount === 0 ? (
                      <p className="text-sm text-gray-400 dark:text-gray-500 italic pl-6">
                        No created events match your search or filters.
                      </p>
                    ) : (
                      <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 xl:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-7 lg:gap-8 xl:gap-9">
                        {flatFilteredEvents
                          .filter((e) => e.iAmCreator)
                          .map((event) => (
                            <div
                              key={event.id}
                              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-md flex flex-col justify-between h-full"
                            >
                              <div className="flex flex-col gap-4 h-full">
                                <div className="flex justify-between items-start gap-3">
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 break-words whitespace-normal min-w-0">
                                    {event.name}
                                  </h3>
                                  <div className="flex items-center gap-1">
                                    {renderLabels(event)}
                                    {event.iAmCreator && (
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() =>
                                            nav(`/edit/${event.id}`, {
                                              state: { isEditMode: true },
                                            })
                                          }
                                          className="p-1.5 rounded-md text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 flex-shrink-0"
                                          aria-label="Edit event"
                                        >
                                          <IconEdit className="w-5 h-5" />
                                        </button>
                                        <button
                                          onClick={() => {
                                            if (dontAskAgain) {
                                              deleteEvent(event.id)
                                                .then(() => {
                                                  setHasDeletedEvent(true);
                                                  setEvents(
                                                    events?.filter(
                                                      (e) => e.id !== event.id
                                                    )
                                                  );
                                                })
                                                .catch((err) => {});
                                            } else {
                                              setSelectedEventToDelete(event);
                                            }
                                          }}
                                          className="p-1.5 rounded-md text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                                          aria-label="Delete event"
                                        >
                                          <IconTrash className="w-5 h-5" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <LabelBadges event={event} />
                                <div className="mt-auto flex flex-row gap-2">
                                  <button
                                    onClick={() =>
                                      nav(`/dashboard/${event.id}`)
                                    }
                                    className="flex-1 bg-primary hover:bg-blue-400 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                                  >
                                    Open Event
                                  </button>
                                  <CopyCodeButton
                                    customEventCode={event.id}
                                    className="flex-shrink-0 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {showCreated && showFilled && (
                  <hr className="border-gray-200 dark:border-gray-700" />
                )}

                {showFilled && (
                  <div ref={filledOutRef}>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                        Filled Out by You
                      </h3>
                      <span className="text-sm text-gray-600 dark:text-gray-500">
                        ({filledCount})
                      </span>
                    </div>
                    {filledCount === 0 ? (
                      <p className="text-sm text-gray-400 dark:text-gray-500 italic pl-6">
                        No filled out events match your search or filters.
                      </p>
                    ) : (
                      <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 xl:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-7 lg:gap-8 xl:gap-9">
                        {flatFilteredEvents
                          .filter((e) => !e.iAmCreator)
                          .map((event) => (
                            <div
                              key={event.id}
                              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-md flex flex-col justify-between h-full"
                            >
                              <div className="flex flex-col gap-4 h-full">
                                <div className="flex justify-between items-start gap-3">
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 break-words whitespace-normal min-w-0">
                                    {event.name}
                                  </h3>
                                  {renderLabels(event)}
                                </div>
                                <LabelBadges event={event} />
                                <div className="mt-auto flex flex-row gap-2">
                                  <button
                                    onClick={() =>
                                      nav(`/dashboard/${event.id}`)
                                    }
                                    className="flex-1 bg-green-500 hover:bg-green-400 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                                  >
                                    Open Event
                                  </button>
                                  <CopyCodeButton
                                    customEventCode={event.id}
                                    className="flex-shrink-0 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : events !== undefined ? (
          getAccountId() === '' ? (
            <div className="text-slate-700 dark:text-text-dark">
              You are logged in as a guest.
            </div>
          ) : (
            <div className="text-slate-700 dark:text-text-dark">
              You have no events.
            </div>
          )
        ) : undefined}
      </div>
    </div>
  );
}
