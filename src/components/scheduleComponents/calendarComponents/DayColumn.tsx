
import React from "react";
import DayBlock from "./DayBlock";
import { generateTimeBlocks } from "../utils/generateTimeBlocks.js";
import "tailwindcss/tailwind.css";
import { calanderState } from "../scheduletypes";

interface DayColumnProps {
  startTime: string
  endTime: string
  theCalendarState: [calanderState, React.Dispatch<React.SetStateAction<calanderState>>]
  columnID: number
  weekDay: string
  numberDay : string
  draggable : boolean
}

export default function DayColumn({startTime, draggable, endTime, weekDay, numberDay, columnID, theCalendarState}: DayColumnProps) {

  const [calendarState, setCalendarState] = theCalendarState;

  let blocks = generateTimeBlocks(startTime, endTime);

  return (
    <div className="">
      <div className="flex flex-col">
        <div className="p-4 xs:p-2 sm:p-2 md:p-2 lg:p-4 \
                        m-1 ml-0 mr-0 border-solid border-D0CFCF border-b-4 border-r-2 \
                      bg-white text-black flex place-content-center items-center
          ">
          <center>
            <p className="text-lg p-1 text-[#787878]">
              {weekDay}
            
              <br />
              {numberDay}
            </p>
          </center>
        </div>
        <div>
          {blocks.map((block, index) => {   
            return    (
                      <>
                        
                        <DayBlock
                          columnID={columnID}
                          blockID={index}
                          key={index}
                          draggable={draggable}
                          theCalendarState={[calendarState, setCalendarState]}
                          />
                  
                        </>
                        );
          })}
        </div>
      </div>
    </div>
  );
}