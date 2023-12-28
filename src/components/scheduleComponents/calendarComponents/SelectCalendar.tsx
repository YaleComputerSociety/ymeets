import React, { useState, useEffect } from "react";
import "tailwindcss/tailwind.css";
import { calandarDate, calendarDimensions, calanderState, userData } from "./scheduletypes";
import { generateTimeBlocks } from "../utils/generateTimeBlocks";
import CalRow from "./CalRow";
import DateBar from "./DateBar";

interface SelectCalanderProps {
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

  let timeBlocks = generateTimeBlocks(startDate.getHours(), endDate.getHours());
  
  const [dragState, setDragState] = useState({
      dragStartedOn : [], // [columnID, blockID]
      dragEndedOn : [] 
  })

  return (
      <div>
        {
          timeBlocks.map((hour: string[], blockID: number) => {
            console.log(hour[0])
            console.log(hour[0].length)

            return <div className="flex flex-row">


              { renderTime && blockID != 0 &&
                    <p className="mr-1 w-12" style={{fontSize : "12px"}}>{hour[0]}</p>
              }
              {
                  renderTime && blockID == 0 && <div className="mr-1 w-12 flex items-center">
                  <p className="" style={{fontSize : "12px"}}>{hour[0]}</p>
                  </div>
              }

              <div key={blockID}>
                                  
                                          
                  { blockID == 0 &&
                      <DateBar 
                          dates={bucket}       
                      />
                  }  

                  <div className="flex flex-col border-black border-t border-l border-b">
                      {hour.map((time: string) => (
                        
                        <>


                              {/* { renderTime && blockID != 0 &&
                                    <p className="mr-2" style={{fontSize : "12px"}}>{hour[0]}</p>
                                  }
                                  
                                  {
                                    renderTime && blockID == 0 && <div className="mr-2 flex items-center">
                                    <p style={{fontSize : "12px"}}>{hour[0]}</p>
                                    </div>
                                  } */
                                }

                            <CalRow
                                is30Minute={time.slice(3) === "30" ? true : false}
                                key={time}
                                bucket={bucket}
                                theCalendarState={theCalendarState}
                                draggable={draggable}
                                columnIndexOffSet={columnIndexOffset}
                                blockID={blockID}
                                user={user}
                                isAdmin={isAdmin}
                            />

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
