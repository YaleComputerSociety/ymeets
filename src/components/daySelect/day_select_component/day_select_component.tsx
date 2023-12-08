import * as React from "react";
import { useState } from 'react';
import './day_select_component.css';
import CalanderComponent from '../calander_component';
import frontendEventAPI from "../../../eventAPI";
import { getAccountId, getAccountName } from "../../../firebase/events";
import { EventDetails } from "../../../types";
import { useNavigate } from "react-router-dom";

export const DaySelectComponent = () => {
    const [eventName, setEventName] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState([]);
    const [popUpMessage, setPopupMessage] = useState("");
    const [popUpIsOpen, setPopupIsOpen] = useState(false);

    const showAlert = (message: string) => {
        setPopupMessage(message);
        setPopupIsOpen(true);
      };

    const navigate = useNavigate();

    return (
        <div className="flex flex-col md:flex-row w-[93%] m-10 my-16 px-2 text-center">
            <div className="flex flex-col justify-center items-center w-[100%] md:w-[45%] md:space-y-7 space-y-2">
                <div className="w-[100%]">
                    <label htmlFor="event-name">Give your event a Title:</label>
                    <input
                        id="event-name"
                        type="text"
                        className="p-3 px-4 text-base w-[80%] border"
                        placeholder="Event Name"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                    />
                </div>
                <div className="w-[100%]">
                    <label htmlFor="event-description">Add a Description (Optional):</label>
                    <textarea
                        id="event-description"
                        style={{resize: "none"}}
                        className="p-3 px-4 text-base w-[80%] border"
                        placeholder="Description"
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                    />
                </div>
                <div className="w-[100%]">
                    <label htmlFor="event-location">Select a Location (Optional):</label>
                    <select id="event-location" className="border p-3 px-4 text-base w-[80%]">
                        <option value="bass">No Location</option>
                        <option value="sterling">Sterling Library</option>
                        <option value="tsai">Tsai City</option>
                        <option value="CEID">Bass Library</option>
                    </select>
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