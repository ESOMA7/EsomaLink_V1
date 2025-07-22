import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AppointmentEvent } from '../../types';
import MonthView from '../calendar/MonthView';
import { CalendarViewSkeleton } from '../ui/LoadingSkeletons';
import { ErrorMessage } from '../ui/ErrorMessage';

export interface CalendarViewProps {
    events: AppointmentEvent[];
    onSlotClick: (date: Date) => void;
    onEventClick: (event: AppointmentEvent) => void;
    onUpdateAppointmentDate: (eventId: string | number, newStartDate: Date, newEndDate: Date) => Promise<void>;
    isLoading: boolean;
    error: string | null;
    onSyncWithGoogle: () => void;
    isAuthenticatedWithGoogle: boolean;
}

import { CheckCircle, RefreshCw } from 'lucide-react';

const CalendarView: React.FC<CalendarViewProps> = ({ events, onSlotClick, onEventClick, onUpdateAppointmentDate, isLoading, error, onSyncWithGoogle, isAuthenticatedWithGoogle }) => {
    const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 2));

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

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Calendario</h1>
                <div>
                    {isAuthenticatedWithGoogle ? (
                        <div className="flex items-center space-x-2 text-green-600">
                            <CheckCircle size={20} />
                            <span>Sincronizado con Google</span>
                        </div>
                    ) : (
                        <button onClick={onSyncWithGoogle} disabled={isLoading} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 space-x-2">
                            {isLoading && <RefreshCw className="animate-spin" size={16} />}
                            <span>Sincronizar con Google</span>
                        </button>
                    )}
                </div>
            </div>
            <header className="flex flex-wrap justify-between items-center mb-6 flex-shrink-0 gap-4">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Calendario de Citas</h2>
                <div className="flex items-center space-x-2 md:space-x-4">
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
            <div className="flex-grow bg-white dark:bg-slate-800 p-1 sm:p-4 rounded-lg shadow-md overflow-hidden">
                {isLoading ? (
                    <CalendarViewSkeleton />
                ) : error ? (
                    <ErrorMessage message={error} />
                ) : (
                    <MonthView currentDate={currentDate} events={events} onDayClick={onSlotClick} onEventClick={onEventClick} onUpdateAppointmentDate={onUpdateAppointmentDate} />
                )}
            </div>
        </div>
    );
};

export default CalendarView;
