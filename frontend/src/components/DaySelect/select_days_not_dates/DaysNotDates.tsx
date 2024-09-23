import { useState } from 'react';
import TimeSelectComponent from '../time_select_component';
import './DaysNotDates.css';

interface DaysNotDatesProps {
  theSelectedDays: [any, React.Dispatch<React.SetStateAction<any>>] | undefined;
  selectedStartDate:
    | [Date, React.Dispatch<React.SetStateAction<Date>>]
    | undefined;
  selectedEndDate:
    | [Date, React.Dispatch<React.SetStateAction<Date>>]
    | undefined;
}

export default function DaysNotDates({
  theSelectedDays,
  selectedStartDate,
  selectedEndDate,
}: DaysNotDatesProps) {
  const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // @ts-expect-error
  const [selectedDays, setSelectedDays] = theSelectedDays;
  // @ts-expect-error
  const [startDate, setStartDate] = selectedStartDate;
  // @ts-expect-error
  const [endDate, setEndDate] = selectedEndDate;

  const handleUpdateStartTime = (time: Date) => {
    setStartDate(time);
  };

  const handleUpdateEndTime = (time: Date) => {
    setEndDate(time);
  };

  return (
    <div className="days-calendar-wrapper">
      <div className="flex flex-row mt-12">
        {DAYS.map((day) => (
          <div
            key={day}
            className="mr-1 sm:w-1/7 md:w-1/7 lg:w-1/7 w-full sm:w-1/4 md:w-1/8 lg:w-1/10"
          >
            <p className="text-grey mb-2">{day}</p>
            <div
              onClick={() => {
                setSelectedDays((oldState: any) => ({
                  ...oldState,
                  [day]: {
                    ...oldState[day],
                    selected: !oldState[day]?.selected,
                  },
                }));
              }}
              className={`h-32 sm:h-48 border border-black rounded-md ${selectedDays[day]?.selected ? 'bg-[rgb(81,145,242)]' : 'bg-white'}`}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
}
