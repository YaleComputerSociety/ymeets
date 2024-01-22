import * as React from "react";
import "./calander_component.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import CircleComponent from "../circle_component";
import TimeSelectComponent from "../time_select_component";
import { Link, useNavigate } from 'react-router-dom';
import Popup from 'reactjs-popup';
import frontendEventAPI from "../../../firebase/eventAPI";
import { useState, useEffect } from "react";
import { createEvent, getEventById, checkIfLoggedIn } from "../../../firebase/events";
import "../calander_component/calander_component.css"
import GeneralPopup from '../general_popup_component'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import DaysNotDates from "../select_days_not_dates/DaysNotDates";

interface CalanderComponentProps {
  theEventName: [string, React.Dispatch<React.SetStateAction<string>>],
  selectedStartDate: [Date, React.Dispatch<React.SetStateAction<Date>>],
  selectedEndDate : [Date, React.Dispatch<React.SetStateAction<Date>>],
  theSelectedDates : [Date[], React.Dispatch<React.SetStateAction<Date[]>>],
  popUpOpen : [boolean, React.Dispatch<React.SetStateAction<boolean>>],
  popUpMessage : [string, React.Dispatch<React.SetStateAction<string>>]
  theSelectGeneralDays : [boolean, React.Dispatch<React.SetStateAction<boolean>>]
}

export const CalanderComponent = ({theEventName, selectedStartDate, selectedEndDate, theSelectedDates, popUpOpen, popUpMessage, theSelectGeneralDays}: CalanderComponentProps) => {
  const [showLoginPopup, setShowLoginPopup] = useState<boolean>(false);

  const [selectGeneralDays, setSelectGeneralDays] = theSelectGeneralDays

  useEffect(() => {
    // TODO better practice is to use onAuthStateChange
    setTimeout(() => {
      setShowLoginPopup(!checkIfLoggedIn());
    }, 500);
  }, []);

  const handleLoginPopupClose = () => {
    setShowLoginPopup(false);
  };

  const [showGeneralPopup, setGeneralPopup] = popUpOpen;

  const handleGeneralPopupClose = () => {
    setGeneralPopup(false);
  }

  const [generalPopupMessage, setGeneralPopupMessage] = popUpMessage;

  const arr1: any[] = [];
  const [selectedDates, setSelectedDates] = theSelectedDates

  const navigate = useNavigate();

  useEffect(() => {
    console.log(selectedDates);
  }, [selectedDates]);
  
  const addDay = (date: Date) => {

    console.log("added date " + date)

    const arr = [
      ...selectedDates
    ]
    arr.push(date);
    arr.sort((a: Date, b: Date) => {
      return a.getTime() - b.getTime();
    })

    setSelectedDates(arr);

  }

  const removeDay = (date: Date) => {
    const arr = selectedDates.filter(
      (obj) =>
        obj.getTime() != date.getTime()
    )
    console.log('The filtered arr');
    console.log(arr);
    setSelectedDates(arr)
  }

  const [startDate, setStartDate] = selectedStartDate;
  const [popupIsOpen, setPopupIsOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const handleUpdateStartTime = (time: Date) => {
    setStartDate(time)
  }

  const [endDate, setEndDate] = selectedEndDate;

  const handleUpdateEndTime = (time: Date) => {
    setEndDate(time)
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

  const [selectedDays, setSelectedDays] = useState({
    "SUN" : {
        dateObj : new Date(2000, 0, 2),
        selected : false
    },
    "MON" : {
        dateObj : new Date(2000, 0, 3),
        selected : false
    },
    "TUE" : {
        dateObj : new Date(2000, 0, 4),
        selected : false
    },
    "WED" : {
        dateObj : new Date(2000, 0, 5),
        selected : false
    },
    "THU" : {
        dateObj : new Date(2000, 0, 6),
        selected : false
    },
    "FRI" : {
        dateObj : new Date(2000, 0, 7),
        selected : false
    },
    "SAT" : {
        dateObj : new Date(2000, 0, 8),
        selected : false
    },
})

  return (
    <div className="calendar-wrapper">
      {
        selectGeneralDays ? 
      <Calendar
        locale="en-US"
        calendarType="US"
        prev2Label={null}
        next2Label={null}
        nextLabel={<FontAwesomeIcon icon={faArrowRight} />}
        prevLabel={<FontAwesomeIcon icon={faArrowLeft} />}
        selectRange={false}
        showNeighboringMonth={true}
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
        tileContent={({ date, view }) => {      
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
                isActive={selectedDates.filter(
                  (obj: any) => {
                    return obj.getFullYear() == date.getFullYear() &&
                    obj.getMonth() == date.getMonth() &&
                    obj.getDate() == date.getDate();
                  }
                ).length !== 0}
              />
            </div>
          );
        }}
        navigationLabel={({ date, label, locale, view }) =>
          date.toLocaleString('default', { month: 'long' })
        }
      /> :
      <DaysNotDates 
             theSelectedDays={[selectedDays, setSelectedDays]}
             selectedStartDate={[startDate, setStartDate]}
             selectedEndDate={[endDate, setEndDate]}
      />
      }
      <TimeSelectComponent
        updateStart={handleUpdateStartTime}
        updateEnd={handleUpdateEndTime}
        px={selectGeneralDays === true ? 92 : 0}
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
      {/* Login popup */}
      {showLoginPopup && <GeneralPopup 
        onClose={handleLoginPopupClose} 
        message={"Please sign in before creating an event."} 
        isLogin={true} />
      }
      {/* General popup */}
      {!showLoginPopup && showGeneralPopup && <GeneralPopup 
        onClose={handleGeneralPopupClose} 
        message={generalPopupMessage} 
        isLogin={false} />
      }
    </div>
  );
};