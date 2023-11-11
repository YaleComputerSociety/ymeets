import SelectCalander from "../scheduleComponents/calendarComponents/SelectCalendar";
import TimeColumn from "../scheduleComponents/calendarComponents/TimeColumn"
import { calendarDimensions, calanderState } from "../scheduleComponents/scheduletypes";


interface AdminCalProps {
    theCalendarFramework: [calendarDimensions, React.Dispatch<React.SetStateAction<calendarDimensions>>]
    theCalendarState: [calanderState, React.Dispatch<React.SetStateAction<calanderState>>]
    draggable : boolean
    isAdmin? : boolean
}

export default function AdminCal({theCalendarFramework, theCalendarState, draggable, isAdmin}: AdminCalProps) {

    const [calendarFramework, setCalendarFramework] = theCalendarFramework;
    const [calendarState, setCalendarState] = theCalendarState;
    let columnIndexOffset = 0

    return (
        <>
            <p className="text-4xl m-5 mb-1 font-bold">
                Group Availibility - Admin
            </p>
            <div className="border border-1 border-gray-600 m-5 w-fit">
                <div className="flex">
                    <TimeColumn     
                        startTime={calendarFramework.startDate}
                        endTime={calendarFramework.endDate}
                    />
                    {
                    calendarFramework.dates.map((bucket, index) => {

                        if (index != 0) {
                            columnIndexOffset += bucket.length
                        }
                        
                        return <SelectCalander 
                            theCalendarState={[calendarState, setCalendarState]}
                            bucket={bucket}
                            theCalendarFramework={[calendarFramework, setCalendarFramework]}
                            draggable={false}
                            isAdmin={false}
                            columnIndexOffset={columnIndexOffset}
                        />

                        
                    }) 
                    }
                </div>
            </div>
        </>
    )
}