export type availabilityMatrix = Record<number, number[]>

export type calanderState = Array<availabilityMatrix>; // length = num of people

// TODO add associated date object?
export interface calandarDate {
    id : number,
    shortenedWeekDay : string,
    calanderDay : string
    month : string
    year? : string
    date? : Date
}

// TODO : make the move over to date objects
export interface calendarDimensions {
    dates: calandarDate[][];
    startDate: Date;
    endDate: Date ;
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