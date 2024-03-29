import React, { useState } from "react"
import { checkIfAdmin } from "../../firebase/events";

interface LocationChartProps {
    theSelectedLocation?: [string, React.Dispatch<React.SetStateAction<string>>] | undefined;
    locationOptions : any
    locationVotes : any
}


/**
 * 
 * Contains information on the vote count for each location.
 * 
 * @param LocationChartProps 
 * @returns Page Support Component - Admin
 */
export default function LocationChart({theSelectedLocation, locationOptions, locationVotes} : LocationChartProps) {

    //@ts-ignore
    const [selectedLocation, setSelectedLocation] = theSelectedLocation;
    
    const [isClicked, setIsClicked] = useState(selectedLocation !== "");

    let combined = locationOptions.map((loc:any, idx:any) => {
        return { location: loc, votes: locationVotes[idx] };
    });
    combined.sort((a:any, b:any) => b.votes - a.votes);
    locationOptions = combined.map((item:any) => item.location);
    locationVotes = combined.map((item:any) => item.votes);

    function handleRowClick(loc: string) {

        if (!checkIfAdmin()) {
            return;
        }

        if (loc == selectedLocation || loc == "") {
            setIsClicked(!isClicked);
        } 

        setSelectedLocation(loc);
    }
    
    return (
        <div className="flex justify-center items-center text-center bg-white rounded-lg">
            <table className="table-fixed border-collapse w-full">
                <tbody>
                    <tr>
                        <th className="border-b p-3 text-black">Location</th>
                        <th className="border-b p-3 text-black">Votes</th>
                    </tr>
                    {/* @ts-ignore */}
                    {locationOptions.map((loc, idx) => {
                        return <tr key={idx} onClick={() => {handleRowClick(loc)}} className={`group p-4 cursor-pointer ${
                            isClicked && selectedLocation == loc ? 'bg-ymeets-light-blue' : 'bg-white'
                          } transition-colors duration-300`}>
                                <td className="p-3">{loc}</td>
                                <td className="p-3">{locationVotes[idx]}</td>
                            </tr>
                    })}
                </tbody>
            </table>
        </div>
    )

}