import {
  calandarDate,
  calendarDimensions,
  calanderState,
  userData,
} from '../../types';
import { calendar_v3 } from 'googleapis';
import CalBlock from './CalBlock';
import { dragProperties } from './CalendarApp';
import { dateObjectToComparable } from '../utils/functions/dateObjecToComparable';
import { isTimeBetweenDates } from '../utils/functions/isTimeBetweenDates';

interface CalRowProps {
  bucket: calandarDate[];
  theCalendarState: [
    calanderState,
    React.Dispatch<React.SetStateAction<calanderState>>,
  ];
  draggable: boolean;
  isAdmin?: boolean;
  chartedUsersData:
    | [userData, React.Dispatch<React.SetStateAction<userData>>]
    | undefined;
  user: number;
  columnIndexOffSet: number;
  blockID: number;
  is30Minute: boolean;
  theDragState: [
    dragProperties,
    React.Dispatch<React.SetStateAction<dragProperties>>,
  ];
  theCalendarFramework: [
    calendarDimensions,
    React.Dispatch<React.SetStateAction<calendarDimensions>>,
  ];

  borderStyle?: string;
  theGoogleCalendarEvents:
    | [
        calendar_v3.Schema$Event[],
        React.Dispatch<React.SetStateAction<calendar_v3.Schema$Event[]>>,
      ]
    | undefined;
  time: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  theShowUserChart:
    | [boolean, React.Dispatch<React.SetStateAction<boolean>>]
    | undefined;
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
  theGoogleCalendarEvents,
  time,
  theShowUserChart,
  onClick,
}: CalRowProps) {
  const [googleCalendarEvents, setGoogleCalendarEvents] =
    theGoogleCalendarEvents || [];

  return (
    <div className={`grid grid-cols-${bucket.length}`}>
      {bucket.map((d: calandarDate, columnIndex: number) => {
        const matchedDates = googleCalendarEvents
          ?.map((gEvent: calendar_v3.Schema$Event) => {
            if (gEvent?.start?.dateTime && gEvent?.end?.dateTime) {
              return [
                new Date(gEvent.start.dateTime),
                new Date(gEvent.end.dateTime),
              ];
            }
            return null;
          })
          ?.filter(
            (dates: Date[] | null) =>
              dates !== null &&
              dateObjectToComparable(dates[0]) ===
                dateObjectToComparable(d.date)
          )
          ?.filter(
            (dates: Date[] | null) =>
              dates !== null &&
              dateObjectToComparable(dates[0]) ===
                dateObjectToComparable(d.date)
          );

        const isOnGcal = matchedDates?.some((dateRange) =>
          isTimeBetweenDates(dateRange?.[0], dateRange?.[1], time)
        );

        const matchedEvents = googleCalendarEvents?.filter(
          (gEvent: calendar_v3.Schema$Event) =>
            gEvent?.start?.dateTime &&
            dateObjectToComparable(new Date(gEvent.start.dateTime)) ===
              dateObjectToComparable(d.date)
        );

        const surroundingEvents = matchedEvents?.filter(
          (gEvent: calendar_v3.Schema$Event) =>
            gEvent?.start?.dateTime &&
            gEvent?.end?.dateTime &&
            isTimeBetweenDates(
              new Date(gEvent?.start?.dateTime),
              new Date(gEvent?.end?.dateTime),
              time
            )
        );

        return (
          // <div key={columnIndex}>hi</div>
          <CalBlock
            theShowUserChart={theShowUserChart}
            onClick={onClick}
            theCalendarFramework={theCalendarFramework}
            is30Minute={is30Minute}
            theCalendarState={theCalendarState}
            blockID={blockID}
            columnID={columnIndex + columnIndexOffSet}
            isAdmin={isAdmin}
            draggable={draggable}
            user={user}
            theDragState={theDragState}
            key={columnIndex + columnIndexOffSet}
            chartedUsersData={chartedUsersData}
            isOnGcal={isOnGcal === undefined ? false : isOnGcal}
            associatedEvents={surroundingEvents}
          />
        );
      })}
    </div>
  );
}
