// Take a look at this article to get started
// Perhaps surprisingly, our use-case is not so different from this messaging service
// https://levelup.gitconnected.com/structure-firestore-firebase-for-scalable-chat-app-939c7a6cd0f5

import { db } from './firebase';
import { event, eventId, participant } from '../types';
import { prototype } from 'events';

var emptyEvent = {id: "", details: {startDate: new Date(), endDate: new Date(), location: new Geolocation()}, participants: []};

function getEventById(id: eventId): event | null { // TODO add return statements
    return emptyEvent;
}

// throws an Error on failure
function createEvent(event: event): event {
    return emptyEvent;
}

// hold off on working on this one
// TODO: Discuss should events be editable after creation?
// throws an Error on failure
function updateEvent(event: event): void {
}

// throws an Error on failure
function updateEventWithParticipant(eventId: eventId, participant: participant): void {
}

export {
    getEventById,
    createEvent,
    updateEvent,
    updateEventWithParticipant
}
