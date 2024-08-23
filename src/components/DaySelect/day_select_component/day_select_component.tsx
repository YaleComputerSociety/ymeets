import { useState, useEffect, useRef } from 'react'
import './day_select_component.css'
import CalanderComponent from '../calander_component'
import frontendEventAPI from '../../../firebase/eventAPI'
import { getAccountId, getAccountName } from '../../../firebase/events'
import { useNavigate } from 'react-router-dom'
import Select from 'react-dropdown-select'
import Button from '../../utils/components/Button'
import InformationPopup from '../../utils/components/InformationPopup'
import { Input } from '../../utils/components/Input'

export const DaySelectComponent = () => {
  // Default event start/end time values
  const nineAM = new Date('January 1, 2023')
  nineAM.setHours(9)
  const fivePM = new Date('January 1, 2023')
  fivePM.setHours(17)

  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    if (containerRef.current) {
      // @ts-expect-error
      setContainerWidth(containerRef.current.offsetWidth)
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        // @ts-expect-error
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const [eventName, setEventName] = useState('')
  const [eventDescription, setEventDescription] = useState('')
  const [zoomLink, setZoomLink] = useState('')
  const [startDate, setStartDate] = useState(nineAM)
  const [endDate, setEndDate] = useState(fivePM)
  const [selectedDates, setSelectedDates] = useState([])
  const [popUpMessage, setPopupMessage] = useState('')
  const [popUpIsOpen, setPopupIsOpen] = useState(false)
  const [locations, updateLocationsState] = useState<string[]>([])
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
  ])

  const handleCreate = (newOption: any) => {
    // newOption contains the value of the new option created by the user
    const newOptions = [
      ...locationOptions,
      { label: newOption, value: newOption.toLowerCase() },
    ]
    setLocationOptions(newOptions)
  }

  const handleUpdateStartTime = (time: Date) => {
    setStartDate(time)
  }

  const handleUpdateEndTime = (time: Date) => {
    setEndDate(time)
  }

  const [selectedDays, setSelectedDays] = useState({
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
  })

  const [selectGeneralDays, setSelectGeneralDays] = useState(false)

  const showAlert = (message: string) => {
    setPopupMessage(message)
    setPopupIsOpen(true)
  }

  const navigate = useNavigate()

  const updateLocations = (values: any) => {
    updateLocationsState(values)
  }

  const removeAndUpdateLocations = (toRemove: any) => {
    return () => {
      const tmp_locations: any = []
      for (let i = 0; i < locations.length; i++) {
        if (locations[i] != toRemove) {
          tmp_locations.push(locations[i])
        }
      }
      updateLocationsState(tmp_locations)
    }
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
      // alert('Make sure to enter times!');
      alert('Make sure to enter times!')
      return
    }

    if (startDate >= endDate) {
      // alert('Make sure your end time is after your start time!');
      alert('Make sure your end time is after your start time!')
      return
    }

    // Optional; backend supports an empty string for name
    if (eventName.length == 0) {
      // alert('Make sure to name your event!');
      alert('Make sure to name your event!')
      return
    }

    if (selectGeneralDays) {
      const generallySelectedDates: Date[] = []

      Object.keys(selectedDays).forEach((day) => {
        // @ts-expect-error
        if (selectedDays[day].selected === true) {
          // @ts-expect-error
          generallySelectedDates.push(selectedDays[day].dateObj)
        }
      })

      if (generallySelectedDates.length == 0) {
        alert('You need to pick some days!')
        return
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
          zoomLink
        )
        .then((ev) => {
          navigate('/timeselect/' + ev?.publicId)
        })
    } else {
      if (selectedDates.length == 0) {
        // alert('Make sure to enter dates!');
        alert('Make sure to enter dates!')
        return
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
          zoomLink
        )
        .then((ev) => {
          navigate('/timeselect/' + ev?.publicId)
        })
    }
  }

  const handleTabChange = (tab: 'Specific Days' | 'General Days') => {
    setSelectGeneralDays(tab === 'General Days')
  }

  const inputClasses =
    'p-3 px-4 text-base border rounded-lg w-full md:w-[80%] bg-white'

  return (
    <div className="flex flex-col justify-center items-center sm:items-start md:flex-row md:w-[80%] sm:w-[90%] xl:w-[65%] mx-auto px-2 text-center">
      <div className="flex flex-col flex-wrap justify-start w-[100%] md:content-start mt-6 z-49">
        <div className="space-y-3 mb-8 md:w-[90%] md:space-y-8 md:mt-12 flex flex-col items-center md:items-start">
          <div className="w-[80%] md:w-[100%] flex flex-row justify-center md:justify-start">
            <Input
              id="event-name"
              placeholder="Event Name"
              value={eventName}
              onChange={(e: any) => {
                setEventName(e.target.value)
              }}
              maxLength={40}
            />
          </div>
          <div className="w-[80%] md:w-[100%] flex flex-row justify-center md:justify-start">
            <Input
              id="event-description"
              placeholder="Event Description"
              value={eventDescription}
              onChange={(e: any) => {
                setEventDescription(e.target.value)
              }}
            />
          </div>
          <div className="w-[80%] md:w-[100%] flex flex-row justify-center md:justify-start">
            <Input
              id="zoom-link"
              placeholder="Zoom Link (Optional)"
              value={zoomLink}
              onChange={(e) => {
                setZoomLink(e.target.value)
              }}
            />
          </div>
          <div className="mt-0 w-[80%] md:w-[100%] justify-center items-center z-49">
            <div className="w-[100%] md:w-[80%] flex flex-row justify-center items-center md:justify-start">
              <div className="w-full sm:w-[80%] md:w-full custom-select-wrapper">
                <Select
                  className="react-dropdown-select"
                  multi
                  create
                  options={locationOptions}
                  clearOnSelect={false}
                  values={[]}
                  onChange={(values) => {
                    const selectedValues = values.map((val) => val.value)
                    updateLocationsState(selectedValues)
                  }}
                  placeholder="  Location Options (Optional)"
                  noDataRenderer={() => (
                    <div className="p-2 text-center">
                      No matching preset locations :(
                    </div>
                  )}
                  onDropdownOpen={() => {
                    const handle = document.querySelector(
                      '.react-dropdown-select-dropdown-handle'
                    )
                    if (handle) handle.classList.add('open')
                  }}
                  onDropdownClose={() => {
                    const handle = document.querySelector(
                      '.react-dropdown-select-dropdown-handle'
                    )
                    if (handle) handle.classList.remove('open')
                  }}
                />
              </div>
            </div>
            <div className="mt-2 mb-6 z-50">
              <InformationPopup
                content="
                Type and click ENTER to add options not listed.
              "
              />
              {/* <div className="flex flex-col justify-left items-center w-[100%] space-y-3 max-h-32 overflow-y-scroll">
                {locations.map((location, index) => (
                  <div className="flex w-[100%] justify-center md:justify-start">
                    <div className="location-selection-option flex justify-between items-center w-[80%] px-3 h-10">
                      <div>{location}</div>
                      <div>
                        <button onClick={removeAndUpdateLocations(location)} className="w-[30%]">&times;</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div> */}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-wrap space-y-2 mb-6 w-[90%] sm:w-[85%]">
        {/* <Button
          bgColor='blue-500'
          textColor='white'
          onClick={() => {setSelectGeneralDays((oldState) => {
              return !oldState
          })}}
        >
          {
            selectGeneralDays === true ? "Select Specfic Dates" : "Select General Days"
          }
        </Button> */}

        <div className="mb-4 flex space-x-4 p-2 bg-white rounded-lg shadow-md relative">
          <button
            onClick={() => {
              handleTabChange('Specific Days')
            }}
            className={`flex-1 px-4 rounded-md focus:outline-none transition-all duration-300 relative ${
              selectGeneralDays ? 'text-black' : 'text-white'
            }`}
          >
            <span className="relative z-10">Specific Days</span>
            <div
              className={`absolute rounded-md transition-transform duration-300 ${
                selectGeneralDays ? 'translate-x-[110%]' : 'translate-x-0'
              } bg-blue-500`}
            />
          </button>
          <button
            onClick={() => {
              handleTabChange('General Days')
            }}
            className={`flex-1 px-4 rounded-md focus:outline-none transition-all duration-300 relative general-days-button ${
              selectGeneralDays ? 'text-white' : 'text-black'
            }`}
          >
            <span className="relative z-10">General Days</span>
            <div
              className={`absolute md:left-0.5 inset-0 rounded-md transition-transform duration-300 ${
                selectGeneralDays ? 'translate-x-0' : '-translate-x-[110%]'
              } bg-blue-500`}
            />
          </button>
        </div>

        <div className="w-full h-2/4 xs:mb-2 md:mb-0 z-30">
          <CalanderComponent
            theSelectGeneralDays={[selectGeneralDays, setSelectGeneralDays]}
            theGeneralDays={[selectedDays, setSelectedDays]}
            theEventName={[eventName, setEventName]}
            selectedStartDate={[startDate, setStartDate]}
            selectedEndDate={[endDate, setEndDate]}
            // @ts-expect-error
            theSelectedDates={[selectedDates, setSelectedDates]}
            popUpOpen={[popUpIsOpen, setPopupIsOpen]}
            popUpMessage={[popUpMessage, setPopupMessage]}
          />
        </div>
        <div className="mt-2"></div>
        <div className="flex items-center justify-center">
          <Button
            textColor="white"
            bgColor="blue-500"
            onClick={verifyNextAndSubmitEvent}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
