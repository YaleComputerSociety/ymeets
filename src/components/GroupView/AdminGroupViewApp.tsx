// import { useState, useEffect } from 'react';
// import {
//   calanderState,
//   userData,
//   calendarDimensions,
//   dragProperties,
// } from '../../types';
// import eventAPI from '../../firebase/eventAPI';
// import Calendar from '../selectCalendarComponents/CalendarApp';
// import { signInWithGoogle } from '../../firebase/auth';
// import { useCallback } from 'react';
// import {
//   getEventOnPageload,
//   getEventName,
//   getEventObjectForGCal,
//   getParticipantIndex,
//   getAccountId,
//   getEventDescription,
//   getLocationsVotes,
//   getLocationOptions,
//   getAccountName,
//   getChosenLocation,
// } from '../../firebase/events';
// import { useParams, useNavigate } from 'react-router-dom';
// import LocationChart from './LocationChart';
// import UserChart from './UserChart';
// import { generateTimeBlocks } from '../utils/functions/generateTimeBlocks';
// import GeneralPopup from '../DaySelect/general_popup_component';
// import AddToGoogleCalendarButton from './AddToCalendarButton';
// import copy from 'clipboard-copy';
// import { IconCopy } from '@tabler/icons-react';
// import { LoadingAnim } from '../utils/components/LoadingAnim';
// import InformationPopup from '../utils/components/InformationPopup';
// import { GAPIContext } from '../../firebase/gapiContext';
// import { useContext } from 'react';

// /**
//  * Group View (with all the availabilities) if you are logged in as the creator of the Event.
//  * @returns Page Component
//  */
// export default function AdminGroupViewPage() {
//   const { gapi, handleIsSignedIn } = useContext(GAPIContext);

//   const [calendarState, setCalendarState] = useState<calanderState>([]);
//   const [calendarFramework, setCalendarFramework] =
//     useState<calendarDimensions>({
//       dates: [],
//       startTime: new Date(),
//       endTime: new Date(),
//       numOfBlocks: 0,
//       numOfCols: 0,
//     });

//   const { code } = useParams();

//   const [chartedUsers, setChartedUsers] = useState<userData>({} as userData);
//   const [eventName, setEventName] = useState('');
//   const [eventDescription, setEventDescription] = useState('');

//   const [locationVotes, setLocationVotes] = useState(Object);
//   const [locationOptions, setLocationOptions] = useState(Array<string>);

//   // this is the location that admin selected on the CLIENT side
//   const [adminChosenLocation, setAdminChosenLocation] = useState<
//     string | undefined
//   >(undefined);

//   // this is the location the admin previously submitted / submitted to the backend, which is pulled and set
//   // or updated to be the admin location
//   const [selectedLocation, setSelectedLocation] = useState<string>();
//   const [loading, setLoading] = useState(true);
//   const [showGeneralPopup, setShowGeneralPopup] = useState(false);
//   const [generalPopupMessage] = useState('');

//   const [dragState, setDragState] = useState<dragProperties>({
//     dragStartedOnID: [], // [columnID, blockID]
//     dragEndedOnID: [],
//     dragStartedOn: false,
//     blocksAffectedDuringDrag: new Set(),
//   });

//   const [copied, setCopied] = useState(false);

//   const nav = useNavigate();

//   const createCalendarEventUrl = useCallback((event: any) => {
//     const startDateTime = new Date(event.start.dateTime)
//       .toISOString()
//       .replace(/-|:|\.\d\d\d/g, '');
//     const endDateTime = new Date(event.end.dateTime)
//       .toISOString()
//       .replace(/-|:|\.\d\d\d/g, '');

//     // Construct the Google Calendar event URL
//     const baseUrl = 'https://calendar.google.com/calendar/render';
//     const queryParams = new URLSearchParams({
//       action: 'TEMPLATE',
//       text: event.summary,
//       dates: `${startDateTime}/${endDateTime}`,
//       details: event.description,
//       location: event.location,
//       sprop: 'website:https://example.com', // You can set your website or leave it empty
//       spropname: 'Add Event',
//     });

