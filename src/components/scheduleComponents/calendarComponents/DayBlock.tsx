import React, { useEffect, useState } from "react";
import "tailwindcss/tailwind.css";

export default function DayBlock(props: any) {

    const blockID = props.blockID; // x
    const columnID = props.columnID // y


    const [bgColor, setBgColor] = useState("white");
    const [dayColumnDockState, setDayColumnDockState] = props.columnData;

    useEffect(() => {

        let count = 0

        for (let i = 0; i < dayColumnDockState.length; i++) {
            if (dayColumnDockState[i][columnID][blockID] == 1) {
                count += 1
            }
        }
        
        if (count == 0) {
            setBgColor("white");
        } else if (count <= Math.ceil(dayColumnDockState.length * .25)) {
            setBgColor("sky-100");
        } else if (count <= Math.ceil(dayColumnDockState.length * .50)) {
            setBgColor("sky-200");
        } else if (count <=Math.ceil(dayColumnDockState.length * .75)) {
            setBgColor("sky-300");
        } else {
            setBgColor("sky-400")
        }

    }, [])

    const handleDragStart = (event: any) => {

        if (props.draggable === true) {

            const crt = event.target.cloneNode(true);
            crt.style.position = "absolute";
            crt.style.left = "-9999px"; 
            crt.style.opacity = "0"
            document.body.appendChild(crt);
            event.dataTransfer.setDragImage(crt, 0, 0);
        }
      };
      
    const handleDragEnter = () => {

        if (props.draggable === true) {
            if (dayColumnDockState[columnID][blockID] === 1) {
                setBgColor("white");
                let oldData = {...dayColumnDockState};
                oldData[columnID][blockID] = 0;
                setDayColumnDockState(oldData);
            } else {
                let oldData = {...dayColumnDockState};
                console.log(oldData);
                oldData[columnID][blockID] = 1;
                setDayColumnDockState(oldData);
                setBgColor("sky-100")
            }
        }

        console.log(dayColumnDockState);
    };

    return (
    
            // <div className="border border-black h-10">


            // </div>
            
            <div
                onClick={handleDragEnter}
                onDragStart={handleDragStart}
                onDragEnter={handleDragEnter}
                className={` \
                bg-${bgColor} \
                m-1 mt-0 mb-0 ml-0 mr-0 min-h-[10px] h-10 \
                col-span-2 border border-solid-1 border-[#d6d6d6] \
                `
                }
                draggable="true" // This attribute makes the div draggable
            >

            </div>
    );
}
