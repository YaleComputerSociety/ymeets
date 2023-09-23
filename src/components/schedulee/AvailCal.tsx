import SelectCalander from "../scheduleComponents/components/SelectCalendar";
import TimeColumn from "../scheduleComponents/components/TimeColumn"

export default function AvailCal(props: any) {

    const [calendarFramework, setCalendarFramework] = props.calendarFramework;
    const [calendarState, setCalendarState] = props.calendarState;

    return (
        <>
            <p className="text-4xl m-5 mb-1 font-bold">
                Your Availibility
            </p>
            <div className="border border-1 border-gray-600 m-5 w-fit">
                <div className="flex">
                    <TimeColumn 
                        startTime={calendarFramework.startTime}
                        endTime={calendarFramework.endTime}
                    />
                    <SelectCalander 
                        calendarState={[calendarState, setCalendarState]}
                        calendarFramework={[calendarFramework, setCalendarFramework]}
                        startTime={calendarFramework.startTime}
                        endTime={calendarFramework.endTime}
                        draggable={true}
                    />
                </div>
            </div>
        </>
    )
}