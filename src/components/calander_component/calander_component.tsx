import * as React from "react";
import './calander_component.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export const CalanderComponent = () => {
    return (
        <div className="App">
            <Calendar 
            prev2Label={null} 
            next2Label={null} 
            selectRange={true} 
            showNeighboringMonth={false} 
            minDetail="month" 
            onChange={(value: any, event: any) => alert('Clicked day: ' + value)} 
            tileContent={({ activeStartDate, date, view }) => <div className="circle">{date.getDate()}</div>}
            navigationLabel={({ date, label, locale, view }) => date.toLocaleString('default', { month: 'long' })}
        />
        </div>
    );
}