import React, { useState, useEffect } from "react";
import DayColumn from "./DayColumn";
import { createContext } from "react";
import "tailwindcss/tailwind.css";
import { calandarDate, calendarDimensions, calanderState, userData } from "../scheduletypes";

interface SelectCalanderProps {
  theCalendarFramework: [calendarDimensions, React.Dispatch<React.SetStateAction<calendarDimensions>>]
  theCalendarState: [calanderState, React.Dispatch<React.SetStateAction<calanderState>>]
  chartedUsersData?: [userData, React.Dispatch<React.SetStateAction<userData>>]
  draggable: boolean
  isAdmin?: boolean
  bucket : calandarDate[]
  columnIndexOffset : number
}

function SelectCalander({ theCalendarFramework, theCalendarState, chartedUsersData, draggable, isAdmin, bucket, columnIndexOffset}: SelectCalanderProps) {

  const [calendarState, setCalendarState] = theCalendarState;
  const [calendarFramework, setCalendarFramework] = theCalendarFramework;

  return (
    <div className="mr-4">
      <div className={`grid grid-cols-${bucket.length}`}>
              {
                bucket.map((d: calandarDate, columnIndex) => {                  
                  return <DayColumn
                    key={d.id}
                    numberDay={d.calanderDay}
                    weekDay={d.shortenedWeekDay}
                    startHour={calendarFramework.startDate.getHours()}
                    endHour={calendarFramework.endDate.getHours()}
                    month={d.month}
                    columnID={columnIndex + columnIndexOffset}
                    draggable={draggable}
                    chartedUsersData={chartedUsersData}
                    theCalendarState={[calendarState, setCalendarState]}
                    isAdmin={isAdmin}
                  />
              })
              }
      </div>
    </div>
  );
}

export default SelectCalander;
