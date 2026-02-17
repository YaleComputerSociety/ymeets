import * as React from 'react';
import './time_select_component.css';
import Dropdown from '../../utils/components/Dropdown';

interface TimeOption {
  value: number;
  label: string;
}

interface TimeSelectComponentProps {
  updateStart: (date: Date) => void;
  updateEnd: (date: Date) => void;
  paddingClass?: string;
  startDate?: Date;
  endDate?: Date;
}

const turnToTimeString = (i: number): string => {
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

// Create options array once outside component (constant)
const createTimeOptions = (): TimeOption[] => {
  const opts = Array.from({ length: 24 }, (_, i) => ({
    value: i + 1,
    label: turnToTimeString(i),
  }));
  opts.push({ value: 25, label: '12:00 AM' });
  return opts;
};

const TIME_OPTIONS = createTimeOptions();

export const TimeSelectComponent = (props: TimeSelectComponentProps) => {
  // Helper to find the option matching a date's hour
  // Options array: index 0 = 12:00 AM (hour 0), index 1 = 1:00 AM (hour 1), etc.
  const findOptionForDate = React.useCallback((date: Date | undefined): TimeOption => {
    if (!date) {
      return TIME_OPTIONS[9]; // Default to 9am
    }
    const hour = date.getHours();
    
    // Find matching hour - options array is indexed by hour (0-23)
    // TIME_OPTIONS[hour] gives us the correct option for that hour
    if (hour >= 0 && hour < 24) {
      return TIME_OPTIONS[hour];
    }
    
    return TIME_OPTIONS[9]; // Default fallback to 9am
  }, []);

  // Initialize state from props if provided, otherwise use defaults
  const [selectedStart, setSelectedStart] = React.useState<TimeOption>(() => 
    findOptionForDate(props.startDate)
  );
  const [selectedEnd, setSelectedEnd] = React.useState<TimeOption>(() => 
    findOptionForDate(props.endDate)
  );

  // Update state when props change (for edit mode)
  // Convert date to a comparable value (hours + minutes as a string) for dependency tracking
  const startDateKey = props.startDate 
    ? `${props.startDate.getHours()}:${props.startDate.getMinutes()}` 
    : null;
  const endDateKey = props.endDate 
    ? `${props.endDate.getHours()}:${props.endDate.getMinutes()}` 
    : null;

  React.useEffect(() => {
    if (props.startDate) {
      const newStart = findOptionForDate(props.startDate);
      setSelectedStart(newStart);
    }
  }, [startDateKey, findOptionForDate, props.startDate]);

  React.useEffect(() => {
    if (props.endDate) {
      const newEnd = findOptionForDate(props.endDate);
      setSelectedEnd(newEnd);
    }
  }, [endDateKey, findOptionForDate, props.endDate]);

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
      className={`time-select-container absolute z-[49] ${props.paddingClass} flex flex-row items-center justify-center flex-wrap gap-2`}
    >
      <div className="grid items-center">
        <p className="text-right dark:text-text-dark font-normal m-0 text-xs sm:text-base">
          From:
        </p>
      </div>
      <div className="w-[120px] sm:w-[120px]">
        <Dropdown<TimeOption>
          options={TIME_OPTIONS}
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
          options={TIME_OPTIONS}
          selectedOption={selectedEnd}
          onSelect={handleEndChange}
          renderOption={(option) => option.label}
          className="bg-gray-100 dark:bg-gray-800"
        />
      </div>
    </div>
  );
};
