import { start } from "repl";
import { calendarDimensions, calanderState, userData, calendar, user, availabilityMatrix, calandarDate } from "./components/scheduleComponents/scheduletypes";
import { createEvent, setAvailability, getAccountId, getAllAvailabilities, getAllAvailabilitiesNames, setChosenDate, setChosenLocation, getChosenLocation, getChosenDayAndTime } from "./firebase/events";
import { Availability, Location, Event, EventDetails } from "./types";

// TODO fetch event details -> calendarFramework

interface testData {

    // name, getAllAvailablilitiesNames
    userData : userData,

    // schedules, getAllAvailabilities
    scheduleData : calanderState,
    dateData : calendarDimensions
}

export default class frontendEventAPI{
    constructor(){}

    static convertToEventTime(time : string) {

        let [hour, minute] = time.split(":");

        return (parseInt(hour) * 60) + parseInt(minute)

    
    }

    static convertFromEventTime(time : Number) {

    }
    

    static createNewEvent(
        title : string, description : string, adminName : string, adminAccountId : string, dates : Date[],
        startTime : string, endTime : string, plausibleLocations : Location[]
    ) { 

        function convertTime(time : string) {

            let [hour, minute] = time.split(":");

            return (parseInt(hour) * 60) + parseInt(minute)

        }

        let convertedStartTime = convertTime(startTime)
        let convertedEndTime = convertTime(endTime)

        createEvent(
            {
                name : title,
                description : description,
                adminName : adminName,
                adminAccountId : adminAccountId,
                dates : dates,
                startTime : convertedStartTime,
                endTime : convertedEndTime,
                plausibleLocations : plausibleLocations

            }
        )
    }

    static availabilityMatrixToAvailability(availMatrix: availabilityMatrix) : Availability {
        
        let convertedAvailabilites : boolean[][] = []
        
        Object.values(availMatrix).forEach((avail : any) => {
            
            let convertedRow : boolean[] = []
        
            if (avail === 1) {
                convertedRow.push(true);
            } else {
                convertedRow.push(false);
            }

            convertedAvailabilites.push([...convertedRow])

        }) 

        return convertedAvailabilites

    }

    static availabilitytoAvailabilityMatrix(avail: Availability) : availabilityMatrix {

        let convertedAvailabilites = {}
        
        Object.values(avail).forEach((value : any, index : any) => {
            
            // @ts-ignore
            convertedAvailabilites[index] = value

        }) 

        return convertedAvailabilites
    }

    static submitCalendar(cal : calendar) {
        
        // expensive operation, potentially change.
        let numOfPariticipants = cal.participants.users.length;

        for (let i = 0; i < numOfPariticipants; i++) {
            setAvailability(
                // @ts-ignore
                cal.participants[i],
                this.availabilityMatrixToAvailability(cal.availabilities[i]),
            )

        }
    }

    // static getCalendarDimensions(ev : Event) : calendarDimensions {
    

        // for (let i = 0; i < ev.details.dates.length; i++) {

        // }

        // return {
        //     dates : {},
        //     startTime : ev.details.startTime,
        //     endTime : ev.details.endTime
        // }

    // }

    static getCalendar() : calendar {

        let avails = getAllAvailabilities()
        let names = getAllAvailabilitiesNames()

        let userData : userData = {
            users : [],
            available: [],
            unavailable : []
        }

        for (let i = 0; i < names.length; i++) {
            userData.users.push({
                name : names[i],
                id : i
            })
        }
        
        return {
            // @ts-ignore
            availabilities : this.AvailabilitytoCalendarState(avails),
            participants : userData
            }
    }

    static setAdminDecision(
        startTime : string, endTime : string, 
        startDate : calandarDate, endDate : calandarDate, location : string) {
        
        function convertTimeToDateTime(timeString: string) {
            const [hours, minutes] = timeString.split(':').map(Number);
            const now = new Date();
            now.setHours(hours);
            now.setMinutes(minutes);
            return now;
        
        }

        const newStartTime = convertTimeToDateTime(startTime);
        const newEndTime = convertTimeToDateTime(endTime);

        const startYear = parseInt(startDate.year);
        const startMonth = startDate.month;
        const startDay = parseInt(startDate.calanderDay);
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

        const newStartDate = new Date(startYear, months.indexOf(startMonth), startDay);
        newStartDate.setHours(newStartTime.getHours());
        newStartDate.setMinutes(newStartTime.getMinutes());

        
        const endYear = parseInt(endDate.year);
        const endMonth = endDate.month;
        const endDay = parseInt(endDate.calanderDay);
        
        const newEndDate = new Date(endYear, months.indexOf(endMonth), endDay);
        newEndDate.setHours(newEndTime.getHours());
        newEndDate.setMinutes(newEndTime.getMinutes());

        setChosenDate(newStartDate, newEndDate)

        setChosenLocation(location)
    }

    static getAdminDecision() {

        // @ts-ignore
        let [startDate, endDate] : [Date, Date] | undefined = getChosenDayAndTime()
        let chosenLocation = getChosenLocation()
        
        return {
            startTime : startDate,
            endTime : endDate,
            chosenLocation : chosenLocation
        }
    }

    static getTestData() : testData{
        return {
            userData : {
                users: [{name: "Tim", id: 0}, 
                        {name: "Jon", id: 1}, 
                        {name: "Janet", id: 2}],
                available: [],
                unavailable: []
            },
            scheduleData :
                [
                  {
                    0: [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    1: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    2: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    3: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    4: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    5: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    6: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
                  },
                  {
                    0: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    1: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    2: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    3: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    4: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    5: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    6: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
                  },
                  {
                    0: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    1: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    2: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    3: [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    4: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    5: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    6: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
                  }
            ],

            dateData : {
                dates : {
                    "1" : [
                    {   
                        id : 0,
                        shortenedWeekDay : "SUN",
                        calanderDay : "20",
                        year : "2023",
                        month : "AUG"
                    },
                    {   
                        id : 1,
                        shortenedWeekDay : "MON",
                        calanderDay : "21",
                        year : "2023",
                        month : "AUG"
                    },
                    {
                        id : 3,
                        shortenedWeekDay : "TUE",
                        calanderDay : "22",
                        year : "2023",
                        month : "AUG"
                    },
                    {
                        id : 4,
                        shortenedWeekDay : "WED",
                        calanderDay : "23",
                        year : "2023",
                        month : "AUG"
                    },
                    {
                        id : 5,
                        shortenedWeekDay : "THU",
                        calanderDay : "24",
                        year : "2023",
                        month : "AUG"
                    },
                    {
                        id : 6,
                        shortenedWeekDay : "FRI",
                        calanderDay : "25",
                        year : "2023",
                        month : "AUG"
                    },
                    {
                        id : 7,
                        shortenedWeekDay : "SAT",
                        calanderDay : "26",
                        year : "2023",
                        month : "AUG"
                    }
                ],
        
                "2" : [
                    {
                        id : 8,
                        shortenedWeekDay : "SUN",
                        calanderDay : "02",
                        year : "2023",
                        month : "SEPT"
                    },
        
                    {
                        id : 9,
                        shortenedWeekDay : "MON",
                        calanderDay : "03",
                        year : "2023",
                        month : "SEPT"
                    },
                    
                    {
                        id : 10,
                        shortenedWeekDay : "TUE",
                        calanderDay : "04",
                        year : "2023",
                        month : "SEPT"
                    },
                ]
            },
                startTime : "10:00:00", 
                endTime : "12:00:00",
            }
        }
    
    }   
}