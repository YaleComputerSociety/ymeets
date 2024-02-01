import React from 'react';
import LocationSelectionComponent from '../locationSelectionComponent';
// import GroupAvailCal from "./components/GroupAvailCal"
import { useState, useEffect, useCallback } from "react"
import Footer from '../footer/Footer';
import { calandarDate, calanderState, userData } from '../../types'
import { calendarDimensions } from '../../types'
import eventAPI from "../../firebase/eventAPI"
import { useNavigate, useParams } from 'react-router-dom';
import { getAccountId, getAccountName, getAvailabilityByAccountId, getAvailabilityByName, getEventOnPageload, wrappedSaveParticipantDetails, getEventName, getEventDescription, getLocationOptions, getParticipantIndex, checkIfLoggedIn } from '../../firebase/events';
import { Availability } from '../../types';
import Calendar from "../selectCalendarComponents/CalendarApp";
import { getChosenLocation, getChosenDayAndTime } from '../../firebase/events';
import { SCOPES, auth } from '../../firebase/firebase';
import { loadGapiInsideDOM, loadAuth2 } from 'gapi-script';
import { start } from 'repl';
import { Popup } from './SelectGCalsPopup';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import {LoginPopup} from '../loginpopup/login_guest_popup';
import { REACT_APP_API_KEY_GAPI, REACT_APP_CLIENT_ID_GAPI } from '../../firebase/gapi_keys';

