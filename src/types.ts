export type EventId = string;
export type Location = string;
export type Availability = string | boolean[][];

export interface Event { // Firebase ID is EventID
    publicId: EventId, // field
    details: EventDetails, // map (nested object)
    participants: Participant[], // subcollection
}

export interface EventDetails {
    name: string,
    description: string,
    adminName: string,
    adminAccountId: string, // firebase uid
    dates: Date[],
    startTime: number, // minutes; min: 0, max 24*60 = 1440
    endTime: number, // minutes; min: 0, max 24*60 = 1440
    plausibleLocations: Location[],
    chosenLocation?: Location,
    chosenStartDate?: Date,
    chosenEndDate?: Date // minutes
}

export interface Participant {
    name: string,
    accountId?: string,
    availability: Availability, // Availability || JSON string of Availability type
    location: Location,
}
