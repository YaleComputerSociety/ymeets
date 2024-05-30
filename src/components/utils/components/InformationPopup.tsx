import { IoIosInformationCircleOutline } from "react-icons/io";
import { useState } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";

interface Props {
    content : string
}
export default function InformationPopup({content} : Props) {
    const [opacity, setOpacity] = useState(0); // State to control opacity

    return (
        <div className="relative">
          
                <IoMdInformationCircleOutline 
                onMouseEnter={() => setOpacity(1)} // Set opacity to 1 on mouse enter
                onMouseLeave={() => {
                    setOpacity(0); 

                }}  
                className="cursor-pointer"
                size={24} />
            <div
                className={`absolute bg-black text-white z-10 p-2 rounded-lg transition-opacity duration-500 ${
                    opacity ? 'opacity-100' : 'opacity-0'
                } pointer-events-none max-w-xs w-auto`}
                style={{ transitionDelay: `${opacity ? '0ms' : '1000ms'}` }}
            >
                {content}
            </div>
        </div>
    );
}
