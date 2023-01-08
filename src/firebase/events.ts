import { UnsavedEvent, Event, EventId, Participant } from '../types';

var emptyEvent = {id: "", details: {startDate: new Date(), endDate: new Date(), startTime: 0, endTime: 1440, location: new Geolocation()}, participants: []};

async function getEventById(id: EventId): Promise<Event | null> { // TODO add return statements
    return Promise.resolve(emptyEvent);
}

// throws an Error on failure
async function createEvent(event: UnsavedEvent): Promise<Event | null> {
    return Promise.resolve(emptyEvent);
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