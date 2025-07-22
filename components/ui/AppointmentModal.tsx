import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Trash2, X } from 'lucide-react';
import { AppointmentEvent } from '@/types';
import { Calendar as CalendarType } from '../../types/calendar';

interface AppointmentModalProps {
    modalState: {
        isOpen: boolean;
        event?: AppointmentEvent | null;
        date: Date | null;
    };
    onClose: () => void;
    onSave: (data: Omit<AppointmentEvent, 'title' | 'id'> & { id?: string | number }) => Promise<{ success: boolean }>;
    onDelete: (id: string | number, title: string) => void;
    calendars: CalendarType[];
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ modalState, onClose, onSave, onDelete, calendars }) => {
    const { isOpen, event, date } = modalState;
    const [patient, setPatient] = useState('');
    const [procedure, setProcedure] = useState('');
    const [professional, setProfessional] = useState('');
    const [eventDate, setEventDate] = useState(new Date());
    const [eventStartTime, setEventStartTime] = useState('09:00');
    const [eventEndTime, setEventEndTime] = useState('10:00');


    useEffect(() => {
        if (event) {
            setPatient(event.patient || '');
            setProcedure(event.procedure || '');
                        setProfessional(event.professional || '');
            setEventDate(new Date(event.start));
            setEventStartTime(new Date(event.start).toTimeString().substring(0, 5));
            setEventEndTime(new Date(event.end).toTimeString().substring(0, 5));
        } else if (date) {
            // Reset fields for new appointment
            setPatient('');
            setProcedure('');
            setProfessional(calendars[0]?.summary || '');
            
            // Set date and time
            setEventDate(new Date(date));
            const startTime = new Date(date).toTimeString().substring(0, 5);
            setEventStartTime(startTime);

            const endDate = new Date(date);
            endDate.setHours(endDate.getHours() + 1);
            const endTime = endDate.toTimeString().substring(0,5);
            setEventEndTime(endTime);
        }
    }, [event, date]);

        // Save the appointment
    const handleSave = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const [startHours, startMinutes] = eventStartTime.split(':');
        const start = new Date(eventDate);
        start.setHours(parseInt(startHours, 10), parseInt(startMinutes, 10), 0, 0);
        
        const [endHours, endMinutes] = eventEndTime.split(':');
        const end = new Date(eventDate);
        end.setHours(parseInt(endHours, 10), parseInt(endMinutes, 10), 0, 0);

        if (end <= start) {
            alert('La hora de finalización debe ser posterior a la hora de inicio.');
            return;
        }

                const eventData: Omit<AppointmentEvent, 'title' | 'id'> & { id?: string | number } = { 
            id: event?.id, // undefined for new event
            patient, 
            procedure, 
                        professional,
            start, 
            end, 
            whatsapp: event?.whatsapp || '',
            estado: event?.estado || 'confirmed'
        };
        const result = await onSave(eventData);
        if (result.success) {
            onClose(); // Cierra el modal si se guarda con éxito
        }
    }, [event?.id, patient, procedure, professional, eventDate, eventStartTime, eventEndTime, onSave]);
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-lg">
                <form onSubmit={handleSave}>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Calendar className="h-6 w-6 text-orange-500 mr-3" />
                                <h3 className="text-xl leading-6 font-bold text-slate-900 dark:text-slate-100">{event ? 'Editar Cita' : 'Añadir Nueva Cita'}</h3>
                            </div>
                            <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"><X className="h-5 w-5"/></button>
                        </div>
                        <div className="mt-6 space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Fecha</label>
                                <input 
                                    type="date" 
                                    value={eventDate.toISOString().split('T')[0]}
                                    onChange={(e) => setEventDate(new Date(e.target.value + 'T00:00:00'))}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="start-time" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Hora de Inicio</label>
                                    <input type="time" id="start-time" value={eventStartTime} onChange={(e) => setEventStartTime(e.target.value)} step="900" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" required />
                                </div>
                                 <div>
                                    <label htmlFor="end-time" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Hora de Finalización</label>
                                    <input type="time" id="end-time" value={eventEndTime} onChange={(e) => setEventEndTime(e.target.value)} step="900" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" required />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="patient" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre del Paciente/Cliente</label>
                                <input type="text" id="patient" value={patient} onChange={(e) => setPatient(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" required />
                            </div>
                            <div>
                                <label htmlFor="procedure" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Procedimiento/Motivo</label>
                                <input type="text" id="procedure" value={procedure} onChange={(e) => setProcedure(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" required />
                            </div>
                            <div>
                                <label htmlFor="professional" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Profesional/Responsable</label>
                                <select value={professional} onChange={(e) => setProfessional(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm">
                                    {calendars.map(cal => (
                                        <option key={cal.id} value={cal.summary}>{cal.summary}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 flex justify-between items-center">
                        <div>
                            {event && event.id && (
                                <button type="button" onClick={() => event.id && onDelete(event.id, event.title)} className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm font-medium rounded-md hover:bg-red-200 dark:hover:bg-red-500/20 transition-colors">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                </button>
                            )}
                        </div>
                        <div className="flex space-x-3">
                            <button type="button" onClick={onClose} className="inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-500 px-4 py-2 bg-white dark:bg-slate-600 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-500 transition-colors">Cancelar</button>
                            <button type="submit" className="inline-flex justify-center rounded-md border border-transparent px-4 py-2 bg-orange-600 text-sm font-medium text-white hover:bg-orange-700 transition-colors">Guardar Cita</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AppointmentModal;