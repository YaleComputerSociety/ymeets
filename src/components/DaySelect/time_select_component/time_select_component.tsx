import * as React from 'react';
import './time_select_component.css';
import Dropdown from '../../utils/components/Dropdown';

interface TimeOption {
  value: number;
  label: string;
}

export const TimeSelectComponent = (props: any) => {
  const turnToTimeString = (i: any) => {
    if (i === 0) {
      return '12:00 AM';
    } else if (i < 12) {
      return `${i}:00 AM`;
    } else if (i === 12) {
      return '12:00 PM';
    } else {
      return `${i - 12}:00 PM`;
    }
  };

  const options = Array.from({ length: 24 }, (_, i) => ({
    value: i + 1,
    label: turnToTimeString(i),
  }));
  options.push({ value: 25, label: '12:00 AM' });

  const [selectedStart, setSelectedStart] = React.useState<TimeOption>(
    options[9]
  );
  const [selectedEnd, setSelectedEnd] = React.useState<TimeOption>(options[17]);

  const handleStartChange = (selected: TimeOption) => {
    setSelectedStart(selected);
    let date;
    if (selected.value !== 25) {
      date = new Date(`January 1, 2023 ${selected.label}`);
    } else {
      date = new Date('January 1, 2023 11:59 PM');
    }
    props.updateStart(date);
  };

  const handleEndChange = (selected: TimeOption) => {
    setSelectedEnd(selected);
    let date;
    if (selected.value !== 25) {
      date = new Date(`January 1, 2023 ${selected.label}`);
    } else {
      date = new Date('January 1, 2023 11:59 PM');
    }
    props.updateEnd(date);
  };

  return (
    <div
      className={`time-select-container absolute z-50 ${props.paddingClass} flex flex-row items-center justify-center flex-wrap gap-2`}
    >
      <div className="grid items-center">
        <p className="text-right dark:text-text-dark font-normal m-0 text-xs sm:text-base">
          From:
        </p>
      </div>
      <div className="w-[120px] sm:w-[120px]">
        <Dropdown<TimeOption>
          options={options}
          selectedOption={selectedStart}
          onSelect={handleStartChange}
          renderOption={(option) => option.label}
          className="bg-gray-100 dark:bg-gray-800"
        />
      </div>
      <div className="grid items-center">
        <p className="text-right dark:text-text-dark font-normal m-0 text-xs sm:text-base">
          To:
        </p>
      </div>
      <div className="w-[120px] sm:w-[120px]">
        <Dropdown<TimeOption>
          options={options}
          selectedOption={selectedEnd}
          onSelect={handleEndChange}
          renderOption={(option) => option.label}
          className="bg-gray-100 dark:bg-gray-800"
        />
      </div>
    </div>
  );
};
