/* eslint-disable */

import { doc, collection, getDoc, setDoc, updateDoc, CollectionReference, DocumentData, getDocs, Timestamp, arrayUnion, query, where, QuerySnapshot, deleteDoc, writeBatch, FieldValue, deleteField } from 'firebase/firestore'
import { Availability, Event, Location, EventDetails, EventId, Participant } from '../types'
import { auth, db } from './firebase'

// ASSUME names are unique within an event

let workingEvent: Event = {
  publicId: 'ABABAB',
  details: {
    name: 'name',
    adminName: 'string',
    description: 'description',
    adminAccountId: 'WJCCE0YA2fY5gpPxG58l8Ax3T9m2',
    dates: [],
    startTime: new Date(), // minutes; min: 0, max 24*60 = 1440
    endTime: new Date(), // minutes; min: 0, max 24*60 = 1440
    plausibleLocations: ['HH17', 'Sterling']
  },
  participants: []
}

const checkIfLoggedIn = (): boolean => {
  return (auth.currentUser && !auth.currentUser.isAnonymous) || false
}

const checkIfAdmin = (): boolean => {
  if (workingEvent && auth.currentUser) {
    if (workingEvent.details.adminAccountId && workingEvent.details.adminAccountId == getAccountId()) {
      return true
    }
  }
  return false
}

/**
 *
 * @returns Account ID, if and only if the user is not anonymously logged in.
 */
const getAccountId = (): string => {
  if (auth.currentUser !== null && !auth.currentUser.isAnonymous) {
    return auth.currentUser.uid
  } else {
    return ''
  }
}

const getAccountName = (): string => {
  return auth.currentUser?.displayName ? auth.currentUser.displayName : ''
}

const getAccountEmail = (): string => {
  return auth.currentUser?.email ? auth.currentUser.email : ''
}

// https://firebase.google.com/docs/firestore/manage-data/add-data
// may have better way to generate id (Firestore can do it automatically)
const generateUniqueId = (): string => {
  // new method will generate a random string indexing [0,9,a,b,c...,z] - [i,l,0,o]
  // to generate a 6-character code. Not currently checking if already in the database
  // else would generate a new string, check again. Appox: 1.07 billion
  let id = ''
  const valid_chars = 'abcdefghjkmnpqrstuvwxyz123456789'
  for (let i = 0; i < 6; i++) {
    id += valid_chars[(Math.floor(Math.random() * (valid_chars.length)))].toUpperCase()
  }
  return id
}

// PURPOSE: Internal use and to check if event of id exists.
// Retreives an event from the backend given the id
// Will throw an error if the document cannot be found
// Event is not return; rather, it is stored internally
// for other getters and settings defined in this file.
async function getEventById (id: EventId): Promise<void> {
  const eventsRef = collection(db, 'events')
  await new Promise((resolve, reject) => {
    getDoc(doc(eventsRef, id)).then(async (result) => {
      if (result.exists()) {
        // @ts-expect-error
        workingEvent = result.data()
        workingEvent.details.startTime = workingEvent.details.startTime ? (workingEvent.details.startTime as unknown as Timestamp).toDate() : workingEvent.details.startTime
        workingEvent.details.endTime = workingEvent.details.endTime ? (workingEvent.details.endTime as unknown as Timestamp).toDate() : workingEvent.details.endTime
        workingEvent.details.chosenStartDate = workingEvent.details.chosenStartDate ? (workingEvent.details.chosenStartDate as unknown as Timestamp).toDate() : workingEvent.details.chosenStartDate
        workingEvent.details.chosenEndDate = workingEvent.details.chosenEndDate ? (workingEvent.details.chosenEndDate as unknown as Timestamp).toDate() : workingEvent.details.chosenEndDate
        workingEvent.details.dates = dateToArray(workingEvent.details.dates)

        // Retrieve all participants as sub-collection
        await getParticipants(collection(db, 'events', id, 'participants')).then((parts) => {
          workingEvent.participants = parts
        }).catch((err) => {
          reject(err)
        })
        //@ts-ignore
        resolve()
      } else {
        reject('Document not found')
      }
    }).catch((err) => {
      console.error('Caught ' + err + ' with message ' + err.msg)
      reject(err)
    })
  })
}

