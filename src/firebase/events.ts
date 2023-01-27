import { addDoc, collection, DocumentReference, getDocs } from 'firebase/firestore';
import { UnsavedEvent, Event, EventId, Participant } from '../types';
import { db } from './firebase';

var emptyEvent = {id: "", details: {startDate: new Date(), endDate: new Date(), startTime: 0, endTime: 1440, location: new Geolocation()}, participants: []};

const generateUniqueId = (): string => {
    // new method will generate a random number from [1,36], indexing [a,b,c...,9,0]
    // to generate a 6-character code. Check using a get from the database (this is name of event)
    // that it doesn't exist already, else generate a new string. Appox: 2.18 billion
    const randomNum = Math.floor(Math.random() * 10^3);
    const now = Date.now();
    return now + randomNum.toString();
}

async function getEventById(id: EventId): Promise<Event | null> { // TODO add return statements
    return new Promise(() => {
        getDocs(collection(db, "events/" + id)).then((result) => {         
            if (result.docs.length === 0) {
                return null;
            } else {
                result.docs[0];
            }
        }).catch((err) => {
            console.log(err.msg);
            return null;
        });
    });
}

// throws an Error on failure
async function createEvent(event: UnsavedEvent): Promise<Event | null> {
    const id = generateUniqueId();
    const newEvent = {
        ...event,
        id: id,
    };

    return new Promise(() => {
        addDoc(collection(db, "events/" + id), newEvent)
            .then((result: DocumentReference) => {         
            return newEvent;

            }).catch((err) => {
            console.log(err.msg);
            return null;

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
