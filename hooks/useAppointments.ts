import { useState, useEffect, useCallback } from 'react';
import { AppointmentEvent, Calendar } from '@/types';
import * as googleCalendarService from '../services/googleCalendarService';
import { useAuth } from './useAuth';

export const useAppointments = (currentDate: Date, currentView: 'month' | 'week' | 'day', selectedCalendarIds?: string[]) => {
    const { session } = useAuth();
    const [events, setEvents] = useState<AppointmentEvent[]>([]);
    const [calendars, setCalendars] = useState<Calendar[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGoogleCalendarEvents = useCallback(async () => {
        const accessToken = session?.provider_token;
        if (!accessToken) return;

        console.log(`Fetching events for date: ${currentDate.toISOString()} and view: ${currentView}`);
        setIsLoading(true);
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
            await googleCalendarService.initializeGapiClient(accessToken);
            
            let userCalendars = await googleCalendarService.listUserCalendars();
            
            if (userCalendars) {
                userCalendars = userCalendars.map(calendar => {
                    if (calendar.summary === 'CALENDARIO JOSE') {
                        return { ...calendar, backgroundColor: '#4285F4' }; // Blue color from Google Calendar
                    }
                    return calendar;
                });
            }

            setCalendars(userCalendars || []);

            if (userCalendars && userCalendars.length > 0) {
                const calendarsToFetch = (selectedCalendarIds && selectedCalendarIds.length > 0)
                    ? userCalendars.filter(c => selectedCalendarIds.includes(c.id))
                    : userCalendars;

                if (calendarsToFetch.length > 0) {
                    const allEventsPromises = calendarsToFetch.map(calendar => 
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
                } else {
                    setEvents([]);
                }
            } else {
                setEvents([]);
            }
        } catch (err: any) {
            console.error('Error fetching Google Calendar events:', err);
            setError('Failed to fetch calendar events. Please try again.');
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