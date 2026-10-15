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
 * Represents a user dragging their mouse across an availability grid to select or deselect blocks. Automatically
 * updates blocks as they are selected or deselected according to the given `updateBlock` callback.
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
   * A callback that updates dirty blocks.
   * @private
   */
  private readonly updateBlock: (block: Coords, setTo: boolean) => void;
  /**
   * The block where the drag started.
   * @private
   */
  private readonly origin: Coords;
  /**
   * The most recent endpoint of the drag. Updated automatically in `moveTo`.
   * @private
   */
  private destination: Coords;

  /**
   * Starts a new drag as if the user had started holding down left click. Automatically flips the origin block
   * according to `updateBlock`.
   *
   * @remarks
   * `updateBlock` should, given the coordinates of a block and a value, "set that block to the given value". That may
   * mean different things in different contexts, including rerendering the GUI, modifying a mutable variable, writing
   * to local storage, or writing to a database.
   *
   * `origin` must be in bounds for `initialAvailability`.
   *
   * @remarks
   * Deep-copies `initialAvailability`.
   *
   * @param initialAvailability - The state of the availability grid before this drag began.
   * @param origin - The coordinates of the block where the drag began.
   * @param updateBlock - A callback for setting blocks to their appropriate values.
   */
  constructor(
    initialAvailability: Availability,
    origin: Coords,
    updateBlock: (coords: Coords, setTo: boolean) => void
  ) {
    // If we don't clone, updating the original grid will mess with the memory.
    this.initialAvailability = initialAvailability.map((row) => row.slice());
    this.origin = origin;
    this.updateBlock = updateBlock;

    this.setsBlocksTo =
      !this.initialAvailability[this.origin.col][this.origin.block];
    this.destination = this.origin;

    this.updateBlock(this.origin, this.setsBlocksTo);
  }

  /**
   * Simulates moving the destination of the drag to `destination`, as if a user had moved their mouse there while
   * still holding left click. Automatically updates blocks that need to be updated via `updateBlock`.
   *
   * @remarks
   * Since this class is intended primarily for IO, it tries to reduce calls to the `updateBlock` callback at the cost
   * of a more expensive dirty-block computation.
   *
   * @param destination - The new far corner for the drag.
   */
  moveTo(destination: Coords): void {
    // We could save a little computation by storing the last bounding box instead of the destination, but that makes
    // invalid states (where the origin is not in the corner of a bounding box) representable.
    const oldBox = new BoundingBox(this.origin, this.destination);
    const newBox = new BoundingBox(this.origin, destination);

    const dirtyBlocks = DraggedSelection.computeDirtyBlocks(
      oldBox,
      newBox,
      this.initialAvailability,
      this.setsBlocksTo
    );
    for (const { coords, setTo } of dirtyBlocks) {
      this.updateBlock(coords, setTo);
    }

    this.destination = destination;
  }

  /**
   * Computes a "small" set of changes that will properly switch a selection from `oldSelection` to `newSelection`.
   * You're probably looking for `moveTo` instead, which handles that computation for you.
   *
   * @remarks
   * Pure function.
   *
   * If `oldSelection` lists the coordinates currently in the selection, then setting each block to its new value (from
   * the returned iterable) will update the selection to `newSelection`. Blocks that leave the selection will become
   * their initial values from `initialAvailability`, and blocks that enter the selection will become `setsBlocksTo`.
   * This all assumes the caller updates the blocks; this function tells you which blocks to set, but it won't actually
   * set them.
   *
   * @param oldSelection - Every coordinate that was already selected.
   * @param newSelection - Every coordinate that should end up selected.
   * @param initialAvailability - The state of the availability grid before any dragging occurred.
   * @param setsBlocksTo - What to set blocks to if they enter (not exit) the selection box.
   * @returns - An iterable of entries, each containing the coordinates of a dirty block and its new value.
   */
  static *computeDirtyBlocks(
    oldSelection: Iterable<Coords>,
    newSelection: Iterable<Coords>,
    initialAvailability: ReadonlyAvailability,
    setsBlocksTo: boolean
  ): Iterable<{ coords: Coords; setTo: boolean }> {
    // We need to serialize because of object equality semantics. We could also use nested maps, but this is simpler.
    // Custom serialization would probably be faster but more complex than JSON.
    const serializedDirtyBlocks = new Map<string, boolean>();

    for (const coords of oldSelection) {
      const oldValue = initialAvailability[coords.col][coords.block];
      // Extra filtering would save some updateBlock calls but reduce async resilience.
      serializedDirtyBlocks.set(JSON.stringify(coords), oldValue);
    }

    // Don't pull this loop into its own function. The deletion is only correct if preceded by the oldSelection loop.
    for (const coords of newSelection) {
      const serializedCoords = JSON.stringify(coords);
      if (serializedDirtyBlocks.has(serializedCoords)) {
        serializedDirtyBlocks.delete(serializedCoords);
      } else {
        serializedDirtyBlocks.set(serializedCoords, setsBlocksTo);
      }
    }

    for (const [coords, setTo] of serializedDirtyBlocks.entries()) {
      yield { coords: JSON.parse(coords), setTo };
    }
  }
}

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
