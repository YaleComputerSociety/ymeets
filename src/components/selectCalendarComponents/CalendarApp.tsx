import SelectCalander from "./SelectCalendar"
import { calendarDimensions, calanderState, userData } from  "../../types"
import { useState } from "react";

interface CalendarProps {
    theCalendarFramework: [calendarDimensions, React.Dispatch<React.SetStateAction<calendarDimensions>>]
    theCalendarState: [calanderState, React.Dispatch<React.SetStateAction<calanderState>>]
    chartedUsersData: [userData, React.Dispatch<React.SetStateAction<userData>>] | undefined
    draggable : boolean
    user : number
    isAdmin : boolean
    title : string
}

export interface dragProperties { 
    dragStartedOnID : number[];
    dragEndedOnID : number[];
    dragStartedOn : boolean;
    blocksAffectedDuringDrag : Set<any>;
}

export default function Calender({
    theCalendarFramework, 
    theCalendarState, 
    chartedUsersData, 
    draggable, 
    user, 
    isAdmin,
    title 
}: CalendarProps) {

    const [calendarFramework, setCalendarFramework] = theCalendarFramework;
    const [calendarState, setCalendarState] = theCalendarState;
    let columnIndexOffset = 0

    const [dragState, setDragState] = useState({
        dragStartedOnID : [], // [columnID, blockID]
        dragEndedOnID : [],
        dragStartedOn : false,
        affectedBlocks : new Set()
    })

    return (
        <>
            <p className="text-4xl m-5 mb-1 font-bold">
                {title}
            </p>

            <div className="m-5">
                <div className="bg-white flex flex-row w-fit max-w-full h-full overflow-scroll py-6 px-8 \
                                md:bg-white md:rounded-lg"
                >
                 {
                calendarFramework.dates.map((bucket, index) => {
                        if (index !== 0) {
                            let prev_bucket = calendarFramework.dates[index - 1];
                            columnIndexOffset += prev_bucket.length;
                        }

                        return (
                            <div className="ml-2 mr-2" key={index}>
                                <SelectCalander 
                                    renderTime={index == 0 ? true : false}
                                    theCalendarState={[calendarState, setCalendarState]}
                                    bucket={bucket}
                                    draggable={draggable}
                                    isAdmin={isAdmin}
                                    key={index}
                                    user={user}
                                    columnIndexOffset={columnIndexOffset}
                                    startDate={calendarFramework.startTime}
                                    endDate={calendarFramework.endTime}
                                    // @ts-ignore
                                    theDragState={[dragState, setDragState]}
                                    theCalendarFramework={theCalendarFramework}
                                    chartedUsersData={chartedUsersData}
                                />
                            </div>
                        );
                    })
                    }
                </div>
            </div>
        </>
    )
}