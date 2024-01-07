import React from "react"
import Favicon from "react-favicon";

export default function CalendarIcon() {
    const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
    const currDate = new Date(Date.now())
    const currWeekDay = weekdays[currDate.getDay()]
    const currMonthDay = currDate.getDate().toString().padStart(2, '0')
    return (
        <div className="flex flex-row items-center">
            
            <svg width="45" 
                height="45" 
                viewBox="0 0 150 185" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg">
                <text x="45" y="95" fill="currentColor" fontSize="30" className="font-sans font-bold">{currWeekDay}</text>
                <text x="40" y="150" fill="currentColor" fontSize="60" className="font-sans font-bold">{currMonthDay}</text>
                <rect x="11" y="36" width="134" height="29" rx="5" fill="currentColor"/>
                <rect x="6" y="30" width="144" height="141" rx="14" stroke="currentColor" strokeWidth="12"/>
                <rect x="30.5" y="2.5" width="24" height="36" rx="7.5" fill="currentColor" stroke="white" strokeWidth="5"/>
                <rect x="99.5" y="2.5" width="24" height="36" rx="7.5" fill="currentColor" stroke="white" strokeWidth="5"/>
            </svg>
        </div>
    )
}

export function Favi() {
    const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const currDate = new Date(Date.now());
    const currWeekDay = weekdays[currDate.getDay()];
    const currMonthDay = currDate.getDate().toString();

    // SVG content with dynamic values
    const svgContent = `
    <svg width="45" 
    height="45" 
    viewBox="0 0 150 185" 
    fill="#0ea5e9"
    xmlns="http://www.w3.org/2000/svg">
    <rect x="11" y="36" width="134" height="29" rx="5" fill="#0ea5e9"/>
    <rect x="6" y="30" width="144" height="141" rx="14" stroke="#0ea5e9" stroke-width="12"/>
    <rect x="30.5" y="2.5" width="24" height="36" rx="7.5" fill="#0ea5e9" stroke="white" stroke-width="5"/>
    <rect x="99.5" y="2.5" width="24" height="36" rx="7.5" fill="#0ea5e9" stroke="white" stroke-width="5"/>
    <text x="75" y="135" fill="white" font-size="90" text-anchor="middle" dominantBaseline="middle" font-family="arial" className="font-sans font-bold">${currMonthDay}</text>
    </svg>

    `;

    return (
        <div className="flex flex-row items-center">
            <Favicon url={`data:image/svg+xml,${encodeURIComponent(svgContent)}`} />
        </div>
    );
}