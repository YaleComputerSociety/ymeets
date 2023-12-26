import { calandarDate, calendarDimensions, calanderState, userData } from "./scheduletypes";
import CalBlock from "./CalBlock";

interface CalRowProps {
    bucket : calandarDate[],
    theCalendarFramework: [calendarDimensions, React.Dispatch<React.SetStateAction<calendarDimensions>>],
    theCalendarState: [calanderState, React.Dispatch<React.SetStateAction<calanderState>>],
    draggable: boolean,
    isAdmin?: boolean,
    user : number
    columnIndexOffSet : number
    blockID : number,
    is30Minute : boolean
}



export default function CalRow({
    bucket, 
    theCalendarFramework, 
    theCalendarState, 
    isAdmin, 
    draggable, 
    user, 
    columnIndexOffSet,
    blockID,
    is30Minute
} : CalRowProps) {

    return (
        <div className={`flex flex-row`}>
        {
            bucket.map((d: calandarDate, columnIndex) => {                  
                return (

                    <CalBlock 
                        is30Minute={is30Minute}
                        theCalendarState={theCalendarState}
                        blockID={blockID}
                        columnID={columnIndex + columnIndexOffSet}
                        isAdmin={isAdmin}
                        draggable={draggable}
                        user={user}
                    />   

                )

            })
        }
        </div>

    )
}