import { AppointmentEvent } from '../types';
import { supabase } from './supabaseClient';

export const loadGoogleApiService = (callback: () => void) => { 
    console.log('Using Supabase Edge Function Proxy. No gapi load needed.');
    callback(); 
};

export const initializeGapiClient = async (accessToken: string): Promise<void> => {
    console.log('initializeGapiClient called, but obsolete with Proxy. Ignored.');
    return Promise.resolve();
};

export const initializeTokenClient = (callback: (tokenResponse: any) => void) => {
    console.log('initializeTokenClient called, but obsolete with Proxy. Ignored.');
};

export const requestAccessToken = () => {
    console.log('requestAccessToken obsolete. Auth forms should redirect to Supabase OAuth.');
};

export const revokeGoogleToken = (accessToken: string, onRevoke: () => void) => {
    onRevoke();
};

// --- REAL PROXY FUNCTIONS VIA EDGE FUNCTIONS ---

const invokeCalendarFunction = async (action: string, calendarId?: string, params?: any, eventData?: any, eventId?: string) => {
    const { data, error } = await supabase.functions.invoke('google-calendar', {
        body: { action, calendarId, params, eventData, eventId }
    });

    if (error) {
        console.error('Error invoking Google Calendar edge function:', error);
        throw error;
    }

    if (data?.error) {
        throw new Error(data.error.message || data.error);
    }

    return data;
};

export const listUserCalendars = async () => {
    try {
        const result = await invokeCalendarFunction('listCalendars');
        return result.items || [];
    } catch (error) {
        console.error('Error fetching calendar list:', error);
        throw error;
    }
};

export const listUpcomingEvents = async (calendarId: string = 'primary', calendarColor?: string, timeMin?: string, timeMax?: string): Promise<AppointmentEvent[]> => {
    const result = await invokeCalendarFunction('listEvents', calendarId, { timeMin, timeMax });
    const googleEvents = result.items || [];

    return googleEvents.map((event: any) => ({
        id: event.id,
        calendarId: calendarId,
        title: event.summary || 'Sin título',
        start: new Date(event.start.dateTime || event.start.date),
        end: new Date(event.end.dateTime || event.end.date),
        color: calendarColor,
        professional: '',
        patient: event.summary,
        procedure: event.description,
        whatsapp: '',
        estado: 'confirmed',
    }));
};

export const createEvent = async (calendarId: string, event: Omit<AppointmentEvent, 'id' | 'title'>) => {
    const resource = {
        summary: event.patient,
        description: event.procedure,
        start: {
            dateTime: event.start.toISOString(),
            timeZone: 'America/Mexico_City',
        },
        end: {
            dateTime: event.end.toISOString(),
            timeZone: 'America/Mexico_City',
        },
    };

    return await invokeCalendarFunction('createEvent', calendarId, undefined, resource);
};

export const updateEvent = async (calendarId: string, eventId: string, event: Omit<AppointmentEvent, 'id' | 'title'>) => {
    const resource = {
        summary: event.patient,
        description: event.procedure,
        start: {
            dateTime: event.start.toISOString(),
            timeZone: 'America/Mexico_City',
        },
        end: {
            dateTime: event.end.toISOString(),
            timeZone: 'America/Mexico_City',
        },
    };

    return await invokeCalendarFunction('updateEvent', calendarId, undefined, resource, eventId);
};

export const updateEventDateTime = async (calendarId: string, eventId: string, newStart: Date, newEnd: Date) => {
    const resource = {
        start: { dateTime: newStart.toISOString(), timeZone: 'America/Mexico_City' },
        end: { dateTime: newEnd.toISOString(), timeZone: 'America/Mexico_City' },
    };

    return await invokeCalendarFunction('patchEvent', calendarId, undefined, resource, eventId);
};

export const deleteEvent = async (calendarId: string, eventId: string) => {
    return await invokeCalendarFunction('deleteEvent', calendarId, undefined, undefined, eventId);
};
