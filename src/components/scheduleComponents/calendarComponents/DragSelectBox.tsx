import { useState } from "react"

interface SelectionBoxState {
    x: number;
    y: number;
    width: number;
    height: number;
  };

interface DragSelectBoxProps {
    theSelection : [boolean, React.Dispatch<React.SetStateAction<boolean>>]
}

export function DragSelectBox({theSelection} : DragSelectBoxProps) {

    const [isSelecting, setIsSelecting] = theSelection;

    const [dim, setDim] = useState<SelectionBoxState>({
        x: 0,
        y: 0,
        width: 0,
        height: 0
    });
      

    const handleMouseUp = (e: any) => {

        setDim(() => ({
            x : 0,
            y : 0,
            width : 0,
            height : 0
        }))
        setIsSelecting(false)
        
    }
    
    const handleMouseMove = (e: any) => {

        console.log("mouse is moving!")

        if (!isSelecting) return;

        setDim((oldDim) => (
            {
                ...oldDim,
                width : e.clientX - oldDim.x,
                height : e.clientY - oldDim.y
            }
        ))

    }

    const handleMouseDown = (e: any) => {

        console.log("mouse pressed down");

        setIsSelecting(true);

        setDim(() => ({
            x : e.clientX,
            y : e.clientY,
            width : 0,
            height : 0
        }))

    } 

    return <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
    >
        <div
        style={{
            left : `${dim.x}px`,
            right : `${dim.y}px`,
            width : `${dim.width}px`,
            height : `${dim.height}px`,
            border: '2px dashed #007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
        }}
        >
        </div>
    </div>
}