
import { useState, useEffect, useCallback } from 'react';
import { AppointmentEvent } from '../types';
import { initialEvents } from '../constants';

export const useAppointments = () => {
    const [events, setEvents] = useState<AppointmentEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 800));
                setEvents(initialEvents);
            } catch (err) {
                setError("No se pudieron cargar las citas.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const saveAppointment = useCallback(async (eventData: Omit<AppointmentEvent, 'title'>) => {
        // In a real app, this would be an API call to Supabase
        await new Promise(resolve => setTimeout(resolve, 300));
        if (eventData.id) { // Update
            setEvents(prev => prev.map(e => e.id === eventData.id ? { ...e, ...eventData, title: `${eventData.procedure} - ${eventData.patient}` } : e));
        } else { // Create
            const newEvent: AppointmentEvent = { ...eventData, id: Date.now(), title: `${eventData.procedure} - ${eventData.patient}` };
            setEvents(prev => [...prev, newEvent]);
        }
        return { success: true };
    }, []);
    
    const deleteAppointment = useCallback(async (eventId: number) => {
        // In a real app, this would be an API call to Supabase
        await new Promise(resolve => setTimeout(resolve, 300));
        setEvents(prev => prev.filter(e => e.id !== eventId));
        return { success: true };
    }, []);
    
    const updateAppointmentDate = useCallback(async (eventId: number, newStartDate: Date) => {
        // In a real app, this would be an API call to Supabase
        await new Promise(resolve => setTimeout(resolve, 100));
        setEvents(prevEvents => {
            const eventToUpdate = prevEvents.find(e => e.id === eventId);
            if (!eventToUpdate) return prevEvents;

            const duration = eventToUpdate.end.getTime() - eventToUpdate.start.getTime();
            const newEndDate = new Date(newStartDate.getTime() + duration);

            return prevEvents.map(e => 
                e.id === eventId 
                    ? { ...e, start: newStartDate, end: newEndDate } 
                    : e
            );
        });
    }, []);

    return { events, isLoading, error, saveAppointment, deleteAppointment, updateAppointmentDate };
};
