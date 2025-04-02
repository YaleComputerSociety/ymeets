import { useState, useEffect, useRef } from 'react';
import './day_select_component.css';
import CalanderComponent from '../calander_component';
import frontendEventAPI from '../../../firebase/eventAPI';
import { getAccountId, getAccountName } from '../../../firebase/events';
import { useNavigate } from 'react-router-dom';
import LimitedSelect from './limited_select_component'
import Button from '../../utils/components/Button';
import InformationPopup from '../../utils/components/InformationPopup';
import TimezonePicker from '../../utils/components/TimezonePicker';

export const DaySelectComponent = () => {
  // Default event start/end time values
  const nineAM = new Date('January 1, 2023');
  nineAM.setHours(9);
  const fivePM = new Date('January 1, 2023');
  fivePM.setHours(17);
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [zoomLink, setZoomLink] = useState('');
  const [startDate, setStartDate] = useState(nineAM);
  const [endDate, setEndDate] = useState(fivePM);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [popUpMessage, setPopupMessage] = useState('');
  const [popUpIsOpen, setPopupIsOpen] = useState(false);
  const [locations, updateLocationsState] = useState<string[]>([]);
  const [locationOptions, setLocationOptions] = useState<any[]>([
    {
      label: '17 Hillhouse',
      value: '17 Hillhouse',
    },
    {
      label: 'Bass',
      value: 'Bass',
    },
    {
      label: 'HQ',
      value: 'HQ',
    },
    {
      label: 'LC',
      value: 'LC',
    },
    {
      label: 'Sterling',
      value: 'Sterling',
    },
    {
      label: 'TSAI City',
      value: 'TSAI City',
    },
    {
      label: 'WLH',
      value: 'WLH',
    },
  ]);

  const [selectedDays, setSelectedDays] = useState<
    Record<string, { dateObj: Date; selected: boolean }>
  >({
    SUN: {
      dateObj: new Date(2000, 0, 2),
      selected: false,
    },
    MON: {
      dateObj: new Date(2000, 0, 3),
      selected: false,
    },
    TUE: {
      dateObj: new Date(2000, 0, 4),
      selected: false,
    },
    WED: {
      dateObj: new Date(2000, 0, 5),
      selected: false,
    },
    THU: {
      dateObj: new Date(2000, 0, 6),
      selected: false,
    },
    FRI: {
      dateObj: new Date(2000, 0, 7),
      selected: false,
    },
    SAT: {
      dateObj: new Date(2000, 0, 8),
      selected: false,
    },
  });

  const [selectGeneralDays, setSelectGeneralDays] = useState(false);

  const navigate = useNavigate();

  // New, 2/18/25 - used to check if eventName or eventDescription are blank spaces or invisible characters
  const isBlankspaceOrInvisible = (str: string): boolean => {
    // eslint-disable-next-line no-control-regex
    const invisibleChars = new RegExp('[^\x00-\x7F]', 'gu');
    return str.replace(invisibleChars, '').trim().length === 0;
  }

  const verifyNextAndSubmitEvent = () => {
    if (
      startDate.getHours() === 0 &&
      startDate.getMinutes() === 0 &&
      startDate.getSeconds() === 0 &&
      endDate.getHours() === 0 &&
      endDate.getMinutes() === 0 &&
      endDate.getSeconds() === 0
    ) {
      alert('Make sure to enter times!');
      return;
    }

    if (startDate >= endDate) {
      alert('Make sure your end time is after your start time!');
      return;
    }

    // Optional; backend supports an empty string for name
    // Change, 2/18/25 - Name is not optional; make sure it's not a blank space or just invisible characters.
    if (isBlankspaceOrInvisible(eventName)) {
      alert('Make sure to name your event!');
      return;
    }

    // Change, 2/18/25 - Description is by default optional; however, if they enter something, make sure it's not a blank space or just invisible characters.
    if (eventDescription.length > 0 && isBlankspaceOrInvisible(eventDescription)) {
      alert('Did you mean to enter an event description? Please enter a valid description, if so.');
      return;
    }
    
    if (locations.some(isBlankspaceOrInvisible)) {
      alert("Looks like you left one of your event locations blank. Please remove it before proceeding!");
      return;
    }

    if (selectGeneralDays) {
      const generallySelectedDates: Date[] = [];

      Object.keys(selectedDays).forEach((day) => {
        if (selectedDays[day].selected === true) {
          generallySelectedDates.push(selectedDays[day].dateObj);
        }
      });

      if (generallySelectedDates.length == 0) {
        alert('You need to pick some days!');
        return;
      }

      frontendEventAPI
        .createNewEvent(
          eventName,
          eventDescription,
          getAccountName(), // admin name
          getAccountId(), // admin ID
          generallySelectedDates,
          locations, // plaus locs
          startDate,
          endDate,
          zoomLink,
          timezone
        )
        .then((ev) => {
          navigate('/timeselect/' + ev?.publicId);
        });
    } else {
      if (selectedDates.length == 0) {
        alert('Make sure to enter dates!');
        return;
      }

      frontendEventAPI
        .createNewEvent(
          eventName,
          eventDescription,
          getAccountName(), // admin name
          getAccountId(), // admin ID
          selectedDates,
          locations, // plaus locs
          startDate,
          endDate,
          zoomLink,
          timezone
        )
        .then((ev) => {
          navigate('/timeselect/' + ev?.publicId);
        });
    }
  };

  const handleTabChange = (tab: 'Specific Days' | 'General Days') => {
    setSelectGeneralDays(tab === 'General Days');
  };

  const inputClasses =
    'p-3 px-4 text-base border rounded-lg w-full md:w-[80%] bg-white dark:bg-secondary_background-dark dark:text-text-dark text-text';

  return (
    <div className="flex flex-col justify-center items-center sm:items-start md:flex-row md:w-[80%] sm:w-[90%] xl:w-[65%] mx-auto px-2 text-center">
      <div className="flex flex-col flex-wrap justify-start w-[100%] md:content-start mt-6 z-69">
        <div className="space-y-3 mb-2 md:w-[90%] md:space-y-8 md:mt-12 flex flex-col items-center md:items-start">
          <div className="w-[80%] md:w-[100%] flex flex-row justify-center md:justify-start">
            {/* Intentionally made these not Input components since I dont want the expand feature on all */}
            <input
              id="event-name"
              type="text"
              className={inputClasses}
              placeholder="Event Name"
              value={eventName}
              onChange={(e) => {
                setEventName(e.target.value);
              }}
              maxLength={40}
            />
          </div>
          <div className="w-[80%] md:w-[100%] flex flex-row justify-center md:justify-start">
            {/* Intentionally made these not Input components since I dont want the expand feature on all */}
            <textarea
              id="event-description"
              className={inputClasses}
              placeholder="Event Description (Optional)"
              value={eventDescription}
              onChange={(e) => {
                setEventDescription(e.target.value);
              }}
              rows={1}
              maxLength={100}
            />
          </div>
          <div className="w-[80%]  flex flex-row justify-center md:justify-start">
            <TimezonePicker theTimezone={[timezone, setTimezone]} />
          </div>
          <div className="mt-0 w-[80%] md:w-[100%] justify-center items-center z-69">
            <div className="w-[100%] md:w-[80%] flex flex-row justify-center items-center md:justify-start z-69">
              <div className="w-full sm:w-[80%] md:w-full custom-select-wrapper z-69">
              <LimitedSelect
                locationOptions={locationOptions}
                updateLocationsState={updateLocationsState}
              />
              </div>
            </div>

            <div className="mt-2 mb-6 z-50 flex justify-start">
              <InformationPopup
                content="
                Type and click ENTER to add locations for your group to vote on for the meeting
              "
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-wrap space-y-2 mb-6 w-[90%] sm:w-[85%]">
        <div className="mb-4 flex space-x-4 p-2 bg-white dark:bg-secondary_background-dark rounded-lg shadow-md relative">
          <button
            onClick={() => {
              handleTabChange('Specific Days');
            }}
            className={`flex-1 px-4 rounded-md focus:outline-none transition-all duration-300 relative specific-days-button ${
              selectGeneralDays
                ? 'text-black dark:text-text-dark'
                : 'text-white'
            }`}
          >
            <span className="relative z-10">Specific Days</span>
            <div
              className={`absolute rounded-md transition-transform duration-300 ${
                selectGeneralDays ? 'translate-x-[110%]' : 'translate-x-0'
              } bg-primary`}
            />
          </button>
          <button
            onClick={() => {
              handleTabChange('General Days');
            }}
            className={`flex-1 px-4 rounded-md focus:outline-none transition-all duration-300 relative general-days-button ${
              selectGeneralDays
                ? 'text-white'
                : 'text-black dark:text-text-dark'
            }`}
          >
            <span className="relative z-10">General Days</span>
            <div
              className={`absolute md:left-0.5 inset-0 rounded-md transition-transform duration-300 ${
                selectGeneralDays ? 'translate-x-0' : '-translate-x-[110%]'
              } bg-primary`}
            />
          </button>
        </div>

        <div className="w-full h-2/4 xs:mb-2 md:mb-0">
          <CalanderComponent
            theSelectGeneralDays={[selectGeneralDays, setSelectGeneralDays]}
            theGeneralDays={[selectedDays, setSelectedDays]}
            theEventName={[eventName, setEventName]}
            selectedStartDate={[startDate, setStartDate]}
            selectedEndDate={[endDate, setEndDate]}
            theSelectedDates={[selectedDates, setSelectedDates]}
            popUpOpen={[popUpIsOpen, setPopupIsOpen]}
            popUpMessage={[popUpMessage, setPopupMessage]}
          />
        </div>
        <div className="mt-2"></div>
        <div className="flex items-center justify-center">
          <Button
            textColor="white"
            bgColor="primary"
            onClick={verifyNextAndSubmitEvent}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
