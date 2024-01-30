import React from "react";
import {
    IconPlus,
    IconCopy,
    IconSearch,
    IconUser,
    IconCalendarEvent,
    IconUsers,
    IconClock,
    IconMapPin,
    IconEdit,
    IconInfoCircle,
    IconTrash
  } from "@tabler/icons-react";

import { getAccountId, getAllEventsForUser } from "../../firebase/events";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import copy from "clipboard-copy"
import { logout } from "../../firebase/auth";
import { Event, EventDetails } from "../../types";
import { auth } from "../../firebase/firebase";
import { deleteEvent } from "../../firebase/events";
import GeneralPopup from "../daySelect/general_popup_component";
  
interface AccountsPageEvent {
  name: string; 
  id: string;
  dates: string; 
  startTime: string;
  endTime: string; 
  location: string;
  iAmCreator: boolean
}

const parseEventObjectForAccountsPage = (events: Event[]): AccountsPageEvent[] => {
  const accountPageEvents: AccountsPageEvent[] = [];
  events.forEach((event) => {
    accountPageEvents.push({
      name: event.details.name, 
      id: event.publicId,
      dates: event.details.chosenStartDate ? event.details.chosenStartDate?.toLocaleDateString() : "TBD", 
      startTime: event.details.chosenStartDate ? event.details.chosenStartDate?.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true
    }) : "TBD",
      endTime: event.details.chosenEndDate ? event.details.chosenEndDate?.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true
    }) : "TBD",
      location: event.details.chosenLocation || "TBD",
      //@ts-ignore
      iAmCreator : event.details.adminAccountId && event.details.adminAccountId == getAccountId()
    });
  });

  return accountPageEvents;
}


