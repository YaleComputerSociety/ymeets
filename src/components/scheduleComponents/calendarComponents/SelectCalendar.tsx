import React, { useState, useEffect } from "react";
import DayColumn from "./DayColumn";
// import {userSchedule, CalendarDimensions} from "../scheduletypes.ts"
import { createContext } from "react";
import "tailwindcss/tailwind.css";

function SelectCalander(props: any) {

    const [calendarState, setCalendarState] = props.calendarState;
    const [calendarFramework, setCalendarFramework] = props.calendarFramework;

    return (
        <div className={`grid grid-cols-${calendarFramework.numberOfColumns}`}>
            {
              calendarFramework.theDates.map((d: any, index: any) => {
                return <DayColumn
                  key={d.date}
                  numberDay={d.date.getDate()}
                  weekDay={d.dayOfWeek}
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
