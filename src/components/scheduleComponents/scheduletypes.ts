export interface calanderState {
    schedules: Array<Record<number, number[]>>;

}
export interface calandarDate {
    id : number,
    shortenedWeekDay : string,
    calanderDay : string
    month : number
    year : string
}

export interface calendarDimensions {
    dates: Array<calandarDate>;
    startTime: string;
    endTime: string;
}
