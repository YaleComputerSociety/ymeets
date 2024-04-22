import { useState } from 'react';
import './day_select_component.css';
import CalanderComponent from '../calander_component';
import frontendEventAPI from "../../../firebase/eventAPI";
import { getAccountId, getAccountName } from "../../../firebase/events";
import { useNavigate } from "react-router-dom";
import Select from "react-dropdown-select";
import Button from '../../utils/components/Button';

export const DaySelectComponent = () => {

    // Default event start/end time values
    const nineAM = new Date(`January 1, 2023`);
    nineAM.setHours(9);
    const fivePM = new Date(`January 1, 2023`);
    fivePM.setHours(17);
    
    const [eventName, setEventName] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [startDate, setStartDate] = useState(nineAM);
    const [endDate, setEndDate] = useState(fivePM);
    const [selectedDates, setSelectedDates] = useState([]);
    const [popUpMessage, setPopupMessage] = useState("");
    const [popUpIsOpen, setPopupIsOpen] = useState(false);
    const [locations, updateLocationsState] = useState<string[]>([]);
    const [locationOptions, setLocationOptions] = useState<any[]>([
        {
            label : "17 Hillhouse",
            value : "17 Hillhouse"
        },
        {
            label : "Bass",
            value : "Bass",
        },
        {
            label : "HQ",
            value : "HQ"
        },
        {
            label : "LC",
            value : "LC"
        },
        {
            label : "Sterling",
            value : "Sterling"
        },
        {
            label : "TSAI City",
            value : "TSAI City"
        },
        {
            label : "WLH",
            value : "WLH"
        }
    ]);

    const handleUpdateStartTime = (time: Date) => {
        setStartDate(time)
    }

    const handleUpdateEndTime = (time: Date) => {
        setEndDate(time)
    }

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

        
        if (startDate.getHours() === 0 && startDate.getMinutes() === 0 && startDate.getSeconds() === 0 &&
        endDate.getHours() === 0 && endDate.getMinutes() === 0 && endDate.getSeconds() === 0) {            
            // alert('Make sure to enter times!');
            alert('Make sure to enter times!');
            return;
        }

        if (startDate >= endDate) {
            // alert('Make sure your end time is after your start time!');
            alert('Make sure your end time is after your start time!');
            return;
        }

        // Optional; backend supports an empty string for name
        if (eventName.length == 0) {
            // alert('Make sure to name your event!');
            alert('Make sure to name your event!');
            return;
        }

        if (selectGeneralDays) {

            let generallySelectedDates : Date[] = []

            console.log(selectedDays);

            Object.keys(selectedDays).forEach((day) => {
                //@ts-ignore
                if (selectedDays[day].selected === true) {
                    //@ts-ignore
                    generallySelectedDates.push(selectedDays[day].dateObj)
                }
            });

            if (generallySelectedDates.length == 0) { 
                alert('You need to pick some days!');
                return;
            }

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
                alert('Make sure to enter dates!');
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

    const handleTabChange = (tab: 'Specific Days' | 'General Days') => {
        setSelectGeneralDays(tab === 'General Days');
    };
       
    return (
        <div className="flex flex-col justify-center items-center sm:items-start md:flex-row md:w-[80%] sm:w-[90%] xl:w-[65%] mx-auto px-2 text-center">
            <div className="flex flex-col flex-wrap justify-start w-[100%] md:content-start mt-6">
                <div className="space-y-3 mb-8 md:w-[90%] md:space-y-8 md:mt-12 ">
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
                            {/* <input
                                id="event-description"
                                maxLength={30}
                                style={{resize: "none"}}
                                className="p-3 px-4 text-base w-[80%] border rounded-lg"
                                placeholder="Location Choices (Optional)"
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

                                
                            /> */}
                               <Select  
                                    style={{ width : "100%", height: "100%", minWidth: "24.5vw" }} // Set the width to 300px (adjust as needed)
                                    multi
                                    create={true}
                                    onCreateNew={(newItem) => {
                                        console.log(newItem);
                                        setLocationOptions((oldOptions: any) => {
                                            return [...oldOptions, newItem];
                                        });
                                    }}
                                    options={locationOptions} 
                                    clearOnSelect={false}
                                    values={[]} 
                                    onChange={(values) => {
                                        console.log(values);
                        
                                        const selectedValues = values.map((val) => val.value);
                                        console.log(selectedValues);
                                        updateLocationsState(selectedValues)
                        
                                    }}
                                    placeholder="Locations (Optional)"
                                    // className="w-[80%] border rounded-lg p-3 px-4 text-base"
                                />


                        </div>
                        <div className="mb-6">
                            <div className="w-[100%] flex flex-row justify-center md:justify-start mb-6">
                                <div className="p-1 w-[80%] text-gray-500 text-left text-sm md:text-left">
                                    Type and click ENTER to add options not listed.
                                </div>
                            </div>
                            {/* <div className="flex flex-col justify-left items-center w-[100%] space-y-3 max-h-32 overflow-y-scroll">
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
                            </div> */}
                        </div>
                    </div>
                </div>
                
            </div>
            
            <div className="flex flex-col flex-wrap space-y-2 mb-6 w-[90%] sm:w-[85%]">
                {/* <Button 
                    bgColor='blue-500'
                    textColor='white'
                    onClick={() => {setSelectGeneralDays((oldState) => {
                        return !oldState
                    })}}
                >   
                    {
                        selectGeneralDays === true ? "Select Specfic Dates" : "Select General Days"
                    }
                </Button> */}

                <div className="mb-4 flex space-x-4 p-2 bg-white rounded-lg shadow-md relative">
                    <button
                        onClick={() => handleTabChange('Specific Days')}
                        className={`flex-1 px-4 rounded-md focus:outline-none transition-all duration-300 relative ${
                        selectGeneralDays ? 'text-black' : 'text-white'
                        }`}
                    >
                        <span className="relative z-10">Specific Days</span>
                        <div
                        className={`absolute rounded-md transition-transform duration-300 ${
                            selectGeneralDays ? 'translate-x-[110%]' : 'translate-x-0'
                        } bg-blue-600`}
                        />
                    </button>
                    <button
                        onClick={() => handleTabChange('General Days')}
                        className={`flex-1 px-4 rounded-md focus:outline-none transition-all duration-300 relative ${
                        selectGeneralDays ? 'text-white' : 'text-black'
                        }`}
                    >
                        <span className="relative z-10">General Days</span>
                        <div
                        className={`absolute md:left-0.5 inset-0 rounded-md transition-transform duration-300 ${
                            selectGeneralDays ? 'translate-x-0' : '-translate-x-[110%]'
                        } bg-blue-600`}
                        />
                    </button>
                </div>
             
                <div className="w-full h-2/4 xs:mb-2 md:mb-0">
            
                    <CalanderComponent 
                        theSelectGeneralDays={[selectGeneralDays, setSelectGeneralDays]}
                        theGeneralDays={[selectedDays, setSelectedDays]}
                        theEventName={[eventName, setEventName]}
                        selectedStartDate={[startDate, setStartDate]}
                        selectedEndDate={[endDate, setEndDate]}
                        // @ts-ignore
                        theSelectedDates={[selectedDates, setSelectedDates]}
                        popUpOpen={[popUpIsOpen, setPopupIsOpen]}
                        popUpMessage={[popUpMessage, setPopupMessage]}
    
                    />  
                
                </div>
                <div className='flex items-center justify-center'>
                <Button 
                    textColor='white'
                    bgColor='blue-500'
                    onClick={verifyNextAndSubmitEvent}
                    
                >
                                    Next
                </Button>
                </div>
            </div>
            
        </div>

    );
}