import { useState } from "react";

interface DaysNotDatesProps {
    theSelectedDays: [any, React.Dispatch<React.SetStateAction<any>>] | undefined;
}

export default function DaysNotDates({ theSelectedDays }: DaysNotDatesProps) {

    const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    //@ts-ignore
    const [selectedDays, setSelectedDays] = theSelectedDays;

    return (
        <div className="flex flex-row">
            {
                DAYS.map((day) => (
                    <div key={day} className="m-2 w-14">
                        <p className="text-grey mb-2">{day}</p>
                        <div
                            onClick={() => {
                                setSelectedDays((oldState: any) => ({
                                    ...oldState,
                                    [day]: { ...oldState[day], selected: !oldState[day]?.selected }
                                }));
                            }}
                            className={`h-48 hover:scale-110 rounded-md ${selectedDays[day]?.selected ? 'bg-green-500' : 'bg-white'}`}
                        >
                        </div>
                    </div>
                ))
            }
        </div>
    );
}