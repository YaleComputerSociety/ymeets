// GoogleCalendarService.ts
// A service to handle Google Calendar API interactions with modern authentication flow

// Configuration
const GOOGLE_API_KEY = process.env.REACT_APP_API_KEY_GAPI;
const GOOGLE_CLIENT_ID = process.env.REACT_APP_CLIENT_ID_GAPI;
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
];

// Store calendar access state in localStorage to persist through refreshes
const CALENDAR_ACCESS_KEY = 'hasCalendarAccess';
const TOKEN_EXPIRY_KEY = 'tokenExpiry';

// Custom type for access change listeners
type AccessChangeListener = (hasAccess: boolean) => void;

class GoogleCalendarService {
  private initialized: boolean = false;
  private apiLoaded: boolean = false;
  private loadingPromise: Promise<boolean> | null = null;
  private initPromise: Promise<boolean> | null = null;
  private accessChangeListeners: AccessChangeListener[] = [];
  private tokenClient: google.accounts.oauth2.TokenClient | null = null;

  constructor() {
    // Check if access is already granted from previous sessions
    const stored = localStorage.getItem(CALENDAR_ACCESS_KEY);
    const tokenExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    
    // Only consider access granted if the token expiry timestamp is in the future
    if (stored === 'true' && tokenExpiry) {
      const expiryTime = parseInt(tokenExpiry, 10);
      const currentTime = new Date().getTime();
      
      this._hasAccess = expiryTime > currentTime;
      
      // Clean up expired token
      if (!this._hasAccess && stored === 'true') {
        localStorage.removeItem(CALENDAR_ACCESS_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
      }
    } else {
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
        // If we're granting access, store the token expiry time
        try {
          const token = gapi.client.getToken();
          if (token && token.expires_in) {
            // Calculate expiry time (current time + expires_in seconds)
            //@ts-expect-error
            const expiryTime = new Date().getTime() + (token.expires_in * 1000);
            localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
          }
        } catch (error) {
          console.error('Error storing token expiry:', error);
        }
      } else {
        // If we're revoking access, remove the token expiry
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
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
        console.log('GAPI script loaded');
      }

      // Load the Google Identity Services script
      if (!window.google?.accounts) {
        await this.loadScript('https://accounts.google.com/gsi/client');
        console.log('Google Identity Services script loaded');
      }

      // Load the GAPI client
      await new Promise<void>((resolve, reject) => {
        window.gapi.load('client', {
          callback: () => {
            console.log('GAPI client loaded');
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

  // Private implementation for initializing Google API client
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
      console.log('Initializing GAPI client with:', {
        apiKey: GOOGLE_API_KEY ? 'present' : 'missing',
        clientId: GOOGLE_CLIENT_ID ? 'present' : 'missing',
      });
      
      await window.gapi.client.init({
        apiKey: GOOGLE_API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
      });
      
      // Initialize the token client - explicitly configure to prevent auto-prompts
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID || '',
        scope: CALENDAR_SCOPE,
        prompt: '', // Empty prompt means don't show UI automatically
        callback: (tokenResponse:any ) => {
          // This callback gets triggered when you get a token
          if (tokenResponse && !tokenResponse.error) {
            // We have a token, so we have access
            this.hasAccess = true;
          } else {
            console.error('Token error:', tokenResponse?.error);
            this.hasAccess = false;
          }
        },
      });

      // If we have a stored token expiry and it's in the future,
      // attempt a no-prompt token request to validate and refresh the token
      if (this._hasAccess) {
        const tokenExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
        if (tokenExpiry) {
          const expiryTime = parseInt(tokenExpiry, 10);
          const currentTime = new Date().getTime();
          
          // If token is still valid or expired less than 7 days ago, try to refresh it silently
          if (expiryTime > currentTime || (currentTime - expiryTime < 7 * 24 * 60 * 60 * 1000)) {
            try {
              // Try to get a token without user interaction
              await this.refreshTokenSilently();
            } catch (error) {
              console.log('Silent token refresh failed, will require manual login', error);
              this.hasAccess = false;
            }
          } else {
            // Token expired more than 7 days ago, likely need user interaction
            this.hasAccess = false;
          }
        }
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing client:', error);
      this.initialized = false;
      this.hasAccess = false;
      return false;
    }
  }

  // Try to refresh the token without user interaction
  private async refreshTokenSilently(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (!this.tokenClient) {
        reject(new Error('Token client not initialized'));
        return;
      }
      
      // Save the current callback
      const originalCallback = this.tokenClient.callback;
      
      // Set a new callback just for this operation
      this.tokenClient.callback = (tokenResponse) => {
        // Restore the original callback
        this.tokenClient!.callback = originalCallback;
        
        if (tokenResponse && !tokenResponse.error) {
          this.hasAccess = true;
          resolve(true);
        } else {
          if (tokenResponse?.error === 'user_denied' || 
              tokenResponse?.error === 'access_denied' ||
              tokenResponse?.error === 'popup_closed') {
            // User actively declined - don't retry with UI
            this.hasAccess = false;
            reject(new Error('User denied access: ' + tokenResponse?.error));
          } else {
            // Other error, might need user interaction
            this.hasAccess = false;
            reject(new Error('Token error: ' + tokenResponse?.error));
          }
        }
      };
      
      // Request a token without showing UI
      // The 'none' prompt value will cause a failure rather than showing UI
      this.tokenClient.requestAccessToken({ prompt: 'none' });
    });
  }

  // Request Calendar access with better error handling
  public async requestCalendarAccess(): Promise<boolean> {
    console.log("service: requestCalendarAccess");
    
    if (!this.initialized) {
      console.log("service: initializing before requestCalendarAccess");
      const initialized = await this.initializeClient();
      console.log("service: requestCalendarAccess initialized", initialized);
      if (!initialized) {
        throw new Error('Failed to initialize Google API client');
      }
    }
    
    try {
      if (!this.tokenClient) {
        throw new Error('Token client not initialized');
      }
      
      // Request an access token - this is where we INTENTIONALLY show the popup
      return new Promise<boolean>((resolve) => {
        this.tokenClient!.callback = (tokenResponse) => {
          if (tokenResponse && !tokenResponse.error) {
            this.hasAccess = true;
            resolve(true);
          } else {
            console.error('Error getting token:', tokenResponse?.error);
            this.hasAccess = false;
            resolve(false);
          }
        };
        
        // Explicitly prompt the user for consent - this will open a popup
        // This is the ONLY place in the code where a popup should appear
        this.tokenClient!.requestAccessToken({prompt: 'consent'});
      });
    } catch (error) {
      console.error('Error in requestCalendarAccess:', error);
      this.hasAccess = false;
      return false;
    }
  }

  // Fetch list of calendars with better error handling
  public async fetchCalendars(): Promise<any[]> {
    if (!this.initialized) {
      console.log('Initializing before fetchCalendars');
      await this.initializeClient();
    }

    // If we don't have access, try to refresh the token silently before failing
    if (!this._hasAccess) {
      try {
        const refreshed = await this.refreshTokenSilently();
        if (!refreshed) {
          throw new Error('Calendar access not granted. Please request access first.');
        }
      } catch (error) {
        console.error('Failed to refresh token silently:', error);
        throw new Error('Calendar access not granted. Please request access first.');
      }
    }

    try {
      console.log('Fetching calendar list');
      const response = await window.gapi.client.calendar.calendarList.list();
      console.log('Calendar list response:', response);
      return response.result.items || [];
    } catch (error) {
      console.error('Error fetching calendars:', error);
      
      // Handle auth errors by requesting access again
      if (this.isAuthError(error)) {
        console.log('Auth error detected, clearing access state');
        this.hasAccess = false;
        
        try {
          // Try to request access again
          console.log('Attempting to request access again');
          const granted = await this.requestCalendarAccess();
          if (granted) {
            // Retry the fetch if access was granted
            console.log('Access re-granted, retrying fetch');
            return this.fetchCalendars();
          } else {
            throw new Error('Failed to re-authenticate');
          }
        } catch (retryError) {
          console.error('Failed to re-authenticate:', retryError);
          throw new Error('Authentication failed while fetching calendars');
        }
      }
      
      throw error;
    }
  }

  // Fetch calendar events with better error handling
  public async fetchCalendarEvents(
    calendarId: string = 'primary',
    timeMin: string,
    timeMax: string
  ): Promise<any[]> {
    if (!this.initialized) {
      console.log('Initializing before fetchCalendarEvents');
      await this.initializeClient();
    }

    // If we don't have access, try to refresh the token silently before failing
    if (!this._hasAccess) {
      try {
        const refreshed = await this.refreshTokenSilently();
        if (!refreshed) {
          throw new Error('Calendar access not granted. Please request access first.');
        }
      } catch (error) {
        console.error('Failed to refresh token silently:', error);
        throw new Error('Calendar access not granted. Please request access first.');
      }
    }

    try {
      console.log('Fetching calendar events:', { calendarId, timeMin, timeMax });
      const response = await window.gapi.client.calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime'
      });

      console.log('Fetched calendar events response:', response);
      return response.result.items || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      
      // Handle auth errors by requesting access again
      if (this.isAuthError(error)) {
        console.log('Auth error detected, clearing access state');
        this.hasAccess = false;
        
        try {
          // Try to request access again
          console.log('Attempting to request access again');
          const granted = await this.requestCalendarAccess();
          if (granted) {
            // Retry the fetch if access was granted
            console.log('Access re-granted, retrying fetch');
            return this.fetchCalendarEvents(calendarId, timeMin, timeMax);
          } else {
            throw new Error('Failed to re-authenticate');
          }
        } catch (retryError) {
          console.error('Failed to re-authenticate:', retryError);
          throw new Error('Authentication failed while fetching events');
        }
      }
      
      throw error;
    }
  }

  // Disconnect from Google APIs (when logging out)
  public async disconnect(): Promise<void> {
    // To revoke access, we need to make a direct request
    if (this._hasAccess && window.google?.accounts?.oauth2) {
      try {
        // Get the token
        const token = window.gapi.client.getToken();
        if (token) {
          // Revoke the token
          window.google.accounts.oauth2.revoke(token.access_token, () => {
            console.log('Token revoked');
          });
          // Clear the token from gapi client
          window.gapi.client.setToken(null);
        }
      } catch (error) {
        console.error('Error during token revocation:', error);
      }
    }
    
    this.hasAccess = false;
    console.log('Disconnected from Google Calendar');
  }

  // Helper to load scripts
  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (document.querySelector(`script[src="${src}"]`)) {
        console.log(`Script ${src} already loaded`);
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log(`Script ${src} loaded successfully`);
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

// TypeScript declaration for Google Identity Services
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