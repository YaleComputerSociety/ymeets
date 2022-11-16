export type eventId = string;

export interface event {
    id: eventId,
    details: eventDetails
    participants: participant[],
}

export interface eventDetails {
    startDate: Date,
    endDate: Date,
    location: Geolocation
}

export interface participant {
    name: string,
    password?: string,
    availability: unknown,
    location?: Geolocation,
    accountId?: string,
}