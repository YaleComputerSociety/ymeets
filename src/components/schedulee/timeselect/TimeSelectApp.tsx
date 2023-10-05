import AvailCal from '../AvailCal';
// import GroupAvailCal from "./components/GroupAvailCal"
import { useState, useEffect } from "react"
import { generateTimeBlocks } from '../../scheduleComponents/utils/generateTimeBlocks';
import { getDatesFromRange } from '../../scheduleComponents/utils/getDatesFromRange';
import { getDateWithDay } from '../../scheduleComponents/utils/getDateWithDay';
import { calandarDate, calanderState } from '../../scheduleComponents/scheduletypes';
import { calendarDimensions } from '../../scheduleComponents/scheduletypes';
function TimeSelectApp() {

    const [calendarState, setCalendarState] = useState<calanderState>({
        schedules : [
        {
            0: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            1: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            2: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            3: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            4: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            5: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
        ]
});

    const [calendarFramework, setCalendarFramework] = useState<calendarDimensions>({
        dates : {
            "1" : [
            {   
                id : 0,
                shortenedWeekDay : "SUN",
                calanderDay : "20",
                year : "2023",
                month : "AUG"
            },
            {   
                id : 1,
                shortenedWeekDay : "MON",
                calanderDay : "21",
                year : "2023",
                month : "AUG"
            },
            {
                id : 3,
                shortenedWeekDay : "TUE",
                calanderDay : "22",
                year : "2023",
                month : "AUG"
            },
            {
                id : 4,
                shortenedWeekDay : "WED",
                calanderDay : "23",
                year : "2023",
                month : "AUG"
            },
            {
                id : 5,
                shortenedWeekDay : "THU",
                calanderDay : "24",
                year : "2023",
                month : "AUG"
            },
            {
                id : 6,
                shortenedWeekDay : "FRI",
                calanderDay : "25",
                year : "2023",
                month : "AUG"
            },
            {
                id : 7,
                shortenedWeekDay : "SAT",
                calanderDay : "26",
                year : "2023",
                month : "AUG"
            }
        ],

        "2" : [
            {
                id : 8,
                shortenedWeekDay : "SUN",
                calanderDay : "02",
                year : "2023",
                month : "SEPT"
            },

            {
                id : 9,
                shortenedWeekDay : "MON",
                calanderDay : "03",
                year : "2023",
                month : "SEPT"
            },
            
            {
                id : 10,
                shortenedWeekDay : "TUE",
                calanderDay : "04",
                year : "2023",
                month : "SEPT"
            },
        ]
    },
        startTime : "10:00:00", 
        endTime : "23:32:00",
    })

    return (
        <div>
            <div className="grid grid-cols-2 grid-rows-1 font-roboto mx-8">
                <div className="grid col-start-2 col-span-1"> 
                    <AvailCal 
                        theCalendarState={[calendarState, setCalendarState]}
                        theCalendarFramework={[calendarFramework, setCalendarFramework] }
                        draggable={true}
                    />
                </div>
            </div>
        </div>
    )
}

export default TimeSelectApp;
