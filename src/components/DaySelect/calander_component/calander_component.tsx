import * as React from 'react';
import './calander_component.css';
import Calendar from 'react-calendar';
// import 'react-calendar/dist/Calendar.css';
import CircleComponent from '../circle_component';
import TimeSelectComponent from '../time_select_component';
import { Link, useNavigate } from 'react-router-dom';
import Popup from 'reactjs-popup';
import { useState, useEffect, useRef } from 'react';
import { checkIfLoggedIn } from '../../../backend/events';
import GeneralPopup from '../general_popup_component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import DaysNotDates from '../select_days_not_dates/DaysNotDates';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { getDatesFromRange } from '../../utils/functions/getDatesFromRange';
import { DateRange } from '../../../types';
import { useTheme } from '../../../contexts/ThemeContext';

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getRangePosition(
  date: Date,
  selectedDates: Date[]
): { isRangeStart: boolean; isRangeEnd: boolean } {
  const isSelected = selectedDates.some((d) => isSameDay(d, date));
  if (!isSelected) {
    return { isRangeStart: false, isRangeEnd: false };
  }
  const prevDay = new Date(date);
  prevDay.setDate(prevDay.getDate() - 1);
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  const prevSelected = selectedDates.some((d) => isSameDay(d, prevDay));
  const nextSelected = selectedDates.some((d) => isSameDay(d, nextDay));
  return {
    isRangeStart: !prevSelected,
    isRangeEnd: !nextSelected,
  };
}

interface CalanderComponentProps {
  theEventName: [string, React.Dispatch<React.SetStateAction<string>>];
  selectedStartDate: [Date, React.Dispatch<React.SetStateAction<Date>>];
  selectedEndDate: [Date, React.Dispatch<React.SetStateAction<Date>>];
  theSelectedDates: [Date[], React.Dispatch<React.SetStateAction<Date[]>>];
  popUpOpen: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  popUpMessage: [string, React.Dispatch<React.SetStateAction<string>>];
  theSelectGeneralDays: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
  ];
  theGeneralDays: [any, React.Dispatch<React.SetStateAction<any>>];
}

