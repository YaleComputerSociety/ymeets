import * as React from "react";
import './time_select_component.css';
import Select from "react-dropdown-select";

export const TimeSelectComponent = (props: any) => {

  const passed_px = props.px

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
  options.push({value: 25, label: "12:00 AM"});

  const handleStartChange = (values: any) => {
    if (values.length > 0) {
      let date;
      if (values[0].value != 25) {
        const selectedTime = values[0].label;
        date = new Date(`January 1, 2023 ${selectedTime}`);
      } else {
        const selectedTime = values[0].label;
        date = new Date(`January 1, 2023 11:59 PM`);
      }
      props.updateStart(date); // Update the date component with the Date object
    }
  };

  const handleEndChange = (values: any) => {
    if (values.length > 0) {
      let date;
      let selectedTime;
      if (values[0].value != 25) {
        selectedTime = values[0].label;
        date = new Date(`January 1, 2023 ${selectedTime}`);
      } else {
        selectedTime = values[0].label;
        date = new Date(`January 1, 2023 11:59 PM`);
      }
      props.updateEnd(date); // Update the date component with the Date object
    }
  };

  return (
  <div className={`time-select-container top-[${passed_px}px] flex flex-row items-center justify-center`}>
      <div className='grid items-center px-1 sm:px-2'>
        <p className='text-right font-normal m-0 text-xs sm:text-base'>from: </p>
      </div>
      <Select
        className=""
        searchable={false}
        options={options}
        values={[options[9]]}
        onChange={handleStartChange}
      />
      <div className='grid items-center px-1 sm:px-2'>
        <p className='text-right font-normal m-0 text-xs sm:text-base pl-1'>to: </p>
      </div>
      <Select
        className=""
        searchable={false}
        options={options}
        values={[options[17]]}
        onChange={handleEndChange}
      />
    </div>
  );
}
