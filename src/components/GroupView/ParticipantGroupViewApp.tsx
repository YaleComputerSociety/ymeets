import { useEffect, useState } from 'react'
import UserChart from './UserChart'
import LocationChart from './LocationChart'
import { calanderState, userData, calendarDimensions } from '../../types'
import eventAPI from '../../firebase/eventAPI'
import {
  getEventOnPageload,
  getEventName,
  getEventDescription,
  getLocationsVotes,
  getLocationOptions,
  getAccountName,
  getChosenLocation,
  getParticipantIndex,
  getAccountId,
  getChosenDayAndTime,
  getZoomLink,
} from '../../firebase/events'
import { useParams, useNavigate } from 'react-router-dom'
import Calender from '../selectCalendarComponents/CalendarApp'
import AddToGoogleCalendarButton from './AddToCalendarButton'
import Button from '../utils/components/Button'
import InformationPopup from '../utils/components/InformationPopup'
import { LoadingAnim } from '../utils/components/LoadingAnim'

/**
 *
 * @returns Page Component Page
 */
export default function ParticipantGroupViewPage() {
  const { code } = useParams()

  const [chartedUsers, setChartedUsers] = useState<userData | undefined>(
    undefined
  )
  const [calendarState, setCalendarState] = useState<calanderState | undefined>(
    undefined
  )
  const [calendarFramework, setCalendarFramework] = useState<
    calendarDimensions | undefined
  >(undefined)

  const [eventName, setEventName] = useState('')
  const [eventDescription, setEventDescription] = useState('')
  const [locationVotes, setLocationVotes] = useState(Object)
  const [locationOptions, setLocationOptions] = useState(Array<string>)
  const [userChosenLocation, setUserChosenLocation] = useState('')
  const [selectedLocation, setSelectedLocation] = useState(undefined)
  // const [chosenTimeRange, setChosenTimeRange] = useState(undefined);
  const [selectedDateTimeObjects, setSelectedDateTimeObjects] = useState<
    [Date, Date] | undefined
  >()
  // const [selectedDateTimeObjects, setSelectedDateTimeObjects] = useState<Date[]>([]);

  const [loading, setLoading] = useState(true)

  const [dragState, setDragState] = useState({
    dragStartedOnID: [], // [columnID, blockID]
    dragEndedOnID: [],
    dragStartedOn: false,
    affectedBlocks: new Set(),
  })

  const nav = useNavigate()

  const getCurrentUserIndex = () => {
    let user = getParticipantIndex(getAccountName(), getAccountId())
    if (user === undefined) {
      // new user => last availability
      user =
        calendarState !== undefined ? Object.keys(calendarState).length - 1 : 0
    }
    return user
  }

  useEffect(() => {
    const fetchData = async () => {
      if (code && code.length == 6) {
        await getEventOnPageload(code)
          .then(() => {
            const { availabilities, participants } = eventAPI.getCalendar()
            const dates = eventAPI.getCalendarDimensions()

            setChartedUsers(participants)
            setCalendarState(availabilities)
            setCalendarFramework(dates)

            setEventName(getEventName())
            setEventDescription(getEventDescription())
            setLocationVotes(getLocationsVotes())
            setLocationOptions(getLocationOptions())

            setSelectedDateTimeObjects(getChosenDayAndTime())

            // @ts-expect-error

            setSelectedLocation(getChosenLocation())
            setLoading(false)
          })
          .catch(() => {
            nav('/notfound')
          })
      } else {
        // url is malformed
        console.error("The event code in the URL doesn't exist")
        nav('/notfound')
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <LoadingAnim />
      </div>
    )
  }

  return (
    <>
    <div className="flex justify-center items-center mx-4 mb-4 md:mx-10 md:mb-10">
        <div className="flex flex-col-reverse justify-center w-[100%] md:px-8 md:flex-row md:space-x-7 lg:space-x-15 xl:space-x-25">
          <div className="flex flex-col flex-none md:w-[48%] mb-4 md:mt-0 space-y-5 items-center">
            <div className="w-[100%] content-start align-start items-start">
              {/* Edit availability button */}

              <div className="hidden md:block flex flex-row ml-0 md:ml-4">
                <div className="flex-grow">
                  <button
                      className="font-bold text-white bg-blue-500 rounded-full bg-blue-500 text-white py-3 px-5 text-md w-fit transform transition-transform drop-shadow-sm hover:scale-90 active:scale-100e disabled:bg-gray-500 disabled:opacity-70"
                      disabled={selectedDateTimeObjects != undefined}
                      onClick={() => {
                        nav('/timeselect/' + code)
                      }}
                    >
                    <span className="mr-1">&#8592;</span> Edit Your Availiability
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col content-center space-y-5 md:w-[75%] flex-none mb-5 md:mt-0">
              {/* Event name, location, and time */}

              <div className="hidden mb-4 flex flex-col space-y-5 md:block">
                <h3 className="text-3xl font-bold text-center md:text-left">
                  {eventName}
                </h3>
                <h3 className="text-xl text-center md:text-left">
                  {eventDescription}
                </h3>

                {/* {selectedDateTimeObjects ? (
                  <div className="">
                    <AddToGoogleCalendarButton />
                  </div>
                ) : undefined} */}

                <div className="flex flex-col">
                  <h3 className="text-base text-center md:text-left">
                    <span className="font-bold">Time:</span>{' '}
                    {selectedDateTimeObjects !== undefined
                      ? selectedDateTimeObjects[0]?.toLocaleDateString('en-us', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        }) +
                        ' — ' +
                        selectedDateTimeObjects[1]?.toLocaleTimeString('en-us', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })
                      : 'not selected by host'}
                  </h3>

                  {locationOptions.length > 0 && (
                    <h3 className="text-base text-center md:text-left">
                      <span className="font-bold">Location:</span>{' '}
                      {selectedLocation !== undefined
                        ? selectedLocation
                        : 'not selected by host'}
                    </h3>
                  )}
                  {getZoomLink() && (
                    <h3 className="text-base text-center md:text-left">
                      <span className="font-bold">Zoom Link:</span>{' '}
                      <a 
                        href={getZoomLink()} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-block text-left w-full md:w-auto break-all text-blue-500 underline"
                      >
                        {getZoomLink()}
                      </a>
                    </h3>
                  )}
                </div>
              </div>
            <div className="">
              <UserChart
                // @ts-expect-error
                chartedUsersData={[chartedUsers, setChartedUsers]}
                />
            </div>

            <LocationChart
              theSelectedLocation={[userChosenLocation, setUserChosenLocation]}
              locationOptions={
                locationOptions.length > 0 ? locationOptions : ['']
              }
              locationVotes={Object.values(locationVotes)}
              />
          </div>
          </div>

          <div className="max-w-[100%] lg:max-w-[50%] ">
            <div className="flex flex-col content-center flex-1 grow overflow-x-auto md:content-end">
              <Calender
                title={''}
                isAdmin={false}
                // @ts-expect-error
                theCalendarState={[calendarState, setCalendarState]}
                // @ts-expect-error
                theCalendarFramework={[calendarFramework, setCalendarFramework]}
                // @ts-expect-error
                chartedUsersData={[chartedUsers, setChartedUsers]}
                draggable={false}
                user={getCurrentUserIndex()}
                // @ts-expect-error
                theSelectedDate={[undefined, undefined]}
                // @ts-expect-error
                theDragState={[dragState, setDragState]}
                // @ts-expect-error
                theGoogleCalendarEvents={[undefined, undefined]}
              />
            </div>
            <div className="pl-3">
              {selectedDateTimeObjects != undefined && (
                <InformationPopup
                  content={
                    'NOTE: Admin has selected a time, so you cannot edit your availability'
                  }
                />
              )}
            </div>
            <div className="flex justify-center items-center mt-1">
              {selectedDateTimeObjects ? (
                <div className="flex justify-center items-center px-4">
                  <AddToGoogleCalendarButton />
                </div>
                  ) : undefined}
            </div>
          </div>

          <div className="md:hidden flex flex-col flex-none mb-5 items-center">
            {/* (Mobile): Event name, location, and time */}
            <div className="w-[100%] content-start align-start items-start">
              <div className="flex flex-row ml-0 md:ml-4">
                <div className="flex-grow ml-2">
                  <button
                      className="font-bold text-white bg-blue-500 rounded-full bg-blue-500 text-white py-2 px-4 text-sm w-fit transform transition-transform drop-shadow-sm hover:scale-90 active:scale-100e disabled:bg-gray-500 disabled:opacity-70"
                      disabled={selectedDateTimeObjects != undefined}
                      onClick={() => {
                        nav('/timeselect/' + code)
                      }}
                    >
                    <span className="mr-1">&#8592;</span> Edit Your Availiability
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col content-center space-y-1 w-[80%] flex-none mb-5 md:mt-0">
              <div className="mb-4 flex flex-col space-y-2 mt-4">
                <h3 className="text-2xl font-bold text-center mb-0">
                  {eventName}
                </h3>
                <h3 className="text-md text-left mt-0">
                  {eventDescription}
                </h3>

                {selectedDateTimeObjects ? (
                  <div className="flex items-center justify-center">
                    <AddToGoogleCalendarButton />
                  </div>
                ) : undefined}

                <div className="flex flex-col">
                  <h3 className="text-base text-center">
                    <span className="font-bold">Time:</span>{' '}
                    {selectedDateTimeObjects?.[0] !== undefined
                      ? selectedDateTimeObjects[0].toLocaleDateString('en-us', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'not yet selected by host'}
                  </h3>

                  {locationOptions.length > 0 && (
                    <h3 className="text-base text-center md:text-left">
                      <span className="font-bold">Location: </span>{' '}
                      {selectedLocation !== undefined
                        ? selectedLocation
                        : 'not yet selected by host'}
                    </h3>
                  )}
                  {getZoomLink() && (
                    <h3 className="text-base text-center md:text-left">
                      <span className="font-bold">Zoom Link:</span>{' '}
                      <a 
                        href={getZoomLink()} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-block text-left w-full md:w-auto break-all text-blue-500 underline"
                      >
                        {getZoomLink()}
                      </a>
                    </h3>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      {/* <div className="flex justify-center items-center">
        <div className="flex flex-col-reverse justify-center w-[90%] px-8 md:flex-row md:space-x-7 lg:space-x-20 xl:space-x-30">
          <div className="flex flex-col content-center space-y-7 flex-none md:w-[32%] mb-5 md:content-start md:mt-0">
            <Button
              bgColor="blue-500"
              textColor="white"
              disabled={selectedDateTimeObjects != undefined}
              onClick={() => {
                nav('/timeselect/' + code)
              }}
            >
              <span className="mr-1">&#8592;</span> Edit Your Availiability
            </Button>
             {selectedDateTimeObjects != undefined && <div className="p-1 w-[80%] text-gray-500 text-left text-sm md:text-left">
                            NOTE: Admin has selected a time, so you cannot edit your availability
                        </div>
                        } 

            <div className="hidden mb-4 flex flex-col space-y-5 md:block">
              <h3 className="text-3xl font-bold text-center md:text-left">
                {eventName}
              </h3>
              <h3 className="text-xl text-center md:text-left">
                {eventDescription}
              </h3>

              {selectedDateTimeObjects ? (
                <div className="">
                  <AddToGoogleCalendarButton />
                </div>
              ) : undefined}

              <div className="flex flex-col">
                <h3 className="text-base text-center md:text-left">
                  <span className="font-bold">Time:</span>{' '}
                  {selectedDateTimeObjects !== undefined
                    ? selectedDateTimeObjects[0]?.toLocaleDateString('en-us', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      }) +
                      ' — ' +
                      selectedDateTimeObjects[1]?.toLocaleTimeString('en-us', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                    : 'not selected'}
                </h3>

                {locationOptions.length > 0 && (
                  <h3 className="text-base text-center md:text-left">
                    <span className="font-bold">Location:</span>{' '}
                    {selectedLocation !== undefined
                      ? selectedLocation
                      : 'not selected'}
                  </h3>
                )}
              </div>
            </div>

            <UserChart
              // @ts-expect-error
              chartedUsersData={[chartedUsers, setChartedUsers]}
            />

            <LocationChart
              theSelectedLocation={[userChosenLocation, setUserChosenLocation]}
              locationOptions={
                locationOptions.length > 0 ? locationOptions : ['']
              }
              locationVotes={Object.values(locationVotes)}
            />
          </div>

          <div className="max-w-[100%] lg:max-w-[50%] ">
            <div className="flex flex-col content-center flex-1 grow overflow-x-auto md:content-end pl-4">
              <Calender
                title={''}
                isAdmin={false}
                // @ts-expect-error
                theCalendarState={[calendarState, setCalendarState]}
                // @ts-expect-error
                theCalendarFramework={[calendarFramework, setCalendarFramework]}
                // @ts-expect-error
                chartedUsersData={[chartedUsers, setChartedUsers]}
                draggable={false}
                user={getCurrentUserIndex()}
                // @ts-expect-error
                theSelectedDate={[undefined, undefined]}
                // @ts-expect-error
                theDragState={[dragState, setDragState]}
                // @ts-expect-error
                theGoogleCalendarEvents={[undefined, undefined]}
              />
            </div>
            <div className="ml-7">
              {selectedDateTimeObjects != undefined && (
                <InformationPopup
                  content={
                    'NOTE: Admin has selected a time, so you cannot edit your availability'
                  }
                />
              )}
            </div>
          </div>

          <div className="md:hidden">
             (Mobile): Event name, location, and time 

            <div className="mb-4 flex flex-col space-y-5 mt-4">
              <h3 className="text-3xl font-bold text-center md:text-left">
                {eventName}
              </h3>
              <h3 className="text-xl text-center md:text-left">
                {eventDescription}
              </h3>

              {selectedDateTimeObjects ? (
                <div className="flex items-center justify-center">
                  <AddToGoogleCalendarButton />
                </div>
              ) : undefined}

              <div className="flex flex-col">
                <h3 className="text-base text-center md:text-left">
                  <span className="font-bold">Time:</span>{' '}
                  {selectedDateTimeObjects?.[0] !== undefined
                    ? selectedDateTimeObjects[0].toLocaleDateString('en-us', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'not selected'}
                </h3>

                {locationOptions.length > 0 && (
                  <h3 className="text-base text-center md:text-left">
                    <span className="font-bold">Location: </span>{' '}
                    {selectedLocation !== undefined
                      ? selectedLocation
                      : 'not selected!'}
                  </h3>
                )}
                {getZoomLink() && (
                  <h3 className="text-base text-center md:text-left">
                    <span className="font-bold">Zoom Link:</span>{' '}
                    {getZoomLink()}
                  </h3>
                )}
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </>
  )
}
