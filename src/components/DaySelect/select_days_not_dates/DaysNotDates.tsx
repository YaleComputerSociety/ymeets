import { useState } from 'react';
import TimeSelectComponent from '../time_select_component';
import './DaysNotDates.css';

interface DaysNotDatesProps {
  theSelectedDays:
    | [
        Record<string, { dateObj: Date; selected: boolean }>,
        React.Dispatch<
          React.SetStateAction<
            Record<string, { dateObj: Date; selected: boolean }>
          >
        >,
      ]
    | undefined;
}

export default function DaysNotDates({ theSelectedDays }: DaysNotDatesProps) {
  const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const [selectedDays, setSelectedDays] = theSelectedDays || [{}, () => {}];

  return (
    <div className="w-full p-3 dark:text-text-dark">
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
              className={`h-32 sm:h-48 border border-black rounded-md ${selectedDays[day]?.selected ? 'bg-[rgb(81,145,242)]' : 'dark:bg-text-dark bg-white'}`}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
}
