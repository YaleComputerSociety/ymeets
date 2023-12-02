export type Availability = boolean[][]

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