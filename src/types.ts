export type EventId = string;
export type Location = string;
export type Availability = boolean[][];

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
    startTime: Date, 
    endTime: Date, 
    plausibleLocations: Location[],
    chosenLocation?: Location,
    chosenStartDate?: Date,
    chosenEndDate?: Date // minutes
}

export interface Participant {
    name: string,
    accountId?: string,
    email?: string,
    availability: Availability, // Availability || JSON string of Availability type
    location: Location[],
}

export type calanderState = Availability[]; // length = num of people

export interface calandarDate {
    id : number,
    shortenedWeekDay : string,
    calanderDay : string
    month : string
    year? : string
    date? : Date
}

export interface calendarDimensions {
    dates: calandarDate[][];
    startTime: Date;
    endTime: Date ;
    numOfBlocks : number
    numOfCols : number
}

export interface dragProperties { 
    dragStartedOnID : number[];
    dragEndedOnID : number[];
    dragStartedOn : boolean;
    blocksAffectedDuringDrag : Set<any>;
}

export interface calendar {
    availabilities : calanderState 
    participants : userData 
}

// The User ID MUST match the schedule in the position calandarState

// TODO : potential code smell -- just have array of users with attributes available / unavailable

export interface user {
    name: string,
    id: number
}

export interface userData {
    users: Array<user>,
    available: Array<user>,
    unavailable: Array<user>
}

