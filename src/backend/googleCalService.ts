// GoogleCalendarService.ts
// A service to handle Google Calendar API interactions with modern authentication flow

import { time } from "console";
import { getUserTimezone } from "../components/utils/functions/timzoneConversions";


// Why we feel this is secure: https://stackoverflow.com/questions/18280827/localstorage-vs-cookies-for-oauth2-in-html5-web-app
// combined with the fact that there is a expiration date for the token.

// Configuration
const GOOGLE_API_KEY = process.env.REACT_APP_API_KEY_GAPI;
const GOOGLE_CLIENT_ID = process.env.REACT_APP_CLIENT_ID_GAPI;
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
];

// Store calendar access state in localStorage to persist through refreshes
const CALENDAR_ACCESS_KEY = 'hasCalendarAccess';
const LAST_AUTH_TIME_KEY = 'lastAuthTime';
const TOKEN_KEY = 'googleCalendarToken';
const TOKEN_EXPIRY_KEY = 'googleCalendarTokenExpiry';

// Custom type for access change listeners
type AccessChangeListener = (hasAccess: boolean) => void;

// Token interface
interface StoredToken {
  access_token: string;
  expires_in: number;
  expires_at?: number;
}

class GoogleCalendarService {
  private initialized: boolean = false;
  private apiLoaded: boolean = false;
  private loadingPromise: Promise<boolean> | null = null;
  private initPromise: Promise<boolean> | null = null;
  private accessChangeListeners: AccessChangeListener[] = [];
  private tokenClient: google.accounts.oauth2.TokenClient | null = null;

