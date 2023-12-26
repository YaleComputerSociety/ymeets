import React, { useState, useEffect } from "react";
import DayColumn from "./DayColumn";
import { createContext } from "react";
import "tailwindcss/tailwind.css";
import { calandarDate, calendarDimensions, calanderState, userData } from "./scheduletypes";
import { generateTimeBlocks } from "../utils/generateTimeBlocks";
import CalRow from "./CalRow";
import DateBar from "./DateBar";

interface SelectCalanderProps {
  theCalendarFramework: [calendarDimensions, React.Dispatch<React.SetStateAction<calendarDimensions>>]
  theCalendarState: [calanderState, React.Dispatch<React.SetStateAction<calanderState>>]
  chartedUsersData?: [userData, React.Dispatch<React.SetStateAction<userData>>]
  draggable: boolean
  isAdmin?: boolean
  bucket: calandarDate[]
  columnIndexOffset: number
  user: number
  startDate: Date
  endDate: Date
  renderTime : boolean
}

function SelectCalander({
  theCalendarFramework,
  theCalendarState,
  chartedUsersData,
  draggable,
  isAdmin,
  bucket,
  columnIndexOffset,
  user,
  startDate,
  endDate,
  renderTime
}: SelectCalanderProps) {

  const [calendarState, setCalendarState] = theCalendarState;
  const [calendarFramework, setCalendarFramework] = theCalendarFramework;

  let timeBlocks = generateTimeBlocks(startDate.getHours(), endDate.getHours());

  return (
      <div>
        {
          timeBlocks.map((hour: string[], blockID: number) => (
              <div key={blockID} className="flex flex-row">
                { renderTime && blockID != 0 &&
                    <p className="mr-2" style={{fontSize : "12px"}}>{hour[0]}</p>
                }
                {
                  renderTime && blockID == 0 && <div className="mr-2 flex items-center">
                  <p className="" style={{fontSize : "12px"}}>{hour[0]}</p>
                  </div>
                }
                <div className="flex flex-col">
                  { blockID == 0 &&
                  <>
                    <DateBar 
                        dates={bucket}       
                    />
                  </>
                }  
                  <div key={blockID} className="border border-black">
                    
                    {hour.map((time: string) => (
                        <div key={time} className="h-4">
                          
                          <CalRow
                            is30Minute={time.slice(3) === "30" ? true : false}
                            bucket={bucket  }
                            theCalendarFramework={theCalendarFramework}
                            theCalendarState={theCalendarState}
                            draggable={draggable}
                            columnIndexOffSet={columnIndexOffset}
                            blockID={blockID}
                            user={user}
                          />
                        </div>
                    ))}
                </div>
              </div>
            </div>
          ))
        }
      </div>
  );
}

export default SelectCalander;
