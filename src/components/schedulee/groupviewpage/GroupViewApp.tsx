import SelectCalander from "../../scheduleComponents/calendarComponents/SelectCalendar";
import GroupAvailCal from "../GroupAvailCal";
import { useState } from "react";
import UserChart from "../../scheduleComponents/hoverViewComponents/UserChart";
import { calanderState } from "../../scheduleComponents/scheduletypes";
import { calendarDimensions } from "../../scheduleComponents/scheduletypes";
export default function GroupViewApp() {

    const [chartedUsers, setChartedUsers] = useState<Array<string>>([])

    const [calendarState, setCalendarState] = useState<calanderState>({
      schedules: [
        {
          0: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          1: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          2: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          3: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          4: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          5: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          6: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        },
        {
          0: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          1: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          2: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          3: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          4: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          5: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          6: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        },
        {
          0: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          1: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          2: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          3: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          4: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          5: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          6: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
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
        endTime : "12:00:00",
    })

    return (
      <>
         <div className="grid grid-cols-2 grid-rows-1 font-roboto mx-8">
                <div className="grid col-start-1 col-span-1"> 
                  <GroupAvailCal 
                      theCalendarState={[calendarState, setCalendarState]}
                      theCalendarFramework={[calendarFramework, setCalendarFramework] }
                      draggable={false}
                  />
                </div>
                <div className="grid col-start-2 col-span-1">
                    <UserChart 
                      chartedUsers={[chartedUsers, setChartedUsers]}
      
                    />
                </div>
        </div>
      </>
    )

}