async function deleteEvent (id: EventId): Promise<void> {
  // Prevent any user other than the admin to delete event
  if (getAccountId() !== ((await getDoc(doc(db, 'events', id))).data() as unknown as Event).details.adminAccountId) {
    throw Error('Only creator can delete event')
  }

  // Get a new write batch
  const batch = writeBatch(db)

  // Add each participant doc in the subcollection
  const participants = await getDocs(collection(db, 'events', id, 'participants'))

  participants.forEach((data) => {
    batch.delete(doc(db, 'events', id, 'participants', data.id))
  })

  // delete the event itself
  batch.delete(doc(db, 'events', id))

  // Commit the batch
  await batch.commit().catch((err) => {
    console.log('Error: ', err)
  })
}

// Retrieves all events that this user has submitted availability for
async function getAllEventsForUser (accountID: string): Promise<Event[]> {
  const eventsRef = collection(db, 'events')
  return await new Promise(async (resolve, reject) => {
    const q = query(eventsRef, where('participants', 'array-contains', accountID))
    const querySnapshot = await getDocs(q)

    const eventsList: Event[] = []
    querySnapshot.forEach((doc) => {
      const result = doc.data()
      result.details.startTime = result.details.startTime ? (result.details.startTime as unknown as Timestamp).toDate() : result.details.startTime
      result.details.endTime = result.details.endTime ? (result.details.endTime as unknown as Timestamp).toDate() : result.details.endTime
      result.details.chosenStartDate = result.details.chosenStartDate ? (result.details.chosenStartDate as unknown as Timestamp).toDate() : result.details.chosenStartDate
      result.details.chosenEndDate = result.details.chosenEndDate ? (result.details.chosenEndDate as unknown as Timestamp).toDate() : result.details.chosenEndDate
      result.details.dates = dateToArray(result.details.dates)

      eventsList.push(result as unknown as Event)
    })

    resolve(eventsList)
  })
}

// Stores a new event passed in as a parameter to the backend
async function createEvent (eventDetails: EventDetails): Promise<Event | null> {
  const id = generateUniqueId()
  const newEvent: Event = {
    details: {
      ...eventDetails,
      // TODO map dates to JSON
      // @ts-expect-error
      dates: dateToObject(eventDetails.dates)
    },
    publicId: id,
    participants: []
  }

  // Update local copy
  workingEvent = newEvent

  // Update backend
  return await new Promise((resolve, reject) => {
    const eventsRef = collection(db, 'events')
    setDoc(doc(eventsRef, id), {
      ...newEvent,
      participants: [eventDetails.adminAccountId]
    }) // addDoc as overwrite-safe alt
      .then((result: void) => {
        resolve(newEvent)
      }).catch((err) => {
        reject(err)
      })
  })
}

// For internal use
// Returns undefined when participant has not been added yet
const getParticipantIndex = (name: string, accountId: string = ''): number | undefined => {
  let index
  for (let i = 0; i < workingEvent.participants.length; i++) {
    if ((accountId === '' && workingEvent.participants[i].name == name) ||
            (accountId !== '' && workingEvent.participants[i].accountId == accountId)) {
      index = i
    }
  }
  return index
}

// For internal use
const getParticipants = async (reference: CollectionReference<DocumentData>): Promise<Participant[]> => {
  return await new Promise((resolve, reject) => {
    getDocs(reference).then((docs) => {
      const parts: Participant[] = []
      docs.forEach((data) => {
      // unstringify availability
        const participant = data.data()
        participant.availability = JSON.parse(participant.availability)

        parts.push(participant as Participant)
      })

      resolve(parts)
    }).catch((err) => {
      console.error('Caught ' + err + ' with message ' + err.msg)
      reject(err)
    })
  })
}

