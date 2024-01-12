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
    const [chartedUsers, setChartedUsers] = useState<userData>(testData.userData)
    const [calendarState, setCalendarState] = useState<calanderState | undefined>(undefined);
    const [calendarFramework, setCalendarFramework] = useState<calendarDimensions>(testData.dateData)
    const [eventName, setEventName] = useState("")
    const [eventDescription, setEventDescription] = useState("")
    const [locationVotes, setLocationVotes] = useState(Object)
    const [locationOptions, setLocationOptions] = useState(Array<String>)
    const [selectedLocation, setSelectedLocation] = useState("");
    const [chosenLocation, setChosenLocation] = useState("")
    const [chosenTimeRange, setChosenTimeRange] = useState(undefined);
    const [chosenDateRange, setChosenDateRange] = useState(undefined);


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

                        setChosenDateRange(
                            {
                                //@ts-ignore
                                "day" : getChosenDayAndTimeVar[0].getDay(),
                                //@ts-ignore
                                "month" : monthDictionary[getChosenDayAndTimeVar[0].getMonth()],
                                //@ts-ignore
                                "year" : getChosenDayAndTimeVar[0].getYear()
                            }
                        )
                    }

                    //@ts-ignore
                    
                    setChosenLocation(getChosenLocation())

                }); 

            } else { // url is malformed
                console.error("The event code in the URL doesn't exist");
            }
            setLoading(false);
        }

        fetchData();
    }, []);
    


    if (loading) {
        return <p>Loading...</p>
    }

    return (
        <>
            <div className="flex flex-col-reverse justify-center \
                            md:flex-row mx-12">
                <div className="flex flex-col content-center ml-8 flex-wrap w-full \ 
                                md:w-1/2 md:content-start">
                    <div className="flex flex-col space-y-7 max-w-sm mx-5 \
                                    md:mt-12">
                        <h1 className={"text-3xl font-bold text-center " + 
                                    "md:text-left"}>Event: {eventName}</h1>
                        <p className={"text-xl text-center " + 
                                    "md:text-left"}>Desc: {eventDescription}</p>

{chosenLocation && <div className='mb-8'>
                        <h3 className="text-m text-center /
                                    md:text-left text-gray-400">
                            Selected Location
                        </h3>
                        <h3 className="text-3xl font-bold text-center / 
                                    md:text-left">{chosenLocation}
                        </h3>
                    </div>}
                    {chosenTimeRange && <div className='mb-8'>
                        <h3 className="text-m text-center /
                                    md:text-left text-gray-400">
                            Selected Time 
                        </h3>
                        <h3 className="text-3xl font-bold text-center / 
                                    md:text-left">
{                                        //@ts-ignore
}                                       {chosenDateRange.month}, {chosenDateRange.day}{numberEnding[chosenDateRange.day % 10] || "th"} <br></br> 
                                        {chosenTimeRange[0]}-{chosenTimeRange[1]}
                        </h3>
                    </div>}

                                    
                        
                        <UserChart 
                            chartedUsersData={[chartedUsers, setChartedUsers]}
                        />
                        <LocationChart 
                        
                        theSelectedLocation={[selectedLocation, setSelectedLocation]}
                        locationOptions={locationOptions.length > 0 ? locationOptions : [""]}
                        locationVotes={Object.values(locationVotes)}
                        />
                        <button 
                              onClick={() => {nav("/timeselect/" + code)}}
                              className='mb-1 font-bold rounded-full bg-blue-500 text-white py-4 px-7 text-lg mb-8 w-fit place-self-center \
                                          transform transition-transform hover:scale-90 active:scale-100e'>
                              Edit Your Availiability
                        </button>
                

                        
                    </div>
                </div>
                <div className="flex flex-col content-center mr-8 flex-wrap w-full \ 
                                md:w-1/2 md:content-end"> 
                    <Calender
                        title={"Group Availability"}
                        isAdmin={false} 
                        //@ts-ignore
                        theCalendarState={[calendarState, setCalendarState]}
                        theCalendarFramework={[calendarFramework, setCalendarFramework] }
                        chartedUsersData={[chartedUsers, setChartedUsers]}
                        draggable={false}
                        user={0}
                        //@ts-ignore
                        theSelectedDate={[undefined, undefined]}
                        //@ts-ignore
                        theDragState={[dragState, setDragState]}
                    />
                </div>
        </div>
        </>
    )

}