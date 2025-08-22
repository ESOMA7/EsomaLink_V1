import { AppointmentEvent } from '../types';

declare global {
    interface Window {
        google: any;
        tokenClient: any;
        gapiLoaded: boolean;
        gapiLoadPromise: Promise<void>;
    }
}

const GAPI_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GAPI_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events';

let tokenClient: any;
let gapiInitialized = false;

// Create a global promise that resolves when gapi is loaded
if (!window.gapiLoadPromise) {
    window.gapiLoadPromise = new Promise<void>((resolve, reject) => {
        // Load GAPI script
        const gapiScript = document.createElement('script');
        gapiScript.src = 'https://apis.google.com/js/api.js';
        gapiScript.async = true;
        gapiScript.defer = true;
        
        // Load Google Identity Services script
        const gisScript = document.createElement('script');
        gisScript.src = 'https://accounts.google.com/gsi/client';
        gisScript.async = true;
        gisScript.defer = true;
        
        let scriptsLoaded = 0;
        const totalScripts = 2;
        
        const checkAllLoaded = () => {
            scriptsLoaded++;
            if (scriptsLoaded === totalScripts) {
                // Load only the client library, not auth2
                window.gapi.load('client', () => {
                    window.gapiLoaded = true;
                    console.log('Google API and GIS scripts loaded and ready');
                    resolve();
                });
            }
        };
        
        gapiScript.onload = checkAllLoaded;
        gisScript.onload = checkAllLoaded;
        
        gapiScript.onerror = gisScript.onerror = (error) => {
            console.error('Failed to load Google scripts', error);
            reject(new Error('Failed to load Google scripts'));
        };
        
        document.body.appendChild(gapiScript);
        document.body.appendChild(gisScript);
    });
}

export const loadGoogleApiService = (callback: () => void) => {
    window.gapiLoadPromise
        .then(() => {
            console.log('Google API is ready');
            callback();
        })
        .catch((error: Error) => {
            console.error('Failed to load Google API:', error);
        });
};

export const initializeGapiClient = async (accessToken: string): Promise<void> => {
    if (!window.gapi) {
        throw new Error('Google API not loaded');
    }

    if (gapiInitialized) {
        console.log('Google API client already initialized');
        return;
    }

    try {
        await window.gapi.client.init({
            apiKey: GAPI_API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
        });
        
        window.gapi.client.setToken({ access_token: accessToken });
        
        console.log('Google API client initialized successfully');
        gapiInitialized = true;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error initializing Google API client:', error);
        throw new Error(`Failed to initialize Google API: ${errorMessage}`);
    }
};

export const initializeTokenClient = (callback: (tokenResponse: any) => void) => {
    console.log('Attempting to initialize Google Token Client...');
    if (typeof window.google === 'undefined') {
        console.error('GIS Error: window.google is not defined.');
        throw new Error('Google API script not loaded.');
    }
    if (typeof window.google.accounts === 'undefined') {
        console.error('GIS Error: window.google.accounts is not defined.');
        throw new Error('Google Identity Services not loaded.');
    }
    if (typeof window.google.accounts.oauth2 === 'undefined') {
        console.error('GIS Error: window.google.accounts.oauth2 is not defined.');
        throw new Error('Google Token Client library not loaded.');
    }
    console.log('GIS object found. Initializing token client...');
    try {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: GAPI_CLIENT_ID,
            scope: SCOPES,
            callback: callback,
            error_callback: (error: any) => {
                console.error('Token Client Initialization Error Callback:', error);
                // Llama al callback principal con una estructura de error para notificar a la UI
                callback({ error: 'initialization_failed', error_description: error.message || 'Failed to initialize token client' });
            },
        });
        console.log('Google Token Client initialized successfully.');
    } catch (error) {
        console.error('Error during window.google.accounts.oauth2.initTokenClient:', error);
        throw error;
    }
};

