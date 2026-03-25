/**
 * Year-aware holiday utilities for US federal and Yale academic calendar.
 * Federal rules: https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/
 * Yale academic calendar: https://yalecollege.yale.edu/academics/academic-calendar
 */

export type Holidays = Record<string, Date | Date[]>;

/** 0 = Sunday, 1 = Monday, ... 6 = Saturday */
function getNthWeekdayOfMonth(
  year: number,
  month: number,
  n: number,
  weekday: number
): Date {
  let count = 0;
  for (let d = 1; d <= 31; d++) {
    const date = new Date(year, month, d);
    if (date.getMonth() !== month) break;
    if (date.getDay() === weekday) {
      count += 1;
      if (count === n) return date;
    }
  }
  throw new Error(`No ${n}th weekday ${weekday} in month ${month} ${year}`);
}

function getLastWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number
): Date {
  let last: Date | null = null;
  for (let d = 1; d <= 31; d++) {
    const date = new Date(year, month, d);
    if (date.getMonth() !== month) break;
    if (date.getDay() === weekday) last = date;
  }
  if (!last) throw new Error(`No weekday ${weekday} in month ${month} ${year}`);
  return last;
}

/** Gregorian Easter (Anonymous algorithm). */
function getEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

/**
 * Yale academic break date ranges by calendar year. [startDay, endDay] in that month.
 * Source: https://yalecollege.yale.edu/academics/academic-calendar/future-and-future-provisional-academic-calendars
 * and https://yalecollege.yale.edu/academics/academic-calendar/2025-2026-academic-calendar
 */
const YALE_OCTOBER_BREAK: Record<number, [number, number]> = {
  2025: [14, 19], // 2025-26: recess Oct 14, resume Oct 20
  2026: [21, 25], // 2026-27: recess Oct 21 (W), resume Oct 26 (M)
  2027: [20, 24], // 2027-28: recess Oct 20 (W), resume Oct 25 (M)
  2028: [18, 22], // 2028-29: recess Oct 18 (W), resume Oct 23 (M)
  2029: [17, 21], // 2029-30 provisional
  2030: [16, 20], // 2030-31 provisional
  2031: [15, 19], // 2031-32 provisional
};
const YALE_NOVEMBER_BREAK: Record<number, [number, number]> = {
  2025: [21, 30], // 2025-26: recess Nov 21, resume Dec 1
  2026: [23, 29], // 2026-27: recess Nov 23 (M), resume Nov 30 (M)
  2027: [22, 28], // 2027-28: recess Nov 22 (M), resume Nov 29 (M)
  2028: [20, 26], // 2028-29: recess Nov 20 (M), resume Nov 27 (M)
  2029: [19, 25], // 2029-30 provisional
  2030: [18, 30], // 2030-31 provisional: recess Nov 18, resume Dec 2
  2031: [24, 30], // 2031-32 provisional: recess Nov 24, resume Dec 1
};
const YALE_SPRING_BREAK: Record<number, [number, number]> = {
  2026: [6, 22], // 2025-26: recess Mar 6, resume Mar 23
  2027: [8, 21], // 2026-27: recess Mar 8 (M), resume Mar 22 (M)
  2028: [6, 19], // 2027-28: recess Mar 6 (M), resume Mar 20 (M)
  2029: [5, 18], // 2028-29: recess Mar 5 (M), resume Mar 19 (M)
  2030: [4, 17], // 2029-30 provisional
  2031: [3, 16], // 2030-31 provisional
  2032: [8, 21], // 2031-32 provisional
};

/**
 * Returns all holidays (federal + Yale academic) for the given year.
 * Dates are in local time; month is 0-indexed in Date.
 */
export function getHolidaysForYear(year: number): Holidays {
  const result: Holidays = {};

  // Fixed federal
  result["New Year's Day"] = new Date(year, 0, 1);
  result['Fourth of July'] = new Date(year, 6, 4);
  result['Juneteenth'] = new Date(year, 5, 19);
  result['Christmas Day'] = new Date(year, 11, 25);

  // Floating federal (Monday = 1)
  result['MLK Jr Day'] = getNthWeekdayOfMonth(year, 0, 3, 1);
  result['Memorial Day'] = getLastWeekdayOfMonth(year, 4, 1);
  result['Labor Day'] = getNthWeekdayOfMonth(year, 8, 1, 1);
  result['Thanksgiving Day'] = getNthWeekdayOfMonth(year, 10, 4, 4);

  // Easter-based
  const easter = getEaster(year);
  const goodFriday = new Date(easter);
  goodFriday.setDate(goodFriday.getDate() - 2);
  result['Good Friday'] = goodFriday;

  // Yale academic breaks (by calendar year)
  const oct = YALE_OCTOBER_BREAK[year];
  if (oct) {
    result['October Break'] = Array.from(
      { length: oct[1] - oct[0] + 1 },
      (_, i) => new Date(year, 9, oct[0] + i)
    );
  }
  const nov = YALE_NOVEMBER_BREAK[year];
  if (nov) {
    result['November Break'] = Array.from(
      { length: nov[1] - nov[0] + 1 },
      (_, i) => new Date(year, 10, nov[0] + i)
    );
  }
  const spring = YALE_SPRING_BREAK[year];
  if (spring) {
    result['Spring Break'] = Array.from(
      { length: spring[1] - spring[0] + 1 },
      (_, i) => new Date(year, 2, spring[0] + i)
    );
  }

  return result;
}

/**
 * Returns { isHoliday, holidayName } for the given date using year-aware holidays.
 */
export function getHolidayForDate(date: Date): {
  isHoliday: boolean;
  holidayName: string | null;
} {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const holidays = getHolidaysForYear(year);

  for (const name of Object.keys(holidays)) {
    const value = holidays[name];
    if (Array.isArray(value)) {
      if (value.some((d) => d.getMonth() === month && d.getDate() === day)) {
        return { isHoliday: true, holidayName: name };
      }
    } else {
      if (value.getMonth() === month && value.getDate() === day) {
        return { isHoliday: true, holidayName: name };
      }
    }
  }
  return { isHoliday: false, holidayName: null };
}
