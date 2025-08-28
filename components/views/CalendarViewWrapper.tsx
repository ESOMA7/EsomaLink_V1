import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { AppointmentEvent } from '../../types';
import MonthView from '../calendar/MonthView';
import WeekView from '../calendar/WeekView';
import { CalendarViewSkeleton } from '../ui/LoadingSkeletons';
import { ErrorMessage } from '../ui/ErrorMessage';
import AppointmentModal from '../ui/AppointmentModal';
import ConfirmationModal from '../ui/ConfirmationModal';
import { toast } from 'react-hot-toast';
import { useAppointments } from '../../hooks/useAppointments';
import DayView from '../calendar/DayView';

const CalendarViewWrapper: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>('month');
  const [appointmentModalState, setAppointmentModalState] = useState<{ isOpen: boolean; event: AppointmentEvent | null; date: Date | null; }>({ isOpen: false, event: null, date: null });
  const [confirmationModalState, setConfirmationModalState] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: (() => void) | null }>({ isOpen: false, title: '', message: '', onConfirm: null });
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [isCalendarDropdownOpen, setIsCalendarDropdownOpen] = useState(false);
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>([]);
  const { events, isLoading, error, refreshEvents, deleteAppointment, createAppointment, calendars, updateAppointment } = useAppointments(currentDate, currentView, selectedCalendarIds);

  useEffect(() => {
    if (calendars.length > 0 && selectedCalendarIds.length === 0) {
      setSelectedCalendarIds(calendars.map(c => c.id));
    }
  }, [calendars, selectedCalendarIds.length]);

  const handleCalendarSelection = (calendarId: string) => {
    setSelectedCalendarIds(prevSelectedIds => {
      if (prevSelectedIds.includes(calendarId)) {
        return prevSelectedIds.filter(id => id !== calendarId);
      } else {
        return [...prevSelectedIds, calendarId];
      }
    });
  };

  const changeDate = (amount: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (currentView === 'week') {
        newDate.setDate(newDate.getDate() + (amount * 7));
      } else if (currentView === 'day') {
        newDate.setDate(newDate.getDate() + amount);
      } else {
        newDate.setMonth(newDate.getMonth() + amount);
      }
      return newDate;
    });
  };

  const getHeaderText = () => {
    if (currentView === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return startOfWeek.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
      } else {
        const startMonth = startOfWeek.toLocaleDateString('es-ES', { month: 'short' });
        const endMonth = endOfWeek.toLocaleDateString('es-ES', { month: 'short' });
        return `${startMonth} - ${endMonth} ${endOfWeek.getFullYear()}`.replace(/^\w/, c => c.toUpperCase());
      }
    }
    return currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
  };

  const handleSlotClick = (date: Date) => {
    setAppointmentModalState({ isOpen: true, event: null, date });
  };

  const handleEventClick = (event: AppointmentEvent) => {
    setAppointmentModalState({ isOpen: true, event, date: event.start });
  };

  const handleSaveAppointment = async (data: Omit<AppointmentEvent, 'title' | 'id'> & { id?: string | number }) => {
    const result = data.id
      ? await updateAppointment({ ...data, id: data.id, title: `${data.patient} - ${data.procedure}` } as AppointmentEvent)
      : await createAppointment(data);

    if (result.success) {
      toast.success(data.id ? 'Cita actualizada correctamente.' : 'Cita creada correctamente.');
      setAppointmentModalState({ isOpen: false, event: null, date: null });
      refreshEvents(); // Actualizar eventos
    } else {
      toast.error(result.error || (data.id ? 'No se pudo actualizar la cita.' : 'No se pudo crear la cita.'));
    }
    return result;
  };

  const handleViewChange = (view: 'month' | 'week' | 'day') => {
    setCurrentView(view);
  };

  useEffect(() => {
    setSelectedDate(currentDate);
  }, [currentDate]);

  const handleDeleteAppointment = (id: string | number, title: string) => {
    setConfirmationModalState({
      isOpen: true,
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro de que quieres eliminar la cita "${title}"?`,
      onConfirm: async () => {
        const result = await deleteAppointment(id.toString());
        if (result.success) {
          toast.success('Cita eliminada correctamente.');
          setAppointmentModalState({ isOpen: false, event: null, date: null });
        }
        setConfirmationModalState({ isOpen: false, title: '', message: '', onConfirm: null });
      },
    });
  };
  
  const updateAppointmentDate = async (eventId: string, newStartDate: Date, newEndDate: Date) => {
    toast.error('La actualización de citas no está disponible.');
  };

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900">
      <div className="flex flex-col flex-grow">
        <header className="flex flex-wrap justify-between items-center flex-shrink-0 gap-4 p-6 pb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Calendario de Citas</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative">
              <button onClick={() => setIsCalendarDropdownOpen(!isCalendarDropdownOpen)} className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-semibold bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 rounded-lg transition-colors">
                <CalendarIcon className="h-4 w-4" />
                <span>Calendarios</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isCalendarDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCalendarDropdownOpen && (
                <div className="absolute z-10 mt-2 w-56 bg-white dark:bg-slate-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    {calendars.map((calendar) => (
                      <label
                        key={calendar.id}
                        className="flex items-center justify-between px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            checked={selectedCalendarIds.includes(calendar.id)}
                            onChange={() => handleCalendarSelection(calendar.id)}
                          />
                          <span>{calendar.summary}</span>
                        </div>
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: calendar.backgroundColor }}
                        ></span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg">
              <button onClick={() => handleViewChange('month')} className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-l-md transition-colors ${currentView === 'month' ? 'bg-orange-500 text-white' : 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'}`}>Mes</button>
              <button onClick={() => handleViewChange('week')} className={`px-3 py-1.5 text-xs sm:text-sm font-semibold border-l border-slate-300 dark:border-slate-600 transition-colors ${currentView === 'week' ? 'bg-orange-500 text-white' : 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'}`}>Semana</button>
              <button onClick={() => handleViewChange('day')} className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-r-md border-l border-slate-300 dark:border-slate-600 transition-colors ${currentView === 'day' ? 'bg-orange-500 text-white' : 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'}`}>Día</button>
            </div>

            <button onClick={() => refreshEvents()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><RefreshCw className="h-5 w-5" /></button>
            <div className="flex items-center">
              <button onClick={() => changeDate(-1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><ChevronLeft className="h-5 w-5" /></button>
              <span className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-200 w-32 sm:w-40 text-center">
                {getHeaderText()}
              </span>
              <button onClick={() => changeDate(1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><ChevronRight className="h-5 w-5" /></button>
            </div>
          </div>
        </header>
        <main className="flex-grow flex flex-col p-6 pt-0">
          <div className="flex-grow flex flex-col bg-white dark:bg-slate-800 rounded-lg shadow-md">
            {isLoading ? (
              <CalendarViewSkeleton />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : (
              <>
                {currentView === 'month' ? (
                  <MonthView 
                    currentDate={currentDate} 
                    events={events}
                    onDayClick={handleSlotClick}
                    onEventClick={handleEventClick}
                  />
                ) : currentView === 'week' ? (
                  <WeekView
                    currentDate={currentDate}
                    events={events}
                    onEventClick={handleEventClick}
                    onUpdateAppointmentDate={updateAppointmentDate}
                    onSlotClick={handleSlotClick}
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                  />
                ) : (
                  <DayView
                    currentDate={currentDate}
                    events={events}
                    onEventClick={handleEventClick}
                    onSlotClick={handleSlotClick}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>
      <AppointmentModal 
        modalState={appointmentModalState} 
        onClose={() => setAppointmentModalState({ isOpen: false, event: null, date: null })} 
        onSave={handleSaveAppointment} 
        onDelete={handleDeleteAppointment} 
        calendars={calendars}
      />
      <ConfirmationModal 
        modalState={confirmationModalState} 
        onClose={() => setConfirmationModalState({ isOpen: false, title: '', message: '', onConfirm: null })} 
      />
    </div>
  );
};

export default CalendarViewWrapper;