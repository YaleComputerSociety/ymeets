import TimeColumn from "../scheduleComponents/calendarComponents/TimeColumn"
import SelectCalander from "../scheduleComponents/calendarComponents/SelectCalendar";
import { generateTimeBlocks } from "../scheduleComponents/utils/generateTimeBlocks";
import { useEffect } from "react";
import { getDateWithDay } from "../scheduleComponents/utils/getDateWithDay";
// import "tailwindcss/tailwind.css";

export default function GroupAvailCal(props: any) {

    const [calendarFramework, setCalendarFramework] = props.calendarFramework;
    const [calendarState, setCalendarState] = props.calendarState;

    // let numberOfBlocks = generateTimeBlocks(calendarFramework.startTime, calendarFramework.endTime).length;

    // const handleColumnDataUpdate = (colIndex: any) => {
    //     setCalendarState((prevDayColumnDockState: any) => ({
    //     ...prevDayColumnDockState,
    //     [colIndex]: Array.from({ length: numberOfBlocks }, (_, index) => undefined),
    //     }));
    // };

    // useEffect(() => {
    //     let dates = [];
    //     // let curColIndex = 0;
        
    //     for (let i = 0; i < calendarFramework.theInputtedDates.length; i++) {
    //         let newDateWithDay = getDateWithDay(calendarFramework.theInputtedDates[i]);
        
    //         dates.push(newDateWithDay);
    //     }
        
    //     let oldFramework = {...calendarFramework};
    //     oldFramework.numberOfColumns = dates.length;
    //     oldFramework.theDates = dates;
    //     setCalendarFramework(oldFramework);
    // }, []);
    
    return (

        <>
         <h1 className="text-4xl m-5 mb-0 font-bold">Group Availibility</h1>
        
            <div className="border border-1 border-gray-600 m-5 w-fit">
            
            <div className="flex">    
                <TimeColumn 
                    startTime={calendarFramework.startTime}
                    endTime={calendarFramework.endTime}
                />
                <SelectCalander            
                    calendarState={[calendarState, setCalendarState]}
                    calendarFramework={[calendarFramework, setCalendarFramework]}
                    startTime={calendarFramework.startTime}
                    endTime={calendarFramework.endTime}
                    draggable={false}
                />
            </div>
        </div>
        </>
        
    )

}