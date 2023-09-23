import React, { useEffect, useState } from "react";
import "tailwindcss/tailwind.css";

export default function DayBlock(props: any) {

    const blockID = props.blockID; // x
    const columnID = props.columnID // y


    const [bgColor, setBgColor] = useState("white");
    const [dayColumnDockState, setDayColumnDockState] = props.columnData;

    useEffect(() => {

        if (dayColumnDockState[columnID][blockID] === 1) {
            setBgColor("sky-100");
        } else if (dayColumnDockState[columnID][blockID] === 0) {
            setBgColor("white");
        } else {
            setBgColor("white");
        }

    }, [dayColumnDockState])

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
                col-span-2 border border-[#787878] \
                `
                }
                draggable="true" // This attribute makes the div draggable
            >

            </div>
    );
}
