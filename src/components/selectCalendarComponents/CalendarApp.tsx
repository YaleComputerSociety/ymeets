import SelectCalander from "./SelectCalendar"
import { calendarDimensions, calanderState, userData, calandarDate } from  "../../types"
import { useState } from "react";

interface CalendarProps {
    theCalendarFramework: [calendarDimensions, React.Dispatch<React.SetStateAction<calendarDimensions>>] | undefined
    theCalendarState: [calanderState, React.Dispatch<React.SetStateAction<calanderState>>] | undefined
    chartedUsersData: [userData, React.Dispatch<React.SetStateAction<userData>>] | undefined 
    draggable : boolean
    user : number
    isAdmin : boolean
    title : string
    theSelectedDate : [calandarDate, React.Dispatch<React.SetStateAction<calandarDate>>] | undefined
    theDragState : [dragProperties, React.Dispatch<React.SetStateAction<dragProperties>>]
    theGoogleCalendarEvents : [Date, React.Dispatch<React.SetStateAction<Date>>]
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
    title,
    theSelectedDate,
    theDragState,
    theGoogleCalendarEvents
}: CalendarProps) {

    //@ts-ignore
    const [calendarFramework, setCalendarFramework] = theCalendarFramework;
    
    //@ts-ignore
    const [calendarState, setCalendarState] = theCalendarState;

    let columnIndexOffset = 0

    const [dragState, setDragState] = theDragState

    const hasTitle = (title !== "");

    return (
        <div className="flex flex-col max-w-full">
            {
                hasTitle && <p className="text-2xl sm:text-4xl my-5 mb-4 sm:mb-1 sm:ml-6 font-bold">
                    {title}
                </p>
            }

            <div className="flex justify-center mb-4 md:m-5 md:justify-start">
                <div className="bg-white flex flex-row w-fit max-w-full h-full overflow-scroll py-3 sm:py-6 px-4 sm:px-8 \
                                md:bg-white rounded-lg">
                    {
                        calendarFramework?.dates.map((bucket : calandarDate[], index: number) => {
                                if (index !== 0) {
                                    let prev_bucket = calendarFramework.dates[index - 1];
                                    columnIndexOffset += prev_bucket.length;
                                }

                        return (
                            <div className="ml-2 mr-2 mb-12" key={index}>
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
                                    theSelectedDate={theSelectedDate}
                                    theGoogleCalendarEvents={theGoogleCalendarEvents}
                                />
                            </div>
                        );
                    })
                    }
                </div>
            </div>
        </div>
    )
}