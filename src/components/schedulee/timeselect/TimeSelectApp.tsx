import React from 'react';
import AvailCal from '../AvailCal';
import LocationSelectionComponent from '../locationSelectionComponent';
// import GroupAvailCal from "./components/GroupAvailCal"
import { useState, useEffect } from "react"
import { getDatesFromRange } from '../../scheduleComponents/utils/getDatesFromRange';
import { getDateWithDay } from '../../scheduleComponents/utils/getDateWithDay';

import { calandarDate, calanderState, userData } from '../../scheduleComponents/scheduletypes';
import { calendarDimensions } from '../../scheduleComponents/scheduletypes';
import eventAPI from "../../../eventAPI"
import { useParams } from 'react-router-dom';
import { getAccountId, getAccountName, getAvailabilityByAccountId, getAvailabilityByName, getEventOnPageload, wrappedSaveParticipantDetails } from '../../../firebase/events';

function TimeSelectApp() {
    const { code } = useParams();

    const testData = eventAPI.getTestData()
    const [chartedUsers, setChartedUsers] = useState<userData>(testData.userData)
    const [calendarState, setCalendarState] = useState<calanderState>({...testData.scheduleDataEmpty});
    const [calendarFramework, setCalendarFramework] = useState<calendarDimensions>(testData.dateData)

    const [selectedLocations, updateSelectedLocations] = useState([]);

    const [ loading, setLoading ] = useState(true);
    useEffect(() => {

        const fetchData = async () => {
            if (code && code.length == 6) {
                await getEventOnPageload(code).then(() => {
                    const { availabilities, participants } = eventAPI.getCalendar();
                    const dim = eventAPI.getCalendarDimensions();

                    const accountName = getAccountName()
                    if (accountName === null) {console.warn("User not logged in"); return}

                    let avail = (getAccountId() == "") ? getAvailabilityByAccountId(getAccountId()) : getAvailabilityByName(accountName)
                    if (avail === undefined) { // participant doesn't exist
                        avail = eventAPI.getEmptyAvailability(dim)
                    }

                    setChartedUsers(participants);
                    setCalendarState({...[eventAPI.availabilitytoAvailabilityMatrix(avail)]});
                    setCalendarFramework(dim);

                });
    
            } else { 
                console.error("The event code in the URL doesn't exist");
            }
            setLoading(false);
        }

        fetchData();


    }, []);

    if (loading) {
        return <p>Loading...</p>
    }

    const saveAvailAndLocationChanges = () => {
        const avail = eventAPI.availabilityMatrixToAvailability(calendarState[0])
        console.log("After conversion, ", avail);
        wrappedSaveParticipantDetails(avail, selectedLocations);
    }

    const handleUpdateSelectedLocations = (locations:any) => {
        updateSelectedLocations(locations);
    }

    const handleSubmitAvailability = () => {
        saveAvailAndLocationChanges();
        // TODO Route to next page
    }

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
                    <button className="m-4 p-4" onClick={handleSubmitAvailability}>Submit</button>
                </div>
            </div>
        </div>
    )
}

export default TimeSelectApp;
