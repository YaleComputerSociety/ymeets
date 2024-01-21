import * as React from "react";
import { useState } from 'react';
import './day_select_component.css';
import CalanderComponent from '../calander_component';
import frontendEventAPI from "../../../firebase/eventAPI";
import { getAccountId, getAccountName } from "../../../firebase/events";
import { EventDetails } from "../../../types";
import { useNavigate } from "react-router-dom";
import LocationSelectionComponent from "../../locationSelectionComponent"
import DaysNotDates from "../select_days_not_dates/DaysNotDates";

export const DaySelectComponent = () => {

    // Default event start/end time values
    const nineAMToday = new Date(new Date().toDateString());
    nineAMToday.setHours(9);
    const fivePMToday = new Date(new Date().toDateString());
    fivePMToday.setHours(17);
    
    const [eventName, setEventName] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [startDate, setStartDate] = useState(nineAMToday);
    const [endDate, setEndDate] = useState(fivePMToday);
    const [selectedDates, setSelectedDates] = useState([]);
    const [popUpMessage, setPopupMessage] = useState("");
    const [popUpIsOpen, setPopupIsOpen] = useState(false);
    const [locations, updateLocationsState] = useState<string[]>([]);
    const [locationField, setLocationField] = useState("");

    const [selectedDays, setSelectedDays] = useState({
        "SUN" : {
            dateObj : new Date(2000, 0, 2),
            selected : false
        },
        "MON" : {
            dateObj : new Date(2000, 0, 3),
            selected : false
        },
        "TUE" : {
            dateObj : new Date(2000, 0, 4),
            selected : false
        },
        "WED" : {
            dateObj : new Date(2000, 0, 5),
            selected : false
        },
        "THU" : {
            dateObj : new Date(2000, 0, 6),
            selected : false
        },
        "FRI" : {
            dateObj : new Date(2000, 0, 7),
            selected : false
        },
        "SAT" : {
            dateObj : new Date(2000, 0, 8),
            selected : false
        },
    })

    const [selectGeneralDays, setSelectGeneralDays] = useState(false);

    const showAlert = (message: string) => {
        setPopupMessage(message);
        setPopupIsOpen(true);
    };

    const navigate = useNavigate();

    const updateLocations = (values: any) => {
        console.log(values);
        updateLocationsState(values);
    }

    const removeAndUpdateLocations = (toRemove: any) => {
        return () => {
            const tmp_locations: any = [];
            for (let i = 0; i < locations.length; i++) {
                if (locations[i] != toRemove) {
                    tmp_locations.push(locations[i]);
                }
            }
            updateLocationsState(tmp_locations);
        }
    }
    const verifyNextAndSubmitEvent = () => {

        if (selectGeneralDays) {

            let generallySelectedDates : Date[] = []

            Object.keys(selectedDays).forEach((key) => {
                //@ts-ignore
                if (selectedDays[key].selected == true) {
                    //@ts-ignore
                    generallySelectedDates.push(selectedDays[key].dateObj)
                }
            });

            console.log(generallySelectedDates);

            frontendEventAPI.createNewEvent(
                eventName,
                eventDescription,
                // @ts-ignore 
                getAccountName(), // admin name
                getAccountId(), // admin ID
                //@ts-ignore
                generallySelectedDates,
                locations, // plaus locs
                startDate,
                endDate
            ).then((ev) => {
                navigate("/timeselect/" + ev?.publicId)
            })



        } else {

            if (selectedDates.length == 0) {
                // alert('Make sure to enter dates!');
                showAlert('Make sure to enter dates!');
                return;
            }
    
            if (startDate.getHours() === 0 && startDate.getMinutes() === 0 && startDate.getSeconds() === 0 &&
            endDate.getHours() === 0 && endDate.getMinutes() === 0 && endDate.getSeconds() === 0) {            
                // alert('Make sure to enter times!');
                showAlert('Make sure to enter times!');
                return;
            }
    
            if (startDate >= endDate) {
                // alert('Make sure your end time is after your start time!');
                showAlert('Make sure your end time is after your start time!');
                return;
            }
    
            // Optional; backend supports an empty string for name
            if (eventName.length == 0) {
                // alert('Make sure to name your event!');
                showAlert('Make sure to name your event!');
                return;
            }
        
            frontendEventAPI.createNewEvent(
                eventName,
                eventDescription,
                // @ts-ignore 
                getAccountName(), // admin name
                getAccountId(), // admin ID
                selectedDates,
                locations, // plaus locs
                startDate,
                endDate
            ).then((ev) => {
                navigate("/timeselect/" + ev?.publicId)
            })

        }

    }
       
    return (
        <div className="flex flex-col justify-center items-center md:flex-row md:w-[80%] sm:w-[90%] xl:w-[65%] mx-auto px-2 text-center">
            <div className="flex flex-col flex-wrap justify-start content-center w-[100%] md:content-start">
                <div className="space-y-3 mb-8 md:w-[90%] md:space-y-7 md:mt-12 ">
                    <div className="w-[100%] flex flex-row justify-center md:justify-start">
                        <input
                            id="event-name"
                            type="text"
                            className="p-3 px-4 text-base w-[80%] border rounded-lg"
                            placeholder="Event Name"
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                        />
                    </div>
                    <div className="w-[100%] flex flex-row justify-center md:justify-start">
                        <textarea
                            id="event-description"
                            style={{ resize: "none" }}
                            className="p-3 px-4 text-base w-[80%] border rounded-lg"
                            placeholder="Event Description (Optional)"
                            value={eventDescription}
                            onChange={(e) => setEventDescription(e.target.value)}
                            rows={1}
                        />
                    </div>

                    <div className="mt-0">
                        <div className="w-[100%] flex flex-row justify-center md:justify-start mb-2 space-y-2">
                            <input
                                id="event-description"
                                style={{resize: "none"}}
                                className="p-3 px-4 text-base w-[80%] border rounded-lg"
                                placeholder="Add Location Options"
                                value={locationField}
                                onChange={(e) => setLocationField(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        // Check if the location already exists
                                        if (!locations.includes(locationField)) {
                                            const tmp_locations: any = [...locations, locationField];
                                            setLocationField("");
                                            updateLocationsState(tmp_locations);

                                        } else {
                                            // Clear the text field without adding a new location
                                            setLocationField("");
                                        }
                                    }
                                }}
                            />
                            {/* <select id="event-location" className="flex justify-left border p-3 px-4 text-base w-[80%]">
                                <option value="bass">No Location</option>
                                <option value="sterling">Sterling Library</option>
                                <option value="tsai">Tsai City</option>
                                <option value="CEID">Bass Library</option>
                            </select> */}
                        </div>
                        <div className="mb-6">
                            <div className="w-[100%] flex flex-row justify-center md:justify-start mb-6">
                                <div className="p-1 w-[80%] text-gray-500 text-left text-sm md:text-left">
                                    Click ENTER after typing a location to add an option for participants
                                </div>
                            </div>
                            <div className="flex flex-col justify-left items-center w-[100%] space-y-3">
                                {locations.map((location, index) => (
                                    <div className="flex w-[100%] justify-center md:justify-start">
                                        <div className="location-selection-option flex justify-between items-center w-[80%] px-3 h-10">
                                            <div>{location}</div>
                                            <div>
                                                <button onClick={removeAndUpdateLocations(location)} className="w-[30%]">&times;</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>
            
            <div className="flex flex-col space-y-7 mb-6 w-[85%]">
                <button 
                    className="text-sm hover:scale-90 w-fit lg:text-base flex items-center gap-2 bg-blue-500 text-white font-medium py-1 sm:py-1.5 md:py-2 px-4 md:px-6 rounded-l active:bg-ymeets-light-blue transition-colors"
                    onClick={() => {setSelectGeneralDays((oldState) => {
                        return !oldState

                    })}}
                >   
                    {
                        selectGeneralDays ? "Select Specfic Dates" : "Select General Days"
                    }
                </button>
                <div className="w-full h-2/4">
                {
                    selectGeneralDays ?                
                        
                        <DaysNotDates 
                            theSelectedDays={[selectedDays, setSelectedDays]}
                        
                        /> : 
                        <CalanderComponent 
                            theEventName={[eventName, setEventName]}
                            selectedStartDate={[startDate, setStartDate]}
                            selectedEndDate={[endDate, setEndDate]}
                            // @ts-ignore
                            theSelectedDates={[selectedDates, setSelectedDates]}
                            popUpOpen={[popUpIsOpen, setPopupIsOpen]}
                            popUpMessage={[popUpMessage, setPopupMessage]}
                        />  
                }
                </div>
                <button onClick={verifyNextAndSubmitEvent}
                    className='font-bold rounded-full bg-blue-500 text-white py-4 px-7 text-lg w-fit place-self-center \
                                transform transition-transform hover:scale-90 active:scale-100e'>
                                    Next
                </button>
            </div>
            
        </div>

    );
}