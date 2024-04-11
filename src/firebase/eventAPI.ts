import { start } from "repl";
import { calendarDimensions, calanderState, userData, calendar, user, calandarDate } from "../types";
import { createEvent, getAllAvailabilities, getAllAvailabilitiesNames, setChosenDate, setChosenLocation, getChosenLocation, getChosenDayAndTime, getDates, getStartAndEndTimes } from "./events";
import { Availability, Location, Event, EventDetails } from "../types";
import { generateTimeBlocks } from "../components/utils/functions/generateTimeBlocks";

// TODO fetch event details -> calendarFramework

interface testData {
    userData : userData,
    scheduleDataEmpty : calanderState,
    scheduleDataFull : calanderState,
    dateData : calendarDimensions
}
 
// frontendEventAPI().method()

export default class FrontendEventAPI {
    
    constructor() {}
    
    /**
     * 
     * Returns an empty avaliability for a single user that conforms
     * to a specific calander dimension.
     * 
     * @param dims 
     * @returns Availability type
     */
    static getEmptyAvailability(dims: calendarDimensions): Availability {
        let blocksLength = generateTimeBlocks(dims.startTime, dims.endTime).length * 4;
        let days: boolean[][] = [];
        for (let i = 0; i < dims.dates.length; i++) {
            for (let k = 0; k < dims.dates[i].length; k++) {
                days.push(Array.from({ length: blocksLength }, () => false))
            }
        }

        return days
    }

    /**
     * 
     * Creates a new event in the backend. Events are objects that contain information that can form
     * a calanderFramework.  
     * 
     * @param title 
     * @param description 
     * @param adminName 
     * @param adminAccountId 
     * @param dates 
     * @param plausibleLocations 
     * @param startTime 
     * @param endTime 
     * @returns Promise object that expands to a Event object. 
     */
    static async createNewEvent(
        title: string, description: string, adminName: string, adminAccountId: string, 
        dates: Date[], plausibleLocations: Location[], startTime: Date, endTime: Date
    ): Promise<Event | null> {
        try {

            const ev: Event | null = await createEvent({
                name: title,
                description: description,
                adminName: adminName,
                adminAccountId: adminAccountId,
                dates: dates,
                startTime: startTime,
                endTime: endTime,
                plausibleLocations: plausibleLocations // TODO admin creator is not being added; maybe should be done on time select?
            });

            return ev;

        } catch (error) {

            console.error("Error creating event:", error);
            throw error;

        }
    }

    /**
     * 
     * Obtain the calander dimension from the working event. 
     * 
     * @returns 
     */
    static getCalendarDimensions() : calendarDimensions {
    
        let theDates : Date[] = getDates();
        let theCalendarDates : calandarDate[][] = []
        let curCalendarBucket : calandarDate[] = []
        let numOfCols = theDates.length;
        
        //@ts-ignore
        let numOfBlocks = getStartAndEndTimes.length > 0 ? generateTimeBlocks(getStartAndEndTimes[0], getStartAndEndTimes[1]).length * 4 : 0;
                
        let getShortDay = {
            0 : "SUN",
            1 : "MON",
            2 : "TUE",
            3 : "WED", 
            4 : "THU",
            5 : "FRI",
            6 : "SAT"
        }

        let getMonth = {
            0 : "JAN",
            1 : "FEB",
            2 : "MAR",
            3 : "APR", 
            4 : "MAY",
            5 : "JUN",
            6 : "JUL",
            7 : "AUG",
            8 : "SEP",
            9 : "OCT",
            10 : "NOV",
            11 : "DEC"
        }

        if (theDates[0].getFullYear() === 2000) {

            for (let i = 0; i < theDates.length; i++) {

                if (i == 0) {

                    curCalendarBucket.push(
                        {
                            "id" : i,
                            //@ts-ignore
                            "shortenedWeekDay" : getShortDay[theDates[i].getDay()],
                            //@ts-ignore
                            "calanderDay" : undefined,
                            //@ts-ignore
                            "month" : undefined,
                            "date" : theDates[i]
                        }
                    )  

                } else {
                    if (theDates[i].getDay() - theDates[i - 1].getDay() > 1) {
                        theCalendarDates.push([...curCalendarBucket]);
                        curCalendarBucket = [
                            {
                                "id" : i,
                                //@ts-ignore
                                "shortenedWeekDay" : getShortDay[theDates[i].getDay()],
                                //@ts-ignore
                                "calanderDay" : undefined,
                                //@ts-ignore
                                "month" : undefined,
                                "date" : theDates[i]
                            }
                        ]
                    } else {
                        curCalendarBucket.push(
                            {
                                "id" : i,
                                //@ts-ignore
                                "shortenedWeekDay" : getShortDay[theDates[i].getDay()],
                                //@ts-ignore
                                "calanderDay" : undefined,
                                //@ts-ignore
                                "month" : undefined,
                                "date" : theDates[i]
                            }
                        )
                    }
                }
            }

            if (curCalendarBucket.length > 0) {
                theCalendarDates.push(curCalendarBucket);
            }

        } else {

            for (let i = 0; i < theDates.length; i++) {

                if (i == 0) {
    
                    curCalendarBucket.push(
                        {   
                            "id" : i,
                            // @ts-ignore
                            "shortenedWeekDay" : getShortDay[theDates[i].getDay()],
                            "calanderDay" : theDates[i].getDate().toString(),
                            // @ts-ignore
                            "month" : getMonth[theDates[i].getMonth()],
                            "date" : theDates[i]
                        }
                    )
    
            
                } else {
                    const isSameYear = theDates[i].getFullYear() === theDates[i - 1].getFullYear();
                    const isSameMonth = theDates[i].getMonth() === theDates[i - 1].getMonth();
    
                    if (isSameYear && isSameMonth && Math.abs(theDates[i].getDate() - theDates[i - 1].getDate()) <= 1) {
    
                        curCalendarBucket.push(
                            {   
                                "id" : i,
                                // @ts-ignore
                                "shortenedWeekDay" : getShortDay[theDates[i].getDay()],
                                "calanderDay" : theDates[i].getDate().toString(),
                                // @ts-ignore
                                "month" : getMonth[theDates[i].getMonth()],
                                "date" : theDates[i]
                            }
                        )
                    } else {
    
                        theCalendarDates.push([...curCalendarBucket])
                        curCalendarBucket = [
                            {   
                                "id" : i,
                                // @ts-ignore
                                "shortenedWeekDay" : getShortDay[theDates[i].getDay()],
                                "calanderDay" : theDates[i].getDate().toString(),
                                // @ts-ignore
                                "month" : getMonth[theDates[i].getMonth()],
                                "date" : theDates[i]
                            }   
                        ]
                    }
                }
            }
            
            if (curCalendarBucket.length > 0) {
                theCalendarDates.push(curCalendarBucket);
            }
        }

        return {
                dates : theCalendarDates,
                startTime : getStartAndEndTimes()[0],
                endTime : getStartAndEndTimes()[1],
                numOfBlocks : numOfBlocks,
                numOfCols : numOfCols
        }
    }

