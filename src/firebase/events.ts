// Take a look at this article to get started
// Perhaps surprisingly, our use-case is not so different from this messaging service
// https://levelup.gitconnected.com/structure-firestore-firebase-for-scalable-chat-app-939c7a6cd0f5

import { db } from './firebase';
import { event, eventId, participant } from '../types';

function getEventById(id: eventId) {

}

function createEvent(event: event) {

}

// hold off on working on this one
// TODO: Discuss should events be editable after creation?
function updateEvent(event: event) {

}

function updateEventWithParticipant(eventId: eventId, participant: participant) {

}

export {
    getEventById,
    createEvent,
    updateEvent,
    updateEventWithParticipant
}
