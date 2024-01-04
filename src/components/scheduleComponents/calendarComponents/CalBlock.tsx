import React, { useEffect, useState } from "react";
import "tailwindcss/tailwind.css";
import { calanderState, userData, user, calendarDimensions } from "./scheduletypes";
import { useRef } from "react";
import { dragProperties } from "./CalendarApp";
import { generateTimeBlocks } from "../utils/generateTimeBlocks";

interface DayBlockProps {
    blockID: number
    columnID: number
    theCalendarState: [calanderState, React.Dispatch<React.SetStateAction<calanderState>>]
    theCalendarFramework : [calendarDimensions, React.Dispatch<React.SetStateAction<calendarDimensions>>]
    chartedUsersData?: [userData, React.Dispatch<React.SetStateAction<userData>>]
    draggable: boolean
    isAdmin? : boolean
    user : number
    theDragStartedOn? : any,
    is30Minute : boolean
    theDragState : [dragProperties, React.Dispatch<React.SetStateAction<dragProperties>>]
}

export default function CalBlock({
    blockID, 
    columnID, 
    theCalendarState, 
    theCalendarFramework,
    chartedUsersData, 
    draggable, 
    isAdmin, 
    user, 
    is30Minute,
    theDragState
}: DayBlockProps) {
        
    const [chartedUsers, setChartedUsers] = chartedUsersData ? chartedUsersData : [null, null]
    const [bgColor, setBgColor] = useState("white");
    const [calendarState, setCalanderState] = theCalendarState;
    const [isDottedBorder, setIsDottedBorder] = useState(false);
    const [dragState, setDragState] = theDragState;
    const [calendarFramework, setCalendarFramework] = theCalendarFramework
    const prevDragState = useRef(dragState);

    const NUM_OF_TIME_BLOCKS = generateTimeBlocks(calendarFramework.startTime.getHours(), calendarFramework.endTime.getHours()).length * 4;

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

    useEffect(() => {

        if (draggable === false) {
            return;
        }

        console.log(dragState.affectedBlocks);
        
        const [startCol, startBlock] = dragState.dragStartedOnID;
        const [endCol, endBlock] = dragState.dragEndedOnID;
               
        let affectedBlocks: any[] = [];
    
        let oldDragState = { ...dragState };
    
        prevDragState.current = dragState;
    
        for (let col = Math.min(startCol, endCol); col <= Math.max(startCol, endCol); col++) {
            for (let block = Math.min(startBlock, endBlock); block <= Math.max(startBlock, endBlock); block++) {
                affectedBlocks.push([col, block]);
                oldDragState.affectedBlocks.add(`${col}-${block}`);
            }
        }
        
    
        setDragState(oldDragState);
    
        let oldCalState = { ...calendarState };
    
        for (let col = 0; col < calendarFramework.numOfCols; col++) {
            for (let block = 0; block < NUM_OF_TIME_BLOCKS; block++) {

                if (dragState.dragStartedOn == true) {
                    if (affectedBlocks.some(([c, b]) => c === col && b === block)) {
                        oldCalState[user][col][block] = false;                       
                    } else {
                        if (dragState.affectedBlocks.has(`${col}-${block}`)) {
                            oldCalState[user][col][block] = true;
                        }
                    }
                } else {
                    if (affectedBlocks.some(([c, b]) => c === col && b === block)) {
                        oldCalState[user][col][block] = true;                       
                    } else {
                        if (dragState.affectedBlocks.has(`${col}-${block}`)) {
                            oldCalState[user][col][block] = false;
                        }
                    }
                }
            }
        }
    
        setCalanderState(oldCalState);
    
    }, [draggable, dragState.dragStartedOn, dragState.dragStartedOnID, dragState.dragEndedOnID]);
    

    const createNewDrag = () => {

        let oldState = dragState;

        if (calendarState[user][columnID][blockID] === true) {

            oldState.dragStartedOnID = [columnID, blockID];
            oldState.dragStartedOn = true
            oldState.affectedBlocks = new Set()

        } else {

            let oldState = dragState;

            oldState.dragStartedOnID = [columnID, blockID];
            oldState.dragStartedOn = false
            oldState.affectedBlocks = new Set()            
        }

        setDragState(oldState);

    }

    const handleDragStart = (event: any) => {

        const crt = event.target.cloneNode(true);
        crt.style.position = "absolute";
        crt.style.left = "-9999px"; 
        crt.style.opacity = "0"
        document.body.appendChild(crt);
        event.dataTransfer.setDragImage(crt, 0, 0);  

        if (draggable == false) {
            return;
        }

        createNewDrag();

      };

    const handleBlockClick = () => {


        if (draggable === true) {
            
            if (calendarState[user][columnID][blockID] === true) { 

                let oldData = {...calendarState};
                oldData[user][columnID][blockID] = false;
                setCalanderState(oldData);

            } else {

                let oldData = {...calendarState};
                oldData[user][columnID][blockID] = true;
                setCalanderState(oldData);
            }
        }   
    }
      
    const handleBlockUpdate = () => {

        if (draggable == false) {
            return;
        }
        
        setDragState((oldState) => ({
            ...oldState,
            dragEndedOnID : [columnID, blockID]
        }))

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

    }

    const borderTop = is30Minute ? '1px dotted #000' : 'none';
    
    return (
        <div
            draggable="true"
            onClick={handleBlockClick}
            onDragStart={handleDragStart}
            onDragEnter={handleBlockUpdate}
            onDragOver={handleBlockUpdate}
            onDragEnd={() => {console.log("drag is over!")}}
            onMouseOver={handleHover}
            onMouseLeave={() => setIsDottedBorder(false)}
            className={calendarState[user][columnID][blockID] == true ? `bg-ymeets-light-blue w-16 p-0 h-4` : `bg-white w-16 p-0 h-4`}
            style={{borderRight: "1px solid #000", borderTop: borderTop}}
        >
        </div>
    );

}