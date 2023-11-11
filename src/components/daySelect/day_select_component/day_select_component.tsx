import * as React from "react";
import { useState } from 'react';
import './day_select_component.css';
import CalanderComponent from '../calander_component';

export const DaySelectComponent = () => {
    const [eventName, setEventName] = useState('');
    const [eventDescription, setEventDescription] = useState('');

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
            <CalanderComponent eventName={eventName}/>
        </div>

    );
}