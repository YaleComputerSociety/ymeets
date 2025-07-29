import { checkIfAdmin, getEventOnPageload } from '../../backend/events';
import GroupViewPage from './GroupViewPage';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { calanderState, calendarDimensions, userData } from '../../types';
/**
 *
 * Determines which Group View to render depending on if an admin is logged in or not.
 *
 * @returns Page Component
 */
export default function ConditionalGroupViewRenderer({
  isEditing,
  toggleEditing,
  calendarState,
  setCalendarState,
  calendarFramework,
  setCalendarFramework,
  code,
  chartedUsers,
  setChartedUsers,
  eventName,
  setEventName,
  eventDescription,
  setEventDescription,
  locationVotes,
  setLocationVotes,
  locationOptions,
  setLocationOptions,
  adminChosenLocation,
  setAdminChosenLocation,
  loading,
  setLoading,
  allPeople,
  setAllPeople,
  peopleStatus,
  setPeopleStatus,
  allUsers,
  setAllUsers,
  userHasFilled,
  setUserHasFilled,
}: {
  isEditing: boolean;
  toggleEditing: () => void;
  calendarState: calanderState;
  setCalendarState: Dispatch<SetStateAction<calanderState>>;
  calendarFramework: calendarDimensions;
  setCalendarFramework: Dispatch<SetStateAction<calendarDimensions>>;
  code: string | undefined;
  chartedUsers: userData;
  setChartedUsers: Dispatch<SetStateAction<userData>>;
  eventName: string;
  setEventName: Dispatch<SetStateAction<string>>;
  eventDescription: string;
  setEventDescription: Dispatch<SetStateAction<string>>;
  locationVotes: any;
  setLocationVotes: Dispatch<SetStateAction<any>>;
  locationOptions: string[];
  setLocationOptions: Dispatch<SetStateAction<string[]>>;
  adminChosenLocation: string | undefined;
  setAdminChosenLocation: Dispatch<SetStateAction<string | undefined>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  allPeople: string[];
  setAllPeople: Dispatch<SetStateAction<string[]>>;
  peopleStatus: { [key: string]: boolean };
  setPeopleStatus: Dispatch<SetStateAction<{ [key: string]: boolean }>>;
  allUsers: userData;
  setAllUsers: Dispatch<SetStateAction<userData>>;
  userHasFilled: boolean;
  setUserHasFilled: Dispatch<SetStateAction<boolean>>;
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
    <>
      {isAdmin ? (
        <div>
          <GroupViewPage
            isAdmin={true}
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
            setEventName={setEventName}
            eventDescription={eventDescription}
            setEventDescription={setEventDescription}
            locationVotes={locationVotes}
            setLocationVotes={setLocationVotes}
            locationOptions={locationOptions}
            setLocationOptions={setLocationOptions}
            adminChosenLocation={adminChosenLocation}
            setAdminChosenLocation={setAdminChosenLocation}
            loading={loading}
            setLoading={setLoading}
            allPeople={allPeople}
            setAllPeople={setAllPeople}
            peopleStatus={peopleStatus}
            setPeopleStatus={setPeopleStatus}
            allUsers={allUsers}
            setAllUsers={setAllUsers}
            userHasFilled={userHasFilled}
            setUserHasFilled={setUserHasFilled}
          />
        </div>
      ) : (
        <div>
          <GroupViewPage
            isAdmin={false}
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
            setEventName={setEventName}
            eventDescription={eventDescription}
            setEventDescription={setEventDescription}
            locationVotes={locationVotes}
            setLocationVotes={setLocationVotes}
            locationOptions={locationOptions}
            setLocationOptions={setLocationOptions}
            adminChosenLocation={adminChosenLocation}
            setAdminChosenLocation={setAdminChosenLocation}
            loading={loading}
            setLoading={setLoading}
            allPeople={allPeople}
            setAllPeople={setAllPeople}
            peopleStatus={peopleStatus}
            setPeopleStatus={setPeopleStatus}
            allUsers={allUsers}
            setAllUsers={setAllUsers}
            userHasFilled={userHasFilled}
            setUserHasFilled={setUserHasFilled}
          />
        </div>
      )}
    </>
  );
}
