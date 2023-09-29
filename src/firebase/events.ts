import { doc, collection, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Availability, Event, Location, EventDetails, EventId, Participant } from '../types';
import { db } from './firebase';

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

async function getEventById(id: EventId): Promise<void> { // TODO add return statements
    const eventsRef = collection(db, "events")
    return new Promise((resolve, reject) => {
        getDoc(doc(eventsRef, id)).then((result) => {  
            if (result) {
                // @ts-ignore
                workingEvent = result.data()
                resolve();
            } else {
                reject();
            }
        }).catch((err) => {
            console.log("Catch " + err + " with message " + err.msg);
                reject();
        });
    });
}

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

function setAvailability(name: string, availability: Availability, accountId?: string) {
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

function setChosenDate(chosenStartDate: Date, chosenEndDate: Date) {
    workingEvent.details.chosenStartDate = chosenStartDate
    workingEvent.details.chosenEndDate = chosenEndDate

    saveEventDetails(workingEvent.details)
}

function setChosenLocation(chosenLocation: Location) {
    workingEvent.details.chosenLocation = chosenLocation

    saveEventDetails(workingEvent.details)
}

function getLocationOptions(): Location[] {
    return workingEvent.details.plausibleLocations
}

function getEventName(): string {
    return workingEvent.details.name
}

function getEventDescription(): string {
    return workingEvent.details.description
}

// called on render when a page loads with event id in url
async function getEventOnPageload(id: string): Promise<void> {
    return getEventById(id)
}

function getAvailabilityByName(name: string): Availability | undefined {
    for (let i = 0; i < workingEvent.participants.length; i++) {
        if (workingEvent.participants[i].name == name) {
            return JSON.parse(workingEvent.participants[i].availability)
        }
    }
}

function getAvailabilityByAccountId(accountId: string): Availability | undefined {
    for (let i = 0; i < workingEvent.participants.length; i++) {
        if (workingEvent.participants[i].accountId == accountId) {
            return JSON.parse(workingEvent.participants[i].availability)
        }
    }
}

function getAllAvailabilitiesNames(): string[] {
    let names: string[] = []
    for (let i = 0; i < workingEvent.participants.length; i++) {
        names.push(workingEvent.participants[i].name)
    }
    return names
}

function getAllAvailabilities(): Availability[] {
    let avails: Availability[] = []
    for (let i = 0; i < workingEvent.participants.length; i++) {
        avails.push(JSON.parse(workingEvent.participants[i].availability))
    }
    return avails
}

function getChosenDayAndTime(): [startDate: Date, endDate: Date] | undefined  {
    if (workingEvent.details.chosenStartDate && workingEvent.details.chosenEndDate) {
        return [workingEvent.details.chosenStartDate, workingEvent.details.chosenEndDate]
    }
}

function getChosenLocation(): Location | undefined {
    return workingEvent.details.chosenLocation
}

export {
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

    setChosenLocation,
    setChosenDate,
    setLocationPreference,
    setAvailability
}

// function dateToObject(dateArray: number[][]): {[key: number]: number[]} {
//     const dateObject: {[key: number]: number[]} = {};
//     dateArray.forEach((date: number[], index: number) => {
//       dateObject[index + 1] = date;
//     });
//     return dateObject;
//   }

// function dateToArray(obj: { [key: number]: [number, number, number] }): Array<[number, number, number]> {
//     const result: Array<[number, number, number]> = [];  
//     for (const key in obj) {
//         if (obj.hasOwnProperty(key)) {
//         result.push(obj[key]);
//         }
//     }
//     return result;
// }

// function eventToArray(data: any): Event | null {
//     if (!data) return null;
//     data.details.dates = dateToArray(data.details.dates);
//     return data;
// }