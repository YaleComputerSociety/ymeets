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
import { useNavigate, useParams } from 'react-router-dom';
import { getAccountId, getAccountName, getAvailabilityByAccountId, getAvailabilityByName, getEventOnPageload, wrappedSaveParticipantDetails, getEventName, getEventDescription, getLocationOptions } from '../../../firebase/events';
import { Availability } from '../../../types';

function TimeSelectApp() {
    const { code } = useParams();
    const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate();
    const testData = eventAPI.getTestData()
    const [chartedUsers, setChartedUsers] = useState<userData | undefined>(undefined)
    const [calendarState, setCalendarState] = useState<calanderState | undefined>(undefined);
    const [calendarFramework, setCalendarFramework] = useState<calendarDimensions | undefined>(undefined)

    const [selectedLocations, updateSelectedLocations] = useState([]);

    const [ loading, setLoading ] = useState(true);

    const [eventName, setEventName] = useState("")
    const [eventDescription, setEventDescription] = useState("")
    const [locationOptions, setLocationOptions] = useState(Array<String>)

    useEffect(() => {

        const fetchData = async () => {
            if (code && code.length == 6) {
                await getEventOnPageload(code).then(() => {
                    const { availabilities, participants } = eventAPI.getCalendar();
                    const dim = eventAPI.getCalendarDimensions();

                    const accountName = getAccountName()
                    if (accountName === null) {console.warn("User not logged in"); return}

                    let avail : Availability | undefined = (getAccountId() == "") ? getAvailabilityByAccountId(getAccountId()) : getAvailabilityByName(accountName)
                    
                    if (avail === undefined) { // participant doesn't exist
                        avail = eventAPI.getEmptyAvailability(dim)
                    } 

                    setChartedUsers(participants);

                    setEventName(getEventName());
                    setEventDescription(getEventDescription());
                    setLocationOptions(getLocationOptions())

                    // @ts-ignore
                    setCalendarState([avail]);
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

        // @ts-ignore
        const avail = calendarState[0]
        console.log("After conversion, ", avail);
        wrappedSaveParticipantDetails(avail, selectedLocations);
        navigate(`/groupview/${code}`);
    }

    const handleSubmitAvailability = () => {
        saveAvailAndLocationChanges();
        // TODO Route to next page
    }
    
    const handleShowPopup = () => {
        setShowPopup(true);
    };

    const handlePopupClose = () => {
        setShowPopup(false);
    };

    return (
        <div className="bg-sky-100">
            <div className={"flex flex-col-reverse justify-center content-center " +
                            "md:flex-row md:mx-12"}>
                <div className={"flex flex-col flex-wrap content-center justify-start pt-12 space-y-8 " + 
                                "md:w-1/2 md:mx-7"}> 
                    <h1 className={"text-3xl font-bold text-center " + 
                                   "md:text-left"}>Event: {eventName}</h1>
                    <p className={"text-xl text-center " + 
                                  "md:text-left"}>Desc: {eventDescription}</p>
                    <div className="w-96 flex-col content-center">
                        <LocationSelectionComponent 
                            update={updateSelectedLocations}
                            locations={locationOptions}
                        />
                    </div>
                    <button className='font-bold rounded-full bg-blue-500 text-white py-4 px-7 text-lg w-fit place-self-center \
                                        transform transition-transform hover:scale-90 active:scale-100e' 
                            onClick={handleSubmitAvailability}>
                            Submit
                    </button>
                </div>
                <div className={"flex flex-col justify-center content-center flex-wrap " +
                                "md:w-1/2 md:content-start"}>
                        <AvailCal 
                            // @ts-ignore

                        theCalendarState={[calendarState, setCalendarState]}
                        user={0}
                        // @ts-ignore
                        theCalendarFramework={[calendarFramework, setCalendarFramework] }
                        draggable={true}
                    />
                </div>
            </div>
        </div>
    );
}

export default TimeSelectApp;
