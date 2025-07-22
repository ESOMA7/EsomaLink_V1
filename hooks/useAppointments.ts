
import { useState, useEffect, useCallback } from 'react';
import { AppointmentEvent } from '../types';
import {
    loadGoogleApiService,
    initializeGapiClient,
    initializeTokenClient,
    requestAccessToken,
    listUpcomingEvents,

    revokeGoogleToken
} from '../services/googleCalendarService';

export const useAppointments = () => {

    const [isGoogleApiInitialized, setIsGoogleApiInitialized] = useState(false);
    
    const [googleAuthToken, setGoogleAuthToken] = useState<any>(null);
    const [events, setEvents] = useState<AppointmentEvent[]>([]);
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
        const fetchEvents = async () => {
            if (googleAuthToken) {
                console.log('Auth token received, starting to fetch events...');
                setIsLoading(true);
                try {
                    console.log('Calling listUpcomingEvents...');
                    const googleEvents = await listUpcomingEvents('primary');
                    console.log('Received events from Google:', googleEvents);
                    setEvents(googleEvents);
                    setError(null);
                } catch (e) {
                    setError('Error al cargar los eventos de Google Calendar.');
                    console.error('Error in fetchEvents:', e);
                } finally {
                    console.log('Finished fetching events, setting loading to false.');
                    setIsLoading(false);
                }
            }
        };

        fetchEvents();
    }, [googleAuthToken]);

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

    const saveAppointment = useCallback(async (eventData: Omit<AppointmentEvent, 'title' | 'id'> & { id?: number }) => {
        setEvents(prevEvents => {
            if (eventData.id) {
                // Update existing event
                return prevEvents.map(event => 
                    event.id === eventData.id 
                    ? { ...event, ...eventData, title: `${eventData.procedure} - ${eventData.patient}` } 
                    : event
                );
            } else {
                // Create new event
                const newEvent: AppointmentEvent = {
                    id: Date.now(),
                    ...eventData,
                    title: `${eventData.procedure} - ${eventData.patient}`,
                };
                return [...prevEvents, newEvent];
            }
        });
        return { success: true };
    }, []);
    
    const deleteAppointment = useCallback(async (eventId: number) => {
        setEvents(prev => prev.filter(e => e.id !== eventId));
        return { success: true };
    }, []);
    
        const updateAppointmentDate = useCallback(async (eventId: number, newStartDate: Date, newEndDate: Date) => {
        setEvents(prevEvents => {
            return prevEvents.map(e => e.id === eventId ? { ...e, start: newStartDate, end: newEndDate } : e);
        });
    }, []);

                return { events, isLoading, error, saveAppointment, deleteAppointment, updateAppointmentDate, syncWithGoogle, isAuthenticatedWithGoogle: !!googleAuthToken, revokeGoogleAccess };
};