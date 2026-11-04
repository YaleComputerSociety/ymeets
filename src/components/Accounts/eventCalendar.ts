import type { AccountsPageEvent } from './AccountsPage';

export function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function datedDays(event: AccountsPageEvent) {
  return event.calendarDates.filter(
    (date) => Number.isFinite(date.getTime()) && date.getFullYear() !== 2000
  );
}

export function eventPeriod(
  event: AccountsPageEvent,
  today: Date
): 'past' | 'upcoming' | 'undated' {
  const dates = datedDays(event);
  if (!dates.length) return 'undated';
  const last =
    event.confirmedEnd ||
    new Date(Math.max(...dates.map((date) => date.getTime())));
  const midnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  return last < midnight ? 'past' : 'upcoming';
}

export function occursOn(event: AccountsPageEvent, day: Date) {
  if (event.confirmedStart && event.confirmedEnd) {
    const start = new Date(event.confirmedStart);
    start.setHours(0, 0, 0, 0);
    return day >= start && day <= event.confirmedEnd;
  }
  return datedDays(event).some((date) => sameDay(date, day));
}

export function monthDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const count =
    Math.ceil(
      (first.getDay() +
        new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()) /
        7
    ) * 7;
  return Array.from(
    { length: count },
    (_, index) =>
      new Date(
        month.getFullYear(),
        month.getMonth(),
        index - first.getDay() + 1
      )
  );
}
