import TimeColumn from "./TimeColumn"
import SelectCalander from "../components/scheduleComponents/calendarComponents/SelectCalendar";
import { generateTimeBlocks } from "../components/scheduleComponents/utils/generateTimeBlocks";
import { useEffect } from "react";
import { getDateWithDay } from "../components/scheduleComponents/utils/getDateWithDay";
import { calendarDimensions, calanderState, userData } from "../components/scheduleComponents/calendarComponents/scheduletypes";

interface GroupAvailCalProps {
    theCalendarFramework: [calendarDimensions, React.Dispatch<React.SetStateAction<calendarDimensions>>]
    theCalendarState: [calanderState, React.Dispatch<React.SetStateAction<calanderState>>]
    chartedUsersData: [userData, React.Dispatch<React.SetStateAction<userData>>]
    draggable : boolean
    user : number
}

export default function GroupAvailCal({theCalendarFramework, theCalendarState, chartedUsersData, draggable, user}: GroupAvailCalProps) {

    const [calendarFramework, setCalendarFramework] = theCalendarFramework;
    const [calendarState, setCalendarState] = theCalendarState;
    const [chartedUsers, setChartedUsers] = chartedUsersData;
    
    let columnIndexOffset = 0
    
    return (

        <>
         <h1 className="text-4xl m-5 mb-0 font-bold">Group Availibility</h1>
        
            <div className="m-5 w-fit">
            
            <div className="flex py-6 px-8 \
                            md:bg-white md:rounded-lg">  

                <TimeColumn 
                    startDate={calendarFramework.startTime}
                    endDate={calendarFramework.endTime}
                />
                {
                    calendarFramework.dates.map((bucket, index) => {

                        if (index != 0) {
                            let prev_bucket = calendarFramework.dates[index - 1]
                            columnIndexOffset += prev_bucket.length
                        }
                        
                        return <></>

                    }) 
                    }
            </div>
        </div>
        </>
        
    )

}