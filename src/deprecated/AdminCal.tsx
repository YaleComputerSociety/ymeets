import SelectCalander from "../components/scheduleComponents/calendarComponents/SelectCalendar";
import TimeColumn from "../components/scheduleComponents/calendarComponents/TimeColumn"
import { calendarDimensions, calanderState } from "../components/scheduleComponents/calendarComponents/scheduletypes";


interface AdminCalProps {
    theCalendarFramework: [calendarDimensions, React.Dispatch<React.SetStateAction<calendarDimensions>>]
    theCalendarState: [calanderState, React.Dispatch<React.SetStateAction<calanderState>>]
    draggable : boolean
    isAdmin? : boolean
    user : number
}

export default function AdminCal({theCalendarFramework, theCalendarState, draggable, isAdmin, user}: AdminCalProps) {

    const [calendarFramework, setCalendarFramework] = theCalendarFramework;
    const [calendarState, setCalendarState] = theCalendarState;
    let columnIndexOffset = 0

    return (
        <>
            <p className="text-4xl m-5 mb-1 font-bold">
                Group Availibility - Admin
            </p>
            <div className="border border-1 border-gray-600 m-5 h-fit w-fit">
                <div className="flex">
                    <TimeColumn     
                        startDate={calendarFramework.startDate}
                        endDate={calendarFramework.endDate}
                    />
                    {
                    calendarFramework.dates.map((bucket, index) => {
                        if (index != 0) {
                            let prev_bucket = calendarFramework.dates[index - 1]
                            columnIndexOffset += prev_bucket.length
                        }
                        
                        return <></>
                        
                    }) 
                    }    
                </div>
            </div>
        </>
    )
}