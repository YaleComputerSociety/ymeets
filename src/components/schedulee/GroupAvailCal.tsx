import TimeColumn from "../scheduleComponents/calendarComponents/TimeColumn"
import SelectCalander from "../scheduleComponents/calendarComponents/SelectCalendar";
import { generateTimeBlocks } from "../scheduleComponents/utils/generateTimeBlocks";
import { useEffect } from "react";
import { getDateWithDay } from "../scheduleComponents/utils/getDateWithDay";
import { calendarDimensions, calanderState, userData } from "../scheduleComponents/scheduletypes";

interface GroupAvailCal {
    theCalendarFramework: [calendarDimensions, React.Dispatch<React.SetStateAction<calendarDimensions>>]
    theCalendarState: [calanderState, React.Dispatch<React.SetStateAction<calanderState>>]
    chartedUsersData: [userData, React.Dispatch<React.SetStateAction<userData>>]
    draggable : boolean
    user : number
}

export default function GroupAvailCal({theCalendarFramework, theCalendarState, chartedUsersData, draggable, user}: GroupAvailCal) {

    const [calendarFramework, setCalendarFramework] = theCalendarFramework;
    const [calendarState, setCalendarState] = theCalendarState;
    const [chartedUsers, setChartedUsers] = chartedUsersData;
    
    let columnIndexOffset = 0
    
    return (

        <>
         <h1 className="text-4xl m-5 mb-0 font-bold">Group Availibility</h1>
        
            <div className="border border-1 border-gray-600 m-5 w-fit">
            
            <div className="flex">  

                <TimeColumn 
                    startDate={calendarFramework.startDate}
                    endDate={calendarFramework.endDate}
                />
                {
                    calendarFramework.dates.map((bucket, index) => {

                        if (index != 0) {
                            let prev_bucket = calendarFramework.dates[index - 1]
                            columnIndexOffset += prev_bucket.length
                        }
                        
                        return <SelectCalander 
                            theCalendarState={[calendarState, setCalendarState]}
                            bucket={bucket}
                            theCalendarFramework={[calendarFramework, setCalendarFramework]}
                            draggable={false}
                            isAdmin={false}
                            chartedUsersData={[chartedUsers, setChartedUsers]}
                            columnIndexOffset={columnIndexOffset}
                            user={user}
                        />

                     
                    }) 
                    }
            </div>
        </div>
        </>
        
    )

}