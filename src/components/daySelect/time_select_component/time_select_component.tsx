import * as React from "react";
import './time_select_component.css';
import Select from "react-dropdown-select";

export const TimeSelectComponent = (props: any) => {
  const turnToTimeString = (i: any) => {
    if (i === 0) {
      return "12:00 AM";
    } else if (i < 12) {
      return i.toString().padStart(2, "0") + ":00 AM";
    } else if (i === 12) {
      return "12:00 PM";
    } else {
      return (i - 12).toString().padStart(2, "0") + ":00 PM";
    }
  }

  const options = Array.from({ length: 24 }, (_, i) => ({
    value: i + 1,
    label: turnToTimeString(i)
  }));

  const handleStartChange = (values: any) => {
    if (values.length > 0) {
      const selectedTime = values[0].label;
      const date = new Date(`January 1, 2023 ${selectedTime}`);
      props.updateStart(date); // Update the date component with the Date object
    }
  };

  const handleEndChange = (values: any) => {
    if (values.length > 0) {
      const selectedTime = values[0].label;
      const date = new Date(`January 1, 2023 ${selectedTime}`);
      props.updateEnd(date); // Update the date component with the Date object
    }
  };

  return (
    <div className='time-select-container absolute top-[92px] flex flex-row justify-center'>
      <div className='grid items-center px-1 sm:px-2'>
        <p className='text-right font-normal m-0 text-xs sm:text-base'>from: </p>
      </div>
      <Select
        className=""
        searchable={false}
        options={options}
        values={[]}
        onChange={handleStartChange}
      />
      <div className='grid items-center px-1 sm:px-2'>
        <p className='text-right font-normal m-0 text-xs sm:text-base'>to: </p>
      </div>
      <Select
        className=""
        searchable={false}
        options={options}
        values={[]}
        onChange={handleEndChange}
      />
    </div>
  );
}