export default function Accounts() {
    
    useEffect(() => {

      const retrieveAndSetEvents = async () => {
        const accountID = getAccountId();

        if (accountID && accountID !== "") {
          await getAllEventsForUser(getAccountId()).then((eventsUnparsed) => {
            setEvents(parseEventObjectForAccountsPage(eventsUnparsed) || []);
          });
        }
      }
      
      // setTimeout(() => {
      //   retrieveAndSetEvents();
      // }, 2000);

      return auth.onAuthStateChanged(() => {
        retrieveAndSetEvents();
      });

    }, []);

    const nav = useNavigate();
    const [filter, setFilter] = useState("");

    const [events, setEvents] = useState<AccountsPageEvent[]>([]);

    const handleInputChange = (e: any) => {
        setFilter(e.target.value);

    }
  
    return (
      <div className="min-h-screen flex flex-col items-center">
            <div className="pt-6 sm:pt-9 md:pt-12 lg:pt-16 xl:pt-20 pb-12 sm:pb-16 md:pb-20 lg:pb-24 xl:pb-28 px-5 xs:px-8 md:px-12 lg:px-16 xl:px-20 max-w-8xl flex flex-col gap-6 xs:gap-8 sm:gap-10 md:gap-12 lg:gap-14 xl:gap-16 flex-grow w-full">
                <div className="flex flex-col sm:flex-row justify-between lg:items-center gap-6 sm:gap-8">
                        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold text-slate-700">
                        Your Events
                        </h2>
                        <div className="flex flex-col items-start sm:items-stretch sm:flex-row gap-4 sm:gap-4.5 md:gap-5 lg:gap-6 xl:gap-7">
                        <div className="flex">
                            <input
                            type="text"
                            placeholder="Search"
                            onChange={handleInputChange}
                            className="text-sm lg:text-base outline-none bg-white text-slate-700 border border-slate-300 font-medium py-1 sm:py-1.5 md:py-2 px-3 rounded-l-lg transition-all focus:border-sky-600 focus:ring-4 focus:ring-sky-300/20"
                            />
                            <div className="bg-slate-500 flex items-center gap-2 text-white font-semibold py-1 sm:py-1.5 md:py-2 px-4 rounded-r-lg transition-colors">
                            <IconSearch className="inline-block w-4 md:w-5" />
                            </div>
                        </div>
                        <button onClick={() => nav("/dayselect")} className="text-sm lg:text-base flex items-center gap-2 bg-blue-500 text-white font-medium py-1 sm:py-1.5 md:py-2 px-4 md:px-6 rounded-lg hover:bg-ymeets-med-blue active:bg-ymeets-light-blue transition-colors">
                            <IconPlus className="inline-block w-4 md:w-5" />
                            Create event
                        </button>
                    </div>
            </div>
            
            
            {events.length != 0 ? 
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-7 lg:gap-8 xl:gap-9">
                {events.filter((e) => e.id.includes(filter) || e.name.includes(filter)).map((event) => (
                <div className="bg-white rounded-xl lg:rounded-2xl border shadow-sm grid gap-2 sm:gap-2.5 md:gap-3 lg:gap-3.5 xl:gap-4 p-6 sm:p-7 md:p-8 lg:p-9 xl:p-10">
                    <div className="flex justify-between items-center gap-4 sm:gap-4.5 md:gap-5 lg:gap-5.5 xl:gap-6">
                    <h3 className="md:text-lg lg:text-xl font-medium text-slate-800">
                        {event.name}
                    </h3>
                    {/* Do we want to enable users to edit their events? */}
                    {/* <IconEdit className="inline-block w-4 md:w-5 text-slate-400 hover:text-slate-500 cursor-pointer transition-colors active:text-slate-600" /> */}
                    </div>
                    <div className="grid gap-5 sm:gap-5.5 md:gap-6 lg:gap-7 xl:gap-8">
                    <hr />
                    <div className="grid gap-2 text-sky-600 text-xs sm:text-sm lg:text-base">
                        <p className="flex gap-3 items-center">
                        <IconCalendarEvent className="inline-block w-4 md:w-4.5 lg:w-5" />
                        <span className="text-slate-600">{event.dates}</span>
                        </p>
                        <p className="flex gap-3 items-center">
                        <IconClock className="inline-block w-4 md:w-4.5 lg:w-5" />
                        <span className="text-slate-600">{event.startTime}</span>
                        </p>
                        <p className="flex gap-3 items-center">
                        <IconMapPin className="inline-block w-4 md:w-4.5 lg:w-5" />
                        <span className="text-slate-600">{event.location}</span>
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 xs:gap-4 sm:gap-6 md:gap-5 xl:gap-6">
                        <button onClick={() => {copy(event.id)}} className="text-sm lg:text-base flex items-center gap-2 justify-center bg-slate-100 text-slate-700 border border-slate-300 font-medium py-0.5 sm:py-1 md:py-1.5 px-5 rounded-lg hover:bg-slate-200 active:bg-slate-300 acttransition-colors">
                        {event.id}
                        <IconCopy className="inline-block w-4 lg:w-5" />
                        </button>
                        <button 
                            onClick={() => {nav("/groupview/" + event.id)}}
                            className="text-sm lg:text-base bg-blue-500 flex items-center justify-center gap-2 text-white font-medium py-0.5 sm:py-1 md:py-1.5 px-5 rounded-lg hover:bg-ymeets-med-blue active:bg-ymeets-light-blue transition-colors">
                        Open
                        </button>
                        
                    </div>
                    </div>
                    {event.iAmCreator && <button
                      onClick={() => {
                        deleteEvent(event.id).then(() => {
                          window.location.reload();
                        }).catch((err) => {
                          

                        });
                      }}
                      className="text-sm lg:text-base flex items-center gap-2 justify-center bg-red-900 text-white border border-slate-300 font-medium py-0.5 sm:py-1 md:py-1.5 px-5 rounded-lg hover:bg-red-700 active:bg-red-500 transition-colors"
                    >
                      Delete
                      <IconTrash className="inline-block w-4 lg:w-5" />
                    </button>}

                </div>
                ))}
            </div>
            : <div>You have no events or are logged is a guest.</div>
            }

            <div className="flex items-center justify-end">
            <button onClick={() => {
                    logout();
                    nav("/");
            }} className="text-lg bg-blue-500 w-fit flex items-left gap-2 text-white font-medium py-0.5 sm:py-1 md:py-1.5 px-5 rounded-lg hover:bg-ymeets-med-blue active:bg-ymeets-light-blue transition-colors">
                Logout
            </button>
          
            </div>

        
        </div>

       
    
       
      </div>
    );
  }