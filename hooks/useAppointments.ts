import { useState, useEffect, useCallback } from 'react';
import { AppointmentEvent } from '@/types';
import { Calendar } from '@/types/calendar';
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

    useEffect(() => {
        const fetchAllEvents = async () => {
            if (googleAuthToken) {
                console.log('Auth token received, starting to fetch events from all calendars...');
                setIsLoading(true);
                try {
                                        const calendars: Calendar[] = await listUserCalendars();
                    if (!calendars || calendars.length === 0) {
                        console.log('No user calendars found.');
                        setEvents([]);
                        return;
                    }

                    console.log(`Found ${calendars.length} calendars. Fetching events for each...`);

                                        const allEventPromises = calendars.map(calendar => 
                        listUpcomingEvents(calendar.id, calendar.backgroundColor)
                    );

                                        console.log('Setting user calendars in state:', calendars);
                                        if (JSON.stringify(calendars) !== JSON.stringify(userCalendars)) {
                        console.log('User calendars have changed, updating state.');
                        setUserCalendars(calendars);
                    }

                    const eventArrays = await Promise.all(allEventPromises);
                    const fetchedEvents = eventArrays.flat(); // Combine all event arrays into one

                    console.log(`Received a total of ${fetchedEvents.length} events from all calendars.`);
                    setAllEvents(fetchedEvents);
                    // By default, make all calendars visible
                    setVisibleCalendarIds(new Set(calendars.map(c => c.id)));
                    setError(null);
                } catch (e) {
                    setError('Error al cargar los eventos de Google Calendar.');
                    console.error('Error in fetchAllEvents:', e);
                } finally {
                    console.log('Finished fetching all events, setting loading to false.');
                    setIsLoading(false);
                }
            }
        };

        fetchAllEvents();
    }, [googleAuthToken]);

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

    const saveAppointment = useCallback(async (data: Omit<AppointmentEvent, 'title'> & { id?: string | number }) => {
        if (data.id) {
            // Update existing event
            // ... (existing update logic)
        } else {
            // Create new event
            const professionalCalendar = userCalendars.find(cal => cal.summary === data.professional);

            if (professionalCalendar) {
                try {
                    const newGoogleEvent = await googleCalendarService.createEvent(professionalCalendar.id, data);
                    const newEvent: AppointmentEvent = {
                        ...data,
                        id: newGoogleEvent.id!,
                        title: newGoogleEvent.summary!,
                        calendarId: professionalCalendar.id,
                        color: professionalCalendar.backgroundColor,
                    };
                    setAllEvents(prev => [...prev, newEvent]);
                } catch (error) {
                    console.error('Failed to create Google Calendar event:', error);
                    // Handle error, maybe show a toast notification
                }
            } else {
                // Fallback for local-only event creation
                const newEvent: AppointmentEvent = {
                    ...data,
                    id: Date.now(), // Mock ID for local events
                    title: `${data.patient} - ${data.procedure}`
                };
                setAllEvents(prev => [...prev, newEvent]);
            }
        }
        return { success: true };
    }, []);

    const deleteAppointment = useCallback(async (id: string | number) => {
        setEvents(prev => prev.filter(e => e.id !== id));
        return { success: true };
    }, []);

    const updateAppointmentDate = async (eventId: string | number, newStartDate: Date, newEndDate: Date) => {
        setEvents(prevEvents => {
            return prevEvents.map(e => e.id === eventId ? { ...e, start: newStartDate, end: newEndDate } : e);
        });

        if (typeof eventId === 'string') {
            // It's a Google Calendar event
            try {
                const event = allEvents.find(e => e.id === eventId);
                if (event && event.calendarId) {
                    await googleCalendarService.updateEventDateTime(event.calendarId, eventId as string, newStartDate, newEndDate);
                    toast.success('Cita de Google actualizada.');
                } else {
                    throw new Error('No se pudo encontrar el evento o su calendario.');
                }
            } catch (error) {
                console.error('Failed to update Google Calendar event:', error);
                toast.error('No se pudo actualizar la cita en Google Calendar.');
                // TODO: Rollback optimistic update
            }
        } else {
            // It's a local DB event - this logic needs to be implemented if you have a local backend
            toast.info('La actualización de citas locales aún no está implementada.');
        }
    };

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
        toggleCalendarVisibility 
    };
};