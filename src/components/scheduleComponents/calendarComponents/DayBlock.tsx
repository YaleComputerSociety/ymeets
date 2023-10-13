import React, { useEffect, useState } from "react";
import "tailwindcss/tailwind.css";
import { calanderState } from "../scheduletypes";

interface DayBlockProps {
    blockID: number
    columnID: number
    theCalendarState: [calanderState, React.Dispatch<React.SetStateAction<calanderState>>]
    draggable: boolean
}

export default function DayBlock({blockID, columnID, theCalendarState, draggable}: DayBlockProps) {

    const [bgColor, setBgColor] = useState("white");
    const [calendarState, setCalanderState] = theCalendarState;

    // for group view calander.
    useEffect(() => {

        let count = 0

        for (let i = 0; i < calendarState.schedules.length; i++) {
            if (calendarState.schedules[i][columnID][blockID] == 1) {
                count += 1
            }
        }
        
        // todo - refine this algorithm
        if (count == 0) {
            setBgColor("white");
        } else if (count <= Math.ceil(calendarState.schedules.length * .25)) {
            setBgColor("ymeets-light-blue");
        } else if (count <= Math.ceil(calendarState.schedules.length * .50)) {
            setBgColor("ymeets-light-blue");
        } else if (count <=Math.ceil(calendarState.schedules.length * .75)) {
            setBgColor("ymeets-med-blue");
        } else {
            setBgColor("ymeets-dark-blue")
        }

    }, [])

    const handleDragStart = (event: any) => {
        const crt = event.target.cloneNode(true);
        crt.style.position = "absolute";
        crt.style.left = "-9999px"; 
        crt.style.opacity = "0"
        document.body.appendChild(crt);
        event.dataTransfer.setDragImage(crt, 0, 0);
        
      };
      
    const handleDragEnter = () => {
        if (draggable === true) {

            // if we're draggable
            // then there must be only one calander in schedules, in which case we can just
            // directly edit it to reflect the state.

            if (calendarState.schedules[0][columnID][blockID] === 1) {
                setBgColor("white");
                let oldData = {...calendarState};
                oldData.schedules[0][columnID][blockID] = 0;
                setCalanderState(oldData);
            } else {
                let oldData = {...calendarState};
                console.log(oldData);
                oldData.schedules[0][columnID][blockID] = 1;
                setCalanderState(oldData);
                setBgColor("ymeets-light-blue")
            }
        }
    };

    return (

            <div
                onClick={handleDragEnter}
                onDragStart={handleDragStart}
                onDragEnter={handleDragEnter}
                className={` \
                bg-${bgColor} \
                m-1 mt-0 mb-0 ml-0 mr-0 min-h-[5px] h-5 \
                col-span-2 border border-solid-1 border-ymeets-gray \
                `
                }
                draggable="true"
            >
            </div>
    );
}
