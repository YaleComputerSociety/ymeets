import React, { useEffect, useState } from "react";
import "tailwindcss/tailwind.css";
import { calanderState, userData, user } from "../scheduletypes";

interface DayBlockProps {
    blockID: number
    columnID: number
    theCalendarState: [calanderState, React.Dispatch<React.SetStateAction<calanderState>>]
    chartedUsersData?: [userData, React.Dispatch<React.SetStateAction<userData>>]
    draggable: boolean
    isAdmin? : boolean
}

export default function DayBlock({blockID, columnID, theCalendarState, chartedUsersData, draggable, isAdmin}: DayBlockProps) {
    const [chartedUsers, setChartedUsers] = chartedUsersData ? chartedUsersData : [null, null]
    const [bgColor, setBgColor] = useState("white");
    const [calendarState, setCalanderState] = theCalendarState;

    // for group view calander.
    useEffect(() => {

        let count = 0

        for (let i = 0; i < calendarState.length; i++) {
            if (calendarState[i][columnID][blockID] == 1) {
                count += 1
            }
        }
        
        // todo - refine this algorithm
        if (count == 0) {
            setBgColor("white");
        } else if (count <= Math.ceil(calendarState.length * .25)) {
            setBgColor("ymeets-light-blue");
        } else if (count <= Math.ceil(calendarState.length * .50)) {
            setBgColor("ymeets-light-blue");
        } else if (count <=Math.ceil(calendarState.length * .75)) {
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

            if (isAdmin == true) {

                if (calendarState[0][columnID][blockID] === 1) {
                    setBgColor("selection-made-red");
                    let oldData = {...calendarState};
                    oldData[0][columnID][blockID] = 0;
                    setCalanderState(oldData);
                } else {
                    let oldData = {...calendarState};
                    oldData[0][columnID][blockID] = 1;
                    setCalanderState(oldData);
                    setBgColor("selection-made-red")
                }

            } else {
                // if we're draggable
                // then there must be only one calander in schedules, in which case we can just
                // directly edit it to reflect the state.
                if (calendarState[0][columnID][blockID] === 1) {
                    setBgColor("white");
                    let oldData = {...calendarState};
                    oldData[0][columnID][blockID] = 0;
                    setCalanderState(oldData);
                } else {
                    let oldData = {...calendarState};
                    oldData[0][columnID][blockID] = 1;
                    setCalanderState(oldData);
                    setBgColor("ymeets-light-blue")
                }
            }
        }
    };

    const handleHover = (event : any) => {
        var availableUsers : user[] = []
        var unavailableUsers : user[] = []
        if(chartedUsers){
            for(let i = 0; i < chartedUsers.users.length; i++){
                let user = chartedUsers.users[i]
                let oldData = {...calendarState}
                if(oldData[user.id][columnID][blockID] == 1){
                    availableUsers.push(user)
                }
                else{
                    unavailableUsers.push(user)
                }
            }
            setChartedUsers({users: chartedUsers.users, 
                             available: availableUsers, 
                             unavailable: unavailableUsers})
        }
    }

    return (

            <div
                onClick={handleDragEnter}
                onDragStart={handleDragStart}
                onDragEnter={handleDragEnter}
                onMouseOver={handleHover}
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
