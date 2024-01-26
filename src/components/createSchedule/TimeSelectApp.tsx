import React from 'react';
import LocationSelectionComponent from '../locationSelectionComponent';
// import GroupAvailCal from "./components/GroupAvailCal"
import { useState, useEffect, useCallback } from "react"
import Footer from '../footer/Footer';
import { calandarDate, calanderState, userData } from '../../types'
import { calendarDimensions } from '../../types'
import eventAPI from "../../firebase/eventAPI"
import { useNavigate, useParams } from 'react-router-dom';
import { getAccountId, getAccountName, getAvailabilityByAccountId, getAvailabilityByName, getEventOnPageload, wrappedSaveParticipantDetails, getEventName, getEventDescription, getLocationOptions, getParticipantIndex } from '../../firebase/events';
import { Availability } from '../../types';
import Calendar from "../selectCalendarComponents/CalendarApp";
import { getChosenLocation, getChosenDayAndTime } from '../../firebase/events';
import { SCOPES, auth } from '../../firebase/firebase';
import { loadGapiInsideDOM, loadAuth2 } from 'gapi-script';

function TimeSelectApp() {
    const { code } = useParams();
    const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate();
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

    const [gapi, setGapi] = useState<typeof globalThis.gapi | null>(null);
    const [authInstance, setAuthInstance] = useState<gapi.auth2.GoogleAuthBase | null>(null);
    const [user, setUser] = useState<gapi.auth2.GoogleUser | null>(null);

    const GAPI_CLIENT_NAME = 'client:auth2';

    // Load gapi client after gapi script loaded
    //@ts-ignore
    const loadGapiClient = (gapiInstance: typeof globalThis.gapi): Promise<void> => {
        return new Promise((resolve, reject) => {
          gapiInstance.load(GAPI_CLIENT_NAME, () => {
            try {
              gapiInstance.client.load('calendar', 'v3')
                .then(() => {
                  resolve();
                })
                .catch((error) => {
                  reject(error);
                });
            } catch {
              gapiInstance.client.init({
                apiKey: process.env.REACT_APP_API_KEY_GAPI,
                clientId: process.env.REACT_APP_CLIENT_ID_GAPI,
                scope: SCOPES,
              });
      
              gapiInstance.client.load('calendar', 'v3')
                .then(() => {
                  resolve();
                })
                .catch((error) => {
                  reject(error);
                });
            }
          });
        });
      };
    
    async function createCalendarEvent() {
        
        if (!gapi) {
            alert('gapi not loaded');
            return;
        }

        //@ts-ignore
        console.log(calendarFramework.dates); 

        try {
            //@ts-ignore
            const event_list = await gapi.client.calendar.events.list({
                calendarId: 'primary',
                //@ts-ignore
                timeMin: new Date('2023-08-30').toISOString(),
                timeMax: new Date('2023-09-06').toISOString(),
                singleEvents: true,
                orderBy: 'startTime',
            });

            console.log(event_list);

        } catch (e) {
            alert('[GCAL]: Error creating user event: ' + e );
            console.log("Error creating user event: ", e);
            setLoading(false);
            return;
        }

        setLoading(false);
        alert('Exporting to Google Calendar!');

    };

        useEffect(() => {
        console.log("data fetched");
        const fetchData = async () => {
            if (code && code.length === 6) {
                await getEventOnPageload(code).then(() => {
                    const { availabilities, participants } = eventAPI.getCalendar();
                    const dim = eventAPI.getCalendarDimensions();

                    console.log(dim);
    
                    const accountName = getAccountName();
                    if (accountName === null) {   
                        console.warn("User not logged in");
                        return;
                    }
                    
                    //@ts-ignore
                    setChosenDateRange(getChosenDayAndTime());
    
                    let avail: Availability | undefined =
                        getAccountId() === "" ? getAvailabilityByAccountId(getAccountId()) : getAvailabilityByName(accountName);
    
                    if (avail === undefined) {
                        avail = eventAPI.getEmptyAvailability(dim);
                    }
    
                    setChartedUsers(participants);
    
                    setEventName(getEventName());
                    setEventDescription(getEventDescription());
                    setLocationOptions(getLocationOptions());

                    //@ts-ignore
                    setChosenDateRange(getChosenDayAndTime);
    
                    // @ts-ignore
                    setCalendarState([...availabilities, avail]);
                    setCalendarFramework(dim);
                });
            } else {
                console.error("The event code in the URL doesn't exist");
            }
        };
    
        const loadGapi = async () => {
            try {
                console.log('Start loading Gapi and creating event');
                const newGapi = await loadGapiInsideDOM();
                console.log('Gapi loaded inside DOM');
                setGapi(newGapi);
                await loadGapiClient(newGapi);
                console.log('Gapi client loaded');        
                const newAuth = await loadAuth2(newGapi, process.env.REACT_APP_CLIENT_ID_GAPI || "", SCOPES);
                console.log('Auth2 loaded');
                setAuthInstance(newAuth);
                setLoading(false);
                console.log('Done loading Gapi and creating event');
            } catch (error) {
                console.error('Error loading Gapi and creating event:', error);
            }
        };
        
        fetchData().then(() => {
            setLoading(false);
        })

    }, []);
    
    if (loading) {
        return <p>Loading...</p>
    }

    const getCurrentUserIndex = () => {
        let user = getParticipantIndex(getAccountName(), getAccountId());
        if (user === undefined) { // new user => last availability
            user = (calendarState !== undefined) ? Object.keys(calendarState).length - 1 : 0;

        }
        return user;
    }

    const saveAvailAndLocationChanges = () => {
        const user = getCurrentUserIndex();
        //@ts-ignore
        const avail = calendarState[user]
        console.log("After conversion, ", avail);
        wrappedSaveParticipantDetails(avail, selectedLocations);
        navigate(`/groupview/${code}`);
    }

    const handleSubmitAvailability = () => {


        saveAvailAndLocationChanges();
    }
    
    const handleShowPopup = () => {
        setShowPopup(true);
    };

    const handlePopupClose = () => {
        setShowPopup(false);
    };

    return (
        <div className="bg-sky-100">
            <div className="flex flex-col justify-center content-center md:flex-row md:mx-12">
                <div className="flex flex-col flex-wrap justify-start pt-12 mx-10 md:w-[45%] sm:w-[100%] md:content-center">
                    <div className="mb-8">
                        <h3 className="text-m text-left text-gray-400">Event Name</h3>
                        <h3 className="text-3xl font-bold text-left">{eventName}</h3>
                    </div>
                    {eventDescription && (
                        <div className="mb-8">
                            <h3 className="text-m text-left text-gray-400">Description</h3>
                            <h3 className="text-2xl font-bold text-left">{eventDescription}</h3>
                        </div>
                    )}
            
                    <div>
                        {locationOptions.length > 0 && (
                        <div className="w-96 flex-col content-center mt-5 mb-8">
                            <LocationSelectionComponent
                            update={updateSelectedLocations}
                            locations={locationOptions}
                            />
                        </div>
                        )}
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <button className='font-bold rounded-full bg-blue-500 text-white py-4 px-7 text-lg mb-8 w-fit 
                                            transform transition-transform hover:scale-90 active:scale-100e'
                        onClick={handleSubmitAvailability}>
                        Submit Availability
                        </button>
                        <br/>
                        { chosenDateRange !== undefined &&
                            <div className='text-gray'>
                                Note : You can't edit your availability because the admin has already selected a time and/or location!
                            </div>
                        }
                    </div>
                </div>
                <div className="flex flex-col justify-center content-center h-1/4 mt-0 md:w-[55%] sm:w-[100%] md:content-start">
                <Calendar
                    title={"Enter Your Availability"}
                    // @ts-ignore
                    theCalendarState={[calendarState, setCalendarState]}
                    user={getCurrentUserIndex()}
                    // @ts-ignore
                    theCalendarFramework={[calendarFramework, setCalendarFramework]}
                    draggable={true}
                    chartedUsersData={undefined}
                    //@ts-ignore
                    theSelectedDate={[chosenDateRange, setChosenDateRange]}
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
