import { checkIfAdmin, getEventOnPageload } from '../../backend/events';
import GroupViewPage from './GroupViewPage';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { calendarState, calendarDimensions, userData } from '../../types';
/**
 *
 * Determines which Group View to render depending on if an admin is logged in or not.
 *
 * @returns Page Component
 */
export default function ConditionalGroupViewRenderer({
  toggleEditing,
  calendarState,
  setCalendarState,
  calendarFramework,
  setCalendarFramework,
  code,
  chartedUsers,
  setChartedUsers,
  eventName,
  eventDescription,
  locationVotes,
  locationOptions,
  adminChosenLocation,
  loading,
  allPeople,
  declinedPeople,
  peopleStatus,
  setPeopleStatus,
  allUsers,
  userHasFilled,
}: {
  isEditing: boolean;
  toggleEditing: () => void;
  calendarState: calendarState;
  setCalendarState: Dispatch<SetStateAction<calendarState>>;
  calendarFramework: calendarDimensions;
  setCalendarFramework: Dispatch<SetStateAction<calendarDimensions>>;
  code: string | undefined;
  chartedUsers: userData;
  setChartedUsers: Dispatch<SetStateAction<userData>>;
  eventName: string;
  eventDescription: string;
  locationVotes: any;
  locationOptions: string[];
  adminChosenLocation: string | undefined;
  loading: boolean;
  allPeople: string[];
  declinedPeople: string[];
  peopleStatus: { [key: string]: boolean };
  setPeopleStatus: Dispatch<SetStateAction<{ [key: string]: boolean }>>;
  allUsers: userData;
  userHasFilled: boolean;
}) {
  const [isAdmin, setIsAdmin] = useState(checkIfAdmin());

  useEffect(() => {
    if (code !== undefined) {
      getEventOnPageload(code)
        .then(() => {
          setIsAdmin(checkIfAdmin());
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      alert('code is missing');
    }
  }, []);

  return (
    <GroupViewPage
      isAdmin={isAdmin}
      isEditing={false}
      toggleEditing={toggleEditing}
      calendarState={calendarState}
      setCalendarState={setCalendarState}
      calendarFramework={calendarFramework}
      setCalendarFramework={setCalendarFramework}
      code={code}
      chartedUsers={chartedUsers}
      setChartedUsers={setChartedUsers}
      eventName={eventName}
      eventDescription={eventDescription}
      locationVotes={locationVotes}
      locationOptions={locationOptions}
      adminChosenLocation={adminChosenLocation}
      loading={loading}
      allPeople={allPeople}
      declinedPeople={declinedPeople}
      peopleStatus={peopleStatus}
      setPeopleStatus={setPeopleStatus}
      allUsers={allUsers}
      userHasFilled={userHasFilled}
    />
  );
}
