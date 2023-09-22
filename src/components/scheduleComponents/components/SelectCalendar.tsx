import React, { useState, useEffect } from "react";
import DayColumn from "./DayColumn";

import { createContext } from "react";

const FrameworkContext = createContext(
  {
    theInputtedDates: ["2023-08-20", "2023-08-21", "2023-08-22", "2023-08-23", "2023-08-24", "2023-08-25", "2023-08-26"],
    theDates: [],
    startTime: "10:00:00",
    endTime: "23:32:00",
    numberOfColumns: 0,
  }
);

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
                  columnData={[calendarState, setCalendarState]}
                />
          })}
        </div>

  );
}

export default SelectCalander;
