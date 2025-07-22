
import { useState, useEffect, useCallback } from 'react';
import { AppointmentEvent } from '../types';
import {
    loadGoogleApiService,
    initializeGapiClient,
    initializeTokenClient,
    requestAccessToken,
    listUpcomingEvents
} from '../services/googleCalendarService';

export const useAppointments = () => {

    const [isTokenClientReady, setIsTokenClientReady] = useState(false);
    const [googleAuthToken, setGoogleAuthToken] = useState<any>(null);
    const [events, setEvents] = useState<AppointmentEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const initGapiAndTokenClient = async () => {
            try {
                await initializeGapiClient();
                initializeTokenClient((tokenResponse) => {
                    if (tokenResponse.error) {
                        setError('Error de autenticación con Google.');
                        console.error('Token Error:', tokenResponse.error);
                        return;
                    }
                    setGoogleAuthToken(tokenResponse);
                });
                setIsTokenClientReady(true); // Token client is ready
            } catch (error) {
                setError('No se pudo inicializar la API de Google.');
                console.error('Initialization error:', error);
            }
        };

        // Load the GAPI script. The service will call back into initGapiAndTokenClient
        // once the script is fully loaded and ready.
        loadGoogleApiService(() => {
            // gapi is loaded, now load the client
            window.gapi.load('client', initGapiAndTokenClient);
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

    const syncWithGoogle = useCallback(() => {
        if (isTokenClientReady) {
            requestAccessToken();
        } else {
            setError("El servicio de Google no está listo. Inténtalo de nuevo en unos segundos.");
            console.error("syncWithGoogle called before token client was ready.");
        }
    }, [isTokenClientReady]);

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

    return { events, isLoading, error, saveAppointment, deleteAppointment, updateAppointmentDate, syncWithGoogle, isReadyToSync: isTokenClientReady, isAuthenticatedWithGoogle: !!googleAuthToken };
};