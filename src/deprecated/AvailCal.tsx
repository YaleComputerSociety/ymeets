import SelectCalander from "../components/scheduleComponents/calendarComponents/SelectCalendar";
import TimeColumn from "../components/scheduleComponents/calendarComponents/TimeColumn"
import { calendarDimensions, calanderState } from "../components/scheduleComponents/calendarComponents/scheduletypes";


interface AvailCalProps {
    theCalendarFramework: [calendarDimensions, React.Dispatch<React.SetStateAction<calendarDimensions>>]
    theCalendarState: [calanderState, React.Dispatch<React.SetStateAction<calanderState>>]
    draggable : boolean
    user : number
  }

export default function AvailCal({theCalendarFramework, theCalendarState, user}: AvailCalProps) {

    const [calendarFramework, setCalendarFramework] = theCalendarFramework;
    const [calendarState, setCalendarState] = theCalendarState;
    let columnIndexOffset = 0

    return (
        <>
            <p className="text-4xl m-5 mb-1 font-bold">
                Your Availability
            </p>
            <div className="m-5 h-fit w-fit">
                <div className="flex py-6 px-8 \
                                md:bg-white md:rounded-lg">
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