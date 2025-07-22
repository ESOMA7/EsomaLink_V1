import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, RefreshCw } from 'lucide-react';
import { useAppointments } from '@/hooks';
import { AppointmentEvent } from '../../types';
import MonthView from '../calendar/MonthView';
import CalendarList from '../calendar/CalendarList';
import { CalendarViewSkeleton } from '../ui/LoadingSkeletons';
import { ErrorMessage } from '../ui/ErrorMessage';
import AppointmentModal from '../ui/AppointmentModal';
import ConfirmationModal from '../ui/ConfirmationModal';
import { toast } from 'react-hot-toast';

const CalendarView: React.FC = () => {
    const {
        events,
        isLoading,
        error,
        saveAppointment,
        deleteAppointment,
        updateAppointmentDate,
        syncWithGoogle,
        isAuthenticatedWithGoogle,
        userCalendars,
        visibleCalendarIds,
        toggleCalendarVisibility
    } = useAppointments();

    const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 2));
    const [appointmentModalState, setAppointmentModalState] = useState<{ isOpen: boolean; event: AppointmentEvent | null; date: Date | null; }>({ isOpen: false, event: null, date: null });
    const [confirmationModalState, setConfirmationModalState] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: (() => void) | null }>({ isOpen: false, title: '', message: '', onConfirm: null });

    const changeDate = (amount: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        });
    };

    const getHeaderText = () => {
        return currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
    };

    const handleSlotClick = (date: Date) => {
        setAppointmentModalState({ isOpen: true, event: null, date });
    };

    const handleEventClick = (event: any) => {
        setAppointmentModalState({ isOpen: true, event, date: event.start });
    };

    const handleSaveAppointment = async (data: Omit<AppointmentEvent, 'title'> & { id?: string | number }) => {
        await saveAppointment(data);
        setAppointmentModalState({ isOpen: false, event: null, date: null });
        toast.success('Cita guardada con éxito.');
    };

    const handleDeleteAppointment = (id: string | number, title: string) => {
        if (typeof id !== 'number') {
            toast.error('No se pueden eliminar citas de Google Calendar desde aquí.');
            return;
        }
        setConfirmationModalState({
            isOpen: true,
            title: `Eliminar Cita: ${title}`,
            message: '¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.',
            onConfirm: async () => {
                try {
                    await deleteAppointment(id);
                    toast.success('Cita eliminada con éxito.');
                } catch (error) {
                    toast.error('Error al eliminar la cita.');
                }
                setConfirmationModalState({ isOpen: false, title: '', message: '', onConfirm: null });
            }
        });
    };

    return (
        <div className="flex h-full">
            <CalendarList calendars={userCalendars} visibleCalendars={visibleCalendarIds} onToggleCalendar={toggleCalendarVisibility} />
            <div className="flex flex-col flex-grow">
                <header className="flex flex-wrap justify-between items-center mb-6 flex-shrink-0 gap-4 p-6 pb-0">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Calendario de Citas</h2>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        {isAuthenticatedWithGoogle ? (
                            <div className="flex items-center space-x-2 text-green-600">
                                <CheckCircle size={20} />
                                <span>Sincronizado</span>
                            </div>
                        ) : (
                            <button onClick={syncWithGoogle} disabled={isLoading} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 space-x-2">
                                {isLoading && <RefreshCw className="animate-spin" size={16} />}
                                <span>Sincronizar con Google</span>
                            </button>
                        )}
                        <button onClick={() => setCurrentDate(new Date(2025, 6, 2))} className="px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">Hoy</button>
                        <div className="flex items-center">
                            <button onClick={() => changeDate(-1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><ChevronLeft className="h-5 w-5" /></button>
                            <span className="text-lg font-semibold whitespace-nowrap text-center text-slate-700 dark:text-slate-300 px-2 w-auto min-w-[200px]">
                               {getHeaderText()}
                            </span>
                            <button onClick={() => changeDate(1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><ChevronRight className="h-5 w-5" /></button>
                        </div>
                    </div>
                </header>
                <main className="flex-grow bg-white dark:bg-slate-800 p-1 sm:p-4 rounded-lg shadow-md overflow-hidden m-6 mt-0">
                    {isLoading && events.length === 0 ? (
                        <CalendarViewSkeleton />
                    ) : error ? (
                        <ErrorMessage message={error} />
                    ) : (
                        <MonthView currentDate={currentDate} events={events} onDayClick={handleSlotClick} onEventClick={handleEventClick} onUpdateAppointmentDate={updateAppointmentDate} />
                    )}
                </main>
            </div>
            <AppointmentModal 
                modalState={appointmentModalState} 
                onClose={() => setAppointmentModalState({ isOpen: false, event: null, date: null })} 
                onSave={handleSaveAppointment} 
                onDelete={handleDeleteAppointment} 
                calendars={userCalendars}
            />
            <ConfirmationModal modalState={confirmationModalState} setModalState={setConfirmationModalState} />
        </div>
    );
};

export default CalendarView;
