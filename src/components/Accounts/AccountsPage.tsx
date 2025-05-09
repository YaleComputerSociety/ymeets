import { useContext, useState, useEffect } from 'react';
import { IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';

import {
  checkIfLoggedIn,
  getAccountId,
  getAllEventsForUser,
  deleteEvent,
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

interface AccountsPageEvent {
  name: string;
  id: string;
  dates: string;
  startTime: string;
  endTime: string;
  location: string;
  iAmCreator: boolean;
}

/**
 * Parses the backend event object into a type that the AccountsPage component understands.
 * @param events Event[]
 * @returns AccountsPageEvent[]
 */
const parseEventObjectForAccountsPage = (
  events: Event[]
): AccountsPageEvent[] => {
  const accountPageEvents: AccountsPageEvent[] = [];
  events.forEach((event) => {
    accountPageEvents.push({
      name: event.details.name,
      id: event.publicId,
      dates: event.details.chosenStartDate
        ? event.details.chosenStartDate?.toLocaleDateString()
        : 'TBD',
      startTime: event.details.chosenStartDate
        ? event.details.chosenStartDate?.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })
        : 'TBD',
      endTime: event.details.chosenEndDate
        ? event.details.chosenEndDate?.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })
        : 'TBD',
      location: event.details.chosenLocation || 'TBD',
      iAmCreator: event.details.adminAccountId === getAccountId(),
    });
  });

  return accountPageEvents;
};

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
        await getAllEventsForUser(getAccountId()).then((eventsUnparsed) => {
          setEvents(parseEventObjectForAccountsPage(eventsUnparsed) || []);
        });
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

  const handleInputChange = (e: any) => {
    setFilter(e.target.value.toLowerCase());
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-full pt-2 sm:pt-4 pb-10 sm:pb-14 px-5 xs:px-8 md:px-12 lg:px-16 xl:px-20 max-w-8xl flex flex-col gap-6 xs:gap-8 sm:gap-10 flex-grow w-full">
        <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6 md:gap-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-text dark:text-text-dark">
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

          <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto flex-1 min-w-[250px]">
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

        {events === undefined ? (
          <div className="flex items-center justify-center">
            <LoadingAnim />
          </div>
        ) : undefined}
        {events && events.length != 0 ? (
          <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 xl:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-7 lg:gap-8 xl:gap-9">
            {events
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
                        onClick={() => nav(`/dashboard/${event.id}`)}
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
