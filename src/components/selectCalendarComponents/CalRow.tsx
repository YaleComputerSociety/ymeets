import {
  calandarDate,
  calendarDimensions,
  calanderState,
  userData,
} from '../../types'
import CalBlock from './CalBlock'
import { dragProperties } from './CalendarApp'
import { dateObjectToComparable } from '../utils/functions/dateObjecToComparable'
import { dateObjectToHHMM } from '../utils/functions/dateObjecToHHMM'
import { isTimeBetweenDates } from '../utils/functions/isTimeBetweenDates'
import { useState } from 'react'

interface CalRowProps {
  bucket: calandarDate[]
  theCalendarState:
    | [calanderState, React.Dispatch<React.SetStateAction<calanderState>>]
    | undefined
  draggable: boolean
  isAdmin?: boolean
  chartedUsersData:
    | [userData, React.Dispatch<React.SetStateAction<userData>>]
    | undefined
  user: number
  columnIndexOffSet: number
  blockID: number
  is30Minute: boolean
  theDragState: [
    dragProperties,
    React.Dispatch<React.SetStateAction<dragProperties>>,
  ]
  theCalendarFramework:
    | [
        calendarDimensions,
        React.Dispatch<React.SetStateAction<calendarDimensions>>,
      ]
    | undefined
  borderStyle?: string // can be "dotted", "solid", "double", "none" ; default is "solid", affects border bottom
  theSelectedDate:
    | [calandarDate, React.Dispatch<React.SetStateAction<calandarDate>>]
    | undefined
  theGoogleCalendarEvents: [any, React.Dispatch<React.SetStateAction<any>>]
  time: string
}

export default function CalRow({
  bucket,
  theCalendarState,
  isAdmin,
  draggable,
  user,
  columnIndexOffSet,
  theCalendarFramework,
  blockID,
  is30Minute,
  theDragState,
  chartedUsersData,
  borderStyle,
  theSelectedDate,
  theGoogleCalendarEvents,
  time,
}: CalRowProps) {
  const [googleCalendarEvents, setGoogleCalendarEvents] =
    theGoogleCalendarEvents

  return (
    <div
      className={`flex flex-row 
                       `}
    >
      {bucket.map((d: calandarDate, columnIndex) => {
        const matchedDates = googleCalendarEvents
          .map((gEvent: any) => [
            new Date(gEvent.start.dateTime),
            new Date(gEvent.end.dateTime),
          ])
          ?.filter(
            (dates: any) =>
              dateObjectToComparable(dates[0]) ===
              dateObjectToComparable(d.date)
          )
        // @ts-expect-error
        const isOnGcal = matchedDates?.some((dateRange) =>
          isTimeBetweenDates(dateRange[0], dateRange[1], time)
        )

        const matchedEvents = googleCalendarEvents.filter(
          (gEvent: any) =>
            dateObjectToComparable(new Date(gEvent.start.dateTime)) ===
            dateObjectToComparable(d.date)
        )

        const surroundingEvents = matchedEvents.filter((gEvent: any) =>
          isTimeBetweenDates(
            new Date(gEvent.start.dateTime),
            new Date(gEvent.end.dateTime),
            time
          )
        )

        return (
          <CalBlock
            theCalendarFramework={theCalendarFramework}
            is30Minute={is30Minute}
            theCalendarState={theCalendarState}
            blockID={blockID}
            columnID={columnIndex + columnIndexOffSet}
            isAdmin={isAdmin}
            draggable={draggable}
            user={user}
            theDragState={theDragState}
            key={columnIndex}
            chartedUsersData={chartedUsersData}
            theSelectedDate={theSelectedDate}
            isOnGcal={isOnGcal}
            associatedEvents={surroundingEvents}
          />
        )
      })}
    </div>
  )
}
