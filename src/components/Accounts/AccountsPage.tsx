import React, { useContext, useState, useEffect } from 'react';
import {
  IconPlus,
  IconCopy,
  IconSearch,
  IconCalendarEvent,
  IconClock,
  IconMapPin,
  IconTrash,
} from '@tabler/icons-react';

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

  const handleInputChange = (e: any) => {
    setFilter(e.target.value.toLowerCase());
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-full pt-2 sm:pt-4 md:pt-6 lg:pt-8 xl:pt-10 pb-10 sm:pb-14 md:pb-17 lg:pb-20 xl:pb-24 px-5 xs:px-8 md:px-12 lg:px-16 xl:px-20 max-w-8xl flex flex-col gap-6 xs:gap-8 sm:gap-10 md:gap-12 lg:gap-14 xl:gap-16 flex-grow w-full">
        <div className="flex flex-col sm:flex-row justify-between lg:items-center gap-6 sm:gap-8">
          <h2 className="text-3xl sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold text-slate-700 dark:text-text-dark">
            Your Events
          </h2>
          <div className="flex flex-col items-start sm:items-stretch sm:flex-row gap-4 sm:gap-4.5 md:gap-5 lg:gap-6 xl:gap-7">
            <div className="flex">
              <input
                type="text"
                placeholder="Search"
                onChange={handleInputChange}
                className="text-sm lg:text-base outline-none bg-white text-slate-700 border border-slate-300 dark:bg-secondary_background-dark dark:text-text-dark font-medium py-1 sm:py-1.5 md:py-2 px-3 rounded-l-lg transition-all focus:border-sky-600 focus:ring-4 focus:ring-sky-300/20"
              />
              <div className="bg-slate-500 flex items-center gap-2 text-white font-semibold py-1 sm:py-1.5 md:py-2 px-4 rounded-r-lg transition-colors">
                <IconSearch className="inline-block w-4 md:w-5" />
              </div>
            </div>
            <button
              className="font-bold text-white bg-primary rounded-full bg-primary text-white py-3 px-5 text-md w-fit transform transition-transform drop-shadow-sm hover:scale-90 active:scale-100e disabled:bg-gray-500 disabled:opacity-70"
              onClick={() => {
                nav('/dayselect');
              }}
            >
              <IconPlus size={30} className="inline-block w-4 md:w-5 mr-2" />
              Create Event
            </button>
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
                  className="bg-white dark:bg-secondary_background-dark dark:text-text-dark rounded-xl lg:rounded-2xl border shadow-sm grid gap-2 sm:gap-2.5 md:gap-3 lg:gap-3.5 xl:gap-4 p-6 sm:p-7 md:p-8 lg:p-9 xl:p-10"
                >
                  <div className="flex justify-between items-center gap-4 sm:gap-4.5 md:gap-5 lg:gap-5.5 xl:gap-6">
                    <h3 className="md:text-lg lg:text-xl font-medium text-slate-800 dark:text-text-dark">
                      {event.name}
                    </h3>
                    {/* Do we want to enable users to edit their events? */}
                    {/* <IconEdit className="inline-block w-4 md:w-5 text-slate-400 hover:text-slate-500 cursor-pointer transition-colors active:text-slate-600" /> */}
                  </div>
                  <div className="grid gap-5 sm:gap-5.5 md:gap-6 lg:gap-7 xl:gap-8">
                    <hr />
                    <div className="grid grid-cols-2 gap-3 xs:gap-4 sm:gap-6 md:gap-5 xl:gap-6">
                      <CopyCodeButton customEventCode={event.id}/>
                      {/* <button
                        onClick={() => {
                          copy(event.id);
                        }}
                        className="text-sm lg:text-base flex items-center gap-2 justify-center bg-slate-100 text-slate-700 border border-slate-300 font-medium py-0.5 sm:py-1 md:py-1.5 px-5 rounded-lg hover:bg-slate-200 active:bg-slate-300 acttransition-colors"
                      >
                        {event.id}
                        <IconCopy className="inline-block w-4 lg:w-5" />
                      </button> */}
                      <button
                        onClick={() => {
                          nav('/groupview/' + event.id);
                        }}
                        className="text-sm lg:text-base bg-primary flex items-center justify-center gap-2 text-white font-medium py-0.5 sm:py-1 md:py-1.5 px-5 rounded-lg hover:bg-ymeets-med-blue active:bg-ymeets-light-blue transition-colors"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                  {event.iAmCreator && (
                    <button
                      onClick={() => {
                        deleteEvent(event.id)
                          .then(() => {
                            // delete it locally
                            setEvents(events.filter((e) => e.id != event.id));
                          })
                          .catch((err) => {});
                      }}
                      className="text-sm lg:text-base flex items-center gap-2 justify-center border border-red-400 text-red-500 font-medium py-0.5 sm:py-1 md:py-1.5 px-5 rounded-lg hover:bg-red-700 hover:text-white active:bg-red-500 transition-colors"
                    >
                      Delete
                      <IconTrash className="inline-block w-4 lg:w-5" />
                    </button>
                  )}
                </div>
              ))}
          </div>
        ) : events !== undefined ? (
          getAccountId() === '' ? (
            <div>You are logged in as a guest. </div>
          ) : (
            <div>You have no events.</div>
          )
        ) : undefined}

        <div className="flex items-center justify-end">
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
