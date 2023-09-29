import React, { useState, useEffect } from "react";
import DayColumn from "./DayColumn";
// import {userSchedule, CalendarDimensions} from "../scheduletypes.ts"
import { createContext } from "react";
import "tailwindcss/tailwind.css";
import { CalandarDate } from "../scheduletypes";

function SelectCalander(props: any) {

    const [calendarState, setCalendarState] = props.calendarState;
    const [calendarFramework, setCalendarFramework] = props.calendarFramework;

    return (

        <div className={`grid grid-cols-${calendarFramework.theDates.length}`}>
            {
              calendarFramework.theDates.map((d: CalandarDate, index: any) => {

                console.log(d);

                return <DayColumn
                  key={d.id}
                  numberDay={d.calanderDay}
                  weekDay={d.shortenedWeekDay}
                  startTime={calendarFramework.startTime}
                  endTime={calendarFramework.endTime}
                  columnID={index}
                  draggable={props.draggable}
                  columnData={[calendarState, setCalendarState]}
                />
          })}
        </div>

  );
}

export default SelectCalander;
