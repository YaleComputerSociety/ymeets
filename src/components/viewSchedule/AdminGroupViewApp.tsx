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
import AddToGoogleCalendarButton from "../GAPIComponents/AddToCalendarButton";

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
                setLocationVotes(getLocationsVotes())
                setLocationOptions(getLocationOptions())

                let selectedLocation = getChosenLocation();
                
                //@ts-ignore
                setSelectedLocation(selectedLocation);
                setLoading(false);
              }); 
              
          } else { // url is malformed
              setShowGeneralPopup(true);
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
            <div>
              <button 
                  onClick={() => {nav("/timeselect/" + code)}}
                  className='font-bold rounded-full bg-blue-500 text-white py-3 px-6 text-base mb-6 ml-24 w-fit \
                              transform transition-transform hover:scale-90 active:scale-100e'>
                  <span className="mr-1">&#8592;</span> Edit Your Availiability
                </button>
              <div className="flex flex-col-reverse justify-center \
                              md:flex-row mx-12">
                {showGeneralPopup && <GeneralPopup 
                    onClose={() => {setShowGeneralPopup(false)}}
                    message={generalPopupMessage}
                    isLogin={false}
                />}
                  <div className="flex flex-col content-center ml-8 flex-wrap w-full \ 
                                  md:w-[40%] md:content-start">
                      <div className="flex flex-col space-y-7 max-w-sm mx-5 \
                                      md:mt-0">
                        
                        {/* Event name and description */}
                        <div className = "mb-4">
                            <h3 className="text-m text-center / 
                                        md:text-left text-gray-400">Event Name</h3>
                            <h3 className="text-3xl font-bold text-center / 
                                        md:text-left">{eventName}</h3>
                        </div>
                        <div className = "mb-4">
                            <h3 className="text-m text-center / 
                                        md:text-left text-gray-400">Event Description</h3>
                            <h3 className="text-3xl font-bold text-center / 
                                        md:text-left">{eventDescription}</h3>
                        </div>

                        {/* Admin-Selected Location and Time */}
                        <div className = "mb-4">
                            <h3 className="text-m text-center / 
                                        md:text-left text-gray-400">Location</h3>
                            <h3 className="text-xl font-bold text-center / 
                                        md:text-left">{chosenLocation !== undefined ? getChosenLocation() : "not selected"}</h3>
                        </div>
                        <div className = "mb-4">
                            <h3 className="text-m text-center / 
                                        md:text-left text-gray-400">Time</h3>
                            <h3 className="text-xl font-bold text-center / 
                                        md:text-left">{chosenDayAndTime !== undefined ? chosenDayAndTime[0].toLocaleDateString('en-us', {  
                                          weekday: "long", year: "numeric", month: "short",  
                                          day: "numeric", hour: "2-digit", minute: "2-digit"  
                                      }) : "not selected"}</h3>
                        </div>
                        <div className="mb-4">
                          <AddToGoogleCalendarButton />
                        </div>
                                          
                          {locationOptions.length > 0 && <LocationChart 
                              //@ts-ignore
                              theSelectedLocation={[selectedLocation, setSelectedLocation]}
                              locationOptions={locationOptions.length > 0 ? locationOptions : [""]}
                              locationVotes={Object.values(locationVotes)}/>}
                          {chartedUsers !== undefined && <UserChart 
                              chartedUsersData={[chartedUsers, setChartedUsers]}
                          />}
                          <button 
                              onClick={handleSelectionSubmission}
                              className='font-bold rounded-full bg-blue-500 text-white py-4 px-7 text-lg mb-8 w-fit place-self-center \
                                          transform transition-transform hover:scale-90 active:scale-100e'>
                              Submit Selection
                            </button>
                        {selectionButtonClicked && <strong><p className="text-green-700 text-center transition-opacity duration-500 ease-in-out">Submitted!</p></strong>}
                      </div>
                  </div>
                  <div className="flex flex-col content-center mr-8 flex-wrap w-full \ 
                                  md:w-1/2 md:content-end"> 
                      <Calendar
                          title={"Group Availability"}
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
                          theSelectedDate={[selectedDate, setSelectedDate]}
                          //@ts-ignore
                          theDragState={[dragState, setDragState]}
                      />

                      <div className="flex flex-col m-2">
                            <ExportDecisionsToUser 
                                theSelectedDateTimeObjects={[selectedDateTimeObjects, setSelectedDateTimeObjects]}                              
                            />
                      </div>
                  </div>
              </div>
            </div>
    </>
    )

}