// For internal use
// Updates (overwrites) the event details of the working event
// with the eventDetails parameter
async function saveEventDetails (eventDetails: EventDetails) {
  // Update local copy
  workingEvent.details = eventDetails

  // Update backend
  await new Promise<void>((resolve, reject) => {
    const eventsRef = collection(db, 'events')
    updateDoc(doc(eventsRef, workingEvent.publicId), {
      details: eventDetails
    }).then(() => {
      resolve()
    }).catch((err) => {
      console.error(err.msg)
      reject(err)
    })
  })
}

// For internal use
// Updates the participants list of the working event
// with the participant passed in, overwriting if they already exist
async function saveParticipantDetails (participant: Participant): Promise<void> {
  participant.email = getAccountEmail()

  // Update local copy
  let flag = false
  workingEvent.participants.forEach((part, index) => {
    if ((participant.accountId !== '' && part.accountId == participant.accountId) ||
            ((participant.accountId == '') && (participant.name == part.name))) {
      workingEvent.participants[index] = participant
      flag = true
    }
  })
  if (!flag) {
    workingEvent.participants.push(participant)

    // Update Backend: add user uid to particpants list of event object
    const accountId = getAccountId()
    if (accountId && accountId !== '') {
      const eventsRef = collection(db, 'events')
      updateDoc(doc(eventsRef, workingEvent.publicId), {
        participants: arrayUnion(accountId)

      }).catch((err) => {
        console.error(err.msg)
      })
    }
  }

  // Update backend
  await new Promise<void>((resolve, reject) => {
    const eventsRef = collection(db, 'events')
    const participantsRef = collection(doc(eventsRef, workingEvent.publicId), 'participants')
    let partRef
    if (participant.accountId) {
      partRef = doc(participantsRef, participant.accountId)
    } else {
      partRef = doc(participantsRef, participant.name)
    }

    setDoc(partRef, {
      name: participant.name,
      accountId: participant.accountId || '',
      email: getAccountEmail(),
      availability: JSON.stringify(participant.availability),
      location: participant.location || ''

    }).then(() => {
      resolve()
    }).catch((err) => {
      console.error('Failed to save participant details. Error', err.msg)
      reject(err)
    })
  })
}

async function updateAnonymousUserToAuthUser (name: string) {
  const accountName = getAccountName()
  const accountId = getAccountId()

  try {
    if (accountName === '') Promise.reject('User is not signed in')
    const eventsRef = collection(db, 'events')
    const participantsRef = collection(doc(eventsRef, workingEvent.publicId), 'participants')

    const anonymousPartRef = doc(participantsRef, name)
    const authedPartRef = doc(participantsRef, accountId)

    // Update local
    let availability
    workingEvent.participants.forEach((part, index) => {
      if (part.name == name && part.accountId == '') {
        workingEvent.participants[index].accountId = accountName
        workingEvent.participants[index].accountId = accountId
        availability = workingEvent.participants[index].availability
      }
    })

    // Anonymous user has not submitted their availability yet
    // So nothing to update.
    if (availability === undefined) return

    // Update Backend
    const batch = writeBatch(db)

    // Delete old anonymous doc
    batch.delete(anonymousPartRef)

    // Create (update) new authed doc with old availability
    batch.set(authedPartRef, {
      name: accountName,
      email: getAccountEmail(),
      accountId,
      availability: JSON.stringify(availability)
    })

    // This updates the participants list in the event details object
    batch.update(doc(eventsRef, workingEvent.publicId), {
      participants: arrayUnion(getAccountId())
    })

    await batch.commit(); return
  } catch (err) {
    console.error(err)
  };
}

