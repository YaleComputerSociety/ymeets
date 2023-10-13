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
