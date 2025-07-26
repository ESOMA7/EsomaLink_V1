import { useState, useEffect, useCallback } from 'react';
import { Calendar } from '@/types/calendar';
import { AppointmentEvent } from '@/types';
import * as googleCalendarService from '../services/googleCalendarService';
import { supabase } from '../services/supabaseClient';

// Removed the duplicate interface Calendar definition

import {
    loadGoogleApiService,
    initializeGapiClient,
    initializeTokenClient,
    requestAccessToken,
    listUpcomingEvents,
    listUserCalendars,
    revokeGoogleToken
} from '../services/googleCalendarService';

interface GoogleTokenResponse {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
    [key: string]: any; // Allow for other properties.
}

export const useAppointments = () => {

    const [isGoogleApiInitialized, setIsGoogleApiInitialized] = useState(false);
    
    const [googleAuthToken, setGoogleAuthToken] = useState<GoogleTokenResponse | null>(null);
    const [allEvents, setAllEvents] = useState<AppointmentEvent[]>([]);
    const [events, setEvents] = useState<AppointmentEvent[]>([]);
    const [userCalendars, setUserCalendars] = useState<Calendar[]>([]);
    const [visibleCalendarIds, setVisibleCalendarIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false); 
    const [error, setError] = useState<string | null>(null);

    const getGoogleTokenFromSupabase = async () => {
        try {
            const { data, error } = await supabase
                .from('configuraciones')
                .select('valor')
                .eq('clave', 'google_calendar_token')
                .single();

            if (error) {
                console.error('Error fetching Google token from Supabase:', error);
                return null;
            }

            const dataVal = data ? data.valor : null;

            if (dataVal && dataVal.access_token) {
                return dataVal.access_token;
            }
            return null;
        } catch (error) {
            console.error('Error fetching Google token from Supabase:', error);
            return null;
        }
    };

    const saveGoogleTokenToSupabase = async (token: GoogleTokenResponse) => {
        try {
            const { error } = await supabase
                .from('configuraciones')
                .upsert({ clave: 'google_calendar_token', valor: token }, { onConflict: 'clave' });

            if (error) {
                console.error('Error saving Google token to Supabase:', error);
            }
        } catch (error) {
            console.error('Error saving Google token to Supabase:', error);
        }
    };

    const fetchAllEvents = useCallback(async (token: GoogleTokenResponse | null) => {
        if (!token) {
            console.log('[fetchAllEvents] No auth token available, skipping fetch.');
            return;
        }

        console.log('[fetchAllEvents] Auth token provided, starting to fetch data...');
        setIsLoading(true);
        try {
            const calendars: Calendar[] = await listUserCalendars();
            if (!calendars || calendars.length === 0) {
                console.log('No user calendars found.');
                setUserCalendars([]);
                setAllEvents([]);
                return;
            }
            setUserCalendars(calendars);

            const eventsPromises = calendars.map(calendar => listUpcomingEvents(calendar.id));
            const eventsResults = await Promise.all(eventsPromises);
            const combinedEvents = eventsResults.flat();
            setAllEvents(combinedEvents);
            console.log(`[fetchAllEvents] Fetched ${combinedEvents.length} events from ${calendars.length} calendars.`);
        } catch (err: any) {
            console.error('[fetchAllEvents] Error fetching data:', err);
            setError(`Error al sincronizar con Google: ${err.message || 'Error desconocido'}`);
            if (err.status === 401) {
                setGoogleAuthToken(null);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const initializeGoogleSync = useCallback(() => {
        const initGapiAndTokenClient = async () => {
            try {
                console.log('[useAppointments] Initializing GAPI and Token clients...');
                await initializeGapiClient();
                initializeTokenClient(async (tokenResponse) => {
                    if (tokenResponse.error) {
                        setError('Error de autenticación con Google. Por favor, intenta de nuevo.');
                        console.error('[useAppointments] Token Error:', tokenResponse.error);
                        setGoogleAuthToken(null);
                        setIsLoading(false);
                        return;
                    }
                    console.log('[useAppointments] Google token received.');
                    await saveGoogleTokenToSupabase(tokenResponse);
                    setGoogleAuthToken(tokenResponse);
                });
                setIsGoogleApiInitialized(true);
                console.log('[useAppointments] GAPI and Token clients initialized.');

                const storedToken = await getGoogleTokenFromSupabase();
                if (storedToken) {
                    setGoogleAuthToken(storedToken as GoogleTokenResponse);
                }

            } catch (error) {
                setError('No se pudo inicializar la API de Google.');
                console.error('[useAppointments] Initialization error:', error);
            }
        };

        console.log('[useAppointments] Loading Google API Service...');
        loadGoogleApiService(initGapiAndTokenClient);
    }, []);

    // Initialize Google services when the hook mounts.
    useEffect(() => {
        initializeGoogleSync();
    }, [initializeGoogleSync]);

    // Fetch events whenever the auth token changes.
    useEffect(() => {
        if (googleAuthToken) {
            console.log('[useAppointments] Auth token is present, fetching events...');
            fetchAllEvents(googleAuthToken);
        }
    }, [googleAuthToken, fetchAllEvents]);

    // Filter and process events for display.
    useEffect(() => {
        const calendarColorMap = new Map(userCalendars.map(cal => [cal.id, cal.backgroundColor]));

        const processedEvents = allEvents.map(event => ({
            ...event,
            color: event.calendarId ? calendarColorMap.get(event.calendarId) : event.color,
        }));

        let effectiveVisibleIds = visibleCalendarIds;

        // On initial load, if calendars are loaded but no visibility is set, make all visible.
        if (userCalendars.length > 0 && visibleCalendarIds.size === 0) {
            const allCalendarIds = new Set(userCalendars.map(c => c.id));
            setVisibleCalendarIds(allCalendarIds);
            effectiveVisibleIds = allCalendarIds; // Use immediately for filtering.
        }

        const filteredEvents = processedEvents.filter(
            event => event.calendarId && effectiveVisibleIds.has(event.calendarId)
        );

        setEvents(filteredEvents);
    }, [allEvents, userCalendars, visibleCalendarIds]);

    const toggleCalendarVisibility = useCallback((calendarId: string) => {
        setVisibleCalendarIds(prevVisibleIds => {
            const newVisibleIds = new Set(prevVisibleIds);
            if (newVisibleIds.has(calendarId)) {
                newVisibleIds.delete(calendarId);
            } else {
                newVisibleIds.add(calendarId);
            }
            return newVisibleIds;
        });
    }, []);

    const syncWithGoogle = useCallback(() => {
        if (!isGoogleApiInitialized) {
            setError('La API de Google no está lista. Inténtalo de nuevo en unos segundos.');
            console.error('[useAppointments] Sync clicked before GAPI was initialized.');
            return;
        }

        const proceedToRequest = () => {
            requestAccessToken();
        };

        if (googleAuthToken?.access_token) {
            console.log('[useAppointments] Found existing token, revoking before requesting new one.');
            revokeGoogleToken(googleAuthToken.access_token, () => {
                console.log('[useAppointments] Old token revoked, now requesting new one.');
                setGoogleAuthToken(null);
                setAllEvents([]);
                setUserCalendars([]);
                proceedToRequest();
            });
        } else {
            console.log('[useAppointments] No existing token, requesting new one.');
            proceedToRequest();
        }
    }, [isGoogleApiInitialized, googleAuthToken]);

    const revokeGoogleAccess = useCallback(() => {
        if (googleAuthToken?.access_token) {
            revokeGoogleToken(googleAuthToken.access_token, () => {
                console.log('[useAppointments] Token revoked successfully.');
                setGoogleAuthToken(null);
                setAllEvents([]);
                setUserCalendars([]);
            });
        }
    }, [googleAuthToken]);

    const saveAppointment = useCallback(async (data: Omit<AppointmentEvent, 'title' | 'id'> & { id?: string | number }) => {
        const newTitle = `${data.patient} - ${data.procedure}`;
        try {
            const professionalCalendar = userCalendars.find(cal => cal.summary === data.professional);
            if (!professionalCalendar) {
                throw new Error(`Calendar for professional '${data.professional}' not found.`);
            }
            const eventToSave = { ...data, title: newTitle };
            await googleCalendarService.createEvent(professionalCalendar.id, eventToSave);
            await fetchAllEvents(googleAuthToken);
            return { success: true };
        } catch (error) {
            console.error('Failed to save appointment:', error);
            return { success: false };
        }
    }, [userCalendars, googleAuthToken, fetchAllEvents]);

    const deleteAppointment = useCallback(async (id: string | number) => {
        try {
            const eventToDelete = allEvents.find(e => e.id === id);
            if (!eventToDelete?.calendarId) {
                throw new Error('Event not found or has no calendar ID.');
            }
            await googleCalendarService.deleteEvent(eventToDelete.calendarId, eventToDelete.id as string);
            await fetchAllEvents(googleAuthToken);
            return { success: true };
        } catch (error) {
            console.error('Failed to delete appointment:', error);
            return { success: false };
        }
    }, [allEvents, googleAuthToken, fetchAllEvents]);

    const updateAppointmentDate = useCallback(async (eventId: string | number, newStartDate: Date, newEndDate: Date) => {
        if (typeof eventId !== 'string') {
            console.info('Local appointment date update not implemented.');
            return { success: false };
        }
        try {
            const eventToUpdate = allEvents.find(e => e.id === eventId);
            if (!eventToUpdate?.calendarId) {
                throw new Error('Event to update not found or has no calendar ID.');
            }
            await googleCalendarService.updateEventDateTime(eventToUpdate.calendarId, eventId, newStartDate, newEndDate);
            await fetchAllEvents(googleAuthToken);
            return { success: true };
        } catch (error) {
            console.error('Failed to update appointment date:', error);
            await fetchAllEvents(googleAuthToken); // Refetch to revert optimistic UI changes if any.
            return { success: false };
        }
    }, [allEvents, googleAuthToken, fetchAllEvents]);

    return {
        events,
        isLoading,
        error,
        saveAppointment,
        deleteAppointment,
        updateAppointmentDate,
        syncWithGoogle,
        isAuthenticatedWithGoogle: !!googleAuthToken,
        revokeGoogleAccess,
        userCalendars,
        visibleCalendarIds,
        toggleCalendarVisibility,
        refreshEvents: () => fetchAllEvents(googleAuthToken),
    };
};