async function wrappedSaveParticipantDetails (availability: Availability, locations: Location[] | undefined): Promise<void> {
  let name = getAccountName()
  if (!name) {
    console.warn('User not signed in')
    name = 'John Doe'
  }

  await saveParticipantDetails({
    name,
    accountId: getAccountId(),
    email: getAccountEmail(),
    // @ts-expect-error
    availability: JSON.stringify(availability),
    location: locations !== undefined ? locations : []
  })
}

// Sets the official date for the event; must be called by the admin
async function setChosenDate (chosenStartDate: Date | undefined, chosenEndDate: Date | undefined): Promise<void> {
  if ((chosenStartDate === undefined && chosenEndDate !== undefined) ||
        (chosenStartDate !== undefined && chosenEndDate === undefined)) {
    throw ('Both start and end dates must be defined or undefined, not one of each!')

    // unselect chosen date
  } else if (chosenStartDate === undefined && chosenEndDate === undefined) {
    delete workingEvent.details.chosenStartDate
    delete workingEvent.details.chosenEndDate

    // make sure the order is correct
    // @ts-expect-error
  } else if (chosenEndDate > chosenStartDate) {
    workingEvent.details.chosenStartDate = chosenStartDate
    workingEvent.details.chosenEndDate = chosenEndDate
  } else {
    workingEvent.details.chosenStartDate = chosenEndDate
    workingEvent.details.chosenEndDate = chosenStartDate
  }

  await saveEventDetails(workingEvent.details)
}

// Sets the official location for the event; must be called by the admin
async function setChosenLocation (chosenLocation: Location | undefined): Promise<void> {
  if (chosenLocation === undefined) {
    delete workingEvent.details.chosenLocation
  }
  workingEvent.details.chosenLocation = chosenLocation

  await saveEventDetails(workingEvent.details)
}

// Retrieves the list of locations to be considered for the event
function getLocationOptions (): Location[] {
  return workingEvent.details.plausibleLocations
}

// Retrieves the name of the event
function getEventName (): string {
  return workingEvent.details.name
}

// Retrieves the description of the event
function getEventDescription (): string {
  return workingEvent.details.description
}

// To be called on render when a page loads with event id in url
async function getEventOnPageload (id: string): Promise<void> {
  await getEventById(id.toUpperCase()); return

  // To avoid caching (TODO?)
  if (workingEvent && workingEvent.publicId == id.toUpperCase()) {
    await Promise.resolve(); return
  } else {
    await getEventById(id.toUpperCase()); return
  }
}

// Retrieves the availability object of the participant matching `name`
function getAvailabilityByName (name: string): Availability | undefined {
  for (let i = 0; i < workingEvent.participants.length; i++) {
    if (workingEvent.participants[i].name == name) {
      // @ts-expect-error
      return JSON.parse(workingEvent.participants[i].availability)
    }
  }
}

// Retrieves the availability object of the participant matching `accountId`
function getAvailabilityByAccountId (accountId: string): Availability | undefined {
  for (let i = 0; i < workingEvent.participants.length; i++) {
    if (workingEvent.participants[i].accountId == accountId) {
      // @ts-expect-error
      return JSON.parse(workingEvent.participants[i].availability)
    }
  }
}

// Retrieves the list of participants
// GUARANTEED to be the in the same order as getAllAvailabilities
function getAllAvailabilitiesNames (): string[] {
  const names: string[] = []
  for (let i = 0; i < workingEvent.participants.length; i++) {
    names.push(workingEvent.participants[i].name)
  }
  return names
}

// Retrieves the list of availabilities
// GUARANTEED to be the in the same order as getAllAvailabilitiesNames
function getAllAvailabilities (): Availability[] {
  const avails: Availability[] = []

  for (let i = 0; i < workingEvent.participants.length; i++) {
    // @ts-expect-error
    avails.push(JSON.parse(workingEvent.participants[i].availability))
  }
  return avails
}