function TimeSelectApp() {
    const { code } = useParams();
    const [showPopup, setShowPopup] = useState(false);
    const [isGcalPopupOpen, setGcalPopupOpen] = useState(false);

    const nav = useNavigate();

    const openGcalPopup = () => {
        setGcalPopupOpen(true);
    };
    
    const closeGcalPopup = () => {
        setGcalPopupOpen(false);
    };


    const navigate = useNavigate();
    const [chartedUsers, setChartedUsers] = useState<userData | undefined>(undefined)
    const [calendarState, setCalendarState] = useState<calanderState | undefined>(undefined);
    const [calendarFramework, setCalendarFramework] = useState<calendarDimensions | undefined>(undefined)

    const [selectedLocations, updateSelectedLocations] = useState([]);

    const [ loading, setLoading ] = useState(true);

    const [eventName, setEventName] = useState("")
    const [eventDescription, setEventDescription] = useState("")
    const [locationOptions, setLocationOptions] = useState(Array<String>)
    
    const [chosenDateRange, setChosenDateRange] = useState([])
    const [promptUserForLogin, setPromptUserForLogin] = useState(false);

    const endPromptUserForLogin = () => {
        setPromptUserForLogin(false);
    }

    const [dragState, setDragState] = useState({
        dragStartedOnID : [], // [columnID, blockID]
        dragEndedOnID : [],
        dragStartedOn : false,
        affectedBlocks : new Set()
    })

    const [gapi, setGapi] = useState<typeof globalThis.gapi | null>(null);
    const [authInstance, setAuthInstance] = useState<gapi.auth2.GoogleAuthBase | null>(null);
    const [user, setUser] = useState<gapi.auth2.GoogleUser | null>(null);

    const [googleCalendarEvents, setGoogleCalendarEvents] = useState<Date[]>([]);
    const [googleCalIds, setGoogleCalIds] = useState<string[]>(["primary"]);
    const [googleCalendars, setGoogleCalendars] = useState<any[]>([])
    const [selectedPopupIds, setSelectedPopupIds] = useState<string[]>()

    const GAPI_CLIENT_NAME = 'client:auth2';

    // Load gapi client after gapi script loaded
    //@ts-ignore
    const loadGapiClient = (gapiInstance: typeof globalThis.gapi) => {
        gapiInstance.load(GAPI_CLIENT_NAME, () => {
            try {
                gapiInstance.client.load('calendar', 'v3');

            } catch {
            gapiInstance.client.init({
                apiKey: REACT_APP_API_KEY_GAPI,
                clientId: REACT_APP_CLIENT_ID_GAPI,
                scope: SCOPES,
            });
            gapiInstance.client.load('calendar', 'v3');

            }
        });
    };

    useEffect(() => {
        const getGoogleCalData = async (calIds: string[]) => {
            try {

                //@ts-ignore
                let theDates = [].concat(...(calendarFramework?.dates || []));   
                
                let parsedEvents = []

                if (calIds.length == 0) {
                    setGoogleCalendarEvents([]);
                    return;

                }

                for (let i = 0; i < calIds.length; i++) {

                    //@ts-ignore
                    const eventList = await gapi.client.calendar.events.list({
                        calendarId: calIds[i],
                        //@ts-ignore
                        timeMin: theDates[0].date.toISOString(),
                        //@ts-ignore
                        timeMax: theDates[theDates.length - 1].date.toISOString(),
                        singleEvents: true,
                        orderBy: 'startTime',
                    });
                    
                    let theEvents = eventList.result.items;

                    for (let i = 0; i < theEvents.length; i++) {
                        let startDate = new Date(theEvents[i].start.dateTime)
                        let endDate = new Date(theEvents[i].end.dateTime)

                        if (startDate.getDay() != endDate.getDay()) {
                            continue;
                        }

                        parsedEvents.push([startDate, endDate]);
                    }

                }

            console.log(parsedEvents);

            //@ts-ignore
            setGoogleCalendarEvents([...googleCalendarEvents, ...parsedEvents]);

            } catch (error) {
                console.error('Error fetching calendar events:', error);
            }
        }

        if (gapi) {
            console.log("gapi loaded")
            console.log(googleCalIds);
            getGoogleCalData(googleCalIds);
        } else {
            console.log("gapi not loaded")
        }
        
    }, [gapi, googleCalIds]);

    const fetchUserCals = () => {
        return new Promise((resolve, reject) => {
         //@ts-ignore
          gapi.client.calendar.calendarList.list()
          //@ts-ignore
            .then(response => {
              const calendars = response.result.items;
              resolve(calendars);
            })
            //@ts-ignore
            .catch(error => {
              reject(error);
            });
        });
    };

    const onPopupCloseAndSubmit = () => {
        //@ts-ignore
        setGoogleCalIds(selectedPopupIds);
        setGcalPopupOpen(false);
    }
    
    useEffect(() => {
        const fetchData = async () => {
            if (code && code.length === 6) {
                await getEventOnPageload(code).then(() => {
                    const { availabilities, participants } = eventAPI.getCalendar();
                    const dim = eventAPI.getCalendarDimensions();

                    console.log(dim);

                    if (dim == undefined) {
                        nav("/undefined")

                    }

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
                nav("/notfound")
            }
        };

        async function loadGapi() {
            const newGapi = await loadGapiInsideDOM();
            loadGapiClient(newGapi);
            const newAuth2 = await loadAuth2(
                newGapi,
                REACT_APP_CLIENT_ID_GAPI || "",
                SCOPES,
            );
            setGapi(newGapi);
            setAuthInstance(newAuth2);
            setLoading(false);
        }
        
        fetchData().then(() => {
            if (getAccountName() == "" || getAccountName() == undefined) {
                setPromptUserForLogin(true)
            }
            loadGapi()
        }).catch((err) => {
            console.log(err);
        }
        )

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
        <div className="bg-sky-100 ml-5 w-[90%] md:w-[100%] items-center">
            <div className="flex flex-col justify-center content-center md:flex-row md:mx-12">
                {/*There was an mx-9*/}
                <div className="flex flex-col flex-wrap justify-start sm:pt-12 md:w-[40%] md:pr-10 w-[100%] md:content-left md:px-[5%]">
                    <div className="mb-8">
                        <h3 className="text-m text-left text-gray-400 w-[100%]">Event Name</h3>
                        <h3 className="text-2xl sm:text-3xl font-bold text-left w-[100%]">{eventName}</h3>
                    </div>
                    {eventDescription && (
                        <div className="mb-8">
                            <h3 className="text-m text-left text-gray-400 w-[100%]">Description</h3>
                            <h3 className="text-xl sm:text-2xl font-bold text-left w-[100%]">{eventDescription}</h3>
                        </div>
                    )}
            
                    <div>
                        {locationOptions.length > 0 && (
                        <div className="flex-col content-center mt-5 mb-8 w-[100%]">
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
                            <div className='text-gray text-2xl text-bold'>
                                Note : You can't edit your availability because the admin has already selected a time and/or location!
                            </div>
                        }
                    </div>
                </div>

                <div className={`flex flex-col ${chosenDateRange !== undefined ? 'opacity-60' : ''} justify-center content-center items-center mt-0 mb-6 md:w-[50%] sm:w-[100%] md:content-start`}>
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
                    //@ts-ignore
                    theGoogleCalendarEvents={[googleCalendarEvents, setGoogleCalendarEvents]}
                />
                {/*The first date having a year be 2000 means that it was a general days selection*/}
                {/*@ts-ignore*/}
                {calendarFramework?.dates[0][0].date?.getFullYear() !== 2000 && chosenDateRange === undefined && <button onClick={() => {
                        fetchUserCals()
                        .then((calendars) => {
                            

                            //@ts-ignore
                            const calendarIDs = calendars.map(calendar => calendar.id);

                            console.log("User's Google Calendars:", calendars);
                            
                            //@ts-ignore
                            setGoogleCalendars(calendars);

                            setGcalPopupOpen(true);

                            // setGoogleCalIds(calendarIDs)
                  
                        })
                        .catch(error => {
                          console.error("Error fetching Google Calendars:", error);
                        });
                    }} className={`text-lg md:mb-6 bg-blue-500 w-fit flex 0gap-2 text-white font-medium py-0.5 sm:py-1 md:py-1.5 px-5 rounded-lg hover:bg-ymeets-med-blue disabled:bg-gray-500 active:bg-ymeets-light-blue transition-colors`}
                  >
                    Toggle GCal Availabilities
                </button>}
                <Popup isOpen={isGcalPopupOpen} onClose={closeGcalPopup} onCloseAndSubmit={onPopupCloseAndSubmit}>
                    <h2 className="text-2xl font-bold mb-4">Select GCals</h2>
                    <FormGroup>
                        {googleCalendars.map((cal: any) => (
                            <FormControlLabel
                                key={cal.id}
                                control={<Checkbox checked={selectedPopupIds?.includes(cal.id)} />}
                                label={cal.summary}
                                onChange={() => {
                                    setSelectedPopupIds((prevState) => {
                                        if (prevState?.includes(cal.id)) {
                                            // If the ID is already in the array, remove it
                                            return prevState.filter((id) => id !== cal.id);
                                        } else {
                                            // If the ID is not in the array, add it
                                            return [...(prevState || []), cal.id];
                                        }
                                    });
                                }}
                            />
                        ))}
                    </FormGroup>
                </Popup>
                {promptUserForLogin && <LoginPopup
                    onClose={endPromptUserForLogin}
                    enableAnonymousSignIn={true}
                />}
                </div>
                
            </div>
        </div>
    );
}

export default TimeSelectApp;
