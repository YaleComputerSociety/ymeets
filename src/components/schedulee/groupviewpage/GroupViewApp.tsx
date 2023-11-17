import React, { useEffect } from 'react';
import SelectCalander from "../../scheduleComponents/calendarComponents/SelectCalendar";
import GroupAvailCal from "../GroupAvailCal";
import { useState } from "react";
import UserChart from "../../scheduleComponents/hoverViewComponents/UserChart";
import { calanderState, userData } from "../../scheduleComponents/scheduletypes";
import { calendarDimensions } from "../../scheduleComponents/scheduletypes";
import eventAPI from "../../../eventAPI";
import { getEventOnPageload } from '../../../firebase/events';
import { useParams } from 'react-router-dom';

export default function GroupViewApp() {
  const { code } = useParams();
    const testData = eventAPI.getTestData()
    const [chartedUsers, setChartedUsers] = useState<userData>(testData.userData)
    const [calendarState, setCalendarState] = useState<calanderState>(testData.scheduleDataFull);
    const [calendarFramework, setCalendarFramework] = useState<calendarDimensions>(testData.dateData)

    const [ loading, setLoading ] = useState(true);
    useEffect(() => {

        const fetchData = async () => {
            if (code && code.length == 6) {
                await getEventOnPageload(code).then(() => {
                    const { availabilities, participants } = eventAPI.getCalendar();
                    const dates = eventAPI.getCalendarDimensions();

                    setChartedUsers(participants);
                    setCalendarState(availabilities);
                    setCalendarFramework(dates);
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
         <div className="grid grid-cols-2 grid-rows-1 font-roboto mx-8">
                <div className="grid col-start-1 col-span-1"> 
                  <GroupAvailCal 
                      theCalendarState={[calendarState, setCalendarState]}
                      theCalendarFramework={[calendarFramework, setCalendarFramework] }
                      chartedUsersData={[chartedUsers, setChartedUsers]}
                      draggable={false}
                  />
                </div>
                <div className="grid col-start-2 col-span-1">
                    <UserChart 
                      chartedUsersData={[chartedUsers, setChartedUsers]}
                    />
                </div>
        </div>
      </>
    )

}