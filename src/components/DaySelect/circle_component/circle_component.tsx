import * as React from 'react';
import './circle_component.css';

import { useState, useEffect } from 'react';
import { getHolidayForDate } from '../../utils/functions/holidays';

export const CircleComponent = (props: any) => {
  const holidayMetadata = getHolidayForDate(props.date);

  const [active, toggleActive] = useState('not-active-circle');

  useEffect(() => {
    const isDateSelected = props.selectedDates.some(
      (selectedDate: Date) =>
        selectedDate.getFullYear() === props.date.getFullYear() &&
        selectedDate.getMonth() === props.date.getMonth() &&
        selectedDate.getDate() === props.date.getDate()
    );
    toggleActive(isDateSelected ? 'active-circle' : 'not-active-circle');
  }, [props.selectedDates, props.date]);

  const handleClick = (event: React.MouseEvent) => {
    if (event.shiftKey) {
      props.handleRange(props.date);
    }
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    props.onDragStart?.(props.date);
  };

  const handleMouseEnter = () => {
    if (props.isDragging) {
      props.onDragOver?.(props.date);
    }
  };

  const isSelected = active === 'active-circle';
  const isRangeStart = !!props.isRangeStart;
  const isRangeEnd = !!props.isRangeEnd;
  const rangeClass = isSelected
    ? isRangeStart && isRangeEnd
      ? 'range-single'
      : isRangeStart
        ? 'range-start'
        : isRangeEnd
          ? 'range-end'
          : 'range-middle'
    : '';

  return (
    <div className={`circle ${active} ${rangeClass}`}>
      {holidayMetadata.isHoliday ? (
        <button
          className={`circle-button ${active} ${rangeClass}`}
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
          data-tooltip-id="holiday-tooltip"
          data-tooltip-content={`${holidayMetadata.holidayName}`}
        >
          {props.date.getDate()}
        </button>
      ) : (
        <button
          className={`circle-button ${active} ${rangeClass}`}
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
        >
          {props.date.getDate()}
        </button>
      )}
      {holidayMetadata.isHoliday ? (
        <div
          className={`holiday-indicator ${active === 'active-circle' ? 'selected' : ''}`}
        ></div>
      ) : null}
    </div>
  );
};
