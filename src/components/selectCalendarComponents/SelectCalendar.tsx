import React, { useState, useEffect } from "react";
import "tailwindcss/tailwind.css";
import { calandarDate, calendarDimensions, calanderState, userData } from  "../../types"
import { generateTimeBlocks } from "../utils/generateTimeBlocks";
import CalRow from "./CalRow";
import DateBar from "./DateBar";
import { dragProperties } from "./CalendarApp";

interface SelectCalanderProps {
  theCalendarState: [calanderState, React.Dispatch<React.SetStateAction<calanderState>>]
  chartedUsersData: [userData, React.Dispatch<React.SetStateAction<userData>>] | undefined
  draggable: boolean
  isAdmin?: boolean
  bucket: calandarDate[]
  columnIndexOffset: number
  user: number
  startDate: Date
  endDate: Date
  renderTime : boolean
  theDragState : [dragProperties, React.Dispatch<React.SetStateAction<dragProperties>>]
  theCalendarFramework : [calendarDimensions, React.Dispatch<React.SetStateAction<calendarDimensions>>]
  

}

function SelectCalander({
  theCalendarState,
  chartedUsersData,
  theCalendarFramework,
  draggable,
  isAdmin,
  bucket,
  columnIndexOffset,
  user,
  startDate,
  endDate,
  renderTime,
  theDragState
}: SelectCalanderProps) {

  let timeBlocks = generateTimeBlocks(startDate.getHours(), endDate.getHours());
  
  let militaryConvert = (time : string) => { // expects hh:mm 
    var hours = Number.parseInt(time.slice(0, 2)) ; // gives the value in 24 hours format
    var AmOrPm = hours >= 12 ? 'PM' : 'AM';
    hours = (hours % 12) || 12;
    var minutes = Number.parseInt(time.slice(-2)) ;
    return hours + (minutes == 0 ? "" : ":" + minutes.toString().padStart(2, "0")) + " " + AmOrPm;
  }


  return (
      <div>
        {
          timeBlocks.map((hour: string[], blockIDOffset: number) => {


            return <div className="flex flex-row">

              {/* ROW TIMES */}
              {/* { renderTime && blockIDOffset != 0 &&
                    <p className="mr-1 w-12" style={{fontSize : "12px"}}>{hour[0]}</p>
              }
              {
                  renderTime && blockIDOffset == 0 && <div className="mr-1 w-12 flex items-center">
                  <p className="" style={{fontSize : "12px"}}>{hour[0]}</p>
                  </div>
              } */}

              <div key={blockIDOffset}>
                                  
                                          
                  { blockIDOffset == 0 &&
                      <div className="flex flex-row justify-end">
                        <DateBar 
                          dates={bucket}       
                        />
                      </div>
                  }  

    

    

                  <div className="flex flex-col">
                      {hour.map((time: string, blockID) => (
                        
                        <>
                        <div className="flex flex-row justify-end">
                            { renderTime && time.slice(-2) == "00" &&
                              <div className="w-12 text-xs relative">
                                <p className="absolute" style={{top : "-0.5rem"}}>{militaryConvert(time)}</p>
                                </div>
                            }
                            { renderTime && time.slice(-2) != "00" &&
                              <div className="w-12"></div>
                            }
                            <div className={`border-black border-l ${hour.length - 1 == blockID ? "border-b" : ""}`}>
                              <CalRow
                                  is30Minute={time.slice(3) === "30" ? true : false}
                                  key={time}
                                  bucket={bucket}
                                  theCalendarState={theCalendarState}
                                  draggable={draggable}
                                  columnIndexOffSet={columnIndexOffset}
                                  blockID={(blockIDOffset * 4) + blockID}
                                  user={user}
                                  isAdmin={isAdmin}
                                  // @ts-ignore
                                  theDragState={theDragState}
                                theCalendarFramework={theCalendarFramework}
                                chartedUsersData={chartedUsersData}
                                  borderStyle={time.slice(-2) =="00" ? "solid" : "dotted"}
                              />
                            </div>
                          </div>
                          </>

                      ))}
                    </div>
              </div>
            </div>
          })
        }
      </div>
  );
}

export default SelectCalander;
