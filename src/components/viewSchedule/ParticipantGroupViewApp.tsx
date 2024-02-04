import React, { useEffect } from 'react';
import { useState } from "react";
import UserChart from "../hoverViewComponents/UserChart";
import LocationChart from "../hoverViewComponents/LocationChart";
import { calanderState, userData } from "../../types"
import { calendarDimensions } from "../../types"
import eventAPI from "../../firebase/eventAPI";
import { getEventOnPageload, getEventName, getEventDescription, getLocationsVotes, getLocationOptions } from '../../firebase/events';
import { useParams } from 'react-router-dom';
import Calender from '../selectCalendarComponents/CalendarApp';
import { getChosenLocation, getChosenDayAndTime } from '../../firebase/events';
import { useNavigate } from 'react-router-dom';


export default function ParticipantGroupViewApp() {
    const { code } = useParams();
    const testData = eventAPI.getTestData()
    const [chartedUsers, setChartedUsers] = useState<userData | undefined>(undefined)
    const [calendarState, setCalendarState] = useState<calanderState | undefined>(undefined);
    const [calendarFramework, setCalendarFramework] = useState<calendarDimensions | undefined>(undefined)
    const [eventName, setEventName] = useState("")
    const [eventDescription, setEventDescription] = useState("")
    const [locationVotes, setLocationVotes] = useState(Object)
    const [locationOptions, setLocationOptions] = useState(Array<String>)
    const [selectedLocation, setSelectedLocation] = useState("");
    const [chosenLocation, setChosenLocation] = useState("")
    const [chosenTimeRange, setChosenTimeRange] = useState(undefined);
    const [chosenDateRange, setChosenDateRange] = useState([]);


    const [ loading, setLoading ] = useState(true);
    
    const [dragState, setDragState] = useState({
        dragStartedOnID : [], // [columnID, blockID]
        dragEndedOnID : [],
        dragStartedOn : false,
        affectedBlocks : new Set()
    })

    const nav = useNavigate();

    const monthDictionary = {
        0: 'January',
        1: 'February',
        2: 'March',
        3: 'April',
        4: 'May',
        5: 'June',
        6: 'July',
        7: 'August',
        8: 'September',
        9: 'October',
        10: 'November',
        11: 'December',
    };

    const numberEnding = {
        1: "st",
        2: "nd",
        3: "rd",
        4: "th",
        5: "th",
        6: "th",
        7: "th",
        8: "th",
        9: "th",
        10: "th",
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

                    let getChosenDayAndTimeVar = getChosenDayAndTime()
                    
                    //@ts-ignore
                    setChosenDateRange(getChosenDayAndTimeVar);
                       
                    if (getChosenDayAndTimeVar != undefined) {
                        //@ts-ignore
                        setChosenTimeRange([getChosenDayAndTimeVar[0].toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                        }), 
                        
                        //@ts-ignore
                        getChosenDayAndTimeVar[1].toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                        })
                        ])
                    }

                    //@ts-ignore
                    
                    setChosenLocation(getChosenLocation())
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
                        <button 
                            disabled={chosenDateRange != undefined && chosenDateRange?.length !== 0}
                            onClick={() => {nav("/timeselect/" + code)}}
                            className='hidden font-bold rounded-md bg-blue-500 text-white text-base w-fit p-3 \
                                        transform transition-transform hover:scale-90 active:scale-100e md:block disabled:bg-gray-500 disabled:opacity-50'>
                            <span className="mr-1">&#8592;</span> Edit Your Availiability
                        </button>
                        {chosenDateRange != undefined && chosenDateRange?.length !== 0 && <div className="p-1 w-[80%] text-gray-500 text-left text-sm md:text-left">
                            NOTE: Admin has selected a time, so you cannot edit your availability
                        </div>
                        }

                        <div className = "hidden mb-4 flex flex-col space-y-5 hidden md:block">
                            <h3 className="text-3xl font-bold text-center md:text-left">{eventName}</h3>

                            <div className="flex flex-col">
                        <h3 className="text-base text-center md:text-left">
                            {/*@ts-ignore*/}
                          <span className='font-bold'>Time:</span> {chosenDateRange != undefined && chosenDateRange[0] !== undefined ? chosenDateRange[0]?.toLocaleDateString('en-us', {  
                                    weekday: "long", year: "numeric", month: "short",  
                                    day: "numeric", hour: "2-digit", minute: "2-digit"  
                                }) : "not selected"}
                        </h3>

                        <h3 className="text-base text-center md:text-left">
                        <span className='font-bold'>Location:</span> {chosenLocation !== undefined ? getChosenLocation() : "not selected"}
                        </h3>
                      </div>
                        </div>

                        <UserChart 
                            chartedUsersData={[chartedUsers, setChartedUsers]}
                        />

                        <LocationChart 
                            theSelectedLocation={[selectedLocation, setSelectedLocation]}
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
                            user={0}
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
                        
                      
                        <button 
                            disabled={chosenDateRange !== undefined}
                            onClick={() => {nav("/timeselect/" + code)}}
                            className='font-bold rounded-md bg-blue-500 text-white text-base w-fit p-3 \
                                        transform transition-transform hover:scale-90 active:scale-100e md:block disabled:bg-gray-500 disabled:opacity-50'>
                            <span className="mr-1">&#8592;</span> Edit Your Availiability
                        </button>
                                

                        {/* (Mobile): Event name, location, and time */}

                        <div className = "mb-4 flex flex-col space-y-5 mt-4">
                        <h3 className="text-3xl font-bold text-center md:text-left">{eventName}</h3>

                        <div className="flex flex-col">
                        <h3 className="text-base text-center md:text-left">
                            {/*@ts-ignore*/}
                            <span className='font-bold'>Time:</span> {chosenDateRange != undefined && chosenDateRange[0] !== undefined ? chosenDateRange[0].toLocaleDateString('en-us', {  
                                    weekday: "long", year: "numeric", month: "short",  
                                    day: "numeric", hour: "2-digit", minute: "2-digit"  
                                }) : "not selected"}
                        </h3>

                        <h3 className="text-base text-center md:text-left">
                        <span className='font-bold'>Location:</span> {chosenLocation !== undefined ? getChosenLocation() : "not selected"}
                        </h3>
                      </div>
                        </div>
                        
                  </div>
                </div>
            </div>
        </>
    )

}