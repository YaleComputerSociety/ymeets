import * as React from "react";
import { useState } from 'react';
import './day_select_component.css';
import CalanderComponent from '../calander_component';

export const DaySelectComponent = () => {
    const [eventName, setEventName] = useState('');
    const [eventDescription, setEventDescription] = useState('');

    return (
        <div className="App flex flex-col md:flex-row w-[93%] m-10 my-16 px-2">
            <div className="w-[100%] md:w-[45%]">
                <div className="md:w-[100%] md:m-8 m-3">
                    <input
                        type="text"
                        className="p-2 px-4 rounded-full text-base w-[80%] h-11 md:h-16 mx-auto border"
                        placeholder="Event Name"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                    />
                </div>
                <div className="md:w-[100%] md:m-8 m-3">
                    <input
                        type="text"
                        className="p-2 px-4 text-base w-[100%] md:w-[80%] h-16 md:h-32 mx-auto border"
                        placeholder="Description"
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                    />
                </div>
                <div className="md:w-[90%] m-6 md:m-8 border">
                    <div className="text-center max-h-[120px] md:max-h-none">
                        Location preferences come here 
                        Location preferences come here 
                        Location preferences come here 
                    </div>
                </div>
            </div>
        <CalanderComponent eventName={eventName}/>
        </div>

    );
}