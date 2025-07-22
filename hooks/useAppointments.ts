import { useState, useEffect, useCallback } from 'react';
import { Calendar } from '@/types/calendar';
import { AppointmentEvent } from '@/types';
import * as googleCalendarService from '../services/googleCalendarService';

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

export const useAppointments = () => {

    const [isGoogleApiInitialized, setIsGoogleApiInitialized] = useState(false);
    
    const [googleAuthToken, setGoogleAuthToken] = useState<any>(null);
    const [allEvents, setAllEvents] = useState<AppointmentEvent[]>([]);
    const [events, setEvents] = useState<AppointmentEvent[]>([]); // Filtered events
    const [userCalendars, setUserCalendars] = useState<Calendar[]>([]);
    const [visibleCalendarIds, setVisibleCalendarIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false); // Default to false
    const [error, setError] = useState<string | null>(null);

    const initializeGoogleSync = useCallback(() => {
        return new Promise<void>((resolve, reject) => {
            const initGapiAndTokenClient = async () => {
                try {
                    console.log('[useAppointments] Attempting to initialize GAPI client...');
                    await initializeGapiClient();
                    console.log('[useAppointments] GAPI client initialized. Attempting to initialize token client...');
                    
                    initializeTokenClient((tokenResponse) => {
                        if (tokenResponse.error) {
                            setError('Error de autenticación con Google. Por favor, intenta sincronizar de nuevo.');
                            console.error('[useAppointments] Token Error:', tokenResponse.error);
                            setGoogleAuthToken(null);
                            setIsLoading(false);
                            return;
                        }
                        console.log('[useAppointments] Google token response received.');
                        setGoogleAuthToken(tokenResponse);
                    });
                    
                    console.log('[useAppointments] Token client initialization process called. Setting token client ready.');
                    
                    resolve();

                } catch (error) {
                    setError('No se pudo inicializar la API de Google.');
                    console.error('[useAppointments] Initialization error:', error);
                    
                    reject(error);
                }
            };

            console.log('[useAppointments] Loading Google API Service on demand...');
            loadGoogleApiService(() => {
                console.log('[useAppointments] Google API Service loaded, now initializing clients.');
                initGapiAndTokenClient();
            });
        });
    }, []);

    const fetchAllEvents = useCallback(async () => {
        if (googleAuthToken) {
            console.log('Auth token received, starting to fetch events from all calendars...');
            setIsLoading(true);
            try {
                const calendars: Calendar[] = await listUserCalendars();
                if (!calendars || calendars.length === 0) {
                    console.log('No user calendars found.');
                    setEvents([]);
                    setAllEvents([]);
                    setUserCalendars([]);
                    return; // Exit if no calendars
                }

                console.log(`Found ${calendars.length} calendars. Fetching events for each...`);
                setUserCalendars(calendars);

                const allEventPromises = calendars.map(calendar => 
                    listUpcomingEvents(calendar.id, calendar.backgroundColor)
                );

                const allEventsArrays = await Promise.all(allEventPromises);
                const flattenedEvents = allEventsArrays.flat();

                console.log(`Fetched a total of ${flattenedEvents.length} events.`);
                setAllEvents(flattenedEvents);
                setEvents(flattenedEvents);

                // Only set visible calendars on the first load, not on every refresh
                if (visibleCalendarIds.size === 0) {
                    const initialVisibleIds = new Set(calendars.map(c => c.id));
                    setVisibleCalendarIds(initialVisibleIds);
                }

            } catch (err) {
                console.error('Error fetching events:', err);
                setError('Failed to fetch events from Google Calendar.');
            } finally {
                setIsLoading(false);
                console.log('Finished fetching events.');
            }
        }
    }, [googleAuthToken, visibleCalendarIds.size]);

    useEffect(() => {
        fetchAllEvents();
    }, [fetchAllEvents]);

    useEffect(() => {
        const filtered = allEvents.filter(event => {
            const calendarId = event.id.toString().split('#')[0];
            return visibleCalendarIds.has(calendarId);
        });
        setEvents(filtered);
    }, [allEvents, visibleCalendarIds]);

    const toggleCalendarVisibility = useCallback((calendarId: string) => {
        setVisibleCalendarIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(calendarId)) {
                newSet.delete(calendarId);
            } else {
                newSet.add(calendarId);
            }
            return newSet;
        });
    }, []);

    const revokeGoogleAccess = useCallback(() => {
        if (googleAuthToken && googleAuthToken.access_token) {
            console.log('[useAppointments] Revoking existing Google token...');
            revokeGoogleToken(googleAuthToken.access_token, () => {
                console.log('[useAppointments] Google token revoked successfully.');
                setGoogleAuthToken(null);
            });
        } else {
            console.log('[useAppointments] No Google token to revoke.');
        }
    }, [googleAuthToken]);

    const syncWithGoogle = useCallback(async () => {
        setIsLoading(true);
        console.log('[useAppointments] Starting Google Sync process...');

        const proceedToRequest = () => {
            requestAccessToken();
        };

        const performSync = () => {
            if (googleAuthToken && googleAuthToken.access_token) {
                console.log('[useAppointments] Found existing token, revoking before requesting new one.');
                revokeGoogleToken(googleAuthToken.access_token, () => {
                    console.log('[useAppointments] Old token revoked, now requesting new token.');
                    setGoogleAuthToken(null);
                    proceedToRequest();
                });
            } else {
                console.log('[useAppointments] No existing token, requesting new one.');
                proceedToRequest();
            }
        };

        if (!isGoogleApiInitialized) {
            console.log('[useAppointments] First sync. Initializing Google services...');
            try {
                await initializeGoogleSync();
                setIsGoogleApiInitialized(true);
                console.log('[useAppointments] Google services initialized. Now performing sync...');
                performSync();
            } catch (error) {
                console.error('Failed to initialize Google services on demand:', error);
                setError('Error al inicializar los servicios de Google. Inténtalo de nuevo.');
                setIsLoading(false);
            }
        } else {
            console.log('[useAppointments] Google services already initialized. Proceeding with sync.');
            performSync();
        }
    }, [isGoogleApiInitialized, googleAuthToken, initializeGoogleSync]);

    const saveAppointment = useCallback(async (data: Omit<AppointmentEvent, 'title' | 'id'> & { id?: string | number }) => {
        const newTitle = `${data.patient} - ${data.procedure}`;

        try {
            if (data.id) {
                console.log('Updating event (not implemented):', data.id);
                return { success: true };
            } else {
                const professionalCalendar = userCalendars.find(cal => cal.summary === data.professional);
                if (!professionalCalendar) {
                    console.error(`Calendar for professional '${data.professional}' not found.`);
                    return { success: false };
                }

                const eventToSave = { ...data, title: newTitle };
                await googleCalendarService.createEvent(professionalCalendar.id, eventToSave);
                
                // After successful creation, refetch all events to ensure UI is in sync.
                await fetchAllEvents();

                return { success: true };
            }
        } catch (error) {
            console.error('Failed to save appointment:', error);
            return { success: false };
        }
    }, [userCalendars, fetchAllEvents]);

    const deleteAppointment = useCallback(async (id: string | number) => {
        try {
            const eventToDelete = allEvents.find(e => e.id === id);
            if (!eventToDelete || !eventToDelete.calendarId) {
                console.error('Event not found or has no calendar ID, cannot delete from Google.');
                // If it's a local-only event, just filter it out
                setAllEvents(prev => prev.filter(e => e.id !== id));
                setEvents(prev => prev.filter(e => e.id !== id));
                return { success: true };
            }

            await googleCalendarService.deleteEvent(eventToDelete.calendarId, eventToDelete.id as string);
            
            // After successful deletion, refetch all events.
            await fetchAllEvents();

            return { success: true };
        } catch (error) {
            console.error('Failed to delete appointment:', error);
            return { success: false };
        }
    }, [allEvents, fetchAllEvents]);

    const updateAppointmentDate = useCallback(async (eventId: string | number, newStartDate: Date, newEndDate: Date) => {
        if (typeof eventId !== 'string') {
            toast.info('La actualización de citas locales aún no está implementada.');
            return { success: false };
        }

        try {
            const eventToUpdate = allEvents.find(e => e.id === eventId);
            if (!eventToUpdate || !eventToUpdate.calendarId) {
                throw new Error('No se pudo encontrar el evento o su calendario para actualizar.');
            }

            await googleCalendarService.updateEventDateTime(eventToUpdate.calendarId, eventId, newStartDate, newEndDate);
            
            // After successful update, refetch all events to ensure UI is in sync.
            await fetchAllEvents();

            toast.success('La fecha de la cita ha sido actualizada.');
            return { success: true };

        } catch (error) {
            console.error('Failed to update appointment date:', error);
            toast.error('No se pudo actualizar la cita en Google Calendar.');
            // No rollback needed as we are not doing optimistic updates anymore.
            // We just refetch to get the real state.
            await fetchAllEvents();
            return { success: false };
        }
    }, [allEvents, fetchAllEvents]);

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
        refreshEvents: fetchAllEvents // Expose the refresh function
    };
};