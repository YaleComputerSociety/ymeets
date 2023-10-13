import { doc, collection, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Availability, Event, Location, EventDetails, EventId, Participant } from '../types';
import { db } from './firebase';

// ASSUME names are unique within an event

var workingEvent: Event = {
    publicId: "ABABAB", 
    details: {
        name: "name",
        adminName: "string",
        description: "description",
        adminAccountId: "admin_account_id",
        dates: [],
        startTime: 100, // minutes; min: 0, max 24*60 = 1440
        endTime: 200, // minutes; min: 0, max 24*60 = 1440
        plausibleLocations: ["HH17", "Sterling"],
    }, 
    participants: []
};

const checkIfLoggedIn = (): boolean => {
    return false
}

const checkIfAdmin = (): boolean => {
    return false
}

// https://firebase.google.com/docs/firestore/manage-data/add-data
// may have better way to generate id (Firestore can do it automatically)
const generateUniqueId = (): string => {
    // new method will generate a random string indexing [0,9,a,b,c...,z] - [i,l,0,o]
    // to generate a 6-character code. Not currently checking if already in the database
    // else would generate a new string, check again. Appox: 1.07 billion
    let id = "";
    let valid_chars = "abcdefghjkmnpqrstuvwxyz123456789"
    for (let i = 0; i < 6; i++) {
        id += valid_chars[(Math.floor(Math.random() * (valid_chars.length)))].toUpperCase();
    }
    return id;
}

// PURPOSE: Internal use and to check if event of id exists.
// Retreives an event from the backend given the id
// Will throw an error if the document cannot be found
// Event is not return; rather, it is stored internally
// for other getters and settings defined in this file.
async function getEventById(id: EventId): Promise<void> {
    const eventsRef = collection(db, "events")
    return new Promise((resolve, reject) => {
        getDoc(doc(eventsRef, id)).then((result) => {  
            if (result.exists()) {
                // @ts-ignore
                workingEvent = result.data()
                resolve();
            } else {
                console.log("Document does not exist.");
                reject("Document not found");
            }
        }).catch((err) => {
            console.log("Caught " + err + " with message " + err.msg);
            reject(err);
        });
    });
}

// Stores a new event passed in as a parameter to the backend
async function createEvent(event: Event): Promise<Event | null> {
    const id = generateUniqueId();
    const newEvent: Event = {
        details: {
            ...event.details,
            // TODO map dates to JSON
            // @ts-ignore
            dates: dateToObject(event.details.dates)
        },
        publicId: id,
        participants: [],
    };

    return new Promise((resolve, reject) => {
        const eventsRef = collection(db, "events")
        setDoc(doc(eventsRef, id), newEvent) // addDoc as overwrite-safe alt
            .then((result: void) => {
                resolve(newEvent);

            }).catch((err) => {
                console.log(err.msg);
                reject(err);

            });
    });
}

// Updates (overwrites) the event details of the working event 
// with the eventDetails parameter 
function saveEventDetails(eventDetails: EventDetails) {
    return new Promise<void>((resolve, reject) => {
        const eventsRef = collection(db, "events")
        updateDoc(doc(eventsRef, workingEvent.publicId), {
            details: eventDetails
            
          }).then(() => {
                resolve();

            }).catch((err) => {
                console.log(err.msg);
                reject(err);

        });
    });
}

// Updates the participants list of the working event 
// with the participant passed in, overwriting if they already exist
function saveParticipantDetails(participant: Participant) {
    return new Promise<void>((resolve, reject) => {
        const eventsRef = collection(db, "events");
        const participantsRef = collection(eventsRef, "participants");
        let partRef;
        if (participant.accountId) {
            partRef = doc(participantsRef, participant.accountId);
        } else {
            partRef = doc(participantsRef, participant.name);
        }

        setDoc(doc(partRef, participant.name), {
            name: participant.name,
            accountId: participant.accountId,
            availability: JSON.stringify(participant.availability),
            location: participant.location,

          }).then(() => {
                resolve();

            }).catch((err) => {
                console.log(err.msg);
                reject(err);

        });
    });
}

// Sets the availability of a participant of the name parameter with their 
// availability object; passing in their accountId is optional addition verification
function setAvailability(name: string, availability: Availability, accountId: string = "") {
    let index;
    for (let i = 0; i < workingEvent.participants.length; i++) {
        if (workingEvent.participants[i].name == name || workingEvent.participants[i].accountId == accountId) {
            index = i;
        }
    }
    if (!index) {
        throw new Error('Cannot find participant');
    }

    workingEvent.participants[index].availability = JSON.stringify(availability);

    saveParticipantDetails(workingEvent.participants[index]);
}

