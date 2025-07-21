import { AppointmentEvent } from '../types';

declare global {
    interface Window {
        google: any;
        tokenClient: any;
    }
}

const GAPI_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GAPI_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events';

let tokenClient: any;

export const loadGoogleApiService = (onGapiLoad: () => void) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = onGapiLoad;
    document.body.appendChild(script);
};

export const initializeGapiClient = async () => {
    await new Promise<void>((resolve, reject) => {
        window.google.load('client', {
            callback: resolve,
            onerror: reject,
        });
    });
    await window.google.client.init({
        apiKey: GAPI_API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
};

export const initializeTokenClient = (onTokenResponse: (tokenResponse: any) => void) => {
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

export const listUpcomingEvents = async (calendarId: string): Promise<AppointmentEvent[]> => {
    const response = await window.google.client.calendar.events.list({
        'calendarId': calendarId,
        'timeMin': (new Date()).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 100,
        'orderBy': 'startTime'
    });

    return response.result.items.map((event: any) => ({
        id: event.id,
        title: event.summary,
        start: new Date(event.start.dateTime || event.start.date),
        end: new Date(event.end.dateTime || event.end.date),
        professional: 'José', // This needs to be determined based on calendarId
        patient: 'Google Event',
        procedure: 'Google Event',
        whatsapp: '',
        estado: 'confirmed',
    }));
};
