import * as React from "react";
import "./calander_component.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import CircleComponent from "../circle_component";
import TimeSelectComponent from "../time_select_component";
import { Link, useNavigate } from 'react-router-dom';
import Popup from 'reactjs-popup';
import frontendEventAPI from "../../../eventAPI";
import { useState, useEffect } from "react";
import { createEvent, getEventById } from "../../../firebase/events";
import "../calander_component/calander_component.css"

interface CalanderComponentProps {
  theEventName: [string, React.Dispatch<React.SetStateAction<string>>],
  selectedStartDate: [Date, React.Dispatch<React.SetStateAction<Date>>],
  selectedEndDate : [Date, React.Dispatch<React.SetStateAction<Date>>],
  selectedDates : [Date[], React.Dispatch<React.SetStateAction<Date[]>>],
  popUpOpen : [boolean, React.Dispatch<React.SetStateAction<boolean>>],
  popUpMessage : [string, React.Dispatch<React.SetStateAction<string>>]
}

export const CalanderComponent = ({theEventName, selectedStartDate, selectedEndDate, selectedDates, popUpOpen, popUpMessage}: CalanderComponentProps) => {
  

  const arr1: any[] = [];
  const [selectedDays, updateDays] = selectedDates
  const navigate = useNavigate();

  useEffect(() => {
    console.log(selectedDays);
  }, [selectedDays]);
  

  const addDay = (date: Date) => {
    const arr = [
      ...selectedDays
    ]
    arr.push(date);
    updateDays(arr);

  }

  const removeDay = (date: Date) => {
    const arr = selectedDays.filter(
      (obj) =>
        obj == date
    )
    updateDays(arr)
  }

  const [startDate, updateStartDate] = selectedStartDate;

  const [popupIsOpen, setPopupIsOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');


  const handleUpdateStartTime = (time: Date) => {
    updateStartDate(time)
  }

  const [endDate, updateEndDate] = selectedEndDate;

  const handleUpdateEndTime = (time: Date) => {
    updateEndDate(time)
  }

  const [eventName, updateEventName] = theEventName

  const handleUpdateEventName = (name: any) => {
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

  const getHolidayName = (date: Date) => {
    if (holidays[0] <= date && date <= holidays[1]) {
      return "Labor Day";
    } else if (holidays[2] <= date && date <= holidays[3]) {
      return "October Recess";
    } else if (holidays[4] <= date && date <= holidays[5]) {
      return "November Recess";
    } else if (holidays[6] <= date && date <= holidays[7]) {
      return "Winter Recess";
    } else if (holidays[8] <= date && date <= holidays[9]) {
      return "MLK Day";
    } else if (holidays[10] <= date && date <= holidays[11]) {
      return "Spring Recess";
    } else {
      return "";
    }
  };

  return (
    <div className="calendar-wrapper">
      <Calendar
        locale="en-US"
        calendarType="US"
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

        
        tileContent={({ activeStartDate, date, view }) => {
          const holidayName = getHolidayName(date); 
        
          return (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              {holidayName && (
                <div 
                  className="tooltip-overlay has-tooltip" 
                  data-title={holidayName} 
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    zIndex: 3
                  }}
                ></div>
              )}
              <CircleComponent
                date={date}
                add={addDay}
                remove={removeDay}
                selectedDays={selectedDays}
              />
            </div>
          );
        }}
        

        navigationLabel={({ date, label, locale, view }) =>
          date.toLocaleString('default', { month: 'long' })
        }
      />
      <TimeSelectComponent
        updateStart={handleUpdateStartTime}
        updateEnd={handleUpdateEndTime}
      />
      <div className="next-button-wrapper">
        <Popup open={popupIsOpen} closeOnDocumentClick onClose={() => setPopupIsOpen(false)}>
          <div className="custom-popup">
            <button className="close-button" onClick={() => setPopupIsOpen(false)}>
            </button>
            <p>{popupMessage}</p>
          </div>
        </Popup>
      </div>
    </div>
  );
};