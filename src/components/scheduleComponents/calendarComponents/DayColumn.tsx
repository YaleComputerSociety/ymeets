
import React from "react";
import DayBlock from "./DayBlock";
import { generateTimeBlocks } from "../utils/generateTimeBlocks.js";
import "tailwindcss/tailwind.css";
import { calanderState, userData } from "../scheduletypes";

interface DayColumnProps {
  startHour: number
  endHour: number
  theCalendarState: [calanderState, React.Dispatch<React.SetStateAction<calanderState>>]
  chartedUsersData?: [userData, React.Dispatch<React.SetStateAction<userData>>]
  columnID: number
  weekDay: string
  numberDay : string
  draggable : boolean
  month : string
  isAdmin? : boolean
}

export default function DayColumn({startHour, draggable, endHour, weekDay, numberDay, columnID, theCalendarState, chartedUsersData, month, isAdmin}: DayColumnProps) {

  const [calendarState, setCalendarState] = theCalendarState;

  let blocks = generateTimeBlocks(startHour, endHour);
  
  return (
    <div className="">
      <div className="flex flex-col">
        <div className="p-4 xs:p-2 sm:p-2 md:p-2 lg:p-4 \
                        m-1 ml-0 mr-0 border-solid border-D0CFCF border-b-4 border-r-2 \
                      bg-white text-black flex place-content-center items-center
          ">
            
            <center>
              <p className="text-sm text-[#787878]">
                {month}
                <br/>
              </p>
              <p className="text-lg p-1 text-[#787878]">
                
                {weekDay}
                <br />
                {numberDay}
              </p>
            </center>

        </div>
        <div>
          {
          blocks.
            map((block, index) => {  
              
              
              return    (
                        <>
                          
                          <DayBlock
                            isAdmin={isAdmin}
                            columnID={columnID}
                            blockID={index}
                            key={index + "b"}
                            draggable={draggable}
                            theCalendarState={[calendarState, setCalendarState]}
                            chartedUsersData={chartedUsersData}
                            />
                    
                          </>
                          );
            })
          }
        </div>
      </div>
    </div>
  );
}
