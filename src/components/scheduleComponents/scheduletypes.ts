export interface userSchedule {
    id : number,
    schedule : Record<number, Array<number>>
}

export interface CalandarDate {
    id : number,
    shortenedWeekDay : string,
    calanderDay : string
    month : number
    year : string
}

export interface CalendarDimensions<T> {
    dates: Array<CalandarDate>;
    startTime: string;
    endTime: string;
    numberOfColumns: number;
}
