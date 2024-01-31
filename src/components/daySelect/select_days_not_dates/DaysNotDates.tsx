import { useState } from "react";
import TimeSelectComponent from "../time_select_component";
import "./DaysNotDates.css";

interface DaysNotDatesProps {
    theSelectedDays: [any, React.Dispatch<React.SetStateAction<any>>] | undefined;
    selectedStartDate : [Date, React.Dispatch<React.SetStateAction<Date>>] | undefined;
    selectedEndDate : [Date, React.Dispatch<React.SetStateAction<Date>>] | undefined;

}



export default function DaysNotDates({ theSelectedDays, selectedStartDate, selectedEndDate }: DaysNotDatesProps) {

    const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    //@ts-ignore
    const [selectedDays, setSelectedDays] = theSelectedDays;
    //@ts-ignore
    const [startDate, setStartDate] = selectedStartDate;
    //@ts-ignore
    const [endDate, setEndDate] = selectedEndDate;

    const handleUpdateStartTime = (time: Date) => {
        setStartDate(time)
    }

    const handleUpdateEndTime = (time: Date) => {
        setEndDate(time)
    }

    return (
        <div className="days-calendar-wrapper">
            <div className="flex flex-row ">
                {
                    DAYS.map((day) => (
                        <div key={day} className="mt-32 m-2 w-14">
                            <p className="text-grey mb-2">{day}</p>
                            <div
                                onClick={() => {
                                    setSelectedDays((oldState: any) => ({
                                        ...oldState,
                                        [day]: { ...oldState[day], selected: !oldState[day]?.selected }
                                    }));
                                }}
                                className={`h-48 border border-black hover:scale-110 rounded-md ${selectedDays[day]?.selected ? 'bg-green-500' : 'bg-white'}`}
                            >
                            </div>
                        </div>
                    ))
                }
                
        
            </div>             
        </div>
    );
}