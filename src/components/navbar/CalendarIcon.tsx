import React from "react"

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
                <rect x="30.5" y="2.5" width="24" height="36" rx="7.5" fill="currentColor" stroke="white" stroke-width="5"/>
                <rect x="99.5" y="2.5" width="24" height="36" rx="7.5" fill="currentColor" stroke="white" stroke-width="5"/>
            </svg>
        </div>
    )
}