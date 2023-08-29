import React, { useState, useEffect } from "react";
import DayColumn from "./DayColumn";
import { generateTimeBlocks } from "../utils/generateTimeBlocks";
import { getDatesFromRange } from "../utils/getDatesFromRange";

function SelectCalander(props) {
  const [calendarState, setCalendarState] = props.calendarState;
  const [calendarFramework, setCalendarFramework] = props.calendarFramework;


  return (
    <div className={`grid grid-cols-${calendarFramework.numberOfColumns}`}>
      {
      calendarFramework.theDates.map((d, index) => {
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
