import TimeColumn from "./TimeColumn"
import SelectCalander from "./SelectCalendar"
import { calendarDimensions, calanderState, userData } from "./scheduletypes";
import DateBar from "./DateBar";

interface CalendarProps {
    theCalendarFramework: [calendarDimensions, React.Dispatch<React.SetStateAction<calendarDimensions>>]
    theCalendarState: [calanderState, React.Dispatch<React.SetStateAction<calanderState>>]
    chartedUsersData?: [userData, React.Dispatch<React.SetStateAction<userData>>]
    draggable : boolean
    user : number
    isAdmin : boolean
    title : string
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

    return (
        <>
            <p className="text-4xl m-5 mb-1 font-bold">
                {title}
            </p>

            <div className="m-5 h-fit w-fit">
                <div className="flex py-6 px-8 \
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

                                <div className="">
                                    <SelectCalander 
                                        renderTime={index == 0 ? true : false}
                                        theCalendarState={[calendarState, setCalendarState]}
                                        bucket={bucket}
                                        theCalendarFramework={[calendarFramework, setCalendarFramework]}
                                        draggable={true}
                                        isAdmin={isAdmin}
                                        key={index}
                                        user={user}
                                        columnIndexOffset={columnIndexOffset}
                                        startDate={calendarFramework.startDate}
                                        endDate={calendarFramework.endDate}
                                    />
                                </div>
                            </div>
                        );
                    })
                    }
                </div>
            </div>
        </>
    )
}