import * as React from "react";
import "./calander_component.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import CircleComponent from "../circle_component";
import TimeSelectComponent from "../time_select_component";
import { Link, useNavigate } from 'react-router-dom';


import { useState } from "react";
import { createEvent, getEventById } from "../../../firebase/events";


export const CalanderComponent = () => {
  const arr1: any[] = [];
  const [selectedDays, updateDays] = useState(arr1);
  const navigate = useNavigate();

  const addDay = (date: any) => {
    const arr = [
      ...selectedDays, [date.getFullYear(), date.getMonth(), date.getDate()],
    ]
    updateDays(arr)
  }

  const removeDay = (date: any) => {
    const arr = selectedDays.filter(
      (obj) =>
        obj[0] !== date.getFullYear() ||
        obj[1] !== date.getMonth() ||
        obj[2] !== date.getDate()
    )
    updateDays(arr)
  }

  const [startTime, updateStartTime] = useState(0);

  const handleUpdateStartTime = (time:any) => {
    updateStartTime(time)
  }

  const [endTime, updateEndTime] = useState(0);

  const handleUpdateEndTime = (time: any) => {
    updateEndTime(time)
  }

  const [eventName, updateEventName] = useState("");

  const handleUpdateEventName = (name:any) => {
    updateEventName(name)
  }

  const dates = [
    "September 5, 2022 00:00:00",
    "September 5, 2022 23:59:59",
    "October 18, 2022 00:00:00",
    "October 23, 2022 23:59:59",
    "November 18, 2022 00:00:00",
    "November 27, 2022 23:59:59",
    "December 21, 2022 00:00:00",
    "January 15, 2023 23:59:59",
    "January 16, 2023 00:00:00",
    "January 16, 2023 23:59:59",
    "March 10, 2023 00:00:00",
    "March 27, 2023 23:59:59",
  ];
  const holidays = dates.map((item) => new Date(item));

  return (
    <div className="calendar-wrapper">
      <div className="calendar-event-name-wrapper">
        <input
          placeholder="Name your event..."
          type="text"
          value={eventName}
          onChange={(event) => handleUpdateEventName(event.target.value)}
        />
      </div>
      <Calendar
        prev2Label={null}
        next2Label={null}
        selectRange={false}
        showNeighboringMonth={false}
        minDetail="month"
        tileDisabled={({ activeStartDate, date, view }) => {
          if (holidays[0] <= date && date <= holidays[1]) {
            return true;
          } else if (holidays[2] <= date && date <= holidays[3]) {
            return true;
          } else if (holidays[4] <= date && date <= holidays[5]) {
            return true;
          } else if (holidays[6] <= date && date <= holidays[7]) {
            return true;
          } else if (holidays[8] <= date && date <= holidays[9]) {
            return true;
          } else if (holidays[10] <= date && date <= holidays[11]) {
            return true;
          } else {
            return false;
          }
        }}
        tileContent={({ activeStartDate, date, view }) => (
          <CircleComponent
            date={date}
            add={addDay}
            remove={removeDay}
            selectedDays={selectedDays}
          />
        )}
        navigationLabel={({ date, label, locale, view }) =>
          date.toLocaleString('default', { month: 'long' })
        }
      />
      <TimeSelectComponent
        updateStart={handleUpdateStartTime}
        updateEnd={handleUpdateEndTime}
      />
      <div className="next-button-wrapper">
          <button className='nextbuttondaysel' onClick={() => {
                console.log("Hi");  
                console.log(startTime);
                console.log(endTime);
                if (selectedDays.length == 0) {
                  alert('Make sure to enter dates!');
                  return;
                }

                if (startTime == 0 && endTime == 0) {
                  alert('Make sure to enter times!');
                  return;
                }

                if (startTime >= endTime) {
                    alert('Make sure your end time is after your start time!');
                    return;
                }

                // Optional; backend supports an empty string for name
                if (eventName.length == 0) {
                    alert('Make sure to name your event!');
                    return;
                }



                createEvent({
                    details: {
                    name: eventName,
                    dates: selectedDays,
                    // @ts-ignore
                    startTimes: new Array(selectedDays.length).fill(endTime),
                    endTimes: new Array(selectedDays.length).fill(endTime),
                    location: "",
                }}).then((result) => {
                  if (result && result.publicId) {
                    navigate('/timeselect/' + result.publicId);
                  } else {
                    alert("Something went wrong!");
                  }
                })
                                
            }}>Next</button>
      </div>
    </div>
  );
};