export interface calanderState {
    schedules: Array<Record<number, number[]>>;

}
export interface calandarDate {
    id : number,
    shortenedWeekDay : string,
    calanderDay : string
    month : string
    year : string
}

export interface calendarDimensions {
    dates: Record<string, Array<calandarDate>>;
    startTime: string;
    endTime: string;
}

// The User ID MUST match the schedule in the position calandarState
export interface user{
    name: string,
    id: number
}

export interface userData {
    users: Array<user>,
    available: Array<user>,
    unavailable: Array<user>
}