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
    <div className="w-full p-6 dark:text-text-dark">
      <div className="flex flex-row justify-between max-w-3xl mx-auto mt-8 space-x-1">
        {DAYS.map((day) => (
          <div key={day} className="w-[3rem] text-center">
            <p className="text-xs font-medium text-gray-500 mb-3">{day}</p>
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
              className={`h-24 cursor-pointer sm:h-32 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md  border-1 border-gray-500
          ${
            selectedDays[day]?.selected
              ? 'bg-blue-500 border-blue-600'
              : 'dark:bg-gray-800 bg-white border-gray-200'
          } 
          border`}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
}
