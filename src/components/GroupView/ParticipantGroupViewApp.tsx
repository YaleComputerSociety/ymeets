import { useEffect } from 'react';
import { useState } from "react";
import UserChart from "./UserChart";
import LocationChart from "./LocationChart";
import { calanderState, userData } from "../../types"
import { calendarDimensions } from "../../types"
import eventAPI from "../../firebase/eventAPI";
import { getEventOnPageload, getEventName, getEventDescription, getLocationsVotes, getLocationOptions, updateAnonymousUserToAuthUser, getAccountName } from '../../firebase/events';
import { useParams } from 'react-router-dom';
import Calender from '../selectCalendarComponents/CalendarApp';
import { getChosenLocation, getParticipantIndex, getAccountId, getChosenDayAndTime } from '../../firebase/events';
import { useNavigate } from 'react-router-dom';
import AddToGoogleCalendarButton from './AddToCalendarButton';
import Button from '../utils/components/Button';


/**
 * 
 * @returns Page Component Page
 */
export default function ParticipantGroupViewPage() {
    const { code } = useParams();

    const [chartedUsers, setChartedUsers] = useState<userData | undefined>(undefined)
    const [calendarState, setCalendarState] = useState<calanderState | undefined>(undefined);
    const [calendarFramework, setCalendarFramework] = useState<calendarDimensions | undefined>(undefined)
    
    const [eventName, setEventName] = useState("")
    const [eventDescription, setEventDescription] = useState("")
    const [locationVotes, setLocationVotes] = useState(Object)
    const [locationOptions, setLocationOptions] = useState(Array<String>)
    const [userChosenLocation, setUserChosenLocation] = useState("");
    const [selectedLocation, setSelectedLocation] = useState(undefined)
    // const [chosenTimeRange, setChosenTimeRange] = useState(undefined);
    const [selectedDateTimeObjects, setSelectedDateTimeObjects] = useState<[Date, Date] | undefined>();
    // const [selectedDateTimeObjects, setSelectedDateTimeObjects] = useState<Date[]>([]);


    const [ loading, setLoading ] = useState(true);
    
    const [dragState, setDragState] = useState({
        dragStartedOnID : [], // [columnID, blockID]
        dragEndedOnID : [],
        dragStartedOn : false,
        affectedBlocks : new Set()
    })

    const nav = useNavigate();

    const getCurrentUserIndex = () => {
        let user = getParticipantIndex(getAccountName(), getAccountId());
        if (user === undefined) { // new user => last availability
            user = (calendarState !== undefined) ? Object.keys(calendarState).length - 1 : 0;

        }
        return user;
    }

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
                    
                    setSelectedDateTimeObjects(getChosenDayAndTime());
                       
                    //@ts-ignore
                    
                    setSelectedLocation(getChosenLocation())
                    setLoading(false);
                }).catch((err) => {
                    console.log(err)
                    nav("/notfound")
                }); 

            } else { // url is malformed
                console.error("The event code in the URL doesn't exist");
                nav("/notfound")
            }
        }

        fetchData();
    }, []);
    


    if (loading) {
        return <p>Loading...</p>
    }

    return (
        <>

            <div className='flex justify-center'>
                <div className="flex flex-col-reverse justify-center w-[90%] px-8 md:flex-row md:space-x-7 lg:space-x-20 xl:space-x-30">
                    <div className="flex flex-col content-center space-y-7 flex-none md:w-[32%] mb-5 md:content-start md:mt-0">
                        <Button 
                            bgColor="blue-500"
                            textColor='white'
                            disabled={selectedDateTimeObjects != undefined}
                            onClick={() => {nav("/timeselect/" + code)}}
                        >
                            <span className="mr-1">&#8592;</span> Edit Your Availiability
                        </Button>
                        {selectedDateTimeObjects != undefined && <div className="p-1 w-[80%] text-gray-500 text-left text-sm md:text-left">
                            NOTE: Admin has selected a time, so you cannot edit your availability
                        </div>
                        }

                        <div className = "hidden mb-4 flex flex-col space-y-5 md:block">
                            <h3 className="text-3xl font-bold text-center md:text-left">{eventName}</h3>
                            <h3 className="text-xl text-center md:text-left">{eventDescription}</h3>

                            {selectedDateTimeObjects
                          ? <div className="">
                            <AddToGoogleCalendarButton />
                          </div>
                          : undefined}

                            <div className="flex flex-col">
                        <h3 className="text-base text-center md:text-left">
                            {/*@ts-ignore*/}
                            <span className='font-bold'>Time:</span> {selectedDateTimeObjects !== undefined ? (selectedDateTimeObjects[0]?.toLocaleDateString('en-us', {  
                                        weekday: "long", year: "numeric", month: "short",  
                                        day: "numeric", hour: "numeric", minute: "2-digit"  
                                    }) + " — " + selectedDateTimeObjects[1]?.toLocaleTimeString('en-us', {  
                                      hour: "numeric", minute: "2-digit"  
                                  })) : "not selected"}
                        </h3>

                        {locationOptions.length > 0 && <h3 className="text-base text-center md:text-left">
                        <span className='font-bold'>Location:</span> {selectedLocation !== undefined ? selectedLocation : "not selected"}
                        </h3>}
                      </div>
                        </div>

                        <UserChart 
                            //@ts-ignore
                            chartedUsersData={[chartedUsers, setChartedUsers]}
                        />

                        <LocationChart 
                            theSelectedLocation={[userChosenLocation, setUserChosenLocation]}
                            locationOptions={locationOptions.length > 0 ? locationOptions : [""]}
                            locationVotes={Object.values(locationVotes)}
                        />
                    </div>

                    <div className="flex flex-col content-center flex-1 grow overflow-x-auto md:content-end pl-4"> 
                        <Calender
                            title={""}
                            isAdmin={false} 
                            //@ts-ignore
                            theCalendarState={[calendarState, setCalendarState]}
                            //@ts-ignore
                            theCalendarFramework={[calendarFramework, setCalendarFramework] }
                            //@ts-ignore
                            chartedUsersData={[chartedUsers, setChartedUsers]}
                            draggable={false}
                            user={getCurrentUserIndex()}
                            //@ts-ignore
                            theSelectedDate={[undefined, undefined]}
                            //@ts-ignore
                            theDragState={[dragState, setDragState]}
                            //@ts-ignore
                            theGoogleCalendarEvents={[undefined, undefined]}
                        />

                    </div>

                    <div className="md:hidden">
                        {/* (Mobile): Edit availability button */}
                        
                        <div className='flex items-center justify-center '>
                        <Button 
                            bgColor="blue-500"
                            textColor='white'
                            disabled={selectedDateTimeObjects != undefined}
                            onClick={() => {nav("/timeselect/" + code)}}
                        >
                            <span className="mr-1">&#8592;</span> Edit Your Availiability
                        </Button>
                        </div>
                        {/* (Mobile): Event name, location, and time */}

                        <div className = "mb-4 flex flex-col space-y-5 mt-4">
                        <h3 className="text-3xl font-bold text-center md:text-left">{eventName}</h3>
                        <h3 className="text-xl text-center md:text-left">{eventDescription}</h3>

                        {selectedDateTimeObjects
                          ? <div className="flex items-center justify-center">
                            <AddToGoogleCalendarButton />
                          </div>
                          : undefined}

                        <div className="flex flex-col">
                        <h3 className="text-base text-center md:text-left">
                            {/*@ts-ignore*/}
                            <span className='font-bold'>Time:</span> {selectedDateTimeObjects != undefined && selectedDateTimeObjects[0] !== undefined ? selectedDateTimeObjects[0].toLocaleDateString('en-us', {  
                                    weekday: "long", year: "numeric", month: "short",  
                                    day: "numeric", hour: "2-digit", minute: "2-digit"  
                                }) : "not selected"}
                        </h3>

                        {locationOptions.length > 0 && <h3 className="text-base text-center md:text-left">
                        <span className='font-bold'>Location: </span> {selectedLocation !== undefined ? selectedLocation : "not selected"}
                        </h3>}
                        
                      </div>
                        </div>
                        
                  </div>
                </div>
            </div>
        </>
    )

}