import { useState } from "react";
import { calanderState, userData } from "../../types"
import { calendarDimensions } from  "../../types"
import eventAPI from "../../firebase/eventAPI";
import Calendar from "../selectCalendarComponents/CalendarApp"
import { getEventOnPageload, getEventName, getEventDescription, getLocationsVotes, getLocationOptions, setChosenLocation, getChosenDayAndTime } from '../../firebase/events';
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import LocationChart from "../hoverViewComponents/LocationChart";
import UserChart from "../hoverViewComponents/UserChart";
import { generateTimeBlocks } from "../utils/generateTimeBlocks";
import { setChosenDate } from "../../firebase/events";
import { start } from "repl";
import { getChosenLocation } from "../../firebase/events";
import GeneralPopup from "../daySelect/general_popup_component";
import { useNavigate } from "react-router-dom";
import ExportDecisionsToUser from "./ExportDecisionToUsers";
import AddToGoogleCalendarButton from "../GAPIComponents/addToCalendarButton";
import copy from "clipboard-copy"
import {IconCopy} from "@tabler/icons-react"

export default function AdminGroupViewApp() {

    const testData = eventAPI.getTestData()
    const [calendarState, setCalendarState] = useState<calanderState | undefined>(undefined);
    const [calendarFramework, setCalendarFramework] = useState<calendarDimensions | undefined>(undefined)
    const { code } = useParams();
    const [chartedUsers, setChartedUsers] = useState<userData | undefined>(undefined)
    const [eventName, setEventName] = useState("")
    const [eventDescription, setEventDescription] = useState("")
    const [locationVotes, setLocationVotes] = useState(Object)
    const [locationOptions, setLocationOptions] = useState(Array<String>)

    const [selectedLocation, setSelectedLocation] = useState("");
    
    // probably deprecated
    const [selectedDate, setSelectedDate] = useState();

    const [selectedDateTimeObjects, setSelectedDateTimeObjects] = useState([]);

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

                let selectedLocation = getChosenLocation();
                
                //@ts-ignore
                setSelectedLocation(selectedLocation);
                setLoading(false);
                //@ts-ignore
                setSelectedDateTimeObjects(getChosenDayAndTime());
                
                console.log(selectedDateTimeObjects);

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
      //@ts-ignore

      if (dragState.dragEndedOnID.length == 0) {
        // setGeneralPopupMessage("No new time selection made!");
        // setShowGeneralPopup(true);
        alert("No new time selection made!")
        return;
      }

      if (dragState.dragEndedOnID[0] != dragState.dragStartedOnID[0]) {
        // setGeneralPopupMessage("You must select times that occur on the same day!");
        // setShowGeneralPopup(true);
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

        //@ts-ignore
        setSelectedDateTimeObjects([selectedStartTimeDateObject, selectedEndTimeDateObject])
        console.log("date time object set" + selectedDateTimeObjects)
        setChosenDate(selectedStartTimeDateObject, selectedEndTimeDateObject).then(() => {
            setSelectionButtonClicked(true);
        })

      }
      
      if (selectedLocation != "" && selectedLocation != undefined) {
        //@ts-ignore
        setChosenLocation(selectedLocation)
      }

      setTimeout(() => {
        setSelectionButtonClicked(false);
      }, 3000)
  }

  const chosenLocation = getChosenLocation();
  const chosenDayAndTime = getChosenDayAndTime();
  // console.log("Chosen day ", chosenDayAndTime);
  
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

                          <div className="flex flex-col">
                             <h3 className="text-base text-center md:text-left">
                            <span className='font-bold'>Time:</span> {chosenDayAndTime !== undefined ? (chosenDayAndTime[0]?.toLocaleDateString('en-us', {  
                                        weekday: "long", year: "numeric", month: "short",  
                                        day: "numeric", hour: "numeric", minute: "2-digit"  
                                    }) + " — " + chosenDayAndTime[1]?.toLocaleTimeString('en-us', {  
                                      hour: "numeric", minute: "2-digit"  
                                  })) : "not selected"}
                            </h3>

                            <h3 className="text-base text-center md:text-left">
                            <span className='font-bold'>Location:</span> {chosenLocation !== undefined ? getChosenLocation() : "not selected"}
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
                       chosenLocation && (
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

                      {/* Add to Google calendar button and submit selection button */}       

                      <div className="flex flex-row space-x-2">
                      {/* replace w this and get gcal logo <button
                          className='sm:font-bold rounded-full shadow-md bg-white text-gray-600 py-4 px-6 sm:px-8 text-md sm:text-lg w-fit \
                                      transform transition-transform hover:scale-90 active:scale-100e flex items-center'
                          onClick={handleSignInWithGoogle}
                        >
                          <img src={LOGO} alt="Logo" className="mr-3 h-9" /> Continue with Google
                        </button> */}
                        {chosenDayAndTime 
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
                          chartedUsersData={[chartedUsers, setChartedUsers]}
                      />}

                      {/* Location options table */} 

                      {locationOptions.length > 0 && <LocationChart 
                          //@ts-ignore
                          theSelectedLocation={[selectedLocation, setSelectedLocation]}
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
                          user={0}
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
                    {/* (Mobile): Edit availability button */}
                      
                    {/* <button 
                      onClick={() => {nav("/timeselect/" + code)}}
                      className='font-bold rounded-md bg-blue-500 text-white text-base w-fit p-3 \
                                  transform transition-transform hover:scale-90 active:scale-100e'>
                      <span className="mr-1">&#8592;</span> Edit Your Availiability
                    </button> */}

                    {/* (Mobile): Event name, location, and time */}

                    <div className = "mb-4 flex flex-col space-y-5 mt-4">

                      
                      <h3 className="text-3xl font-bold text-center md:text-left">{eventName}</h3>

                      <div className="flex flex-col">
                        <h3 className="text-base text-center md:text-left">
                        <span className='font-bold'>Time:</span> {chosenDayAndTime !== undefined ? chosenDayAndTime[0]?.toLocaleDateString('en-us', {  
                                    weekday: "long", year: "numeric", month: "short",  
                                    day: "numeric", hour: "2-digit", minute: "2-digit"  
                                }) : "not selected"}
                        </h3>

                        <h3 className="text-base text-center md:text-left">
                        <span className='font-bold'>Location:</span> {chosenLocation !== undefined ? getChosenLocation() : "not selected"}
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
                        {chosenLocation && (
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