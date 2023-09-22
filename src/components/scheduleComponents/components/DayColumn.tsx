import React from "react";
import DayBlock from "./DayBlock";
import { generateTimeBlocks } from "../utils/generateTimeBlocks.js";

export default function DayColumn(props: any) {
  const startTime = props.startTime;
  const endTime = props.endTime;
  const columnID = props.columnID
  const [dayColumnDockState, setDayColumnDockState] = props.columnData;


  const weekDay = props.weekDay;
  const numberDay = props.numberDay;

  let blocks = generateTimeBlocks(startTime, endTime);

  return (
    <div className="">
      <div className="flex flex-col">
        <div className="p-4 xs:p-2 sm:p-2 md:p-2 lg:p-4 m-1 ml-0 mr-0 border-solid border-D0CFCF border-b-4 border-r-2 bg-white text-black flex place-content-center items-center">
          <center>
            <p className="text-lg p-1 text-[#787878]">
              {weekDay}
              <br />
              {numberDay}
            </p>
          </center>
        </div>
        <div>
          {blocks.map((block,index) => {
            return <DayBlock
                        columnID={columnID}
                        blockID={index}
                        key={index}
                        columnData={[dayColumnDockState, setDayColumnDockState]}
                        />;
          })}
        </div>
      </div>
    </div>
  );
}