// Sets the location preference of a participant of the name parameter with 
// location parameter object; passing in their accountId is optional addition verification
function setLocationPreference(name: string, location: Location, accountId: string = "") {
    let index;
    for (let i = 0; i < workingEvent.participants.length; i++) {
        if (workingEvent.participants[i].name == name || workingEvent.participants[i].accountId == accountId) {
            index = i;
        }
    }
    if (!index) {
        throw new Error('Cannot find participant');
    }

    workingEvent.participants[index].location = location;

    saveParticipantDetails(workingEvent.participants[index]);
}

// Sets the official date for the event; must be called by the admin 
function setChosenDate(chosenStartDate: Date, chosenEndDate: Date) {
    workingEvent.details.chosenStartDate = chosenStartDate
    workingEvent.details.chosenEndDate = chosenEndDate

    saveEventDetails(workingEvent.details)
}

// Sets the official location for the event; must be called by the admin 
function setChosenLocation(chosenLocation: Location) {
    workingEvent.details.chosenLocation = chosenLocation

    saveEventDetails(workingEvent.details)
}

// Retrieves the list of locations to be considered for the event
function getLocationOptions(): Location[] {
    return workingEvent.details.plausibleLocations
}

// Retrieves the name of the event
function getEventName(): string {
    return workingEvent.details.name
}

// Retrieves the description of the event
function getEventDescription(): string {
    return workingEvent.details.description
}

// To be called on render when a page loads with event id in url
async function getEventOnPageload(id: string): Promise<void> {
    if (workingEvent && workingEvent.publicId == id) {
        console.log("Exists, skipping")
        return Promise.resolve()
    } else {
        return getEventById(id)
    }
}

// Retrieves the availability object of the participant of the parameter name
function getAvailabilityByName(name: string): Availability | undefined {
    for (let i = 0; i < workingEvent.participants.length; i++) {
        if (workingEvent.participants[i].name == name) {
            return JSON.parse(workingEvent.participants[i].availability)
        }
    }
}

// Retrieves the availability object of the participant of the parameter accountId
function getAvailabilityByAccountId(accountId: string): Availability | undefined {
    for (let i = 0; i < workingEvent.participants.length; i++) {
        if (workingEvent.participants[i].accountId == accountId) {
            return JSON.parse(workingEvent.participants[i].availability)
        }
    }
}

// Retrieves the list of participants
// GUARANTEED to be the in the same order as getAllAvailabilities
function getAllAvailabilitiesNames(): string[] {
    let names: string[] = []
    for (let i = 0; i < workingEvent.participants.length; i++) {
        names.push(workingEvent.participants[i].name)
    }
    return names
}

// Retrieves the list of availabilities
// GUARANTEED to be the in the same order as getAllAvailabilitiesNames
function getAllAvailabilities(): Availability[] {
    let avails: Availability[] = []
    for (let i = 0; i < workingEvent.participants.length; i++) {
        avails.push(JSON.parse(workingEvent.participants[i].availability))
    }
    return avails
}

// Retrieves the official date and time of the event as chosen by the admin
function getChosenDayAndTime(): [startDate: Date, endDate: Date] | undefined  {
    if (workingEvent.details.chosenStartDate && workingEvent.details.chosenEndDate) {
        return [workingEvent.details.chosenStartDate, workingEvent.details.chosenEndDate]
    }
}

// Retrieves the official location of the event as chosen by the admin
function getChosenLocation(): Location | undefined {
    return workingEvent.details.chosenLocation
}

// Retrieves the dict objects mapping locations (keys) to number of votes (items)
function getLocationsVotes(): { [id: Location]: number; } {
    const votes: { [id: Location]: number; } = {}
    for (const location in workingEvent.details.plausibleLocations) {
        votes[location] = 0
        for (var participant in workingEvent.participants) {
            // @ts-ignore
            if (participant.location == location) {
                votes[location] += 1
            }
        }
    }
    return votes
}

export {
    checkIfLoggedIn,
    checkIfAdmin,

    getEventById,
    createEvent,
    
    getChosenLocation,
    getChosenDayAndTime,
    getAllAvailabilities,
    getAllAvailabilitiesNames,
    getAvailabilityByAccountId,
    getAvailabilityByName,
    getEventOnPageload,
    getEventDescription,
    getEventName,
    getLocationOptions,
    getLocationsVotes,

    setChosenLocation,
    setChosenDate,
    setLocationPreference,
    setAvailability,
}

function dateToObject(dateArray: number[][]): {[key: number]: number[]} {
    const dateObject: {[key: number]: number[]} = {};
    dateArray.forEach((date: number[], index: number) => {
      dateObject[index + 1] = date;
    });
    return dateObject;
  }

function dateToArray(obj: { [key: number]: [number, number, number] }): Array<[number, number, number]> {
    const result: Array<[number, number, number]> = [];  
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
        result.push(obj[key]);
        }
    }
    return result;
}

function eventToArray(data: any): Event | null {
    if (!data) return null;
    data.details.dates = dateToArray(data.details.dates);
    return data;
}