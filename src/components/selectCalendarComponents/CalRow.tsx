import { calandarDate, calendarDimensions, calanderState, userData } from  "../../types"
import CalBlock from "./CalBlock";
import { dragProperties } from "./CalendarApp";

interface CalRowProps {
    bucket : calandarDate[],
    theCalendarState: [calanderState, React.Dispatch<React.SetStateAction<calanderState>>],
    draggable: boolean,
    isAdmin?: boolean,
    chartedUsersData: [userData, React.Dispatch<React.SetStateAction<userData>>] | undefined
    user : number
    columnIndexOffSet : number
    blockID : number,
    is30Minute : boolean
    theDragState : [dragProperties, React.Dispatch<React.SetStateAction<dragProperties>>]
    theCalendarFramework : [calendarDimensions, React.Dispatch<React.SetStateAction<calendarDimensions>>],
    borderStyle? : string // can be "dotted", "solid", "double", "none" ; default is "solid", affects border bottom
}



export default function CalRow({
    bucket, 
    theCalendarState, 
    isAdmin, 
    draggable, 
    user, 
    columnIndexOffSet,
    theCalendarFramework,
    blockID,
    is30Minute,
    theDragState,
    chartedUsersData,
    borderStyle
} : CalRowProps) {

    const border = borderStyle ?? "solid"

    return (
        
        <div className={`flex flex-row
                       `}>
        {
            bucket.map((d: calandarDate, columnIndex) => {                  
                return (
                    <CalBlock 
                        theCalendarFramework={theCalendarFramework}
                        is30Minute={is30Minute}
                        theCalendarState={theCalendarState}
                        blockID={blockID}
                        columnID={columnIndex + columnIndexOffSet}
                        isAdmin={isAdmin}
                        draggable={draggable}
                        user={user}
                        theDragState={theDragState}
                        key={columnIndex}
                        chartedUsersData={chartedUsersData}
                    />   
                )

            })
        }
        </div>

    )
}