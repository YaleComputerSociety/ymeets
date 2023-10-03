import React, { useState, useEffect } from "react";
import DayColumn from "./DayColumn";
// import {userSchedule, CalendarDimensions} from "../scheduletypes.ts"
import { createContext } from "react";
import "tailwindcss/tailwind.css";
import { calandarDate, calendarDimensions, calanderState } from "../scheduletypes";

interface SelectCalanderProps {
  theCalendarFramework: [calendarDimensions, React.Dispatch<React.SetStateAction<calendarDimensions>>]
  theCalendarState: [calanderState, React.Dispatch<React.SetStateAction<calanderState>>]
  draggable : boolean
  date : string
}

function SelectCalander({theCalendarFramework, theCalendarState, draggable, date}: SelectCalanderProps) {

    const [calendarState, setCalendarState] = theCalendarState;
    const [calendarFramework, setCalendarFramework] = theCalendarFramework;

    return (

      <div className="mr-4">
      <div className={`grid grid-cols-${calendarFramework.dates[date].length}`}>
            {
              calendarFramework.dates[date].map((d: calandarDate, index: any) => {
                
                return <DayColumn
                  key={d.id}
                  numberDay={d.calanderDay}
                  weekDay={d.shortenedWeekDay}
                  startTime={calendarFramework.startTime}
                  endTime={calendarFramework.endTime}
                  month={d.month}
                  columnID={index}
                  draggable={draggable}
                  theCalendarState={[calendarState, setCalendarState]}
                />
          })}
        </div>
        </div>

  );
}

export default SelectCalander;
