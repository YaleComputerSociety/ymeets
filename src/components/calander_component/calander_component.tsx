import * as React from "react";
import './calander_component.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import CircleComponent from "../circle_component";

import { useState } from "react";

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

    return (
        <div className="App">
            <Calendar 
            prev2Label={null} 
            next2Label={null} 
            selectRange={false} 
            showNeighboringMonth={false} 
            minDetail="month" 
            tileContent={({ activeStartDate, date, view }) => <CircleComponent date={date} add={addDay} remove={removeDay} selectedDays={selectedDays} />}
            navigationLabel={({ date, label, locale, view }) => date.toLocaleString('default', { month: 'long' })}
            onChange={() => {console.log(selectedDays)}}
        />
        </div>
    );
}