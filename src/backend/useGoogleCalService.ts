// useGoogleCalendar.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { calendarService } from './googleCalService';

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
}

interface Calendar {
  id: string;
  summary: string;
  primary?: boolean;
}

export function useGoogleCalendar() {
  // Track authorization status
  const [hasAccess, setHasAccess] = useState<boolean>(calendarService.hasCalendarAccess());
  // Track loading state
  const [loading, setLoading] = useState<boolean>(true);
  // Track API client initialization
  const [initialized, setInitialized] = useState<boolean>(false);
  // Track initialization error
  const [error, setError] = useState<string | null>(null);
  // Add a ref to prevent duplicate initialization
  const initializingRef = useRef<boolean>(false);

  // Synchronize hook state with service state
  const syncAuthState = useCallback(() => {
    const serviceHasAccess = calendarService.hasCalendarAccess();
    if (hasAccess !== serviceHasAccess) {
      setHasAccess(serviceHasAccess);
    }
  }, [hasAccess]);

  // Initialize the calendar service when component mounts
  useEffect(() => {
    const initCalendarService = async () => {
      // Prevent multiple initializations
      if (initializingRef.current) return;
      initializingRef.current = true;
      
      setLoading(true);
      setError(null);
      
      try {
        // Initialize the API client but don't force token refresh
        const apiInitialized = await calendarService.initializeClient();
        if (!apiInitialized) {
          throw new Error("Failed to initialize Google API client");
        }
        
        setInitialized(true);
        
        // Get the current auth state from the service
        // This just reads the stored state but doesn't trigger any auth flows
        const serviceHasAccess = calendarService.hasCalendarAccess();
        setHasAccess(serviceHasAccess);
        
        
      } catch (err) {
        console.error("Failed to initialize calendar service:", err);
        setError(err instanceof Error ? err.message : "Unknown error during initialization");
      } finally {
        setLoading(false);
        initializingRef.current = false;
      }
    };

    // Initialize but don't trigger auth flows on mount
    initCalendarService();
    
    // Set up listener for access changes
    const unsubscribe = calendarService.onAccessChange((newHasAccess) => {
      setHasAccess(newHasAccess);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Request calendar access - Only this function should trigger the popup
  const requestAccess = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      
      
      // Make sure we're initialized first
      if (!initialized) {
        const apiInitialized = await calendarService.initializeClient();
        if (!apiInitialized) {
          throw new Error("Failed to initialize Google API before requesting access");
        }
        setInitialized(true);
      }
      
      // Now request access - this will intentionally show a popup
      const granted = await calendarService.requestCalendarAccess();
      
      // Update our state to match the service
      setHasAccess(granted);
      
      
      return granted;
    } catch (err) {
      console.error("Failed to request calendar access:", err);
      setError(err instanceof Error ? err.message : "Failed to request access");
      return false;
    } finally {
      setLoading(false);
    }
  }, [initialized]);
  // Fetch user's calendars
  const getCalendars = useCallback(async (): Promise<Calendar[]> => {
    // Sync state before checking
    syncAuthState();
    
    if (!hasAccess) {
      console.error("Cannot fetch calendars: No calendar access");
      throw new Error("Calendar access not granted");
    }

    if (!initialized) {
      
      calendarService.initializeClient();
    }

    setLoading(true);
    try {
      const calendars = await calendarService.fetchCalendars();
      return calendars;
    } catch (err) {
      console.error("Failed to fetch calendars:", err);
      
      // Re-sync auth state in case it changed due to error
      syncAuthState();
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasAccess, initialized, syncAuthState]);

  // Fetch events for a specific calendar
  const getEvents = useCallback(
    async (
      calendarId: string = 'primary',
      startDate: string,
      endDate: string,
      timezone: string
    ): Promise<CalendarEvent[]> => {
      // Sync state before checking
      syncAuthState();
      
      if (!hasAccess) {
        console.error("Cannot fetch events: No calendar access");
        throw new Error("Calendar access not granted");
      }

      if (!initialized) {
        calendarService.initializeClient();
      }

      setLoading(true);
      try {
        const events = await calendarService.fetchCalendarEvents(
          calendarId,
          startDate,
          endDate,
          timezone
        );
        return events;
      } catch (err) {
        console.error("Failed to fetch events:", err);
        
        // Re-sync auth state in case it changed due to error
        syncAuthState();
        
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [hasAccess, initialized, syncAuthState]
  );

  // Disconnect from Google Calendar
  const disconnect = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      await calendarService.disconnect();
      setHasAccess(false);
    } catch (error) {
      console.error("Failed to disconnect from Google Calendar:", error);
      
      // Re-sync auth state to be sure
      syncAuthState();
    } finally {
      setLoading(false);
    }
  }, [syncAuthState]);

  return {
    hasAccess,
    loading,
    initialized,
    error,
    requestAccess,
    getCalendars,
    getEvents,
    disconnect,
  };
}