//     return `${baseUrl}?${queryParams.toString()}`;
//   }, []);

//   const handleAddToCalendar = useCallback(
//     async (startDate: Date, endDate: Date, location: string | undefined) => {
//       const event = getEventObjectForGCal(startDate, endDate, location);
//       const calendarEventUrl = createCalendarEventUrl(event);

//       window.open(calendarEventUrl, '_blank');
//     },
//     [createCalendarEventUrl]
//   );

//   useEffect(() => {
//     const fetchData = async () => {
//       if (code && code.length == 6) {
//         await getEventOnPageload(code)
//           .then(() => {
//             const { availabilities, participants } = eventAPI.getCalendar();
//             const dates = eventAPI.getCalendarDimensions();

//             setChartedUsers(participants);
//             setCalendarState(availabilities);
//             setCalendarFramework(dates);

//             setEventName(getEventName());
//             setEventDescription(getEventDescription());
//             setLocationVotes(getLocationsVotes());
//             setLocationOptions(getLocationOptions());
//             setSelectedLocation(getChosenLocation());
//             setAdminChosenLocation(getChosenLocation());
//             setLoading(false);
//           })
//           .catch(() => {
//             nav('/notfound');
//           });
//       } else {
//         // url is malformed
//         nav('notfound');
//       }
//     };
//     fetchData();
//   }, []);

//   async function handleSelectionSubmission() {
//     if (dragState.dragEndedOnID.length == 0) {
//       alert('No new time selection made!');
//       return;
//     }

//     if (dragState.dragEndedOnID[0] != dragState.dragStartedOnID[0]) {
//       alert('You must select times that occur on the same day!');
//       return;
//     }

//     const calDate =
//       calendarFramework?.dates.flat()[dragState.dragStartedOnID[0]];
//     const timeBlocks = generateTimeBlocks(
//       calendarFramework?.startTime,
//       calendarFramework?.endTime
//     );

//     const times = timeBlocks.flat();

//     if (
//       dragState.dragStartedOnID.length > 0 &&
//       dragState.dragEndedOnID.length > 0
//     ) {
//       const selectedStartTimeHHMM: string = times[dragState.dragStartedOnID[1]];
//       const selectedEndTimeHHMM: string = times[dragState.dragEndedOnID[1]];

//       const [startHour, startMinute] = selectedStartTimeHHMM
//         .split(':')
//         .map(Number);
//       let [endHour, endMinute] = selectedEndTimeHHMM
//         ? selectedEndTimeHHMM.split(':').map(Number)
//         : [0, 0];

//       const selectedStartTimeDateObject = new Date(calDate?.date!);
//       selectedStartTimeDateObject.setHours(startHour);
//       selectedStartTimeDateObject.setMinutes(startMinute);

//       const selectedEndTimeDateObject = new Date(calDate?.date!);

//       endMinute += 15;
//       if (endMinute == 60) {
//         endMinute = 0;
//         endHour += 1;
//         if (endHour == 25) {
//           endHour = 0;
//         }
//       }

//       selectedEndTimeDateObject.setHours(endHour);
//       selectedEndTimeDateObject.setMinutes(endMinute);

//       if (getAccountId() !== '') {
//         await handleAddToCalendar(
//           selectedStartTimeDateObject,
//           selectedEndTimeDateObject,
//           adminChosenLocation
//         );
//       } else {
//         signInWithGoogle(undefined, gapi, handleIsSignedIn);
//       }
//     }
//   }

