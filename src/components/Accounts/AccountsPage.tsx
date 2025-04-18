import { useContext, useState, useEffect } from 'react';
import {
  IconPlus,
  IconSearch,
  IconTrash,
  IconClock,
  IconCalendar,
  IconChevronDown,
} from '@tabler/icons-react';

import {
  checkIfLoggedIn,
  getAccountId,
  getAllEventsForUser,
  deleteEvent,
  getParsedAccountPageEventsForUser,
} from '../../firebase/events';
import { logout } from '../../firebase/auth';

import { useNavigate } from 'react-router-dom';
import copy from 'clipboard-copy';
import { Event } from '../../types';
import { auth } from '../../firebase/firebase';
import { GAPIContext } from '../../firebase/gapiContext';
import { LoadingAnim } from '../utils/components/LoadingAnim';
import LoginButton from '../utils/components/LoginButton';
import CopyCodeButton from '../utils/components/CopyCodeButton';
import Button from '../utils/components/Button';
import ButtonSmall from '../utils/components/ButtonSmall';

export interface AccountsPageEvent {
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
  const { gapi } = useContext(GAPIContext);

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
  const [sortBy, setSortBy] = useState<'dateCreated' | 'lastModified'>(
    'lastModified'
  );

  const handleInputChange = (e: any) => {
    setFilter(e.target.value.toLowerCase());
  };

  const getSortedEvents = (events: AccountsPageEvent[]) => {
    // return events; // remove later

    console.log(events);

    return [...events].sort((a, b) => {
      let dateA = sortBy === 'dateCreated' ? a.dateCreated : a.lastModified;
      let dateB = sortBy === 'dateCreated' ? b.dateCreated : b.lastModified;

      dateA = new Date(dateA);
      dateB = new Date(dateB);

      console.log(dateA, dateB);
      if (dateA === undefined || dateB === undefined) {
        console.log('Date is undefined');
        return 0;
      }
      return dateB.getTime() - dateA.getTime();
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-[1400px] pt-4 pb-10 px-5 xs:px-8 md:px-12 lg:px-16 xl:px-20 flex flex-col gap-4">
        {/* Header with Title */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-text dark:text-white">
            Your Events
          </h2>

          {/* Desktop Button */}
          <div className="hidden sm:block">
            <Button
              onClick={() => nav('/dayselect')}
              bgColor="primary"
              textColor="white"
              className="inline-flex items-center gap-2"
            >
              <IconPlus />
              Create Event
            </Button>
          </div>

          {/* Mobile Button */}
          <div className="sm:hidden">
            <ButtonSmall
              onClick={() => nav('/dayselect')}
              bgColor="primary"
              textColor="white"
              className="inline-flex items-center gap-2"
            >
              <IconPlus />
              Create
            </ButtonSmall>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <IconSearch className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search events..."
              onChange={handleInputChange}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-800 
              border border-gray-200 dark:border-gray-700 rounded-lg text-sm
              transition-all hover:border-gray-300 dark:hover:border-gray-600
              focus:border-primary/50 focus:ring-2 focus:ring-primary/20
              text-gray-900 dark:text-white"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative min-w-[160px]">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'dateCreated' | 'lastModified')
              }
              className="w-full appearance-none pl-3 pr-8 py-2 bg-white dark:bg-gray-800 
              border border-gray-200 dark:border-gray-700 rounded-lg text-sm
              text-gray-600 dark:text-gray-300 cursor-pointer transition-all
              hover:border-gray-300 dark:hover:border-gray-600
              focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            >
              <option value="lastModified">Last Modified</option>
              <option value="dateCreated">Date Created</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <IconChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {events === undefined ? (
          <div className="flex items-center justify-center">
            <LoadingAnim />
          </div>
        ) : undefined}
        {events && events.length != 0 ? (
          <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 xl:grid-cols-3 pt-4 gap-4 xs:gap-5 sm:gap-6 md:gap-7 lg:gap-8 xl:gap-9">
            {getSortedEvents(events)
              .filter(
                (e) =>
                  e.id.toLowerCase().includes(filter) ||
                  e.name.toLowerCase().includes(filter)
              )
              .map((event) => (
                <div
                  key={event.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-md"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start gap-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 break-words whitespace-normal min-w-0">
                        {event.name}
                      </h3>
                      {event.iAmCreator && (
                        <button
                          onClick={() => {
                            if (
                              hasDeletedEvent ||
                              window.confirm(
                                'Are you sure you want to delete this event? This action cannot be undone.'
                              )
                            ) {
                              deleteEvent(event.id)
                                .then(() => {
                                  setHasDeletedEvent(true);
                                  setEvents(
                                    events.filter((e) => e.id != event.id)
                                  );
                                })
                                .catch((err) => {});
                            }
                          }}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                          aria-label="Delete event"
                        >
                          <IconTrash className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-row gap-2">
                      <button
                        onClick={() => nav(`/groupview/${event.id}`)}
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

        <div className="flex items-center justify-center">
          {checkIfLoggedIn() ? (
            <button
              onClick={() => {
                logout(gapi);
                nav('/');
              }}
              className="text-lg bg-primary w-fit flex items-left gap-2 text-white font-medium py-0.5 sm:py-1 md:py-1.5 px-5 rounded-lg hover:bg-ymeets-med-blue active:bg-ymeets-light-blue transition-colors"
            >
              Logout
            </button>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </div>
  );
}
