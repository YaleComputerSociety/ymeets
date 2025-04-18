import { useState, useEffect, useRef } from 'react';
import './day_select_component.css';
import CalanderComponent from '../calander_component';
import frontendEventAPI from '../../../firebase/eventAPI';
import { getAccountId, getAccountName } from '../../../firebase/events';
import { useNavigate } from 'react-router-dom';
import Select from 'react-dropdown-select';
import LimitedSelect from './limited_select_component';
import Button from '../../utils/components/Button';
import InformationPopup from '../../utils/components/InformationPopup';
import TimezonePicker from '../../utils/components/TimezonePicker';
import TextareaAutosize from 'react-textarea-autosize';
import { IconInfoCircle } from '@tabler/icons-react';

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
  };

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
    if (
      eventDescription.length > 0 &&
      isBlankspaceOrInvisible(eventDescription)
    ) {
      alert(
        'Did you mean to enter an event description? Please enter a valid description, if so.'
      );
      return;
    }

    if (locations.some(isBlankspaceOrInvisible)) {
      alert(
        'Looks like you left one of your event locations blank. Please remove it before proceeding!'
      );
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex flex-col md:flex-row justify-center gap-8">
        <div className="md:w-1/2">
          <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/30 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
            {/* <h2 className="text-3xl sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold text-slate-700 dark:text-slate-200 mb-6">
              Event Details
            </h2> */}

            <div className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="event-name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Event Name
                </label>
                <input
                  id="event-name"
                  type="text"
                  autoComplete="off"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-secondary_background-dark text-gray-900 dark:text-white
                             focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-primary-400 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter event name"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  maxLength={40}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="event-description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Event Description
                </label>
                <TextareaAutosize
                  id="event-description"
                  autoComplete="off"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-secondary_background-dark text-gray-900 dark:text-white
                             focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-primary-400 focus:border-transparent transition-colors duration-200 resize-none overflow-hidden"
                  placeholder="Describe your event (Optional)"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  maxLength={300}
                  minRows={2}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Timezone
                </label>
                <TimezonePicker theTimezone={[timezone, setTimezone]} />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Locations
                </label>
                <div className="z-40 rounded-lg border border-gray-300 dark:border-gray-600 focus-within:ring-1 focus-within:ring-primary dark:focus-within:ring-primary-400 transition-colors duration-200">
                  <LimitedSelect
                    locationOptions={locationOptions}
                    updateLocationsState={updateLocationsState}
                  />
                </div>

                <div className="flex items-center text-sm text-gray-400 dark:text-gray-400 mt-1">
                  Type and press ENTER to add locations
                  {/* <IconInfoCircle stroke={1.25} />
                  <span className="ml-2">
                    Type and press ENTER to add locations
                  </span> */}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:w-2/5">
          <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/30 rounded-xl px-6 border border-gray-100 dark:border-gray-700">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-1 mt-6 mb-3">
              <div className="relative bg-white dark:bg-gray-800 rounded-md">
                <div className="grid grid-cols-2 overflow-hidden rounded-md">
                  <button
                    onClick={() => handleTabChange('Specific Days')}
                    className="py-2 px-2 relative z-10 focus:outline-none transition-colors duration-300"
                  >
                    <span
                      className={
                        selectGeneralDays
                          ? 'text-gray-700 dark:text-gray-300 text-sm'
                          : 'text-white dark:text-white text-sm'
                      }
                    >
                      Specific Days
                    </span>
                  </button>
                  <button
                    onClick={() => handleTabChange('General Days')}
                    className="py-2 px-2 relative z-10 focus:outline-none transition-colors duration-300"
                  >
                    <span
                      className={
                        selectGeneralDays
                          ? 'text-white dark:text-white text-sm'
                          : 'text-gray-700 dark:text-gray-300 text-sm'
                      }
                    >
                      General Days
                    </span>
                  </button>
                  <div
                    className={`absolute inset-0 w-1/2 h-full bg-primary dark:bg-primary-600 rounded-md transition-transform duration-300 ${
                      selectGeneralDays ? 'translate-x-full' : 'translate-x-0'
                    }`}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mx-auto rounded-lg border border-gray-300 dark:border-gray-600">
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
            <div className="mt-4 mb-4 flex justify-center">
              <Button
                onClick={verifyNextAndSubmitEvent}
                bgColor="primary"
                textColor="white"
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
