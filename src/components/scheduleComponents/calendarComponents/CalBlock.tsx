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
    user : number
    theDragStartedOn : any
}


export default function CalBlock({blockID, columnID, theCalendarState, chartedUsersData, draggable, isAdmin, user, theDragStartedOn}: DayBlockProps) {
    const [chartedUsers, setChartedUsers] = chartedUsersData ? chartedUsersData : [null, null]
    const [bgColor, setBgColor] = useState("white");
    const [calendarState, setCalanderState] = theCalendarState;
    const [isDottedBorder, setIsDottedBorder] = useState(false);
    const [dragStartedOn, setDragStartedOn] = theDragStartedOn
    // for group view calander.
    useEffect(() => {

        let count = 0

        for (let i = 0; i < calendarState.length; i++) {
            
            // let indexOfCol = columnID % 7
            
            if (calendarState[i][columnID][blockID] == true) {
                count += 1
            }
        }
        
        // TODO - refine this algorithm
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

        // this needs to be fixed, should not be using 0, should be using the person's ID.

        if (calendarState[user][columnID][blockID] == true) {
            setDragStartedOn(true);
        } else {
            setDragStartedOn(false);
        }
      };

    const handleBlockClick = () => {

        if (draggable === true) {

            if (calendarState[user][columnID][blockID] === true) { 

                setBgColor("white");
                let oldData = {...calendarState};
                oldData[user][columnID][blockID] = false;
                setCalanderState(oldData);

            } else {

                let oldData = {...calendarState};
                oldData[user][columnID][blockID] = true;
                setCalanderState(oldData);
                setBgColor("ymeets-light-blue")
            }
        }   
    }
      
    const handleBlockUpdate = () => {

        if (draggable === true) {

            if (isAdmin == true) {

                if (calendarState[user][columnID][blockID] === true) {
                    setBgColor("selection-made-red");
                    let oldData = {...calendarState};
                    oldData[user][columnID][blockID] = false;
                    setCalanderState(oldData);
                } else {
                    let oldData = {...calendarState};
                    oldData[user][columnID][blockID] = true;
                    setCalanderState(oldData);
                    setBgColor("selection-made-red")
                }

            } else {

                // if we're draggable
                // then there must be only one calander in schedules, in which case we can just
                // directly edit it to reflect the state.
                
                if (calendarState[user][columnID][blockID] === true) {

                    if (dragStartedOn === true) {

                        setBgColor("white");
                        let oldData = {...calendarState};
                        oldData[user][columnID][blockID] = false;
                        setCalanderState(oldData);
                    }
                    
                } else {

                    if (dragStartedOn === true) { 
                        return
                    }

                    let oldData = {...calendarState};
                    oldData[user][columnID][blockID] = true;
                    setCalanderState(oldData);
                    setBgColor("ymeets-light-blue")
                }
            }
        }
    };

    const handleHover = (event : any) => {
        var availableUsers : user[] = []
        var unavailableUsers : user[] = []

        if( chartedUsers ){
            for(let i = 0; i < chartedUsers.users.length; i++){
                let user = chartedUsers.users[i]
                let oldData = {...calendarState}
                
                let indexOfCol = columnID % 7 

                if(oldData[user.id][indexOfCol][blockID] == true){
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

        if (draggable === true) {
            setIsDottedBorder((prevIsDottedBorder) => !prevIsDottedBorder);
        }
    }
    
    const borderStyle = isDottedBorder ? '1px dotted #000' : 'none';
    
    return (

        <div
            draggable="true"
            onClick={handleBlockClick}
            onDragStart={handleDragStart}
            onDragEnter={handleBlockUpdate}
            onDragOver={handleBlockUpdate}
            onMouseOver={handleHover}
            onDragEnd={(e) => {setDragStartedOn(false)}}
            onMouseLeave={() => {setIsDottedBorder(false)}}
            className={`bg-${bgColor} h-4`}
            style={{ border: borderStyle }}

        >
        </div>

  );
}
