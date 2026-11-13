import type { Availability } from '../types';

/**
 * Parses an availability array from a given value. Returns `undefined` if the value cannot be
 * parsed as an availability array.
 *
 * Can parse both plain JavaScript arrays and JSON-serialized array strings. Replaces `undefined`
 * and `null` columns (that is, top-level elements) with empty arrays. Replaces `undefined` and
 * `null` blocks (that is, nested elements) with `false`. Also fills missing slots in sparse
 * arrays on both levels.
 *
 * @param val - Any JavaScript value.
 * @returns a cleaned availability array if possible and `undefined` if not.
 */
export function parseAvailability(val: unknown): Availability | undefined {
  const arr = parseArray(val);
  if (arr === undefined) {
    return undefined;
  }

  // Nullish filling protects against a corner case that was causing site crashes. The bug was
  // rare, so be very, very sure that it's been fixed and that the fix works in prod before
  // removing the nullish filling.
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
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return undefined;
    }
  }

  return undefined;
}

/**
 * Fills all nullish slots in an array with the return value of the given callback. Also fills
 * empty slots in sparse arrays.
 *
 * @param arr - an array that may have nullish elements.
 * @param fillWith - a callback that returns a value to fill one element with.
 * @returns - an array with all nullish gaps filled.
 */
function fillNullish<T>(arr: ReadonlyArray<T | undefined | null>, fillWith: () => T): T[] {
  // arr.map wouldn't properly fill sparse arrays.
  const newArray = Array.from({ length: arr.length }, fillWith);
  return newArray.map((v, i) => arr[i] ?? v);
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
 * Validates that `val` is a boolean or is nullish.
 *
 * @param val - Any JavaScript value.
 * @returns true if `val` is a boolean or nullish.
 */
function isNullishBoolean(val: unknown): val is boolean | null | undefined {
  return val === null || typeof val === 'boolean' || typeof val === 'undefined';
}
