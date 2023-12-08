import * as React from "react";
import { useState } from 'react';
import './day_select_component.css';
import CalanderComponent from '../calander_component';
import frontendEventAPI from "../../../eventAPI";
import { getAccountId, getAccountName } from "../../../firebase/events";
import { EventDetails } from "../../../types";
import { useNavigate } from "react-router-dom";
import LocationSelectionComponent from "../../schedulee/locationSelectionComponent"

export const DaySelectComponent = () => {
    const [eventName, setEventName] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState([]);
    const [popUpMessage, setPopupMessage] = useState("");
    const [popUpIsOpen, setPopupIsOpen] = useState(false);
    const [locations, updateLocationsState] = useState([]);
    const [locationField, setLocationField] = useState("");

    const showAlert = (message: string) => {
        setPopupMessage(message);
        setPopupIsOpen(true);
      };

    const navigate = useNavigate();

    const updateLocations = (values: any) => {
        console.log(values);
        updateLocationsState(values);
    }

    const removeAndUpdateLocations = (toRemove: any) => {
        return () => {
            const tmp_locations: any = [];
            for (let i = 0; i < locations.length; i++) {
                if (locations[i] != toRemove) {
                    tmp_locations.push(locations[i]);
                }
            }
            updateLocationsState(tmp_locations);
        }
    }

    return (
        <div className="flex flex-col md:flex-row w-[80%] xl:w-[56%] mx-auto pt-32 px-2 text-center">
            <div className="flex flex-col justify-left items-center w-[100%] md:w-[80%] md:space-y-7 space-y-2 mb-8">
                <div className="w-[100%]">
                    <input
                        id="event-name"
                        type="text"
                        className="flex justify-left p-3 px-4 text-base w-[80%] border"
                        placeholder="Event Name"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                    />
                </div>
                <div className="w-[100%]">
                    <input
                        id="event-description"
                        style={{resize: "none"}}
                        className="flex justify-left p-3 px-4 text-base w-[80%] border"
                        placeholder="Event Description (Optional)"
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                    />
                </div>
                <div className="w-[100%]">
                    <input
                        id="event-description"
                        style={{resize: "none"}}
                        className="flex justify-left p-3 px-4 text-base w-[80%] border"
                        placeholder="Add Location Options"
                        value={locationField}
                        onChange={(e) => setLocationField(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key == 'Enter') {
                                const tmp_locations: any = locations;
                                tmp_locations.push(locationField);
                                setLocationField("");
                                updateLocationsState(tmp_locations);
                            }
                        }}
                    />
                    {/* <select id="event-location" className="flex justify-left border p-3 px-4 text-base w-[80%]">
                        <option value="bass">No Location</option>
                        <option value="sterling">Sterling Library</option>
                        <option value="tsai">Tsai City</option>
                        <option value="CEID">Bass Library</option>
                    </select> */}
                </div>
                
                <div className="w-[100%]">
                    <div className="p-1 w-[80%] text-gray-500 text-left text-sm">
                        Click ENTER after typing a location to add an option for participants
                    </div>
                </div>

                <div className="flex flex-col justify-left items-center w-[100%] space-y-3">
                {locations.map((location, index) => (
                    <div className="flex justify-left w-[100%]">
                        <div className="location-selection-option flex justify-between items-center w-[80%] px-3 h-10">
                            <div>{location}</div>
                            <div>
                                <button onClick={removeAndUpdateLocations(location)} className="w-[30%]">&times;</button>
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            </div>

            <CalanderComponent 
                theEventName={[eventName, setEventName]}
                selectedStartDate={[startDate, setStartDate]}
                selectedEndDate={[endDate, setEndDate]}
                // @ts-ignore
                theSelectedDates={[selectedDates, setSelectedDates]}
                popUpOpen={[popUpIsOpen, setPopupIsOpen]}
                popUpMessage={[popUpMessage, setPopupMessage]}
            />
            
            <div className="next-button-wrapper">
                <button className='nextbuttondaysel' onClick={() => {

            
                    if (selectedDates.length == 0) {
                        showAlert('Make sure to enter dates!');
                        return;
                    }

                    if (startDate.getHours() === 0 && startDate.getMinutes() === 0 && startDate.getSeconds() === 0 &&
                    endDate.getHours() === 0 && endDate.getMinutes() === 0 && endDate.getSeconds() === 0) {            
                        showAlert('Make sure to enter times!');
                        return;
                    }

                    if (startDate >= endDate) {
                        showAlert('Make sure your end time is after your start time!');
                        return;
                    }

                    // Optional; backend supports an empty string for name
                    if (eventName.length == 0) {
                        showAlert('Make sure to name your event!');
                        return;
                    }

                    console.log("the dates1 " + selectedDates);
                    console.log("start date1 " + startDate);
                    console.log("end date1 " + endDate);
                         
                    frontendEventAPI.createNewEvent(
                        eventName,
                        eventDescription,
                        // @ts-ignore
                        getAccountName(), // admin name
                        getAccountId(), // admin ID
                        selectedDates,
                        [], // plaus locs
                        startDate,
                        endDate
                    ).then((ev) => {
                        navigate("/timeselect/" + ev?.publicId)
                    })
                }}>Next</button>
            </div>
        </div>

    );
}