// Retrieves the official datetime (start and end) of the event as chosen by the admin
function getChosenDayAndTime (): [Date, Date] | undefined {
  if (workingEvent.details.chosenStartDate && workingEvent.details.chosenEndDate) {
    return [workingEvent.details.chosenStartDate, workingEvent.details.chosenEndDate]
  }
}

// Retrieves the official location of the event as chosen by the admin
function getChosenLocation (): Location | undefined {
  return workingEvent.details.chosenLocation
}

// Retrieves the dict objects mapping locations (keys) to number of votes (items)
function getLocationsVotes (): Record<Location, number> | any {
  const votes: Record<Location, number> = {}
  for (let i = 0; i < workingEvent.details.plausibleLocations.length; i++) {
    const location = workingEvent.details.plausibleLocations[i]
    votes[location] = 0
    for (let i = 0; i < workingEvent.participants.length; i++) {
      const participant = workingEvent.participants[i]
      if (participant.location.includes(location)) {
        votes[location] += 1
      }
    }
  }
  return votes
}

// Retrieves the availability object of the participant matching `name`
function getLocationVotesByName (name: string): Location[] | undefined {
  for (let i = 0; i < workingEvent.participants.length; i++) {
    if (workingEvent.participants[i].name == name) {
      return workingEvent.participants[i].location
    }
  }
  return undefined
}

// Retrieves the availability object of the participant matching `accountId`
function getLocationVotesByAccountId (accountId: string): Location[] | undefined {
  for (let i = 0; i < workingEvent.participants.length; i++) {
    if (workingEvent.participants[i].accountId == accountId) {
      return workingEvent.participants[i].location
    }
  }
}

function getEmails (): string[] {
  const emails: string[] = []
  for (let i = 0; i < workingEvent.participants.length; i++) {
    if (workingEvent.participants[i].email !== undefined && workingEvent.participants[i].email !== '') {
      emails.push(workingEvent.participants[i].email || '')
    }
  }
  return emails
}

function getZoomLink (): string | undefined {
  return workingEvent.details.zoomLink || undefined
}

function getDates (): Date[] {
  return workingEvent.details.dates
}

function getStartAndEndTimes (): Date[] {
  return [workingEvent.details.startTime, workingEvent.details.endTime]
}

function getEventObjectForGCal () {
  return {
    summary: workingEvent.details.name,
    location: workingEvent.details.chosenLocation,
    description: workingEvent.details.description,
    start: {
      dateTime: workingEvent.details.chosenStartDate,
      timeZone: 'America/New_York'
    },
    end: {
      dateTime: workingEvent.details.chosenEndDate,
      timeZone: 'America/New_York'
    }
  }
}

export { workingEvent } // For interal use; use getters and setters below

export {
  // Firebase Wrappers
  getAccountId,
  getAccountName,
  getAccountEmail,
  checkIfLoggedIn,
  checkIfAdmin,

  // Misc
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
  getLocationVotesByName,
  getLocationVotesByAccountId,
  getEventDescription,
  getEventName,
  getLocationOptions,
  getLocationsVotes,
  getEventObjectForGCal,
  getEmails,
  getZoomLink,

  // All Participants (Async)
  wrappedSaveParticipantDetails,
  updateAnonymousUserToAuthUser,
  // setAvailability,
  // setLocationPreference,

  // Admin Only (Async)
  setChosenLocation,
  setChosenDate,
  deleteEvent,

  getParticipantIndex

}

function dateToObject (dateArray: number[][]): Record<number, number[]> {
  const dateObject: Record<number, number[]> = {}
  dateArray.forEach((date: number[], index: number) => {
    dateObject[index + 1] = date
  })
  return dateObject
}

function dateToArray (obj: Record<number, Date>): Date[] {
  const result: Date[] = []
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result.push((obj[key] as unknown as Timestamp).toDate())
    }
  }
  return result
}
