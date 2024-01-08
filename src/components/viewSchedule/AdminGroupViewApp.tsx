import { useState } from "react";
import { calanderState, userData } from "../../types"
import { calendarDimensions } from  "../../types"
import eventAPI from "../../firebase/eventAPI";
import Calendar from "../selectCalendarComponents/CalendarApp"
import { getEventOnPageload, getEventName, getEventDescription, getLocationsVotes, getLocationOptions, setChosenLocation } from '../../firebase/events';
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import LocationChart from "../hoverViewComponents/LocationChart";
import UserChart from "../hoverViewComponents/UserChart";
import { generateTimeBlocks } from "../utils/generateTimeBlocks";
import { setChosenDate } from "../../firebase/events";
import { start } from "repl";
import { getChosenLocation } from "../../firebase/events";

export default function AdminGroupViewApp() {

    const testData = eventAPI.getTestData()
    const [calendarState, setCalendarState] = useState<calanderState>({...testData.scheduleDataFull});
    const [calendarFramework, setCalendarFramework] = useState<calendarDimensions>(testData.dateData)
    const { code } = useParams();
    const [chartedUsers, setChartedUsers] = useState<userData>(testData.userData)
    const [eventName, setEventName] = useState("")
    const [eventDescription, setEventDescription] = useState("")
    const [locationVotes, setLocationVotes] = useState(Object)
    const [locationOptions, setLocationOptions] = useState(Array<String>)
    const [selectedLocation, setSelectedLocation] = useState("");
    const [selectedDate, setSelectedDate] = useState();

    const [loading, setLoading] = useState(true);
    const [selectionButtonClicked, setSelectionButtonClicked] = useState(false);

    const [dragState, setDragState] = useState({
      dragStartedOnID : [], // [columnID, blockID]
      dragEndedOnID : [],
      dragStartedOn : false,
      affectedBlocks : new Set()
    })

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

              }); 

          } else { // url is malformed
              console.error("The event code in the URL doesn't exist");
          }
          setLoading(false);
      }

      

      fetchData();

      
  }, []);

  function handleSelectionSubmission() {
      //@ts-ignore

      if (dragState.dragEndedOnID[0] != dragState.dragStartedOnID[0]) {
        console.warn("not the same day! You can't meet on two days, lol")
        return
      }

      setSelectionButtonClicked(true);

      //@ts-ignore
      let calDate = [].concat(...calendarFramework.dates)[dragState.dragStartedOnID[0]]
      let timeBlocks = generateTimeBlocks(calendarFramework.startTime.getHours(), calendarFramework.endTime.getHours())
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

        setChosenDate(selectedStartTimeDateObject, selectedEndTimeDateObject)

      }

      
      if (selectedLocation != "" && selectedLocation != undefined) {
        //@ts-ignore
        setChosenLocation(selectedLocation).then(() => {
            console.log("location set!")
        });

      }

      setTimeout(() => {
        setSelectionButtonClicked(false);
      }, 3000)
      
  }
  
  return ( <>
              <div className="flex flex-col-reverse justify-center \
                              md:flex-row mx-12">
                  <div className="flex flex-col content-center ml-8 flex-wrap w-full \ 
                                  md:w-1/2 md:content-start">
                      <div className="flex flex-col space-y-7 max-w-sm mx-5 \
                                      md:mt-12">
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
                                           
                          {locationOptions.length > 0 && <LocationChart 
                              //@ts-ignore
                              theSelectedLocation={[selectedLocation, setSelectedLocation]}
                              locationOptions={locationOptions.length > 0 ? locationOptions : [""]}
                              locationVotes={Object.values(locationVotes)}/>}
                          <UserChart 
                              chartedUsersData={[chartedUsers, setChartedUsers]}
                          />
                          <button 
                              onClick={handleSelectionSubmission}
                              className='mb-1 font-bold rounded-full bg-blue-500 text-white py-4 px-7 text-lg mb-8 w-fit place-self-center \
                                          transform transition-transform hover:scale-90 active:scale-100e'>
                              Submit Selection
                        </button>
                        {selectionButtonClicked && <strong><p className="text-green-700 text-center transition-opacity duration-500 ease-in-out">Location and Time Selected!</p></strong>}
                      </div>
                  </div>
                  <div className="flex flex-col content-center mr-8 flex-wrap w-full \ 
                                  md:w-1/2 md:content-end"> 
                      <Calendar
                          title={"Group Availability | Admin"}
                          //@ts-ignore
                          theCalendarState={[calendarState, setCalendarState]}
                          theCalendarFramework={[calendarFramework, setCalendarFramework] }
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
                        <button className='font-bold rounded-full bg-blue-500 text-white py-4 px-7 text-lg mb-8 w-fit place-self-center \
                                          transform transition-transform hover:scale-90 active:scale-100e'>
                          Export Decision to Participant Calendars
                        </button>
                      </div>
                  </div>
            </div>
    </>
    )

}