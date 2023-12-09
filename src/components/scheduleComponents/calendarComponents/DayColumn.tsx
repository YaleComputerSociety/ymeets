import React from "react";
import CalBlock from "./CalBlock";
import { generateTimeBlocks } from "../utils/generateTimeBlocks.js";
import "tailwindcss/tailwind.css";
import { calanderState, userData } from "../scheduletypes";
import { useState } from "react";

const NUMBER_OF_TIME_INTERVALS = 4

interface DayColumnProps {
  startHour: number;
  endHour: number;
  theCalendarState: [calanderState, React.Dispatch<React.SetStateAction<calanderState>>];
  chartedUsersData?: [userData, React.Dispatch<React.SetStateAction<userData>>];
  columnID: number;
  weekDay: string;
  numberDay: string;
  draggable: boolean;
  month: string;
  isAdmin?: boolean;
  user : number;
}

export default function DayColumn({
  startHour,
  draggable,
  endHour,
  weekDay,
  numberDay,
  columnID,
  theCalendarState,
  chartedUsersData,
  month,
  isAdmin,
  user
}: DayColumnProps) {

  const [calendarState, setCalendarState] = theCalendarState;
  const [dragStartedOn, setDragStartedOn] = useState(false);

  let blocks = generateTimeBlocks(startHour, endHour);

  return (
    <div className="">
      <div className="flex flex-col">
        {/* <div className="p-4 xs:p-2 sm:p-2 md:p-2 lg:p-4 \
                        m-1 ml-0 mr-0 border-solid border-D0CFCF border-b-4 border-r-2 \
                      bg-white text-black flex place-content-center items-center"> */}
        <div className="flex flex-row justify-center items-center flex-wrap w-full \
                        md:border-x-1 md:border-solid md:border-D0CFCF">
          <div className="rounded-lg p-4 bg-white text-black text-center mx-1 mb-3 \
                          md:rounded-none md:m-0 md:w-full">
            <p className="text-sm text-[#787878]">
              {month}
            </p>
            <p className="text-lg text-[#787878]">
              {weekDay}
            </p>
            <p className="text-lg text-[#787878]">
              {numberDay}
            </p>
          </div>
        </div>
        <div>
          {blocks.map((block, index) => {
            return (
              <div key={index}
                   className="h-17 \
                   col-span-1 border border-solid-2 border-ymeets-gray \  
                   "  
              >
                {
                block.map((b, i) => {

                  return <CalBlock
                    isAdmin={isAdmin}
                    columnID={columnID}
                    blockID={index * NUMBER_OF_TIME_INTERVALS + i}
                    key={index + i}
                    draggable={draggable}
                    theCalendarState={[calendarState, setCalendarState]}
                    chartedUsersData={chartedUsersData}
                    user={user}
                    theDragStartedOn={[dragStartedOn, setDragStartedOn]}
                  />
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