  constructor() {
    // Check if access was previously granted
    const stored = localStorage.getItem(CALENDAR_ACCESS_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    
    if (stored === 'true' && storedToken && storedExpiry) {
      const expiryTime = parseInt(storedExpiry, 10);
      const now = Date.now();
      
      // Check if token is still valid (with 5 minute buffer)
      if (expiryTime > now + 5 * 60 * 1000) {
        // Token is still valid
        this._hasAccess = true;
        
        // Parse and set the token when GAPI is ready
        this.restoreTokenWhenReady(storedToken);
      } else {
        // Token expired, clear storage
        this.clearStoredTokenData();
        this._hasAccess = false;
      }
    } else {
      this._hasAccess = false;
    }
  }

  private clearStoredTokenData() {
    localStorage.removeItem(CALENDAR_ACCESS_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(LAST_AUTH_TIME_KEY);
  }

  private async restoreTokenWhenReady(tokenString: string) {
    try {
      // Wait for GAPI to be loaded and initialized
      await this.initializeClient();
      
      const token: StoredToken = JSON.parse(tokenString);
      if (window.gapi?.client && token) {
        window.gapi.client.setToken(token);
        console.log('Restored previous Google Calendar token');
        
        // Verify the token is still valid by making a simple API call
        try {
          await window.gapi.client.calendar.calendarList.list({ maxResults: 1 });
          console.log('Token validation successful');
        } catch (error) {
          console.error('Token validation failed:', error);
          // Token is invalid, clear it
          this.clearStoredTokenData();
          this._hasAccess = false;
          this.notifyAccessChange();
        }
      }
    } catch (error) {
      console.error('Error restoring token:', error);
      // If restoration fails, clear the stored data
      this.clearStoredTokenData();
      this._hasAccess = false;
    }
  }

  private _hasAccess: boolean = false;

  // Add event emitter pattern for access changes
  public onAccessChange(callback: AccessChangeListener): () => void {
    this.accessChangeListeners.push(callback);
    // Return a function to remove the listener
    return () => {
      this.accessChangeListeners = this.accessChangeListeners.filter(cb => cb !== callback);
    };
  }

  // Notify all listeners of access change
  private notifyAccessChange() {
    for (const listener of this.accessChangeListeners) {
      listener(this._hasAccess);
    }
  }

  // Setter for hasAccess that updates localStorage and notifies listeners
  private set hasAccess(value: boolean) {
    if (this._hasAccess !== value) {
      this._hasAccess = value;
      localStorage.setItem(CALENDAR_ACCESS_KEY, value.toString());
      
      if (value) {
        // Store the current time as the last auth time
        localStorage.setItem(LAST_AUTH_TIME_KEY, new Date().getTime().toString());
        
        // Store the token if available
        if (window.gapi?.client) {
          const token = window.gapi.client.getToken();
          if (token) {
            // Calculate and store expiry time
            const expiresAt = Date.now() + (token.expires_in * 1000);
            const tokenWithExpiry: StoredToken = {
              ...token,
              expires_at: expiresAt
            };
            
            localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenWithExpiry));
            localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString());
          }
        }
      } else {
        // If we're revoking access, remove the auth data
        this.clearStoredTokenData();
      }
      
      this.notifyAccessChange();
    }
  }

  // Check if the user has granted Calendar access
  public hasCalendarAccess(): boolean {
    return this._hasAccess;
  }

  // Load the necessary scripts with better error handling and caching
  public async loadScripts(): Promise<boolean> {
    // Return existing promise if already loading
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // Return early if already loaded
    if (this.apiLoaded) return true;

    // Create and cache the promise
    this.loadingPromise = this._loadScriptsImpl();
    
    try {
      return await this.loadingPromise;
    } finally {
      // Clear promise on completion (success or failure)
      this.loadingPromise = null;
    }
  }

  // Private implementation for loading necessary scripts
  private async _loadScriptsImpl(): Promise<boolean> {
    try {
      // Load the Google API script
      if (!window.gapi) {
        await this.loadScript('https://apis.google.com/js/api.js');
      }

      // Load the Google Identity Services script
      if (!window.google?.accounts) {
        await this.loadScript('https://accounts.google.com/gsi/client');
      }

      // Load the GAPI client
      await new Promise<void>((resolve, reject) => {
        window.gapi.load('client', {
          callback: () => {
            resolve();
          },
          onerror: (error: any) => {
            console.error('Error loading GAPI client:', error);
            reject(error);
          },
          timeout: 5000,
          ontimeout: () => {
            console.error('Timeout loading GAPI client');
            reject(new Error('Timeout loading GAPI client'));
          },
        });
      });

      this.apiLoaded = true;
      return true;
    } catch (error) {
      console.error('Failed to load scripts:', error);
      this.apiLoaded = false;
      return false;
    }
  }

  // Initialize the Google API client with better error handling and caching
  public async initializeClient(): Promise<boolean> {
    // Return existing promise if already initializing
    if (this.initPromise) {
      return this.initPromise;
    }
    
    // Return early if already initialized
    if (this.initialized) return true;
    
    // Create and cache the promise
    this.initPromise = this._initializeClientImpl();
    
    try {
      return await this.initPromise;
    } finally {
      // Clear promise on completion (success or failure)
      this.initPromise = null;
    }
  }

  private async _initializeClientImpl(): Promise<boolean> {
    if (!this.apiLoaded) {
      const loaded = await this.loadScripts();
      if (!loaded) {
        console.error('Failed to load necessary scripts before initializing');
        return false;
      }
    }

    try {
      // Initialize GAPI client with API key and discovery docs
      await window.gapi.client.init({
        apiKey: GOOGLE_API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
      });
      
      // Initialize the token client
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID || '',
        scope: CALENDAR_SCOPE,
        prompt: '', // Empty prompt means don't show UI automatically
        callback: (tokenResponse: any) => {
          // This callback gets triggered when you get a token
          if (tokenResponse && !tokenResponse.error) {
            // We have a token, so we have access
            this.hasAccess = true;
            
            // Store token expiry for better tracking
            if (tokenResponse.expires_in) {
              const expiresAt = Date.now() + (tokenResponse.expires_in * 1000);
              localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString());
            }
          } else if (tokenResponse?.error && 
                    tokenResponse.error !== 'popup_closed_by_user' && 
                    tokenResponse.error !== 'access_denied') {
            console.error('Token error:', tokenResponse?.error);
            this.hasAccess = false;
          }
        },
      });
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing client:', error);
      this.initialized = false;
      this.hasAccess = false;
      return false;
    }
  }

  // Check if token is expired or about to expire
  private isTokenExpired(): boolean {
    const token = window.gapi?.client?.getToken();
    if (!token) return true;
    
    // Check stored expiry time
    const storedExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (storedExpiry) {
      const expiryTime = parseInt(storedExpiry, 10);
      const now = Date.now();
      
      // Consider expired if less than 5 minutes remaining
      return expiryTime < now + 5 * 60 * 1000;
    }
    
    // If no expiry info, assume expired
    return true;
  }

  // Attempt to refresh token silently - expect this to often fail
  private async attemptSilentRefresh(): Promise<boolean> {
    if (!this.tokenClient) {
      return false;
    }
    
    return new Promise<boolean>((resolve) => {
      const originalCallback = this.tokenClient!.callback;
      
      // Set a temporary callback for this operation
      this.tokenClient!.callback = (tokenResponse) => {
        // Restore the original callback
        this.tokenClient!.callback = originalCallback;
        
        if (tokenResponse && !tokenResponse.error) {
          this.hasAccess = true;
          
          // Update token expiry
          if (tokenResponse.expires_in) {
            const expiresAt = Date.now() + (tokenResponse.expires_in * 1000);
            localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString());
          }
          
          resolve(true);
        } else {
          // Silent refresh failed - this is expected and not an error
          console.log('Silent token refresh failed:', tokenResponse?.error);
          resolve(false);
        }
      };
      
      try {
        // Try to get a token without showing UI
        this.tokenClient!.requestAccessToken({ prompt: 'none' });
      } catch (error) {
        // Restore the original callback if there's an exception
        this.tokenClient!.callback = originalCallback;
        console.log('Silent refresh exception:', error);
        resolve(false);
      }
    });
  }

  // Request Calendar access with better error handling
  public async requestCalendarAccess(): Promise<boolean> {
    if (!this.initialized) {
      const initialized = await this.initializeClient();
      if (!initialized) {
        throw new Error('Failed to initialize Google API client');
      }
    }
    
    // If we already have access and token is not expired, just return true
    if (this._hasAccess && !this.isTokenExpired()) {
      console.log('Calendar access already granted with valid token');
      return true;
    }
    
    // If token is expired, try silent refresh first
    if (this._hasAccess && this.isTokenExpired()) {
      console.log('Token expired, attempting silent refresh...');
      const refreshed = await this.attemptSilentRefresh();
      if (refreshed) {
        console.log('Token refreshed successfully');
        return true;
      }
    }
    
    try {
      if (!this.tokenClient) {
        throw new Error('Token client not initialized');
      }
      
      // Request an access token - this will show the popup
      return new Promise<boolean>((resolve) => {
        this.tokenClient!.callback = (tokenResponse) => {
          if (tokenResponse && !tokenResponse.error) {
            this.hasAccess = true;
            
            // Store token expiry
            if (tokenResponse.expires_in) {
              const expiresAt = Date.now() + (tokenResponse.expires_in * 1000);
              localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString());
            }
            
            resolve(true);
          } else {
            console.error('Error getting token:', tokenResponse?.error);
            this.hasAccess = false;
            resolve(false);
          }
        };
        
        // Explicitly prompt the user for consent
        this.tokenClient!.requestAccessToken({ prompt: 'consent' });
      });
    } catch (error) {
      console.error('Error in requestCalendarAccess:', error);
      this.hasAccess = false;
      return false;
    }
  }

  // Ensure we have valid access, with fallback strategies
  private async ensureAccess(): Promise<boolean> {
    // If we think we have access, check if token is still valid
    if (this._hasAccess) {
      // Check if token is expired
      if (this.isTokenExpired()) {
        console.log('Token is expired, attempting refresh...');
        
        // Try silent refresh
        const refreshed = await this.attemptSilentRefresh();
        if (refreshed) {
          console.log('Token refreshed successfully');
          return true;
        } else {
          console.log('Token refresh failed, user interaction required');
          this.hasAccess = false;
          return false;
        }
      }
      
      // Token is not expired, check if it's actually set
      if (window.gapi?.client) {
        const token = window.gapi.client.getToken();
        if (token && token.access_token) {
          return true;
        }
        
        // Try to restore from localStorage if not set
        const storedToken = localStorage.getItem(TOKEN_KEY);
        if (storedToken) {
          try {
            const parsedToken: StoredToken = JSON.parse(storedToken);
            window.gapi.client.setToken(parsedToken);
            return true;
          } catch (error) {
            console.error('Error restoring token:', error);
            this.clearStoredTokenData();
            this.hasAccess = false;
          }
        }
      }
    }

    // If we don't have access or restoration failed
    return false;
  }

  // Fetch list of calendars with better error handling
  public async fetchCalendars(): Promise<any[]> {
    if (!this.initialized) {
      await this.initializeClient();
    }

    // Ensure we have access
    const hasAccess = await this.ensureAccess();
    if (!hasAccess) {
      throw new Error('Calendar access not granted. Please request access first.');
    }

    try {
      const response = await window.gapi.client.calendar.calendarList.list();
      return response.result.items || [];
    } catch (error) {
      console.error('Error fetching calendars:', error);
      
      // Handle auth errors
      if (this.isAuthError(error)) {
        this.hasAccess = false;
        throw new Error('Authentication failed. Please request access again.');
      }
      
      throw error;
    }
  }

 private convertEventsToTimezone(events: any, targetTimezone: string) {
  console.log("converting");
  return events.map((event: any) => {
    const convertedEvent = { ...event };
    
    if (event.start?.dateTime) {
      const startDate = new Date(event.start.dateTime);
      convertedEvent.start = {
        ...event.start,
        dateTime: startDate.toLocaleString('sv-SE', { 
          timeZone: targetTimezone 
        }).replace(' ', 'T'),
        timeZone: targetTimezone
      };
    }
    
    if (event.end?.dateTime) {
      const endDate = new Date(event.end.dateTime);
      convertedEvent.end = {
        ...event.end,
        dateTime: endDate.toLocaleString('sv-SE', { 
          timeZone: targetTimezone 
        }).replace(' ', 'T'),
        timeZone: targetTimezone
      };
    }
    
    return convertedEvent;
  });
}

  // Fetch calendar events with better error handling
  public async fetchCalendarEvents(
    calendarId: string = 'primary',
    timeMin: string,
    timeMax: string,
    timezone: string
  ): Promise<any[]> {
    if (!this.initialized) {
      await this.initializeClient();
    }

    // Ensure we have access
    const hasAccess = await this.ensureAccess();
    if (!hasAccess) {
      throw new Error('Calendar access not granted. Please request access first.');
    }

    console.log(`Fetching events for calendar ${calendarId} from ${timeMin} to ${timeMax} in timezone ${timezone}`);

    try {
      const response = await window.gapi.client.calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
        timeZone: timezone
      });

      console.log(response.result.items);

      if (timezone == null ) {
        return response.result.items || [];
      }

      const conversion =  this.convertEventsToTimezone(response.result.items, timezone) || [];

      console.log("conversion", conversion)

      return conversion;

    } catch (error) {
      console.error('Error fetching calendar events:', error);
      
      // Handle auth errors
      if (this.isAuthError(error)) {
        this.hasAccess = false;
        throw new Error('Authentication failed. Please request access again.');
      }
      
      throw error;
    }
  }

  // Disconnect from Google APIs
  public async disconnect(): Promise<void> {
    if (this._hasAccess && window.google?.accounts?.oauth2) {
      try {
        const token = window.gapi.client.getToken();
        if (token) {
          window.google.accounts.oauth2.revoke(token.access_token, () => {
            console.log('Token revoked');
          });
          window.gapi.client.setToken(null);
        }
      } catch (error) {
        console.error('Error during token revocation:', error);
      }
    }
    
    this.hasAccess = false;
    this.clearStoredTokenData();
  }

  // Helper to load scripts
  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        resolve();
      };
      script.onerror = (error) => {
        console.error(`Script ${src} failed to load:`, error);
        reject(error);
      };
      document.body.appendChild(script);
    });
  }

  private isAuthError(error: any): boolean {
    if (!error) return false;
    
    const errorMessage = typeof error === 'string' 
      ? error 
      : (error.message || error.error?.message || '');
    
    const errorStatus = error.status || error.code || error.error?.code || 0;
    
    return (
      errorStatus === 401 ||
      errorStatus === 403 ||
      errorMessage.includes('401') ||
      errorMessage.includes('403') ||
      errorMessage.includes('unauthenticated') ||
      errorMessage.includes('UNAUTHENTICATED') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('UNAUTHORIZED') ||
      errorMessage.includes('permission') ||
      errorMessage.includes('access') ||
      errorMessage.includes('token')
    );
  }
}

export const calendarService = new GoogleCalendarService();

// TypeScript declarations remain the same
declare global {
  namespace google.accounts.oauth2 {
    interface TokenClient {
      callback: (response: any) => void;
      requestAccessToken: (options?: { prompt?: string }) => void;
    }
    interface TokenClientConfig {
      client_id: string;
      scope: string;
      prompt?: string;
      callback: (response: any) => void;
    }
  }

  interface Window {
    gapi: {
      load: (api: string, options: any) => void;
      client: {
        init: (options: any) => Promise<void>;
        getToken: () => { access_token: string; expires_in: number; } | null;
        setToken: (token: any) => void;
        calendar: {
          calendarList: {
            list: () => Promise<any>;
          };
          events: {
            list: (options: any) => Promise<any>;
          };
        };
      };
      auth2: any;
    };
    google: {
      accounts: {
        oauth2: {
          //@ts-expect-error
          initTokenClient: (config: TokenClientConfig) => google.accounts.oauth2.TokenClient;
          revoke: (token: string, callback: () => void) => void;
        }
      }
    }
  }

  namespace google.accounts.oauth2 {
    interface TokenClient {
      callback: (response: any) => void;
      requestAccessToken: (options?: { prompt?: string }) => void;
    }
  }
}