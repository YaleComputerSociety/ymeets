import React, { useEffect, useState } from "react";
import "tailwindcss/tailwind.css";
import { calanderState, userData, user, calendarDimensions } from "../../types"
import { useRef } from "react";
import { dragProperties } from "./CalendarApp";
import { generateTimeBlocks } from "../utils/generateTimeBlocks";

interface DayBlockProps {
    blockID: number
    columnID: number
    theCalendarState: [calanderState, React.Dispatch<React.SetStateAction<calanderState>>]
    theCalendarFramework : [calendarDimensions, React.Dispatch<React.SetStateAction<calendarDimensions>>]
    chartedUsersData: [userData, React.Dispatch<React.SetStateAction<userData>>] | undefined
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
    const [calendarState, setCalanderState] = theCalendarState;
    const [isDottedBorder, setIsDottedBorder] = useState(false);
    const [dragState, setDragState] = theDragState;
    const [calendarFramework, setCalendarFramework] = theCalendarFramework
    const prevDragState = useRef(dragState);
    const [shadeColor, setShadeColor] = useState("ymeets-light-blue");

    const NUM_OF_TIME_BLOCKS = generateTimeBlocks(calendarFramework.startTime.getHours(), calendarFramework.endTime.getHours()).length * 4;

    useEffect(() => {

        if (draggable === false) {

            console.log([columnID, blockID]);

            let selectedCount = 0;
    
            for (let i = 0; i < calendarState.length; i++) {
                if (calendarState[i][columnID][blockID] === true) {
                    selectedCount += 1;
                }
            }   
            
            console.log("the selected count" + selectedCount);
    
            if (selectedCount === 0) {
                setShadeColor("white");
            } else {
                const percentageSelected = selectedCount / (calendarState.length);
    
                if (percentageSelected <= 0.25) {
                    setShadeColor("ymeets-light-blue");
                } else if (percentageSelected <= 0.50) {
                    setShadeColor("ymeets-light-blue");
                } else if (percentageSelected <= 0.75) {
                    setShadeColor("ymeets-med-blue");
                } else {
                    setShadeColor("sky-500");
                }
            }
        }

        console.log(shadeColor);

    }, []);


    useEffect(() => {

        if (draggable === false) {
            return;
        }
        
        const [startCol, startBlock] = dragState.dragStartedOnID;
        const [endCol, endBlock] = dragState.dragEndedOnID; 
               
        let curAffectedBlocks: any[] = [];
    
        let oldDragState = { ...dragState };
    
        prevDragState.current = dragState;
    
        for (let col = Math.min(startCol, endCol); col <= Math.max(startCol, endCol); col++) {
            for (let block = Math.min(startBlock, endBlock); block <= Math.max(startBlock, endBlock); block++) {
                curAffectedBlocks.push([col, block]);
                oldDragState.blocksAffectedDuringDrag.add(`${col}-${block}`);
            }
        }

        if (startCol === endCol && startBlock === endBlock) {
            curAffectedBlocks = []
        }

        let oldCalState = {...calendarState};

        if (dragState.dragStartedOn == true) {
            if (curAffectedBlocks.some(([c, b]) => c === columnID && b === blockID)) {
                oldCalState[user][columnID][blockID] = false;                       
            } else {
                if (dragState.blocksAffectedDuringDrag?.has(`${columnID}-${blockID}`)) {
                    oldCalState[user][columnID][blockID] = true;
                }
            }
        } else {
            if (curAffectedBlocks.some(([c, b]) => c === columnID && b === blockID)) {
                oldCalState[user][columnID][blockID] = true;                       
            } else {
                if (dragState.blocksAffectedDuringDrag?.has(`${columnID}-${blockID}`)) {
                    oldCalState[user][columnID][blockID] = false;
                }
            }
        }
        
        setDragState(oldDragState);
    
        setCalanderState(oldCalState);
    
    }, [draggable, dragState.dragStartedOn, dragState.dragStartedOnID, dragState.dragEndedOnID]);
    

    const createNewDrag = () => {

        let oldState = dragState;

        if (calendarState[user][columnID][blockID] === true) {

            oldState.dragStartedOnID = [columnID, blockID];
            oldState.dragStartedOn = true
            oldState.blocksAffectedDuringDrag = new Set()

        } else {

            let oldState = dragState;

            oldState.dragStartedOnID = [columnID, blockID];
            oldState.dragStartedOn = false
            oldState.blocksAffectedDuringDrag = new Set()            
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

        
        if( chartedUsers != undefined ){
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
            onMouseOver={handleHover}
            onMouseLeave={() => setIsDottedBorder(false)}
            className={calendarState?.[user]?.[columnID]?.[blockID] == true ? `bg-${shadeColor} w-16 p-0 h-3` : `bg-white w-16 p-0 h-3`}
            style={
                {
                    borderRight: "1px solid #000", 
                    borderTop: borderTop,
                    transition: "background-color 0.2s ease",
                }
            }
        >
        </div>
    );

}