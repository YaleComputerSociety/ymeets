import { Availability } from '../types';

/**
 * Parses an availability array from a given value. Returns `undefined` if the value cannot be
 * parsed as an availability array.
 *
 * Can parse both plain JavaScript arrays and JSON-serialized array strings. Replaces `undefined`
 * and `null` columns (that is, top-level elements) with empty arrays. Replaces `undefined` and
 * `null` blocks (that is, nested elements) with `false`.
 *
 * @param val - Any JavaScript value.
 * @returns a cleaned availability array if possible and `undefined` if not.
 */
export function parseAvailability(val: unknown): Availability | undefined {
  const arr = parseArray(val);
  if (arr === undefined) {
    return undefined;
  }

  const filledTopLevel = fillNullish(arr, () => []);
  if (!filledTopLevel.every(isNullishBooleanArray)) {
    return undefined;
  }
  return filledTopLevel.map((arr) => fillNullish(arr, () => false));
};

/**
 * Extracts an array from a given value, either by returning the value unchanged or parsing it as
 * JSON. If neither attempt produces a valid array, returns `undefined`.
 *
 * @param val - Any JavaScript value.
 * @returns `val`, `val` parsed as a JSON array, or `undefined`.
 */
function parseArray(val: unknown): unknown[] | undefined {
  if (val === undefined || val === null) {
    return undefined;
  }

  if (Array.isArray(val)) {
    return val;
  } else if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return undefined;
    }
  }
}

/**
 * Fills all nullish slots in an array with the return value of the given callback.
 *
 * @param arr - an array that may have nullish elements.
 * @param fillWith - a callback that returns a value to fill one element with.
 * @returns - an array with all nullish gaps filled.
 */
function fillNullish<T>(arr: ReadonlyArray<T | undefined | null>, fillWith: () => T): T[] {
  return arr.map((v) => v ?? fillWith());
}

/**
 * Validates that `val` is an array of potentially-nullish booleans.
 *
 * @param val - Any JavaScript value.
 * @returns true if `val` is an array and all its elements are booleans or nullish.
 */
function isNullishBooleanArray(val: unknown): val is Array<boolean | null | undefined> {
  return Array.isArray(val) && val.every(isNullishBoolean);
}

/**
 * Validates that `val` is a boolean or nullish.
 *
 * @param val - Any JavaScript value.
 * @returns true if `val` is a boolean or nullish.
 */
function isNullishBoolean(val: unknown): val is boolean | null | undefined {
  if (val === null) {
    return true;
  } else if (typeof val === 'boolean') {
    return true;
  } else if (typeof val === 'undefined') {
    return true;
  } else {
    return false;
  }
}
