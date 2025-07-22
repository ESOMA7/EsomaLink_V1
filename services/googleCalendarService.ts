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
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            window.gapi.load('client:auth2', () => {
                window.gapiLoaded = true;
                console.log('Google API script loaded and ready');
                resolve();
            });
        };
        script.onerror = (error) => {
            console.error('Failed to load Google API script');
            reject(new Error('Failed to load Google API script'));
        };
        document.body.appendChild(script);
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

export const initializeGapiClient = async (): Promise<void> => {
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
            clientId: GAPI_CLIENT_ID,
            discoveryDocs: [DISCOVERY_DOC],
            scope: SCOPES,
        });
        
        console.log('Google API client initialized successfully');
        gapiInitialized = true;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error initializing Google API client:', error);
        throw new Error(`Failed to initialize Google API: ${errorMessage}`);
    }
};

export const initializeTokenClient = (onTokenResponse: (tokenResponse: any) => void) => {
    if (!GAPI_CLIENT_ID) {
        console.error("Google Client ID is not set.");
        return;
    }
    if (!window.google) {
        console.error("Google accounts service is not loaded.");
        return;
    }
    tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GAPI_CLIENT_ID,
        scope: SCOPES,
        callback: onTokenResponse,
    });
};

export const requestAccessToken = () => {
    tokenClient.requestAccessToken({ prompt: 'consent' });
};

export const revokeAccessToken = (accessToken: string, onRevoke: () => void) => {
    window.google.accounts.oauth2.revoke(accessToken, onRevoke);
};

export const listUpcomingEvents = async (calendarId: string = 'primary'): Promise<AppointmentEvent[]> => {
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

    return response.result.items?.map((event: any) => ({
        id: event.id,
        title: event.summary,
        start: new Date(event.start.dateTime || event.start.date),
        end: new Date(event.end.dateTime || event.end.date),
        patient: event.summary?.split(' - ')[1] || '',
        procedure: event.summary?.split(' - ')[0] || '',
    })) || [];
};
