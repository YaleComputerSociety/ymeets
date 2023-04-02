import * as React from "react";
import './calander_component.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import CircleComponent from "../circle_component";
import TimeSelectComponent from "../time_select_component";

import { useState } from "react";
import { createEvent } from "../../../firebase/events";

export const CalanderComponent = () => {
    const arr1 : any[] = []
    const [selectedDays, updateDays] = useState(arr1);

    const addDay = (date:any) => {
        const arr = [
            ...selectedDays, [date.getFullYear(), date.getMonth(), date.getDate()]
        ]
        updateDays(arr)
    }

    const removeDay = (date:any) => {
        const arr = selectedDays.filter((obj) => obj[0] !== date.getFullYear() || obj[1] !== date.getMonth() || obj[2] !== date.getDate());
        updateDays(arr)
    }

    const [startTime, updateStartTime] = useState(0)

    const handleUpdateStartTime = (time:any) => {
        updateStartTime(time)
    }

    const [endTime, updateEndTime] = useState(0)

    const handleUpdateEndTime = (time:any) => {
        updateEndTime(time)
    }

    const [eventName, updateEventName] = useState("")

    const handleUpdateEventName = (name:any) => {
        updateEventName(name)
    }

    return (
        <div className="calendar-wrapper">
            <div className='calendar-event-name-wrapper'>
                <input placeholder="Name your event..." type="text" value={eventName} onChange={(event) => handleUpdateEventName(event.target.value)} />
            </div>
            <Calendar 
            prev2Label={null} 
            next2Label={null} 
            selectRange={false} 
            showNeighboringMonth={false} 
            minDetail="month" 
            tileContent={({ activeStartDate, date, view }) => <CircleComponent date={date} add={addDay} remove={removeDay} selectedDays={selectedDays} />}
            navigationLabel={({ date, label, locale, view }) => date.toLocaleString('default', { month: 'long' })}
            />
            <TimeSelectComponent updateStart={handleUpdateStartTime} updateEnd={handleUpdateEndTime} />
            <div className='next-button-wrapper'>
                <button onClick={() => {
                    if (startTime >= endTime) {
                        alert('Make sure your end time is after your start time!');
                        return;
                    }
                    if (eventName.length == 0) {
                        alert('Make sure to name your event!');
                        return;
                    }

                    createEvent({
                        details: {
                        name: eventName,
                        dates: selectedDays,
                        startTime: startTime,
                        endTime: endTime,
                        location: "",
                    }})

                    console.log(selectedDays); 
                    console.log(startTime); 
                    console.log(endTime); 
                    console.log(eventName);
                }}>Next</button>
            </div>
        </div>
    );
}