export const CalanderComponent = ({
  theEventName,
  selectedStartDate,
  selectedEndDate,
  theSelectedDates,
  popUpOpen,
  popUpMessage,
  theSelectGeneralDays,
  theGeneralDays,
}: CalanderComponentProps) => {
  const [showLoginPopup, setShowLoginPopup] = useState<boolean>(false);

  const [selectGeneralDays, setSelectGeneralDays] = theSelectGeneralDays;
  const [selectedDays, setSelectedDays] = theGeneralDays;

  const { theme } = useTheme();

  useEffect(() => {
    // TODO better practice is to use onAuthStateChange
    setTimeout(() => {
      setShowLoginPopup(!checkIfLoggedIn());
    }, 500);
  }, []);

  const today = new Date();

  const tileClassName = ({ date, view }: any) => {
    if (view === 'month') {
      if (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      ) {
        return 'highlight';
      }
    }
    return null;
  };

  const handleLoginPopupClose = () => {
    setShowLoginPopup(false);
  };

  const [showGeneralPopup, setGeneralPopup] = popUpOpen;

  const handleGeneralPopupClose = () => {
    setGeneralPopup(false);
  };

  const [generalPopupMessage, setGeneralPopupMessage] = popUpMessage;

  const [selectedDates, setSelectedDates] = theSelectedDates;
  const [lastSelectedDate, setLastSelectedDate] = useState<Date | null>(null);

  // Drag-to-select state: when user drags across days we select the range
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null);
  const [dragHasMoved, setDragHasMoved] = useState(false);
  const dragHasMovedRef = useRef(false);
  const dragStartDateRef = useRef<Date | null>(null);
  dragHasMovedRef.current = dragHasMoved;
  dragStartDateRef.current = dragStartDate;


  //Event listener for user dragging mouse
  useEffect(() => {
    if (!isDragging) return;
    const handleMouseUp = () => {
      if (!dragHasMovedRef.current && dragStartDateRef.current) {
        setSelectedDates((prev) => toggleDate(prev, dragStartDateRef.current!));
      }
      setIsDragging(false);
      setDragStartDate(null);
      setDragHasMoved(false);
    };
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [isDragging]);

  const handleDragStart = (date: Date) => {
    setDragStartDate(date);
    setIsDragging(true);
    setDragHasMoved(false);
  };

  const handleDragOver = (date: Date) => {
    if (!dragStartDate) return;
    let start = new Date(dragStartDate);
    let end = new Date(date);
    if (start > end) [start, end] = [end, start];
    if (start.getTime() !== end.getTime()) setDragHasMoved(true);
    const range = getDatesFromRange({ startDate: start, endDate: end });
    setSelectedDates(range.map(({ date: d }) => d).sort((a, b) => a.getTime() - b.getTime()));
  };

  const addDay = (date: Date) => {
    const arr = [...selectedDates];
    arr.push(date);
    arr.sort((a: Date, b: Date) => {
      return a.getTime() - b.getTime();
    });

    setLastSelectedDate(date);
    setSelectedDates(arr);
  };

  const removeDay = (date: Date) => {
    const arr = selectedDates.filter((obj) => obj.getTime() != date.getTime());
    setLastSelectedDate(date);
    setSelectedDates(arr);
  };

  const toggleDate = (arr: Date[], date: Date) => {
    const index = arr.findIndex(
      (selected) => selected.getTime() === date.getTime()
    );
    if (index === -1) {
      return [...arr, date];
    } else {
      return arr.filter((_, i) => i !== index);
    }
  };

  const handleRange = (date: Date) => {
    if (lastSelectedDate) {
      const dates: DateRange = {
        startDate: lastSelectedDate,
        endDate: date,
      };
      if (dates.startDate > dates.endDate) {
        [dates.startDate, dates.endDate] = [dates.endDate, dates.startDate];
      }
      const range = getDatesFromRange(dates);
      let arr = [...selectedDates];
      range.forEach(({ date, dayOfWeek }) => {
        arr = toggleDate(arr, date);
      });
      arr = toggleDate(arr, lastSelectedDate);
      arr.sort((a, b) => a.getTime() - b.getTime());
      setSelectedDates([...arr]);
    } else {
      addDay(date);
    }
    setLastSelectedDate(date);
  };

  const [startDate, setStartDate] = selectedStartDate;
  const [popupIsOpen, setPopupIsOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const handleUpdateStartTime = (time: Date) => {
    setStartDate(time);
  };

  const [endDate, setEndDate] = selectedEndDate;

  const handleUpdateEndTime = (time: Date) => {
    setEndDate(time);
  };

  const [eventName, updateEventName] = theEventName;

  const handleUpdateEventName = (name: any) => {
    updateEventName(name);
  };

  return (
    <div className={`calendar-wrapper${isDragging ? ' calendar-dragging' : ''}`}>
      <TimeSelectComponent
        updateStart={handleUpdateStartTime}
        updateEnd={handleUpdateEndTime}
        paddingClass={selectGeneralDays ? 'top-6' : 'top-[80px]'}
        startDate={startDate}
        endDate={endDate}
      />
      {!selectGeneralDays ? (
        <Calendar
          locale="en-US"
          calendarType="US"
          prev2Label={null}
          next2Label={null}
          nextLabel={
            <FontAwesomeIcon
              icon={faArrowRight}
              color={theme === 'dark' ? '#f8f9fa' : 'black'}
            />
          }
          prevLabel={
            <FontAwesomeIcon
              icon={faArrowLeft}
              color={theme === 'dark' ? '#f8f9fa' : 'black'}
            />
          }
          selectRange={false}
          showNeighboringMonth={true}
          minDetail="month"
          tileClassName={tileClassName}
          tileContent={({ date, view }) => {
            const rangePosition = getRangePosition(date, selectedDates);
            return (
              <div
                style={{ position: 'relative', width: '100%', height: '100%' }}
              >
                <CircleComponent
                  date={date}
                  add={addDay}
                  remove={removeDay}
                  selectedDates={selectedDates}
                  handleRange={handleRange}
                  isDragging={isDragging}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  isRangeStart={rangePosition.isRangeStart}
                  isRangeEnd={rangePosition.isRangeEnd}
                />
              </div>
            );
          }}
          navigationLabel={({ date, label, locale, view }) => {
            return (
              <div className="dark:text-text-dark">
                {date.toLocaleString('default', { month: 'long' })}
              </div>
            );
          }}
        />
      ) : (
        <DaysNotDates theSelectedDays={[selectedDays, setSelectedDays]} />
      )}

      <Tooltip id="holiday-tooltip" style={{ zIndex: 3 }} />

      <div className="next-button-wrapper">
        <Popup
          open={popupIsOpen}
          closeOnDocumentClick
          onClose={() => {
            setPopupIsOpen(false);
          }}
        >
          <div className="custom-popup">
            <button
              className="close-button"
              onClick={() => {
                setPopupIsOpen(false);
              }}
            ></button>
            <p>{popupMessage}</p>
          </div>
        </Popup>
      </div>
      {/* Login popup */}
      {showLoginPopup && (
        <GeneralPopup
          onClose={handleLoginPopupClose}
          message={'Please log into Google to create events'}
          isLogin={true}
        />
      )}
      {/* General popup */}
      {!showLoginPopup && showGeneralPopup && (
        <GeneralPopup
          onClose={handleGeneralPopupClose}
          message={generalPopupMessage}
          isLogin={false}
        />
      )}
    </div>
  );
};
