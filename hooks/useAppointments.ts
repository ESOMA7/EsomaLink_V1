import { useState, useEffect, useCallback } from 'react';
import { AppointmentEvent, UserCalendar } from '@/types';
import * as googleCalendarService from '../services/googleCalendarService';
import { useAuth } from './useAuth';

// --- CACHÉ EN MEMORIA PARA SOLUCIONAR PANTALLAS BLANCAS ---
const calendarsCache = { data: null as UserCalendar[] | null, timestamp: 0 };
const eventsCache = new Map<string, { events: AppointmentEvent[], timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutos

export const useAppointments = (currentDate: Date, currentView: 'month' | 'week' | 'day', selectedCalendarIds?: string[]) => {
    const { session } = useAuth();
    const [events, setEvents] = useState<AppointmentEvent[]>([]);
    const [calendars, setCalendars] = useState<UserCalendar[]>([]);
    // Si tenemos datos en caché para esta vista, empezamos con isLoading = false para pintar instantáneamente.
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGoogleCalendarEvents = useCallback(async () => {
        if (!session?.user) return; 

        // Generamos una llave única para el caché basada en la fecha y la vista actual
        const cacheKey = `${currentDate.toISOString().substring(0, 10)}_${currentView}`;
        const cachedEventsData = eventsCache.get(cacheKey);
        
        // Estrategia Stale-While-Revalidate (Caché Primero)
        const isCacheValid = cachedEventsData && (Date.now() - cachedEventsData.timestamp < CACHE_TTL_MS);
        
        if (isCacheValid) {
            setEvents(cachedEventsData.events);
            if (calendarsCache.data) setCalendars(calendarsCache.data);
            setIsLoading(false); // Carga y dibujo instantáneo en el DOM
        } else {
            setIsLoading(true); // Solo ponemos estado de carga la primera vez que se visita o si expiró
        }

        setError(null);

        let timeMin: Date, timeMax: Date;

        if (currentView === 'month') {
            timeMin = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            timeMax = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
        } else if (currentView === 'week') {
            const weekStartDate = new Date(currentDate);
            weekStartDate.setDate(currentDate.getDate() - currentDate.getDay());
            weekStartDate.setHours(0, 0, 0, 0);
            
            const weekEndDate = new Date(weekStartDate);
            weekEndDate.setDate(weekStartDate.getDate() + 6);
            weekEndDate.setHours(23, 59, 59, 999);

            timeMin = weekStartDate;
            timeMax = weekEndDate;
        } else { // day
            const dayStartDate = new Date(currentDate);
            dayStartDate.setHours(0, 0, 0, 0);

            const dayEndDate = new Date(currentDate);
            dayEndDate.setHours(23, 59, 59, 999);

            timeMin = dayStartDate;
            timeMax = dayEndDate;
        }

        try {
            await googleCalendarService.initializeGapiClient('obsoleto');
            
            let userCalendars = calendarsCache.data;
            if (!userCalendars || Date.now() - calendarsCache.timestamp >= CACHE_TTL_MS) {
                 userCalendars = await googleCalendarService.listUserCalendars();
                 
                 if (userCalendars) {
                     userCalendars = userCalendars.map((calendar: UserCalendar) => {
                         if (calendar.summary === 'CALENDARIO JOSE') {
                             return { ...calendar, backgroundColor: '#4285F4' }; 
                         }
                         return calendar;
                     });
                     calendarsCache.data = userCalendars;
                     calendarsCache.timestamp = Date.now();
                 }
            }
            
            setCalendars(userCalendars || []);

            if (userCalendars && userCalendars.length > 0) {
                const calendarsToFetch = (selectedCalendarIds && selectedCalendarIds.length > 0)
                    ? userCalendars.filter((c: UserCalendar) => selectedCalendarIds.includes(c.id))
                    : userCalendars;

                if (calendarsToFetch.length > 0) {
                    const allEventsPromises = calendarsToFetch.map((calendar: UserCalendar) => 
                        googleCalendarService.listUpcomingEvents(
                            calendar.id, 
                            calendar.backgroundColor,
                            timeMin.toISOString(),
                            timeMax.toISOString()
                        )
                    );
                    const eventsArrays = await Promise.all(allEventsPromises);
                    const combinedEvents = eventsArrays.flat();
                    
                    const uniqueEventsMap = new Map<string, AppointmentEvent>();
                    combinedEvents.forEach(event => {
                        if (event.id) {
                            uniqueEventsMap.set(event.id.toString(), event);
                        }
                    });
                    const uniqueEvents = Array.from(uniqueEventsMap.values());
                    
                    setEvents(uniqueEvents);
                    
                    // Actualizar Caché de Eventos
                    eventsCache.set(cacheKey, { events: uniqueEvents, timestamp: Date.now() });
                } else {
                    setEvents([]);
                }
            } else {
                setEvents([]);
            }
        } catch (err: any) {
            console.error('Error fetching Google Calendar events:', err);
            // Solo mostramos error si no había nada en caché
            if (!isCacheValid) {
                setError('Failed to fetch calendar events. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [session, currentDate, currentView, selectedCalendarIds]);

    useEffect(() => {
        console.log('useEffect triggered, calling fetchGoogleCalendarEvents');
        fetchGoogleCalendarEvents();
    }, [fetchGoogleCalendarEvents]);

    const refreshEvents = useCallback(() => {
        console.log('refreshEvents triggered, calling fetchGoogleCalendarEvents');
        fetchGoogleCalendarEvents();
    }, [fetchGoogleCalendarEvents]);

    const createAppointment = useCallback(async (appointmentData: Omit<AppointmentEvent, 'id' | 'title'>) => {
        try {
            const calendar = calendars.find(c => c.summary === appointmentData.professional);
            if (!calendar) {
                throw new Error('No se pudo encontrar el calendario para el profesional seleccionado.');
            }

            const newEvent = await googleCalendarService.createEvent(calendar.id, appointmentData);
            setEvents(prevEvents => [...prevEvents, { ...newEvent, calendarId: calendar.id }]);
            return { success: true };
        } catch (err: any) {
            console.error('Error creating event:', err);
            setError('Failed to create event. Please try again.');
            return { success: false, error: err.message };
        }
    }, [calendars]);

    const deleteAppointment = useCallback(async (eventId: string) => {
        try {
            const eventToDelete = events.find(event => event.id === eventId);
            if (!eventToDelete || !eventToDelete.calendarId) {
                throw new Error('No se pudo encontrar el evento o el ID del calendario.');
            }

            await googleCalendarService.deleteEvent(eventToDelete.calendarId, eventId);
            setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
            return { success: true };
        } catch (err: any) {
            console.error('Error deleting event:', err);
            setError('Failed to delete event. Please try again.');
            return { success: false, error: err.message };
        }
    }, [events]);

    const updateAppointment = useCallback(async (appointmentData: AppointmentEvent) => {
        try {
            const calendar = calendars.find(c => c.summary === appointmentData.professional);
            if (!calendar) {
                throw new Error('No se pudo encontrar el calendario para el profesional seleccionado.');
            }

            if (!appointmentData.id) {
                throw new Error('El ID del evento es indefinido.');
            }

            const updatedEvent = await googleCalendarService.updateEvent(calendar.id, appointmentData.id.toString(), appointmentData);
            setEvents(prevEvents => prevEvents.map(event => event.id === updatedEvent.id ? { ...updatedEvent, calendarId: calendar.id } : event));
            return { success: true };
        } catch (err: any) {
            console.error('Error updating event:', err);
            setError('Failed to update event. Please try again.');
            return { success: false, error: err.message };
        }
    }, [calendars]);

    return {
        events,
        isLoading,
        error,
        calendars,
        refreshEvents,
        createAppointment,
        deleteAppointment,
        updateAppointment
    };
};