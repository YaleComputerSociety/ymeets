export type EventId = string;
export type Location = Geolocation | string;
export type Availability = number[][];

// pass this into createEvent (event without an id)
export interface UnsavedEvent {
    details: EventDetails,
    participants: Participant[],
}

// once event is created, everything should be done with this type (it has an id)
export interface Event {
    id: EventId,
    details: EventDetails,
    participants: Participant[],
}

export interface EventDetails {
    startDate: Date,
    endDate: Date,
    startTime: number, // minutes; min: 0, max 24*60 = 1440
    endTime: number, // minutes; min: 0, max 24*60 = 1440
    location: Location,
}

export interface Participant {
    name: string,
    password?: string,
    availability: Availability,
    location?: Location,
    accountId?: string,
}

// additional user fields
// - km or miles