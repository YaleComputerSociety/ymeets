import { useState } from "react";
import { calanderState, userData } from "../../types"
import { calendarDimensions } from  "../../types"
import eventAPI from "../../firebase/eventAPI";
import Calendar from "../selectCalendarComponents/CalendarApp"
import { getEventOnPageload, getEventName, getParticipantIndex, getAccountId, getEventDescription, getLocationsVotes, getLocationOptions, setChosenLocation, getChosenDayAndTime, updateAnonymousUserToAuthUser, getAccountName } from '../../firebase/events';
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import LocationChart from "./LocationChart";
import UserChart from "./UserChart";
import { generateTimeBlocks } from "../utils/functions/generateTimeBlocks";
import { setChosenDate } from "../../firebase/events";
import { getChosenLocation } from "../../firebase/events";
import GeneralPopup from "../DaySelect/general_popup_component";
import { useNavigate } from "react-router-dom";
import AddToGoogleCalendarButton from "./AddToCalendarButton";
import copy from "clipboard-copy"
import {IconCopy} from "@tabler/icons-react"

/**
 * Group View (with all the availabilities) if you are logged in as the creator of the Event.
 * @returns Page Component
 */
export default function AdminGroupViewPage() {

    const [calendarState, setCalendarState] = useState<calanderState | undefined>(undefined);
    const [calendarFramework, setCalendarFramework] = useState<calendarDimensions | undefined>(undefined)
    const { code } = useParams();
    
    const [chartedUsers, setChartedUsers] = useState<userData | undefined>(undefined)
    const [eventName, setEventName] = useState("")
    const [eventDescription, setEventDescription] = useState("")

    const [locationVotes, setLocationVotes] = useState(Object)
    const [locationOptions, setLocationOptions] = useState(Array<String>)

    // this is the location that admin selected on the CLIENT side
    const [adminChosenLocation, setAdminChosenLocation] = useState<string | undefined>(undefined)
    
    // this is the location the admin previously submitted / submitted to the backend
    const [selectedLocation, setSelectedLocation] = useState<string | undefined>(undefined);
    const [selectedDateTimeObjects, setSelectedDateTimeObjects] = useState<Date[]>([]);

    const [loading, setLoading] = useState(true);
    const [selectionButtonClicked, setSelectionButtonClicked] = useState(false);
    const [showGeneralPopup, setShowGeneralPopup] = useState(false);
    const [generalPopupMessage, setGeneralPopupMessage] = useState("")

    const [dragState, setDragState] = useState({
      dragStartedOnID : [], // [columnID, blockID]
      dragEndedOnID : [],
      dragStartedOn : false,
      affectedBlocks : new Set()
    })

    const [copied, setCopied] = useState(false);

    const nav = useNavigate()

    useEffect(() => {

      const fetchData = async () => {
          if (code && code.length == 6) {
              await getEventOnPageload(code).then(() => {
                const { availabilities, participants } = eventAPI.getCalendar();
                // console.log("Avails: ", availabilities);
                const dates = eventAPI.getCalendarDimensions();

                setChartedUsers(participants);
                setCalendarState(availabilities);
                setCalendarFramework(dates);

                setEventName(getEventName());
                setEventDescription(getEventDescription());
                setLocationVotes(getLocationsVotes());
                setLocationOptions(getLocationOptions());
                
                //@ts-ignore
                setSelectedLocation(getChosenLocation());
                setLoading(false);
                //@ts-ignore
                setSelectedDateTimeObjects(getChosenDayAndTime());
              }).catch((err) => {
                  nav("/notfound")
              }); 
              
          } else { // url is malformed
            nav("notfound")
          }
      }
      fetchData();

      
  }, []);

  function handleSelectionSubmission() {

      if (dragState.dragEndedOnID.length == 0) {
        alert("No new time selection made!")
        return;
      }

      if (dragState.dragEndedOnID[0] != dragState.dragStartedOnID[0]) {
        alert("You must select times that occur on the same day!")
        return;
      }

      //@ts-ignore
      let calDate = [].concat(...calendarFramework.dates)[dragState.dragStartedOnID[0]]
      let timeBlocks = generateTimeBlocks(calendarFramework?.startTime, calendarFramework?.endTime)
      //@ts-ignore
      let times = [].concat(...timeBlocks);

      if (dragState.dragStartedOnID.length > 0 && dragState.dragEndedOnID.length > 0) {

        let selectedStartTimeHHMM = times[dragState.dragStartedOnID[1]];
        let selectedEndTimeHHMM = times[dragState.dragEndedOnID[1]];
        
        //@ts-ignore
        let [startHour, startMinute] = selectedStartTimeHHMM.split(":").map(Number);
        //@ts-ignore
        let [endHour, endMinute] = selectedEndTimeHHMM.split(":").map(Number);

        //@ts-ignore
        let selectedStartTimeDateObject = new Date(calDate.date);
        selectedStartTimeDateObject.setHours(startHour);
        selectedStartTimeDateObject.setMinutes(startMinute);

        //@ts-ignore
        let selectedEndTimeDateObject = new Date(calDate.date);
        selectedEndTimeDateObject.setHours(endHour);
        selectedEndTimeDateObject.setMinutes(endMinute);
        
        // update on client side (set SelectedDateTimeObjects) + backend (setChosenDate)
        //@ts-ignore
        setSelectedDateTimeObjects([selectedStartTimeDateObject, selectedEndTimeDateObject])
        
        setChosenDate(selectedStartTimeDateObject, selectedEndTimeDateObject).then(() => {
            setSelectionButtonClicked(true);
        })

        setSelectedLocation(adminChosenLocation);
        
        if (selectedLocation != undefined) {
          setChosenLocation(selectedLocation);
        }

      }
      if (selectedLocation != "" && selectedLocation != undefined) {
        //@ts-ignore
        setSelectedLocation(selectedLocation)
      }

      setTimeout(() => {
        setSelectionButtonClicked(false);
      }, 3000)
  }

  const getCurrentUserIndex = () => {
    let user = getParticipantIndex(getAccountName(), getAccountId());
    if (user === undefined) { // new user => last availability
        user = (calendarState !== undefined) ? Object.keys(calendarState).length - 1 : 0;

    }
    return user;
}
  
  return ( <>
            <div className="flex justify-center">
              <div className="flex flex-col-reverse justify-center w-[90%] px-8 md:flex-row md:space-x-7 lg:space-x-20 xl:space-x-30">
                  
                  {showGeneralPopup && <GeneralPopup 
                    onClose={() => {setShowGeneralPopup(false)}}
                    message={generalPopupMessage}
                    isLogin={false}/>}

                  <div className="flex flex-col content-center space-y-7 flex-none md:w-[32%] mb-5 md:content-start md:mt-0">
                      {/* Edit availability button */}
                      
                      <div className="justify-center">
                      <button 
                            disabled={selectedDateTimeObjects !== undefined && selectedDateTimeObjects?.length !== 0}
                            onClick={() => {nav("/timeselect/" + code)}}
                            className='font-bold rounded-md bg-blue-500 text-white text-base w-fit p-3 \
                                        transform transition-transform hover:scale-90 active:scale-100e md:block disabled:bg-gray-500 disabled:opacity-50'>
                            <span className="mr-1">&#8592;</span> Edit Your Availiability
                        </button>
                        </div>

                      {/* Event name, location, and time */}

                      <div className = "hidden mb-4 flex flex-col space-y-5 md:block">
                          <h3 className="text-3xl font-bold text-center md:text-left">{eventName}</h3>
                          <h3 className="text-xl  text-center md:text-left">{eventDescription}</h3>

                          <div className="flex flex-col">
                             <h3 className="text-base text-center md:text-left">
                            <span className='font-bold'>Time:</span> {selectedDateTimeObjects !== undefined ? (selectedDateTimeObjects[0]?.toLocaleDateString('en-us', {  
                                        weekday: "long", year: "numeric", month: "short",  
                                        day: "numeric", hour: "numeric", minute: "2-digit"  
                                    }) + " — " + selectedDateTimeObjects[1]?.toLocaleTimeString('en-us', {  
                                      hour: "numeric", minute: "2-digit"  
                                  })) : "not selected"}
                            </h3>

                            <h3 className="text-base text-center md:text-left">
                            <span className='font-bold'>Location:</span> {selectedLocation !== undefined ? selectedLocation : "not selected"}
                            </h3>

                            <button
                          onClick={() => {
                            copy(`${window.location.origin}/timeselect/${code}`)
                            setCopied(true);
                            setTimeout(() => {
                              setCopied(false);
                            }, 1000)
                          }}
                          className={`text-sm mt-4 lg:text-base flex items-center gap-2 justify-center ${
                            copied ? 'bg-green-700' : 'bg-slate-100'
                          } ${
                            copied ? 'hover:text-slate-700' : 'hover:text-slate-700'
                          }  border border-slate-300 font-medium py-0.5 sm:py-1 md:py-1.5 px-5 rounded-lg ${
                            copied ? 'hover:bg-green-700' : 'hover:bg-slate-200'
                          }  
            
                          transition-colors relative`}    
                                              >
                          {copied ? 'Copied' : "Click to copy shareable link"}
                          {!copied && <IconCopy className="inline-block w-4 lg:w-5" />}
                        </button>


                            {
                       selectedLocation && (
                                <button
                                onClick={() => {
                                  window.open("https://25live.collegenet.com/pro/yale#!/home/event/form", "_blank");
                              }}
                                    className="font-bold mt-2 rounded-md bg-blue-500 text-white text-base w-fit p-3 transform transition-transform hover:scale-90 active:scale-100e"
                                >
                                    Book Room
                                </button>
                            )
                    
                            }
                          </div>
                      </div>

                      <div className="flex flex-row space-x-2">
                 
                        {selectedDateTimeObjects 
                          ? <div className="">
                            <AddToGoogleCalendarButton />
                          </div>
                          : undefined}
                          

                        <button 
                            onClick={handleSelectionSubmission}
                            className='font-bold rounded-full bg-blue-500 text-white py-3 px-5 text-sm mb-8 w-fit 
                                        transform transition-transform hover:scale-90 active:scale-100e'>
                               Submit Selection
                        </button>

                        
                      </div>

                      {/* User availability table */} 

                      {chartedUsers !== undefined && <UserChart 
                          //@ts-ignore
                          chartedUsersData={[chartedUsers, setChartedUsers]}
                      />}

                      {/* Location options table */} 

                      {locationOptions.length > 0 && <LocationChart 
                          //@ts-ignore
                          theSelectedLocation={[adminChosenLocation, setAdminChosenLocation]}
                          locationOptions={locationOptions.length > 0 ? locationOptions : [""]}
                          locationVotes={Object.values(locationVotes)}/>}

                      {/* Submit selection button */} 

                      {selectionButtonClicked && <strong><p className="text-green-700 text-center transition-opacity duration-500 ease-in-out">Submitted!</p></strong>}
                  </div>
                  
                  <div className="flex flex-col content-center grow overflow-x-auto md:content-end pl-4"> 
                      <Calendar
                          title={""}
                          //@ts-ignore
                          theCalendarState={[calendarState, setCalendarState]}
                          //@ts-ignore
                          theCalendarFramework={[calendarFramework, setCalendarFramework] }
                          //@ts-ignore
                          chartedUsersData={[chartedUsers, setChartedUsers]}
                          draggable={true}
                          user={getCurrentUserIndex()}
                          isAdmin={true}
                          //@ts-ignore
                          theSelectedDate={[selectedDateTimeObjects, setSelectedDateTimeObjects]}
                          //@ts-ignore
                          theDragState={[dragState, setDragState]}
                          //@ts-ignore
                          theGoogleCalendarEvents={[undefined, undefined]}
                      />
                  </div>

                  <div className="md:hidden">

                    {/* (Mobile): Event name, location, and time */}

                    <div className = "mb-4 flex flex-col space-y-5 mt-4">

                      
                      <h3 className="text-3xl font-bold text-center md:text-left">{eventName}</h3>
                      <h3 className="text-xl text-center md:text-left">{eventDescription}</h3>


                      <div className="flex flex-col">
                        <h3 className="text-base text-center md:text-left">
                        <span className='font-bold'>Time:</span> {selectedDateTimeObjects !== undefined ? selectedDateTimeObjects[0]?.toLocaleDateString('en-us', {  
                                    weekday: "long", year: "numeric", month: "short",  
                                    day: "numeric", hour: "2-digit", minute: "2-digit"  
                                }) : "not selected"}
                        </h3>

                        <h3 className="text-base text-center md:text-left">
                        <span className='font-bold'>Location:</span> {selectedLocation !== undefined ? selectedLocation : "not selected"}
                        </h3>

                        <button
                          onClick={() => {
                            copy(`${window.location.origin}/timeselect/${code}`)
                            setCopied(true);
                            setTimeout(() => {
                              setCopied(false);
                            }, 1000)
                          }}
                          className={`text-sm mt-4 lg:text-base flex items-center gap-2 justify-center ${
                            copied ? 'bg-green-700' : 'bg-slate-100'
                          } ${
                            copied ? 'hover:text-slate-700' : 'hover:text-slate-700'
                          }  border border-slate-300 font-medium py-0.5 sm:py-1 md:py-1.5 px-5 rounded-lg ${
                            copied ? 'hover:bg-green-700' : 'hover:bg-slate-200'
                          }  
            
                          transition-colors relative`}    
                                              >
                          {copied ? 'Copied' : "Click to copy shareable link"}
                          {!copied && <IconCopy className="inline-block w-4 lg:w-5" />}
                        </button>
                        
                        <div className="flex justify-center">
                        {selectedLocation && (
                                <button
                                onClick={() => {
                                  window.open("https://25live.collegenet.com/pro/yale#!/home/event/form", "_blank");
                              }}
                                    className="font-bold mt-2 items-center justify-center rounded-md bg-blue-500 text-white text-base w-fit p-3 transform transition-transform hover:scale-90 active:scale-100e"
                                >
                                    Book Room
                                </button>
                            )
                    
                            }
                          </div>
                      </div>
                    </div>
                    
                  </div>
              </div>
            </div>
    </>
    )

}