//   const getCurrentUserIndex = () => {
//     let user = getParticipantIndex(getAccountName(), getAccountId());
//     if (user === undefined) {
//       // new user => last availability
//       user =
//         calendarState !== undefined ? Object.keys(calendarState).length - 1 : 0;
//     }
//     return user;
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center">
//         <LoadingAnim />
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="flex justify-center mx-4 mb-4 md:mx-10 md:mb-10">
//         <div className="flex flex-col-reverse justify-center w-[100%] md:px-8 md:flex-row md:space-x-7 lg:space-x-15 xl:space-x-25">
//           {showGeneralPopup && (
//             <GeneralPopup
//               onClose={() => {
//                 setShowGeneralPopup(false);
//               }}
//               message={generalPopupMessage}
//               isLogin={false}
//             />
//           )}
//           <div className="flex flex-col flex-none md:w-[48%] mb-4 md:mt-0 space-y-5 items-center">
//             <div className="w-[100%] content-start align-start items-start">
//               {/* Edit availability button */}

//               <div className="hidden md:block flex flex-row ml-0 md:ml-4">
//                 <div className="flex-grow">
//                   <button
//                     className="font-bold text-white bg-blue-500 rounded-full bg-blue-500 text-white py-3 px-5 text-md w-fit transform transition-transform drop-shadow-sm hover:scale-90 active:scale-100e disabled:bg-gray-500 disabled:opacity-70"
//                     onClick={() => {
//                       nav('/timeselect/' + code);
//                     }}
//                   >
//                     <span className="mr-1">&#8592;</span> Edit Your
//                     Availiability
//                   </button>
//                 </div>
//               </div>
//             </div>
//             <div className="flex flex-col content-center space-y-1 md:w-[75%] flex-none mb-5 md:mt-0">
//               {/* Event name, location, and time */}

//               <div className="hidden mb-4 flex flex-col space-y-5 md:block">
//                 <h3 className="text-3xl font-bold text-center md:text-left">
//                   {eventName}
//                 </h3>
//                 <h3 className="text-xl text-center md:text-left">
//                   {eventDescription}
//                 </h3>

//                 <div className="flex flex-col">
//                   <div className="h-3"></div>
//                   <button
//                     onClick={() => {
//                       copy(`${window.location.origin}/timeselect/${code}`);
//                       setCopied(true);
//                       setTimeout(() => {
//                         setCopied(false);
//                       }, 1500);
//                     }}
//                     className={`text-sm mt-4 lg:text-base flex items-center gap-2 justify-center ${
//                       copied
//                         ? 'bg-green-500 hover:bg-green-500 text-white'
//                         : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
//                     } border border-slate-300 font-medium py-0.5 sm:py-1 md:py-1.5 px-5 rounded-lg transition-colors relative`}
//                   >
//                     {<IconCopy className="inline-block w-4 lg:w-5 mr-2" />}
//                     {copied
//                       ? 'Copied to Clipboard'
//                       : `Shareable ymeets Link (Event Code: ${code})`}
//                   </button>
//                 </div>
//               </div>

//               {/* User availability table */}
//               <div className="mb-2">
//                 {chartedUsers !== undefined && (
//                   <UserChart
//                     chartedUsersData={[chartedUsers, setChartedUsers]}
//                   />
//                 )}
//               </div>

