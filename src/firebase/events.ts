import { doc, collection, getDoc, setDoc, updateDoc, CollectionReference, DocumentData, getDocs, Timestamp, arrayUnion, query, where, QuerySnapshot, deleteDoc, writeBatch } from 'firebase/firestore';
import { Availability, Event, Location, EventDetails, EventId, Participant } from '../types';
import { auth, db } from './firebase';

// ASSUME names are unique within an event

var workingEvent: Event = {
    publicId: "ABABAB", 
    details: {
        name: "name",
        adminName: "string",
        description: "description",
        adminAccountId: "WJCCE0YA2fY5gpPxG58l8Ax3T9m2",
        dates: [],
        startTime: new Date(), // minutes; min: 0, max 24*60 = 1440
        endTime: new Date(), // minutes; min: 0, max 24*60 = 1440
        plausibleLocations: ["HH17", "Sterling"],
    }, 
    participants: []
};

const checkIfLoggedIn = (): boolean => {
    return (auth.currentUser && auth.currentUser.isAnonymous == false) || false;
}

const checkIfAdmin = (): boolean => {
    if (workingEvent && auth.currentUser) {
        if (workingEvent.details.adminAccountId && workingEvent.details.adminAccountId == getAccountId()) {
            return true
        }
    }
    return false
}

const getAccountId = (): string => {
    if (auth.currentUser !== null && !auth.currentUser.isAnonymous) {
        return auth.currentUser.uid;
    } else {
        return "";
    }
}

