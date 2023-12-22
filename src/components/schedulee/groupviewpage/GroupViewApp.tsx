import React, { useEffect } from 'react';
import { useState } from "react";
import UserChart from "../../scheduleComponents/hoverViewComponents/UserChart";
import LocationChart from "../../scheduleComponents/hoverViewComponents/LocationChart";
import { calanderState, userData } from "../../scheduleComponents/calendarComponents/scheduletypes";
import { calendarDimensions } from "../../scheduleComponents/calendarComponents/scheduletypes";
import eventAPI from "../../../eventAPI";
import { getEventOnPageload, getEventName, getEventDescription, getLocationsVotes, getLocationOptions } from '../../../firebase/events';
import { useParams } from 'react-router-dom';
import Calender from '../../scheduleComponents/calendarComponents/CalendarApp';

export default function GroupViewApp() {
    const { code } = useParams();
    const testData = eventAPI.getTestData()
    const [chartedUsers, setChartedUsers] = useState<userData>(testData.userData)
    const [calendarState, setCalendarState] = useState<calanderState>(testData.scheduleDataFull);
    const [calendarFramework, setCalendarFramework] = useState<calendarDimensions>(testData.dateData)
    const [eventName, setEventName] = useState("")
    const [eventDescription, setEventDescription] = useState("")
    const [locationVotes, setLocationVotes] = useState(Object)
    const [locationOptions, setLocationOptions] = useState(Array<String>)

    const [ loading, setLoading ] = useState(true);
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
                    console.log(getLocationsVotes())
                    setLocationOptions(getLocationOptions())
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
            <div className="flex flex-col justify-center \
                            md:flex-row-reverse">
                <div className="flex flex-col content-center ml-8 flex-wrap w-full \ 
                                md:w-1/2 md:content-start">
                    <div className="flex flex-col space-y-7 max-w-sm mx-5 \
                                    md:mt-12">
                        <h1 className={"text-3xl font-bold text-center " + 
                                    "md:text-left"}>Event: {eventName}</h1>
                        <p className={"text-xl text-center " + 
                                    "md:text-left"}>Desc: {eventDescription}</p>
                        <LocationChart 
                            locationOptions={locationOptions.length > 0 ? locationOptions : [""]}
                            locationVotes={Object.values(locationVotes)}/>
                        <UserChart 
                            chartedUsersData={[chartedUsers, setChartedUsers]}
                        />
                    </div>
                </div>
                <div className="flex flex-col content-center mr-8 flex-wrap w-full \ 
                                md:w-1/2 md:content-end"> 
                    <Calender
                        title={"Group Availability"}
                        isAdmin={false} 
                        theCalendarState={[calendarState, setCalendarState]}
                        theCalendarFramework={[calendarFramework, setCalendarFramework] }
                        chartedUsersData={[chartedUsers, setChartedUsers]}
                        draggable={false}
                        user={0}
                    />
                </div>
        </div>
        </>
    )

}