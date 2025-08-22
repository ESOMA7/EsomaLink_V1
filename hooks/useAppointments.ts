import { useState, useEffect, useCallback } from 'react';
import { AppointmentEvent, Calendar } from '@/types';
import * as googleCalendarService from '../services/googleCalendarService';
import { useAuth } from './useAuth'; // Import useAuth to get the token

export const useAppointments = () => {
    const { session } = useAuth(); // Use the session from useAuth
    const [events, setEvents] = useState<AppointmentEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGoogleCalendarEvents = useCallback(async (accessToken: string) => {
        setIsLoading(true);
        setError(null);
        try {
            // Initialize the gapi client with the access token
            await googleCalendarService.initializeGapiClient(accessToken);
            
            const calendars = await googleCalendarService.listUserCalendars();
            if (calendars && calendars.length > 0) {
                const allEventsPromises = calendars.map(calendar => 
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
        refreshEvents: () => {
            if (session?.provider_token) {
                fetchGoogleCalendarEvents(session.provider_token);
            }
        }
    };
};