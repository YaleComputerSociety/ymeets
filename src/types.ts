export type EventId = string;
export type Location = string;
export type Availability = boolean[][];

export interface Event {
  // Firebase ID is EventID
  publicId: EventId; // field
  details: EventDetails; // map (nested object)
  participants: Participant[]; // subcollection
}

export interface EventDetails {
  name: string;
  description: string;
  adminName: string;
  adminAccountId: string; // firebase uid
  dates: Date[];
  startTime: Date;
  endTime: Date;
  plausibleLocations: Location[];
  chosenLocation?: Location | undefined;
  chosenStartDate?: Date | undefined;
  chosenEndDate?: Date | undefined; // minutes
  zoomLink?: string | undefined;
  timeZone: string;
  participants: string[]; // firebase uids
  dateCreated: Date;
  emailAdmin?: boolean; // whether to email admin when participants submit availability
}

export interface Participant {
  name: string;
  accountId?: string;
  email?: string;
  availability: Availability | string; // Availability || JSON string of Availability type
  location: Location[];
  declined?: boolean;
}

export type calendarState = Availability[]; // length = num of people

export type DateRange = {
  startDate: Date;
  endDate: Date;
};

export interface calendarDate {
  id: number;
  shortenedWeekDay: string;
  calendarDay: string;
  month: string;
  year?: string;
  date?: Date;
}

export interface calendarDimensions {
  dates: calendarDate[][];
  startTime: Date;
  endTime: Date;
  numOfBlocks: number;
  numOfCols: number;
  timezone: string;
}

/**
 * The coordinates of a cell in a 2D grid, usually column-major.
 */
interface Coords {
  /**
   * The column index of the cell.
   */
  readonly col: number;
  /**
   * The block (row) index of the cell.
   */
  readonly block: number;
}

/**
 * A 2D rectangle on a grid. Each field is a coordinate of a corner. Containment is inclusive.
 *
 * @remarks
 * Guarantees that `left <= right` `top <= bottom`.
 */
export class BoundingBox {
  /**
   * The leftmost (numerically least) column coordinate.
   */
  readonly left: number;
  /**
   * The rightmost (numerically greatest) column coordinate.
   */
  readonly right: number;
  /**
   * The topmost (numerically least) block coordinate.
   */
  readonly top: number;
  /**
   * The bottommost (numerically greatest) block coordinate.
   */
  readonly bottom: number;

  /**
   * Computes the smallest `BoundingBox` that contains both corners.
   *
   * @param corner1 - One point to be contained in the box.
   * @param corner2 - Another point to be contained in the box.
   * @returns A `BoundingBox` with corners at `corner1` and `corner2`.
   */
  constructor(corner1: Coords, corner2: Coords) {
    // This constructor wastes compute when `corner1` and `corner2` are known to be correctly ordered. However, checking
    // on every instantiation ensures correctness for minimal cost. Profile before micro-optimizing it out.
    this.left = Math.min(corner1.col, corner2.col);
    this.right = Math.max(corner1.col, corner2.col);
    this.top = Math.min(corner1.block, corner2.block);
    this.bottom = Math.max(corner1.block, corner2.block);
  }

  /**
   * Returns `true` if the box contains `coords` and `false` otherwise. Inclusive.
   *
   * @param coords - the coordinates of a point to be tested for containment.
   * @returns `true` if `coords` is in the box and `false` otherwise.
   */
  contains(coords: Coords): boolean {
    const horizontallyContains =
      this.left <= coords.col && coords.col <= this.right;
    const verticallyContains =
      this.top <= coords.block && coords.block <= this.bottom;
    return horizontallyContains && verticallyContains;
  }

  /**
   * Returns an `Iterator` over the coordinates this box contains. Inclusive.
   *
   * @returns An iterator that yields each contained coordinate exactly once.
   */
  *[Symbol.iterator](): Iterator<Coords> {
    for (let col = this.left; col <= this.right; col++) {
      for (let block = this.top; block <= this.bottom; block++) {
        yield { col, block };
      }
    }
  }
}
// export interface dragProperties {
//   dragStartedOnID: number[];
//   dragEndedOnID: number[];
//   dragStartedOn: boolean;
//   blocksAffectedDuringDrag: Set<any>;
// }

export interface dragProperties {
  isSelecting: boolean;
  startPoint: [number, number] | null;
  endPoint: [number, number] | null;
  lastPosition: [number, number] | null; // Add this line
  selectionMode: boolean;
  completedSelections?: BoundingBox[];
}

export interface calendar {
  availabilities: calendarState;
  participants: userData;
}

// The User ID MUST match the schedule in the position calendarState

// TODO : potential code smell -- just have array of users with attributes available / unavailable

export interface user {
  name: string;
  id: number;
}

export interface userData {
  users: user[];
  userIDs: string[];
  available: user[];
  unavailable: user[];
  hovering?: boolean;
}
