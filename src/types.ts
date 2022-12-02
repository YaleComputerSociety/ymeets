export type EventId = string;
export type Location = Geolocation | string;
export type Availability = number[][];



export interface event {
    id: EventId,
    details: eventDetails,
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
    availability: Availability,
    location?: Location,
    accountId?: string,
}

// additional user fields
// - km or miles