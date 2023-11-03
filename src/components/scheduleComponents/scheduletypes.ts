export type availabilityMatrix = Record<number, number[]>

export type calanderState = Array<availabilityMatrix>; 

// TODO add associated date object?
export interface calandarDate {
    id : number,
    shortenedWeekDay : string,
    calanderDay : string
    month : string
    year : string
    date? : Date
}

// TODO : make the move over to date objects
export interface calendarDimensions {
    dates: Record<string, Array<calandarDate>>;
    startTime: string;
    endTime: string ;
    selectedStartDate? : Date,
    selectedEndDate? : Date
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