const getAccountName = (): string => {
    return auth.currentUser?.displayName ? auth.currentUser.displayName : "";
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
        getDoc(doc(eventsRef, id)).then(async (result) => {  
            if (result.exists()) {
                // @ts-ignore
                workingEvent = result.data();
                workingEvent.details.startTime = workingEvent.details.startTime ? (workingEvent.details.startTime as unknown as Timestamp).toDate() : workingEvent.details.startTime;
                workingEvent.details.endTime = workingEvent.details.endTime ?(workingEvent.details.endTime as unknown as Timestamp).toDate() : workingEvent.details.endTime;
                workingEvent.details.chosenStartDate = workingEvent.details.chosenStartDate ? (workingEvent.details.chosenStartDate as unknown as Timestamp).toDate() : workingEvent.details.chosenStartDate;
                workingEvent.details.chosenEndDate = workingEvent.details.chosenEndDate ? (workingEvent.details.chosenEndDate as unknown as Timestamp).toDate() : workingEvent.details.chosenEndDate;
                workingEvent.details.dates = dateToArray(workingEvent.details.dates);

                // Retrieve all participants as sub-collection
                await getParticipants(collection(db, "events", id, "participants")).then((parts) => {
                    workingEvent.participants = parts;
                }).catch((err) => {
                    console.log("Issue retrieving participants.");
                    reject(err);
                })

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

async function deleteEvent(id: EventId): Promise<void> {

    // Prevent any user other than the admin to delete event
    if (getAccountId() !== ((await getDoc(doc(db, "events", id))).data() as unknown as Event).details.adminAccountId) {
        throw Error("Only creator can delete event");
    }

    // Get a new write batch
    const batch = writeBatch(db);

    // Add each participant doc in the subcollection
    const participants = await getDocs(collection(db, "events", id, "participants"))

    participants.forEach((data) => {
        batch.delete(doc(db, "events", id, "participants", data.id));
    });

    // delete the event itself
    batch.delete(doc(db, "events", id));

    // Commit the batch
    await batch.commit().catch((err) => {
        console.log("Error: ", err);
    });
}

// Retrieves all events that this user has submitted availability for
async function getAllEventsForUser(accountID: string): Promise<Event[]> {
    const eventsRef = collection(db, "events");
    return new Promise(async (resolve, reject) => {
        const q = query(eventsRef, where("participants", "array-contains", accountID));
        const querySnapshot = await getDocs(q);

        const eventsList: Event[] = []
        querySnapshot.forEach((doc) => {
            const result = doc.data();
            result.details.startTime = result.details.startTime ? (result.details.startTime as unknown as Timestamp).toDate() : result.details.startTime;
            result.details.endTime = result.details.endTime ?(result.details.endTime as unknown as Timestamp).toDate() : result.details.endTime;
            result.details.chosenStartDate = result.details.chosenStartDate ? (result.details.chosenStartDate as unknown as Timestamp).toDate() : result.details.chosenStartDate;
            result.details.chosenEndDate = result.details.chosenEndDate ? (result.details.chosenEndDate as unknown as Timestamp).toDate() : result.details.chosenEndDate;
            result.details.dates = dateToArray(result.details.dates);

            eventsList.push(result as unknown as Event);
        });

        resolve(eventsList);
    });
}

// Stores a new event passed in as a parameter to the backend
async function createEvent(eventDetails: EventDetails): Promise<Event | null> {
    const id = generateUniqueId();
    const newEvent: Event = {
        details: {
            ...eventDetails,
            // TODO map dates to JSON
            // @ts-ignore
            dates: dateToObject(eventDetails.dates)
        },
        publicId: id,
        participants: [],
    };

    // Update local copy
    workingEvent = newEvent

    // Update backend
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


// For internal use
// Returns undefined when participant has not been added yet
const getParticipantIndex = (name: string, accountId: string = ""): number | undefined => {
    let index = undefined;
    for (let i = 0; i < workingEvent.participants.length; i++) {
        if ((accountId === "" && workingEvent.participants[i].name == name) || 
            (accountId !== "" && workingEvent.participants[i].accountId == accountId)) {
                index = i;
        }
    }
    // console.log("Found index: ", index);
    return index;
} 

// For internal use
const getParticipants = async (reference: CollectionReference<DocumentData>): Promise<Participant[]> => {
    return new Promise((resolve, reject) => {getDocs(reference).then((docs) => {
            let parts: Participant[] = []
            docs.forEach((data) => {
                // unstringify availability
                const participant = data.data();
                participant.availability = JSON.parse(participant.availability);

                parts.push(participant as Participant);
            });

            resolve(parts);
        }).catch((err) => {
            console.log("Caught " + err + " with message " + err.msg);
            reject(err);
        })
    });
}

// For internal use
// Updates (overwrites) the event details of the working event 
// with the eventDetails parameter 
function saveEventDetails(eventDetails: EventDetails) {
    // Update local copy
    workingEvent.details = eventDetails

    // Update backend
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

// For internal use
// Updates the participants list of the working event 
// with the participant passed in, overwriting if they already exist
async function saveParticipantDetails(participant: Participant): Promise<void> {
    // Update local copy
    let flag = false
    workingEvent.participants.forEach((part, index) => {
        if ((participant.accountId !== "" && part.accountId == participant.accountId) || 
            ((participant.accountId == "") && (participant.name == part.name))) {
            workingEvent.participants[index] = participant;
            flag = true;
        }
    });
    if (!flag) {
        console.log("Adding new participant")
        workingEvent.participants.push(participant);
        
        // Update Backend: add user uid to particpants list of event object
        const accountId = getAccountId()
        if (accountId && accountId !== "") {
            const eventsRef = collection(db, "events")
            updateDoc(doc(eventsRef, workingEvent.publicId), {
                participants: arrayUnion(accountId)
    
            }).catch((err) => {
                console.log(err.msg);
    
            });
        }
    }

    // Update backend
    return new Promise<void>((resolve, reject) => {
        const eventsRef = collection(db, "events");
        const participantsRef = collection(doc(eventsRef, workingEvent.publicId), "participants");
        let partRef;
        if (participant.accountId) {
            partRef = doc(participantsRef, participant.accountId);
        } else {
            partRef = doc(participantsRef, participant.name);
        }

        console.log("This is at issue: ", {
            name: participant.name,
            accountId: participant.accountId || "",
            availability: JSON.stringify(participant.availability),
            location: participant.location || "",

          });

        setDoc(partRef, {
            name: participant.name,
            accountId: participant.accountId || "",
            availability: JSON.stringify(participant.availability),
            location: participant.location || "",

          }).then(() => {
                console.log("Saved participant details")
                resolve();

            }).catch((err) => {
                console.error("Failed to save participant details. Error", err.msg);
                reject(err);

        });
    });
}


// // TODO retire in favor of wrappedSaveParticipantDetails
// // Sets the availability of a participant of the name parameter with their 
// // availability object; passing in their accountId is optional addition verification
// async function setAvailability(name: string, availability: Availability, accountId: string = ""): Promise<void> {
//     let index = getParticipantIndex(name, accountId);

//     // if (index !== undefined) {
//     //     workingEvent.participants[index].availability = JSON.stringify(availability);
//     // } else {
//     //     workingEvent.participants.push({
//     //         name: name,
//     //         accountId: accountId,
//     //         availability: JSON.stringify(availability),
//     //         location: "",
//     //     });
//     // }

//     return saveParticipantDetails({
//         name: name,
//         accountId: accountId,
//         availability: JSON.stringify(availability),
//         location: index ? workingEvent.participants[index].location : "",
//     });
// }

// // TODO retire
// // Sets the location preference of a participant of the name parameter with 
// // location parameter object; passing in their accountId is optional addition verification
// async function setLocationPreference(name: string, location: Location, accountId: string = ""): Promise<void> {
//     let index = getParticipantIndex(name, accountId);
//     if (index === undefined) throw Error("Participant has not submitted availability yet!"); 

//     workingEvent.participants[index].location = location;

//     // return saveParticipantDetails({
//     //     name: name,
//     //     accountId: accountId,
//     //     availability: index ? JSON.stringify(workingEvent.participants[index].availability) : undefined,
//     //     location: location,
//     // });
// }

async function wrappedSaveParticipantDetails(availability: Availability, locations: Location[]): Promise<void> {
    let name = getAccountName();
    if (!name) {
        console.warn("User not signed in"); 
        name = "John Doe"
    }

    return saveParticipantDetails({
        name: name,
        accountId: getAccountId(),
        //@ts-ignore
        availability: JSON.stringify(availability),
        location: locations,
    });
}

// Sets the official date for the event; must be called by the admin 
async function setChosenDate(chosenStartDate: Date, chosenEndDate: Date): Promise<void> {
    if (chosenEndDate > chosenStartDate) {
        workingEvent.details.chosenStartDate = chosenStartDate;
        workingEvent.details.chosenEndDate = chosenEndDate;
    } else {
        workingEvent.details.chosenStartDate = chosenEndDate;
        workingEvent.details.chosenEndDate = chosenStartDate;
    }

    return saveEventDetails(workingEvent.details);
}

// Sets the official location for the event; must be called by the admin 
async function setChosenLocation(chosenLocation: Location): Promise<void> {
    workingEvent.details.chosenLocation = chosenLocation

    return saveEventDetails(workingEvent.details)
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
    return await getEventById(id.toUpperCase());

    // To avoid caching (TODO?)
    if (workingEvent && workingEvent.publicId == id.toUpperCase()) {
        console.log("Already loaded event, skipping");
        return Promise.resolve();
    } else {
        return await getEventById(id.toUpperCase());
    }
}

// Retrieves the availability object of the participant matching `name`
function getAvailabilityByName(name: string): Availability | undefined {
    for (let i = 0; i < workingEvent.participants.length; i++) {
        if (workingEvent.participants[i].name == name) {
            // @ts-ignore
            return JSON.parse(workingEvent.participants[i].availability)
        }
    }
}

// Retrieves the availability object of the participant matching `accountId`
function getAvailabilityByAccountId(accountId: string): Availability | undefined {
    for (let i = 0; i < workingEvent.participants.length; i++) {
        if (workingEvent.participants[i].accountId == accountId) {
            // @ts-ignore
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

        console.log("exeucted!");
        // @ts-ignore
        avails.push(JSON.parse(workingEvent.participants[i].availability))
    }
    return avails
}

// Retrieves the official datetime (start and end) of the event as chosen by the admin
function getChosenDayAndTime(): [Date, Date] | undefined  {
    if (workingEvent.details.chosenStartDate && workingEvent.details.chosenEndDate) {
        return [workingEvent.details.chosenStartDate, workingEvent.details.chosenEndDate]
    }
}

// Retrieves the official location of the event as chosen by the admin
function getChosenLocation(): Location | undefined {
    return workingEvent.details.chosenLocation
}

// Retrieves the dict objects mapping locations (keys) to number of votes (items)
function getLocationsVotes(): { [id: Location]: number; } | any {
    const votes: { [id: Location]: number; } = {}
    for (let i = 0; i < workingEvent.details.plausibleLocations.length; i++) {
        let location = workingEvent.details.plausibleLocations[i]
        votes[location] = 0
        for (let i = 0; i < workingEvent.participants.length; i++) {
            // @ts-ignore
            let participant = workingEvent.participants[i]
            if (participant.location.includes(location)) {
                votes[location] += 1
            }
        }
    }
    return votes
}

function getDates(): Date[] {
    return workingEvent.details.dates;
}

function getStartAndEndTimes(): Date[] {
    return [workingEvent.details.startTime, workingEvent.details.endTime];
}

function getEventObjectForGCal() {
    console.log({
        'summary': workingEvent.details.name,
        'location': workingEvent.details.chosenLocation,
        'description': workingEvent.details.description,
        'start': {
            'dateTime': workingEvent.details.chosenStartDate,
            'timeZone': 'America/New_York'
        },
        'end': {
            'dateTime': workingEvent.details.chosenEndDate,
            'timeZone': 'America/New_York'
        },
    });
    return {
        'summary': workingEvent.details.name,
        'location': workingEvent.details.chosenLocation,
        'description': workingEvent.details.description,
        'start': {
            'dateTime': workingEvent.details.chosenStartDate,
            'timeZone': 'America/New_York'
        },
        'end': {
            'dateTime': workingEvent.details.chosenEndDate,
            'timeZone': 'America/New_York'
        },
    };
}

export { workingEvent } // For interal use; use getters and setters below

export {
    // Firebase Wrappers
    getAccountId,
    getAccountName,
    checkIfLoggedIn,

    // Misc
    checkIfAdmin,
    getAllEventsForUser,
    
    // High Level (Async)
    getEventOnPageload,
    getEventById,
    createEvent,
    
    // Getters (Sync)
    getDates,
    getStartAndEndTimes,
    getChosenLocation,
    getChosenDayAndTime,
    getAllAvailabilities,
    getAllAvailabilitiesNames,
    getAvailabilityByAccountId,
    getAvailabilityByName,
    getEventDescription,
    getEventName,
    getLocationOptions,
    getLocationsVotes,
    getEventObjectForGCal,

    // All Participants (Async)
    wrappedSaveParticipantDetails,
    // setAvailability,
    // setLocationPreference,

    // Admin Only (Async)
    setChosenLocation,
    setChosenDate,
    deleteEvent,

    getParticipantIndex,
    
}

function dateToObject(dateArray: number[][]): {[key: number]: number[]} {
    const dateObject: {[key: number]: number[]} = {};
    dateArray.forEach((date: number[], index: number) => {
      dateObject[index + 1] = date;
    });
    return dateObject;
}

function dateToArray(obj: { [key: number]: Date }): Array<Date> {
    const result: Array<Date> = [];  
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            result.push((obj[key] as unknown as Timestamp).toDate());
        }
    }
    return result;
}