    /**
     * 
     * Obtain a calander object from the working event, and contains the calanderState and the chartedUsers. 
     * 
     * @returns 
     */
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

        const availMatrix: calanderState = [];
        for (let i = 0; i < avails.length; i++) {
            // @ts-ignore
            availMatrix.push(avails[i]);
        }

        return {
            // @ts-ignore
            availabilities : availMatrix,
            participants : userData
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
            
            // @ts-ignore
            scheduleDataEmpty : [                
                    [
                        [false, false, false, false, false, false, false, false],
                        [false, false, false, false, false, false, false, false],
                        [false, false, false, false, false, false, false, false],
                        [false, false, false, false, false, false, false, false],
                        [false, false, false, false, false, false, false, false],
                        [false, false, false, false, false, false, false, false],
                        [false, false, false, false, false, false, false, false],
                        [false, false, false, false, false, false, false, false],
                        [false, false, false, false, false, false, false, false],
                        [false, false, false, false, false, false, false, false],
                    ]
                
            
            ],

            // calendarState
            scheduleDataFull :
                [
                    [
                        [true, false, true, false, true, false, true, false],
                        [true, false, true, false, true, false, true, false],
                        [true, false, true, false, true, false, true, false],
                        [true, false, true, false, true, false, true, false],
                        [true, false, true, false, true, false, true, false],
                        [true, false, true, false, true, false, true, false],
                        [true, false, true, false, true, false, true, false],
                        [true, false, true, false, true, false, true, false],
                        [true, false, true, false, true, false, true, false],
                        [true, false, true, false, true, false, true, false],                       
                    ],
                  [
                    [true, false, true, false, true, false, true, false],
                    [true, false, true, false, true, false, true, false],
                    [true, false, true, false, true, false, true, false],
                    [true, false, true, false, true, false, true, false],
                    [true, false, true, false, true, false, true, false],
                    [true, false, true, false, true, false, true, false],
                    [true, false, true, false, true, false, true, false],
                    [true, false, true, false, true, false, true, false],
                    [true, false, true, false, true, false, true, false],
                    [true, false, true, false, true, false, true, false],
                  ],
                  [
                    [true, false, true, false, true, false, true, false],
                    [true, false, true, false, true, false, true, false],
                    [true, false, true, false, true, false, true, false],
                    [true, false, true, false, true, false, true, false],
                    [true, false, true, false, true, false, true, false],
                    [true, false, true, false, true, false, true, false],
                    [true, false, true, false, true, false, true, false],
                    [true, false, true, false, true, false, true, false],
                    [true, false, true, false, true, false, true, false],
                    [true, false, true, false, true, false, true, false],
                  ]
            ],
            
            // calendarFramework
            dateData : {
                dates : [
                
                [
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
        
                [
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
            ],
                startTime : new Date('2023-08-20T10:00:00'),
                endTime : new Date('2023-09-04T12:00:00'),
                numOfBlocks : 8,
                numOfCols : 11
            }
        }
    
    }   
}