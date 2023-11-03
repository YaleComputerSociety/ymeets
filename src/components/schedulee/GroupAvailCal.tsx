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
}

export default function GroupAvailCal({theCalendarFramework, theCalendarState, chartedUsersData, draggable}: GroupAvailCal) {

    const [calendarFramework, setCalendarFramework] = theCalendarFramework;
    const [calendarState, setCalendarState] = theCalendarState;
    const [chartedUsers, setChartedUsers] = chartedUsersData;
    
    return (

        <>
         <h1 className="text-4xl m-5 mb-0 font-bold">Group Availibility</h1>
        
            <div className="border border-1 border-gray-600 m-5 w-fit">
            
            <div className="flex">    
                <TimeColumn 
                    startTime={calendarFramework.startTime}
                    endTime={calendarFramework.endTime}
                />
                {
                    Object.keys(calendarFramework.dates).map((theDate) =>
                        <SelectCalander 
                            theCalendarState={[calendarState, setCalendarState]}
                            date={theDate}
                            theCalendarFramework={[calendarFramework, setCalendarFramework]}
                            chartedUsersData={[chartedUsers, setChartedUsers]}
                            draggable={false}
                        />
                    ) 
                    }
            </div>
        </div>
        </>
        
    )

}