export const requestAccessToken = () => {
    if (!tokenClient) {
        console.error('Token client not initialized');
        return;
    }
    
    console.log('Requesting Google Calendar access with scopes:', SCOPES);
    console.log('Token client object before request:', tokenClient);
    
    // Solicitar acceso con prompt explícito para forzar pantalla de consentimiento
    try {
        tokenClient.requestAccessToken({ 
            prompt: 'consent', // Forzar siempre la pantalla de consentimiento
            include_granted_scopes: false // No incluir scopes ya otorgados para forzar la re-autorización
        });
    } catch (error) {
        console.error('Error calling requestAccessToken:', error);
    }
};

export const revokeGoogleToken = (accessToken: string, onRevoke: () => void) => {
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        window.google.accounts.oauth2.revoke(accessToken, onRevoke);
    } else {
        console.error('Cannot revoke token: Google Identity Services not available.');
        onRevoke(); // Call the callback anyway to not block the flow
    }
};

export const listUserCalendars = async () => {
    if (!window.gapi.client.calendar) {
        throw new Error('Google Calendar API client not initialized.');
    }
    try {
        const response = await window.gapi.client.calendar.calendarList.list();
        console.log('Google API response for calendars:', response.result.items);
        return response.result.items;
    } catch (error) {
        console.error('Error fetching calendar list:', error);
        throw error;
    }
};

export const listUpcomingEvents = async (calendarId: string = 'primary', calendarColor?: string): Promise<AppointmentEvent[]> => {
    if (!window.gapi.client) {
        throw new Error('GAPI client is not initialized.');
    }
    const response = await window.gapi.client.calendar.events.list({
        'calendarId': calendarId,
        'timeMin': (new Date()).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 250,
        'orderBy': 'startTime'
    });

    const googleEvents = response.result.items;

    return googleEvents.map((event: any) => ({
        id: event.id, // Use the original Google event ID
        calendarId: calendarId, // Add the calendarId to each event
        title: event.summary || 'Sin título',
        start: new Date(event.start.dateTime || event.start.date),
        end: new Date(event.end.dateTime || event.end.date),
        color: calendarColor, // This might be undefined, but the hook will assign the correct one
        professional: 'José', // Placeholder
        patient: 'N/A', // Placeholder
        procedure: event.summary || 'N/A',
        whatsapp: '',
        estado: 'confirmed',
    })) || [];
};

export const createEvent = async (calendarId: string, event: Omit<AppointmentEvent, 'id' | 'title'>) => {
    if (!window.gapi.client.calendar) {
        throw new Error('Google Calendar API client not initialized.');
    }

    const resource = {
        summary: `${event.patient} - ${event.procedure}`,
        start: {
            dateTime: event.start.toISOString(),
            timeZone: 'America/Mexico_City',
        },
        end: {
            dateTime: event.end.toISOString(),
            timeZone: 'America/Mexico_City',
        },
        // You can add more event properties here, like description, attendees, etc.
    };

    const response = await window.gapi.client.calendar.events.insert({
        calendarId: calendarId,
        resource: resource,
    });

    return response.result;
};

export const updateEventDateTime = async (calendarId: string, eventId: string, newStart: Date, newEnd: Date) => {
    if (!window.gapi.client.calendar) {
        throw new Error('Google Calendar API client not initialized.');
    }

    // The Google Calendar API expects the event ID without the calendarId prefix.
    const realEventId = eventId.split('#').pop();

    try {
        const response = await window.gapi.client.calendar.events.patch({
            calendarId: calendarId,
            eventId: realEventId,
            resource: {
                start: { dateTime: newStart.toISOString() },
                end: { dateTime: newEnd.toISOString() },
            },
        });
        return response.result;
    } catch (error) {
        console.error('Error updating event date/time:', error);
        throw error;
    }
};

export const deleteEvent = async (calendarId: string, eventId: string) => {
    try {
        const response = await window.gapi.client.calendar.events.delete({
            calendarId: calendarId,
            eventId: eventId,
        });
        return response;
    } catch (error) {
        console.error('Error deleting event:', error);
        throw error;
    }
};
