import SelectCalander from "../scheduleComponents/calendarComponents/SelectCalendar";
import TimeColumn from "../scheduleComponents/calendarComponents/TimeColumn"
import { calendarDimensions, calanderState, userData } from "../scheduleComponents/scheduletypes";

import { getLocationsVotes } from "../../firebase/events"
import { setChosenLocation } from "../../firebase/events";
import { getChosenLocation } from "../../firebase/events";
import "../schedulee/groupviewpage/GroupViewApp.css";
import { useState, useEffect } from "react";

import eventAPI from "../../eventAPI";
import UserChart from "../scheduleComponents/hoverViewComponents/UserChart";

interface AdminCalProps {
    theCalendarFramework: [calendarDimensions, React.Dispatch<React.SetStateAction<calendarDimensions>>]
    theCalendarState: [calanderState, React.Dispatch<React.SetStateAction<calanderState>>]
    draggable : boolean
    isAdmin? : boolean
}

export default function AdminCal({theCalendarFramework, theCalendarState, draggable, isAdmin}: AdminCalProps) {

    const [calendarFramework, setCalendarFramework] = theCalendarFramework;
    const [calendarState, setCalendarState] = theCalendarState;
    const testData = eventAPI.getTestData();
    const [chartedUsers, setChartedUsers] = useState<userData>(
        testData.userData
      );

    let chosenLocation = getChosenLocation();
    if (typeof chosenLocation == 'undefined') {
      chosenLocation = "No selected location";
    }
    //useState for updating to the selected location (as Admin)
    const [selectedLocation, setSelectedLocation] = useState<string>(chosenLocation);
    //useState for updating the votes 
    const [votes, setVotes] = useState<{ [id: string]: number }>({});
    //useState for selecting time (as Admin)
    const [selectedTime, setSelectedTime] = useState<string>("N/A"); //TODO
    useEffect(() => {
        const locationsVotes = getLocationsVotes();
        setVotes(locationsVotes);
    }, []);
    
    //Called when saving
    const handleSaveChanges = () => {
      if (selectedLocation !== "No selected location") {
        setChosenLocation(selectedLocation);
      }
    };
    //Save changes button (only renders for admins)
    const saveChangesButton = isAdmin ? (
      <button className="save-button" onClick={handleSaveChanges}>
        Save Changes
      </button>
    ) : null;

    
    //Location:Votes table
    const locationToVotesTable = (
      <div className="grid col-start-2 col-span-1">
        <div className="table-container">
          <div className="selected-textbox">
              <p>Selected Time: {selectedTime}</p>        
            </div>
          <div className="selected-textbox">
            <p>Selected Location: {selectedLocation}</p>
          </div>
          <table className="small-table">
            <thead>
              <tr>
                <th>Location</th>
                <th>Votes</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(votes).map((location) => (
                <tr key={location} onClick={() => {
                  if (isAdmin) {
                    setSelectedLocation(location);
                  }
                }
                }>
                  <td>{location}</td>
                  <td>{votes[location]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
    return (
        <>
            <p className="text-4xl m-5 mb-1 font-bold">
                Group Availibility - Admin
            </p>
            
            
            <div style={{width: "100vw"}}className="grid grid-cols-2 grid-rows-1 font-roboto">
                <div className="grid col-start-1 col-span-1">
                    <div className="border border-1 border-gray-600 m-5">
                        <div className="flex">
                            <TimeColumn     
                                startTime={calendarFramework.startTime}
                                endTime={calendarFramework.endTime}
                            />
                            {
                                Object.keys(calendarFramework.dates).map((theDate) =>
                                    <SelectCalander 
                                        theCalendarState={[calendarState, setCalendarState]}
                                        date={theDate}
                                        theCalendarFramework={[calendarFramework, setCalendarFramework]}
                                        chartedUsersData={[chartedUsers, setChartedUsers]}
                                        draggable={draggable}
                                        isAdmin={isAdmin}
                                    />
                                ) 
                            }
                        
                        </div>

                    </div>
                </div>
                {locationToVotesTable}
                {saveChangesButton}
                <div className="grid col-start-2 col-span-1">
                    <UserChart chartedUsersData={[chartedUsers, setChartedUsers]} />
                </div>
            </div>
            
        </>
    )


}