import { LocationSelectionComponent } from './LocationSelectionComponent';
// import GroupAvailCal from "./components/GroupAvailCal"
import { useState, useEffect } from "react"
import { calanderState, userData } from '../../types'
import { calendarDimensions } from '../../types'
import eventAPI from "../../firebase/eventAPI"
import { useNavigate, useParams } from 'react-router-dom';
import { getAccountId, getAccountName, getAvailabilityByAccountId, getAvailabilityByName, getEventOnPageload, wrappedSaveParticipantDetails, getEventName, getEventDescription, getLocationOptions, getParticipantIndex, checkIfLoggedIn } from '../../firebase/events';
import { Availability } from '../../types';
import Calendar from "../selectCalendarComponents/CalendarApp";
import { getChosenDayAndTime } from '../../firebase/events';
import { Popup } from '../utils/components/Popup';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import {LoginPopup} from '../utils/components/LoginPopup/login_guest_popup';
import { LoadingAnim } from "../utils/components/LoadingAnim";
import { signInWithGoogle } from '../../firebase/auth';
import LOGO from "../DaySelect/general_popup_component/googlelogo.png";
import { GAPIContext } from '../../firebase/gapiContext';
import { useContext } from 'react';
import Button from '../utils/components/Button';

/**
 * 
 * @returns Page Component
 */
function TimeSelectPage() {
    const { code } = useParams();
    const [isGcalPopupOpen, setGcalPopupOpen] = useState(false);

    const nav = useNavigate();
    
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

    const [selectedDateTimeObjects, setSelectedDateTimeObjects] = useState([])
    const [promptUserForLogin, setPromptUserForLogin] = useState(false);

    // hook that handles whether or not we are working with dates, or just selecting days of the week
    const [areSelectingGeneralDays, setAreSelectingGeneralDays] = useState(false)

    const endPromptUserForLogin = () => {
        setPromptUserForLogin(false);
        window.location.reload();
    }

    const [dragState, setDragState] = useState({
        dragStartedOnID : [], // [columnID, blockID]
        dragEndedOnID : [],
        dragStartedOn : false,
        affectedBlocks : new Set()
    })

    const gapiContext = useContext(GAPIContext);
    const { gapi, handleIsSignedIn } = gapiContext;

    const [googleCalendarEvents, setGoogleCalendarEvents] = useState<Date[]>([]);
    const [googleCalIds, setGoogleCalIds] = useState<string[]>(["primary"]);
    const [googleCalendars, setGoogleCalendars] = useState<any[]>([])
    const [selectedPopupIds, setSelectedPopupIds] = useState<string[]>()

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

                    if (dim == undefined) {
                        nav("/notfound")
                    }

                    const accountName = getAccountName();
                    if (accountName === null) {   
                        console.log("User not logged in");
                        return;
                    }                    
                    //@ts-ignore
                    setSelectedDateTimeObjects(getChosenDayAndTime());

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
                    let theRange = getChosenDayAndTime()

                    //@ts-ignore
                    setSelectedDateTimeObjects(theRange);

                    // @ts-ignore
                    setCalendarState([...availabilities, avail]);
                    setCalendarFramework(dim);
                    
                    /* The first date having a year be 2000 means that it was a general days selection */
                    setAreSelectingGeneralDays(dim?.dates[0][0].date?.getFullYear() == 2000 && theRange === undefined)

                    // if there's a selection already made, nav to groupview since you're not allowed to edit ur avail
       
                    //@ts-ignore
                    if (theRange != undefined && theRange?.length !== 0) {
                        nav("/groupview/" + code)
                    }

                });
            } else {
                console.error("The event code in the URL doesn't exist");
                nav("/notfound")
            }
        };
        
        fetchData().then(() => {
            if (getAccountName() == "" || getAccountName() == undefined) {
                setPromptUserForLogin(true)
            }

            setLoading(false);

        }).catch((err) => {
            console.log(err);
        }
        )

    }, []);
    
    if (loading) {
        return <div className="w-full h-[60%] flex flex-col items-center justify-center">
            <LoadingAnim/>
            <p className="text-gray-500">Loading...</p>
            </div>;
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
    
    return (
        <div className="bg-sky-100 ml-5 w-[90%] md:w-[100%] items-center">
            <div className="flex flex-col justify-center content-center md:flex-row md:mx-12">
                {/*There was an mx-9*/}
                <div className="flex flex-col flex-wrap justify-start sm:pt-12 md:w-[45%] md:pr-10 w-[100%] md:content-center">
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
            
                  

                    {selectedDateTimeObjects == undefined && <div>
                        {locationOptions.length > 0 && (
                        <div className="flex-col content-center mt-5 mb-8 w-[100%]">
                            <LocationSelectionComponent
                                update={updateSelectedLocations}
                                locations={locationOptions}
                            />
                        </div>
                        )}
                    </div>
                    }

                    <div className="flex flex-col items-center justify-center">
                        <Button 
                        bgColor='blue-500'
                        textColor='white'
                        onClick={handleSubmitAvailability}>
                            Submit Availability / View Group Availability
                        </Button>
                        <br/>
                        { selectedDateTimeObjects !== undefined &&
                            <div className='text-gray text-2xl text-bold'>
                                Note : You can't edit your availability because the admin has already selected a time and/or location!
                            </div>
                        }
                    </div>
                </div>
                <div className={`flex flex-col ${selectedDateTimeObjects !== undefined ? 'opacity-60' : ''} justify-center items-center content-center h-1/4 mt-0 md:w-[45%] sm:w-[100%] md:items-start`}>
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
                    theSelectedDate={[selectedDateTimeObjects, setSelectedDateTimeObjects]}
                    //@ts-ignore
                    theDragState={[dragState, setDragState]}
                    isAdmin={false}
                    //@ts-ignore
                    theGoogleCalendarEvents={[googleCalendarEvents, setGoogleCalendarEvents]}
                />
                {/*@ts-ignore*/}
                {!areSelectingGeneralDays && getAccountId() !== ""
                ? <Button
                        bgColor="blue-500"
                        textColor='white'
                        onClick={() => {
                            fetchUserCals()
                            .then((calendars) => {
                                
                                //@ts-ignore
                                const calendarIDs = calendars.map(calendar => calendar.id);

                                console.log("User's Google Calendars:", calendars);
                                
                                //@ts-ignore
                                setGoogleCalendars(calendars);

                                setGcalPopupOpen(true);
                    
                            })
                            .catch(error => {
                            console.error("Error fetching Google Calendars:", error);
                            });
                        }} 
                    >
                        Toggle GCal Availabilities
                    </Button>
                    : !areSelectingGeneralDays && <button className='sm:font-bold rounded-full shadow-md bg-white text-gray-600 py-4 px-4 sm:px-6 text-md sm:text-lg w-fit \
                                        transform transition-transform hover:scale-90 active:scale-100e flex items-center'
                            onClick={() => {signInWithGoogle(undefined, gapi, handleIsSignedIn).then(() => {console.log("logged here in"); window.location.reload()})}}>
                            <img src={LOGO} alt="Logo" className="mr-3 h-7" /> 
                            Sign in with Google to access GCAL
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

export default TimeSelectPage;