//               {/* Location options table */}
//               {locationOptions.length > 0 && (
//                 <LocationChart
//                   theSelectedLocation={[
//                     adminChosenLocation,
//                     setAdminChosenLocation,
//                   ]}
//                   locationOptions={
//                     locationOptions.length > 0 ? locationOptions : ['']
//                   }
//                   locationVotes={Object.values(locationVotes)}
//                   selectionMade={
//                     getChosenLocation() === ''
//                       ? false
//                       : getChosenLocation() === undefined
//                         ? false
//                         : true
//                   }
//                 />
//               )}
//             </div>
//           </div>
//           <div className="max-w-[100%] lg:max-w-[50%] ">
//             <div className="flex flex-col content-center grow overflow-x-auto md:content-end">
//               <Calendar
//                 title={''}
//                 theCalendarState={[calendarState, setCalendarState]}
//                 theCalendarFramework={[calendarFramework, setCalendarFramework]}
//                 chartedUsersData={[chartedUsers, setChartedUsers]}
//                 draggable={
//                   calendarFramework?.dates?.[0][0].date instanceof Date &&
//                   (calendarFramework.dates[0][0].date as Date).getFullYear() !==
//                     2000
//                 }
//                 user={getCurrentUserIndex()}
//                 isAdmin={true}
//                 theDragState={[dragState, setDragState]}
//                 theGoogleCalendarEvents={[[], () => {}]}
//               />
//             </div>
//             {calendarFramework?.dates?.[0][0].date instanceof Date &&
//               (calendarFramework.dates[0][0].date as Date).getFullYear() !==
//                 2000 && (
//                 <AddToGoogleCalendarButton
//                   onClick={handleSelectionSubmission}
//                 />
//               )}
//             <div className="md:pl-3">
//               <div className="p-1 flex-shrink w-[80%] text-gray-500 text-left text-sm md:text-left">
//                 {/* NOTE: Click and drag as if you are selecting your availability to select your ideal time to meet. <br/>  */}
//                 {locationOptions.length == 0 ? (
//                   <InformationPopup content="NOTE: Click and drag as if you are selecting your availability to select your ideal time to meet. Then, press submit selection to GCAl" />
//                 ) : (
//                   <InformationPopup content="NOTE: Click and drag as if you are selecting your availability to select your ideal time to meet. Click on a location to select it as the place to meet. Then, press submit selection." />
//                 )}
//               </div>
//             </div>
//           </div>
//           <div className="md:hidden flex flex-col flex-none mb-5 items-center">
//             {/* (Mobile): Event name, location, and time */}
//             <div className="w-[100%] content-start align-start items-start">
//               <div className="flex flex-row ml-0 md:ml-4">
//                 <div className="flex-grow ml-2">
//                   <button
//                     className="font-bold text-white bg-blue-500 rounded-full bg-blue-500 text-white py-2 px-4 text-sm w-fit transform transition-transform drop-shadow-sm hover:scale-90 active:scale-100e disabled:bg-gray-500 disabled:opacity-70"
//                     onClick={() => {
//                       nav('/timeselect/' + code);
//                     }}
//                   >
//                     <span className="mr-1">&#8592;</span> Edit Your
//                     Availiability
//                   </button>
//                 </div>
//               </div>
//             </div>
//             <div className="flex flex-col content-center space-y-1 w-[80%] flex-none mb-5 md:mt-0">
//               <div className="mb-4 flex flex-col space-y-2 mt-4">
//                 <h3 className="text-2xl font-bold text-center mb-0">
//                   {eventName}
//                 </h3>
//                 <h3 className="text-md text-center lg:text-left mt-0">
//                   {eventDescription}
//                 </h3>

//                 <div className="flex flex-col">
//                   <button
//                     onClick={() => {
//                       copy(`${window.location.origin}/timeselect/${code}`);
//                       setCopied(true);
//                       setTimeout(() => {
//                         setCopied(false);
//                       }, 1500);
//                     }}
//                     className={`
//                       text-sm mt-4 lg:text-base
//                       flex flex-col items-center justify-center
//                       ${
//                         copied
//                           ? 'bg-green-600 hover:bg-green-600 text-white'
//                           : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
//                       }
//                       border border-slate-300 font-medium
//                       py-2 px-5 rounded-lg transition-colors
//                       relative h-[3.5rem]
//                     `}
//                   >
//                     {copied ? (
//                       <span className="flex items-center gap-2">
//                         <IconCopy className="inline-block w-4" />
//                         Copied to Clipboard
//                       </span>
//                     ) : (
//                       <>
//                         <div className="items-center justify-center align-center">
//                           <span className="flex items-center justify-center align-center">
//                             <IconCopy className="inline-block w-4 mr-2" />
//                             Shareable ymeets Link
//                           </span>
//                           <span className="text-xs align-top">
//                             (Event Code: {code})
//                           </span>
//                         </div>
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

export {};
