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
  const [selectedTime, setSelectedTime] = useState<string>("N/A"); 

  //STUFF FOR HANDLING TIME SELECT ------------------------------
    const [draggedBlocks, setDraggedBlocks] = useState<{ blockID: number; columnID: number }[]>([]);
    useEffect(() => {
      console.log("Dragged over Blocks:", draggedBlocks);
      const times = logTimeIntervals(calendarFramework.startDate.getHours(), draggedBlocks);
      setSelectedTime(times);


      // ... other logic based on the latest state
    }, [draggedBlocks]);
  
    const handleDragOverBlock = (blockID: number, columnID: number) => {
      setDraggedBlocks(prev => {
        const existingIndex = prev.findIndex(item => item.blockID === blockID && item.columnID === columnID);
  
        if (existingIndex === -1) {
          // Block is not in the list, add it
          return [...prev, { blockID, columnID }];
        } else {
          // Block is already in the list, remove it
          return prev.filter((_, index) => index !== existingIndex);
        }
      });
    };

  
  //------------------------------------------------------------
    const [calendarFramework, setCalendarFramework] = theCalendarFramework;
    
    console.log("HOURS" + calendarFramework.startDate.getHours() + " " + calendarFramework.endDate.getHours());

    function logTimeIntervals(startTime: number, draggedBlocks: {blockID:number;columnID:number}[] ) {
      if (draggedBlocks.length === 0) {
        console.log("No blocks selected");
        return "No blocks selected";
      }
    
      // Check if all blocks have the same columnID
      const isSameColumn = draggedBlocks.every(block => block.columnID === draggedBlocks[0].columnID);
    
      // Check if blocks are continuous
      const areContinuous = draggedBlocks.every((block, index) => index === 0 || block.blockID === draggedBlocks[index - 1].blockID + 1);
    
      if (!isSameColumn || !areContinuous) {
        console.log("Invalid time");
        return "Invalid time";
      }
    
      // Calculate the time interval in minutes
      const maxBlockID = Math.max(...draggedBlocks.map(block => block.blockID));
      const minBlockID = Math.min(...draggedBlocks.map(block => block.blockID));
      const startMinutes = ((15 * minBlockID) % 60).toString().padStart(2, '0');
      const endMinutes = ((15 * (maxBlockID + 1)) % 60).toString().padStart(2, '0');
      const startHours = Math.floor((15 * minBlockID)/60);
      const endHours =  Math.floor((15 * (maxBlockID+1))/60);
      
      console.log(`${startTime+startHours}:${startMinutes} - ${startTime+endHours}:${endMinutes}`)
    
      return `${startTime+startHours}:${startMinutes} - ${startTime+endHours}:${endMinutes}`;
    }
    const [calendarState, setCalendarState] = theCalendarState;
    let columnIndexOffset = 0
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
                                startDate={calendarFramework.startDate}
                                endDate={calendarFramework.endDate}
                            />
                            {
                                calendarFramework.dates.map((bucket, index) => {

                                  if (index != 0) {
                                    let prev_bucket = calendarFramework.dates[index - 1]
                                    columnIndexOffset += prev_bucket.length
                                }
                                    
                                  return <SelectCalander 
                                    theCalendarState={[calendarState, setCalendarState]}
                                    bucket={bucket}
                                    theCalendarFramework={[calendarFramework, setCalendarFramework]}
                                    draggable={true}
                                    isAdmin={isAdmin}
                                    key={index}
                                    columnIndexOffset={columnIndexOffset}
                                    onDragOverBlock={(blockID, columnID) => handleDragOverBlock(blockID, columnID)}                  
                              />
            
                                    
                                }) 
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