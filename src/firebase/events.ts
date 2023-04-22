import { doc, collection, getDoc, setDoc } from 'firebase/firestore';
import { UnsavedEvent, Event, EventId, Participant } from '../types';
import { db } from './firebase';

// var emptyEvent = {id: "", details: {startDate: new Date(), endDate: new Date(), startTime: 0, endTime: 1440, location: new Geolocation()}, participants: []};

const generateUniqueId = (): string => {
    // new method will generate a random number from [1,36], indexing [0,9,a,b,c...,z]
    // to generate a 6-character code. Not currently checking if already in the database
    // else would generate a new string, check again. Appox: 2.18 billion
    let id = "";
    for (let i = 0; i < 6; i++) {
        id += (Math.floor(Math.random() * (36))).toString(36).toUpperCase();
    }
    return id;
}

async function getEventById(id: EventId): Promise<Event> { // TODO add return statements
    const eventsRef = collection(db, "events")
    return new Promise((resolve, reject) => {
        getDoc(doc(eventsRef, id)).then((result) => {  
            if (result) {
                // @ts-ignore
                resolve(result.data());
            } else {
                reject();
            }
        }).catch((err) => {
            console.log("Catch " + err + " with message " + err.msg);
                reject();
        });
    });
}

// throws an Error on failure
async function createEvent(event: UnsavedEvent): Promise<Event | null> {
    const id = generateUniqueId();
    const newEvent: Event = {
        details: {
            ...event.details,
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

// hold off on working on this one
// TODO: Discuss should events be editable after creation?
// throws an Error on failure
function updateEvent(event: Event): void {
}

// throws an Error on failure
function updateEventWithParticipant(eventId: EventId, participant: Participant): void {
}

// given information about participant and event, return if available
// day in days from first day
// timestep nth 15-minute array on start
function getAvailablityForParticipant(participantName: string, event: Event, day: number, timeStep: number): boolean {
    return true;
}

// sum getAvailablityForParticipant for each participant
function getAvailablity(eventId: EventId, day: number, timeStep: number): boolean {
    return true;
}

export {
    getEventById,
    createEvent,
    updateEvent,
    updateEventWithParticipant,
    getAvailablityForParticipant,
    getAvailablity
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