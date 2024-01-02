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
    const dragStateRef = useRef(undefined);

    const NUM_OF_TIME_BLOCKS = generateTimeBlocks(calendarFramework.startTime.getHours(), calendarFramework.endTime.getHours()).length * 4;

    console.log("num of time blocks " + NUM_OF_TIME_BLOCKS);
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
        const [startCol, startBlock] = dragState.dragStartedOnID;
        const [endCol, endBlock] = dragState.dragEndedOnID;
    
        let affectedBlocks : any[] = [];

        //@ts-ignore
        if (!dragState || !dragState.dragEndedOnID || !dragState.dragStartedOnID) {
            return;
        }
        
        //@ts-ignore
        if (dragStateRef.current && dragState.dragEndedOnID == dragStateRef.current.dragEndedOnID) {
            return;
        }
    
        // Iterate over columns
        for (let col = Math.min(startCol, endCol); col <= Math.max(startCol, endCol); col++) {
            // Iterate over blocks within each column
            for (let block = Math.min(startBlock, endBlock); block <= Math.max(startBlock, endBlock); block++) {
                // Access the current block using 'col' and 'block'
                affectedBlocks.push([col, block]);
            }
        }
    
        let oldCalState = {...calendarState}

        //@ts-ignore
        for (let col = 0; col < calendarFramework.dates[0].length; col++) {
            //@ts-ignore
            for (let block = 0; block < NUM_OF_TIME_BLOCKS; block++) {
                if (affectedBlocks.some(([c, b]) => c === col && b === block)) {
                    oldCalState[user][col][block] = true
                } else {
                    oldCalState[user][col][block] = false
                }
            }
        }

    }, [dragState]);
    

    const createNewDrag = () => {

        // setDragState((oldState) => ({
        //     ...oldState,
        //     affectedBlocks: [...oldState.affectedBlocks, [columnID, blockID]]
        // }));

        if (calendarState[user][columnID][blockID] === true) {

            let oldState = dragState;

            oldState["dragStartedOnID"] = [columnID, blockID];
            oldState["dragStartedOn"] = true

            setDragState(oldState);

        } else {

            let oldState = dragState;

            oldState["dragStartedOnID"] = [columnID, blockID];
            oldState["dragStartedOn"] = false

            setDragState(oldState);
            
        }
        
        //@ts-ignore
        dragStateRef.current = dragState;

    }

    const handleDragStart = (event: any) => {

        const crt = event.target.cloneNode(true);
        crt.style.position = "absolute";
        crt.style.left = "-9999px"; 
        crt.style.opacity = "0"
        document.body.appendChild(crt);
        event.dataTransfer.setDragImage(crt, 0, 0);  

        // this needs to be fixed, should not be using 0, should be using the person's ID.

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

    const updateBlockState = (newValue: boolean) => {
        
        // const oldData = { ...calendarState };
        
        // //@ts-ignore
        // for (let c = Math.min(columnID, dragState["dragStartedOnID"][0]); c <= Math.max(columnID, dragState["dragStartedOnID"][0]); c++) {
            
        //     //@ts-ignore
        //     for (let b = Math.min(blockID, dragState["dragStartedOnID"][1]); b <= Math.max(blockID, dragState["dragStartedOnID"][1]); b++) {
                
        //         oldData[user][c][b] = newValue;
        //     }
        // }
    
        // setCalanderState(oldData);

      };
      
    const handleBlockUpdate = () => {

        console.log("block updated!")
        console.log("col " + columnID);
        console.log("block " + blockID);
        

        setDragState((oldState) => ({
            ...oldState,
            dragEndedOnID : [columnID, blockID]
        }))

        //@ts-ignore
        dragStateRef.current = dragState;

        console.log(dragState);

        // console.log("c id " + columnID);
        // console.log("b id " + blockID);


        // if (draggable === true) {
          
        //     const newValue = !calendarState[user][columnID][blockID];
        
        //     if (newValue === true && dragState["dragStartedOn"] === false) {
                
        //         updateBlockState(true);

        //     } else if (newValue === false && dragState["dragStartedOn"] === true) {

        //         updateBlockState(false);

        //     }
        // }

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