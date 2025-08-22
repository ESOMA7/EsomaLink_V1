import { useState, useEffect, useCallback } from 'react';
import { AppointmentEvent, Calendar } from '@/types';
import * as googleCalendarService from '../services/googleCalendarService';
import { useAuth } from './useAuth'; // Import useAuth to get the token

export const useAppointments = () => {
    const { session } = useAuth(); // Use the session from useAuth
    const [events, setEvents] = useState<AppointmentEvent[]>([]);
    const [calendars, setCalendars] = useState<Calendar[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGoogleCalendarEvents = useCallback(async (accessToken: string) => {
        setIsLoading(true);
        setError(null);
        try {
            // Initialize the gapi client with the access token
            await googleCalendarService.initializeGapiClient(accessToken);
            
            const userCalendars = await googleCalendarService.listUserCalendars();
            setCalendars(userCalendars || []);

            if (userCalendars && userCalendars.length > 0) {
                const allEventsPromises = userCalendars.map(calendar => 
                    googleCalendarService.listUpcomingEvents(calendar.id, calendar.backgroundColor)
                );
                const eventsArrays = await Promise.all(allEventsPromises);
                const combinedEvents = eventsArrays.flat();
                setEvents(combinedEvents);
            } else {
                setEvents([]);
            }
        } catch (err: any) {
            console.error('Error fetching Google Calendar events:', err);
            setError('Failed to fetch calendar events. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const accessToken = session?.provider_token;
        if (accessToken) {
            fetchGoogleCalendarEvents(accessToken);
        }
    }, [session, fetchGoogleCalendarEvents]);

    return {
        events,
        isLoading,
        error,
        calendars,
        refreshEvents: () => {
            if (session?.provider_token) {
                fetchGoogleCalendarEvents(session.provider_token);
            }
        },
        createAppointment: async (appointmentData: Omit<AppointmentEvent, 'id' | 'title'>) => {
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
        },
        deleteAppointment: async (eventId: string) => {
            try {
                // Encontrar el evento y su calendarId
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
        }
    };
};