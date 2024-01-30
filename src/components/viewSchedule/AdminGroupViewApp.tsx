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

    const [selectedDateTimeObjects, setSelectedDateTimeObjects] = useState();

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
        setGeneralPopupMessage("No new time selection made!");
        setShowGeneralPopup(true);
        return;
      }

      if (dragState.dragEndedOnID[0] != dragState.dragStartedOnID[0]) {
        setGeneralPopupMessage("You must select times that occur on the same day!");
        setShowGeneralPopup(true);
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
              <div className="flex flex-col-reverse justify-center w-[90%] px-8 md:flex-row md:space-x-7 lg:space-x-20 xl:space-x-40">
                  
                  {showGeneralPopup && <GeneralPopup 
                    onClose={() => {setShowGeneralPopup(false)}}
                    message={generalPopupMessage}
                    isLogin={false}/>}

                  <div className="flex flex-col content-center space-y-7 flex-none md:w-72 lg:w-80 mb-5 md:content-start md:mt-0">
                      {/* Edit availability button */}
                      
                      <button 
                        onClick={() => {nav("/timeselect/" + code)}}
                        className='hidden font-bold rounded-md bg-blue-500 text-white text-base w-fit p-3 \
                                    transform transition-transform hover:scale-90 active:scale-100e md:block'>
                        <span className="mr-1">&#8592;</span> Edit Your Availiability
                      </button>

                      {/* Event name, location, and time */}

                      <div className = "hidden mb-4 flex flex-col space-y-5 hidden md:block">
                          <h3 className="text-3xl text-center md:text-left">{eventName}</h3>

                          <div className="flex flex-col">
                            <h3 className="text-base text-center md:text-left">
                              Time: {chosenDayAndTime !== undefined ? chosenDayAndTime[0].toLocaleDateString('en-us', {  
                                        weekday: "long", year: "numeric", month: "short",  
                                        day: "numeric", hour: "2-digit", minute: "2-digit"  
                                    }) : "not selected"}
                            </h3>

                            <h3 className="text-base text-center md:text-left">
                              Location: {chosenLocation !== undefined ? getChosenLocation() : "not selected"}
                            </h3>
                          </div>
                      </div>

                      {/* Add to Google calendar button and submit selection button */}       

                      <div className="flex flex-row space-x-2">
                        {chosenDayAndTime 
                          ? <div className="">
                            <AddToGoogleCalendarButton />
                          </div>
                          : undefined}

                        <button 
                            onClick={handleSelectionSubmission}
                            className='font-semibold rounded-md bg-blue-500 text-white px-1.5 py-3 text-sm \
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
                  
                  <div className="flex flex-col content-center flex-1 grow overflow-x-auto md:content-end"> 
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
                      
                    <button 
                      onClick={() => {nav("/timeselect/" + code)}}
                      className='font-bold rounded-md bg-blue-500 text-white text-base w-fit p-3 \
                                  transform transition-transform hover:scale-90 active:scale-100e'>
                      <span className="mr-1">&#8592;</span> Edit Your Availiability
                    </button>

                    {/* (Mobile): Event name, location, and time */}

                    <div className = "mb-4 flex flex-col space-y-5 mt-4">
                      <h3 className="text-3xl text-center md:text-left">{eventName}</h3>

                      <div className="flex flex-col">
                        <h3 className="text-base text-center md:text-left">
                          Time: {chosenDayAndTime !== undefined ? chosenDayAndTime[0].toLocaleDateString('en-us', {  
                                    weekday: "long", year: "numeric", month: "short",  
                                    day: "numeric", hour: "2-digit", minute: "2-digit"  
                                }) : "not selected"}
                        </h3>

                        <h3 className="text-base text-center md:text-left">
                          Location: {chosenLocation !== undefined ? getChosenLocation() : "not selected"}
                        </h3>
                      </div>
                    </div>
                    
                  </div>
              </div>
            </div>
    </>
    )

}