export interface userSchedule {
    id : number,
    schedule : Record<number, Array<number>>
}

export interface CalendarDimensions<T> {
    theInputtedDates: Array<string>;
    theDates: Array<T>;
    startTime: string;
    endTime: string;
    numberOfColumns: number;
}
