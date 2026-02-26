import type { AccountsPageEvent } from './AccountsPage';

const STORAGE_KEY_PREFIX = 'ymeets_account_events_';


interface CachedEventRow {
  name: string;
  id: string;
  dates: string;
  startTime: string;
  endTime: string;
  location: string;
  iAmCreator: boolean;
  dateCreated: string;
  lastModified: string;
}

function reviveDates(rows: CachedEventRow[]): AccountsPageEvent[] {
  return rows.map((row) => ({
    ...row,
    dateCreated: new Date(row.dateCreated),
    lastModified: new Date(row.lastModified),
  }));
}


//Reads the cached account events for the given account ID from localStorage.
// Returns null if there is no cache or parsing fails.
 
export function getCachedAccountEvents(
  accountID: string
): AccountsPageEvent[] | null {
  try {
    const key = STORAGE_KEY_PREFIX + accountID;
    const raw = localStorage.getItem(key);
    if (raw == null) return null;
    const parsed = JSON.parse(raw) as CachedEventRow[];
    if (!Array.isArray(parsed)) return null;
    return reviveDates(parsed);
  } catch {
    return null;
  }
}

//Writes the given events to localStorage for the given account ID.

export function setCachedAccountEvents(
  accountID: string,
  events: AccountsPageEvent[]
): void {
  try {
    const key = STORAGE_KEY_PREFIX + accountID;
    localStorage.setItem(key, JSON.stringify(events));
  } catch {
    // Ignore quota / private mode errors
  }
}
