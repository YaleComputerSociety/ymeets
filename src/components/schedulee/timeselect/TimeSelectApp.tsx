import AvailCal from '../AvailCal';
import LocationSelectionComponent from '../locationSelectionComponent';
// import GroupAvailCal from "./components/GroupAvailCal"
import { useState, useEffect } from "react"
import { getDatesFromRange } from '../../scheduleComponents/utils/getDatesFromRange';
import { getDateWithDay } from '../../scheduleComponents/utils/getDateWithDay';


import { calandarDate, calanderState, userData } from '../../scheduleComponents/scheduletypes';
import { calendarDimensions } from '../../scheduleComponents/scheduletypes';
import eventAPI from "../../../eventAPI"

function TimeSelectApp() {

    const testData = eventAPI.getTestData()
    const [chartedUsers, setChartedUsers] = useState<userData>(testData.userData)
    const [calendarState, setCalendarState] = useState<calanderState>({...testData.scheduleDataEmpty});
    const [calendarFramework, setCalendarFramework] = useState<calendarDimensions>(testData.dateData)

    const [selectedLocations, updateSelectedLocations] = useState([]);

    const handleUpdateSelectedLocations = (locations:any) => {
        updateSelectedLocations(locations);
    }
    
    /* Testing Purposes */
    useEffect(() => {
        console.log(selectedLocations);
    }, [selectedLocations]);

    return (
        <div>
            <div className="grid grid-cols-2 grid-rows-1 font-roboto mx-8">
                <div className="grid col-start-1 col-span-1"> 
                    <LocationSelectionComponent 
                        update={handleUpdateSelectedLocations}
                    />
                </div>
                <div className="grid col-start-2 col-span-1"> 
                    <AvailCal 
                        theCalendarState={[calendarState, setCalendarState]}
                        theCalendarFramework={[calendarFramework, setCalendarFramework] }
                        draggable={true}
                    />
                </div>
            </div>
        </div>
    )
}

export default TimeSelectApp;
