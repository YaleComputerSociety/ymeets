/// <reference types="jest" />
import { eventPeriod, monthDays, occursOn } from './eventCalendar';
import type { AccountsPageEvent } from './AccountsPage';
const event = (calendarDates: Date[], extra = {}): AccountsPageEvent => ({
  name: 'Test',
  id: 'ABC',
  dates: '',
  startTime: '',
  endTime: '',
  location: '',
  iAmCreator: true,
  dateCreated: new Date(),
  lastModified: new Date(),
  labels: [],
  calendarDates,
  ...extra,
});

test('calendar aligns weekdays, includes leap day, and crosses year boundaries', () => {
  const february = monthDays(new Date(2024, 1, 1));
  expect(february[0].getDay()).toBe(0);
  expect(february.length % 7).toBe(0);
  expect(
    february.some((day) => day.getMonth() === 1 && day.getDate() === 29)
  ).toBe(true);
  expect(monthDays(new Date(2026, 0, 1))[0].getFullYear()).toBe(2025);
});

test('today remains current, multiple proposed dates use the last date, general days stay undated', () => {
  const today = new Date(2026, 9, 22, 15);
  expect(eventPeriod(event([new Date(2026, 9, 22)]), today)).toBe('upcoming');
  expect(eventPeriod(event([new Date(2026, 9, 21)]), today)).toBe('past');
  expect(
    eventPeriod(event([new Date(2026, 9, 21), new Date(2026, 9, 23)]), today)
  ).toBe('upcoming');
  expect(eventPeriod(event([new Date(2000, 0, 3)]), today)).toBe('undated');
  expect(eventPeriod(event([]), today)).toBe('undated');
});

test('proposed dates do not fill gaps, confirmed events span midnight', () => {
  const proposed = event([new Date(2026, 9, 21), new Date(2026, 9, 23)]);
  expect(occursOn(proposed, new Date(2026, 9, 22))).toBe(false);
  expect(occursOn(proposed, new Date(2026, 9, 23))).toBe(true);
  const confirmed = event([new Date(2026, 9, 21, 23)], {
    confirmedStart: new Date(2026, 9, 21, 23),
    confirmedEnd: new Date(2026, 9, 22, 1),
  });
  expect(occursOn(confirmed, new Date(2026, 9, 22))).toBe(true);
  expect(occursOn(confirmed, new Date(2026, 9, 23))).toBe(false);
});
