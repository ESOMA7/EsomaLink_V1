
import { useState, useEffect, useCallback } from 'react';
import { AppointmentEvent } from '../types';
import { initialEvents } from '../constants';

export const useAppointments = () => {
    const [events, setEvents] = useState<AppointmentEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        // Simulate fetching data
        setIsLoading(true);
        setTimeout(() => {
            try {
                // Parse dates since they might not be Date objects if stored/retrieved
                const parsedEvents = initialEvents.map(event => ({
                    ...event,
                    start: new Date(event.start),
                    end: new Date(event.end)
                }));
                setEvents(parsedEvents);
                setError(null);
            } catch (e) {
                setError("Error al cargar los datos de las citas.");
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }, 1000); // Simulate network delay
    }, []);

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

    return { events, isLoading, error, saveAppointment, deleteAppointment, updateAppointmentDate };
};