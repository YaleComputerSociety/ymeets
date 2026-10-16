export type EventId = string;
export type Location = string;
export type Availability = boolean[][];
export type ReadonlyAvailability = readonly (readonly boolean[])[];

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

/**
 * Shallow-copies `state`, replacing the grid for `user` with `availability`.
 *
 * @remarks
 * Does not perform bounds checking.
 *
 * @param state - A calendar state to be shallow-copied.
 * @param user - The user whose calendar should be overridden.
 * @param availability - The user's new calendar.
 * @returns A shallow copy of `state` whose `user`'th element is `availability`.
 */
export function copyAndReplace(
  state: calendarState,
  user: number,
  availability: Availability
): calendarState {
  const newState = state.slice();
  newState[user] = availability;
  return newState;
}

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
   * @param coords - The coordinates of a point to be tested for containment.
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

/**
 * Represents a user dragging their mouse across an availability grid to select or deselect blocks.
 *
 * Always inverts the origin. A drag that starts on `false` will select blocks, and a drag that starts on `true` will
 * deselect blocks.
 */
export class DraggedSelection {
  /**
   * The initial state of the availability grid, kept so shrinking a drag doesn't erase old data.
   * @private
   */
  private readonly initialAvailability: ReadonlyAvailability;
  /**
   * What newly-selected blocks should be set to. `true` makes this a selection; `false` makes this a deselection.
   * @private
   */
  private readonly setsBlocksTo: boolean;
  /**
   * The block where the drag started.
   * @private
   */
  private readonly origin: Coords;

  /**
   * Starts a new drag as if the user had started holding down left click. You probably want `DraggedSelection.create`
   * instead; that function also computes the state of the grid immediately after the drag starts.
   *
   * @remarks
   * `origin` must be in bounds for `initialAvailability`. Deep-copies `initialAvailability`.
   *
   * @param initialAvailability - The state of the availability grid before this drag began.
   * @param origin - The coordinates of the block where the drag began.
   */
  constructor(initialAvailability: Availability, origin: Coords) {
    this.initialAvailability = initialAvailability.map((row) => row.slice());
    this.origin = origin;

    this.setsBlocksTo =
      !this.initialAvailability[this.origin.col][this.origin.block];
  }

  /**
   * Simulates moving the destination of the drag to `destination`, as if a user had moved their mouse there while
   * still holding left click. Returns the box that the drag selects and the the state of the availability grid after
   * the selection.
   *
   * @param destination - The new far corner for the drag.
   * @returns The bounds of the selection
   */
  computeSelection(destination: Coords): {
    selection: BoundingBox;
    newAvailability: Availability;
  } {
    const selection = new BoundingBox(this.origin, destination);
    const newAvailability = this.initialAvailability.map((row) => row.slice());

    for (const { col, block } of selection) {
      newAvailability[col][block] = this.setsBlocksTo;
    }

    return { selection, newAvailability };
  }

  /**
   * Starts a new drag as if the user had started holding down left click. Also computes the drag's bounding box and the
   * grid's new state.
   *
   * @remarks
   * `origin` must be in bounds for `initialAvailability`. Deep-copies `initialAvailability`.
   *
   * @param initialAvailability - The state of the availability grid before this drag began.
   * @param origin - The coordinates of the block where the drag began.
   * @returns The drag, its bounding box, and the new grid state immediately after the drag begins.
   */
  static create(
    initialAvailability: Availability,
    origin: Coords
  ): {
    drag: DraggedSelection;
    selection: BoundingBox;
    newAvailability: Availability;
  } {
    const drag = new DraggedSelection(initialAvailability, origin);
    const { selection, newAvailability } = drag.computeSelection(origin);
    return { drag, selection, newAvailability };
  }
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
