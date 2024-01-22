import React from 'react';
import LocationSelectionComponent from '../locationSelectionComponent';
// import GroupAvailCal from "./components/GroupAvailCal"
import { useState, useEffect } from "react"
import Footer from '../footer/Footer';
import { calandarDate, calanderState, userData } from '../../types'
import { calendarDimensions } from '../../types'
import eventAPI from "../../firebase/eventAPI"
import { useNavigate, useParams } from 'react-router-dom';
import { getAccountId, getAccountName, getAvailabilityByAccountId, getAvailabilityByName, getEventOnPageload, wrappedSaveParticipantDetails, getEventName, getEventDescription, getLocationOptions } from '../../firebase/events';
import { Availability } from '../../types';
import Calendar from "../selectCalendarComponents/CalendarApp";
import { getChosenLocation, getChosenDayAndTime } from '../../firebase/events';

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
    
    const [chosenLocation, setChosenLocation] = useState("")
    const [chosenTimeRange, setChosenTimeRange] = useState([])
    const [chosenDateRange, setChosenDateRange] = useState([])

    const [dragState, setDragState] = useState({
        dragStartedOnID : [], // [columnID, blockID]
        dragEndedOnID : [],
        dragStartedOn : false,
        affectedBlocks : new Set()
    })


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
                    setCalendarState([...availabilities, avail]);
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

        let user = 0; // TODO
        //@ts-ignore
        const avail = calendarState[user]
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
            <div className="flex flex-col justify-center content-center /
                            md:flex-row md:mx-12">
                <div className="flex flex-col flex-wrap content-center justify-start pt-12 / 
                                md:w-1/2 md:mx-20"> 
                    <div className = "mb-8">
                        <h3 className="text-m text-center / 
                                    md:text-left text-gray-400">Event Name</h3>
                        <h3 className="text-3xl font-bold text-center / 
                                    md:text-left">{eventName}</h3>
                    </div>
                    <div className = "mb-8">
                        <h3 className="text-m text-center /
                                    md:text-left text-gray-400">Description</h3>
                        <h3 className="text-2xl font-bold text-center / 
                                    md:text-left">{eventDescription}</h3>
                    </div>
                    
                    <div>
                        <div className="w-96 flex-col content-center mt-5 mb-8">
                            <LocationSelectionComponent 
                                update={updateSelectedLocations}
                                locations={locationOptions}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                        <button className='font-bold rounded-full bg-blue-500 text-white py-4 px-7 text-lg mb-8 w-fit place-self-center \
                                            transform transition-transform hover:scale-90 active:scale-100e' 
                                onClick={handleSubmitAvailability}>
                                Submit
                        </button>
                    </div>
                </div>
                <div className={"flex flex-col justify-center content-center h-1/4 mt-8 w-1/2 md:content-start"}>

                        <Calendar 
                            title={"Enter Your Availability"}
                            // @ts-ignore
                            theCalendarState={[calendarState, setCalendarState]}
                            user={0}
                            // @ts-ignore
                            theCalendarFramework={[calendarFramework, setCalendarFramework]}
                            draggable={true}
                            chartedUsersData={undefined}
                            //@ts-ignore
                            theSelectedDate={[undefined, undefined]}
                            //@ts-ignore
                            theDragState={[dragState, setDragState]}
                            isAdmin={false}
                            />

                </div>
            </div>
           
        </div>
    );
}

export default TimeSelectApp;
