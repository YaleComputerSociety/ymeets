import AvailCal from "./components/AvailCal"
import GroupAvailCal from "./components/GroupAvailCal"
import { useState, useEffect } from "react"
import { generateTimeBlocks } from "./utils/generateTimeBlocks"
import { getDatesFromRange } from "./utils/getDatesFromRange"
import { getDateWithDay } from "./utils/getDateWithDay"

//import "semantic-ui-css/semantic.min.css";


function App() {

    const [calendarState, setCalendarState] = useState({});

    const [calendarFramework, setCalendarFramework] = useState({
        theInputtedDates : ["2023-08-20", "2023-08-21", "2023-08-22", "2023-08-23", "2023-08-24", "2023-08-25", "2023-08-26",],
        theDates : [], // the day,  date object pair
        startTime : "10:00:00", 
        endTime : "23:32:00",
        numberOfColumns : 0
    })

    let numberOfBlocks = generateTimeBlocks(calendarFramework.startTime, calendarFramework.endTime).length;

    const handleColumnDataUpdate = (colIndex) => {
        setCalendarState((prevDayColumnDockState) => ({
        ...prevDayColumnDockState,
        [colIndex]: Array.from({ length: numberOfBlocks }, (_, index) => undefined),
        }));
    };

    useEffect(() => {
        let dates = [];
        let curColIndex = 0;

        for (let i = 0; i < calendarFramework.theInputtedDates.length; i++) {
            let newDateWithDay = getDateWithDay(calendarFramework.theInputtedDates[i]);
            
            handleColumnDataUpdate(curColIndex);
            curColIndex += 1;
         
            dates.push(newDateWithDay);
        }

        console.log(dates);

        let oldFramework = {...calendarFramework};
        oldFramework.numberOfColumns = dates.length;
        oldFramework.theDates = dates;
        setCalendarFramework(oldFramework);
    }, []);

    return (
        <div className="grid grid-cols-2 grid-rows-1 font-roboto">
            <div className="grid col-span-1"> 
            <AvailCal 
                calendarState={[calendarState, setCalendarState]}
                calendarFramework={[calendarFramework, setCalendarFramework] }
            />
            </div>
            <div className="grid col-span-1"> 

            <GroupAvailCal 
                calendarState={ [calendarState, setCalendarState]}
                calendarFramework={[calendarFramework, setCalendarFramework]}
            />
            </div>

        </div>

    )
}

export default App;
