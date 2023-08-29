import React, { useEffect, useState } from "react";

export default function DayBlock(props) {

    
    const blockID = props.blockID;
    const columnID = props.columnID

    const [bgColor, setBgColor] = useState("white");
    // const [isActivated, setIsActivated] = useState(false);
    const [dayColumnDockState, setDayColumnDockState] = props.columnData;

    // refactor with useEffect o be more redeable?

    useEffect(() => {

        if (dayColumnDockState[columnID][blockID] === true) {
            setBgColor("sky-100");
        } else if (dayColumnDockState[columnID][blockID] === false) {
            setBgColor("white");
        } else {
            setBgColor("white");
        }

    }, [dayColumnDockState])

    const handleDragStart = (event) => {
        var img = new Image();
        img.src = '../testimage.jpg';
        event.dataTransfer.setDragImage(img, 0, 0);
    };

    const handleDragEnter = () => {
        if (dayColumnDockState[columnID][blockID] === true) {
            setBgColor("white");
            let oldData = {...dayColumnDockState};
            oldData[columnID][blockID] = false;
            setDayColumnDockState(oldData);
        } else {
            let oldData = {...dayColumnDockState};
            console.log(oldData);
            oldData[columnID][blockID] = true;
            setDayColumnDockState(oldData);
            setBgColor("sky-100")
        }

        console.log(dayColumnDockState);
    };

    return (
        <div
            onClick={handleDragEnter}
            onDragStart={handleDragStart}
            onDragEnter={handleDragEnter}
            className={`h-15 bg-${bgColor}`}
            style={{ userDrag: "none" }} // Disable drag animation
        >
            
            <div
                className={` \
                    m-1 mt-0 mb-0 ml-0 mr-0 h-10 border border-solid border-D0CFCF min-h-10 \
                    col-span-2
                `}
                draggable="true" // This attribute makes the div draggable
            ></div>
        </div>
    );
}
