import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, RefreshCw, LoaderCircle, PanelLeft } from 'lucide-react';
import { useAppointments } from '../../hooks/useAppointments';
import { AppointmentEvent, Calendar } from '../../types';
import MonthView from '../calendar/MonthView';
import WeekView from '../calendar/WeekView';
import CalendarList from '../calendar/CalendarList';
import { CalendarViewSkeleton } from '../ui/LoadingSkeletons';
import { ErrorMessage } from '../ui/ErrorMessage';
import AppointmentModal from '../ui/AppointmentModal';
import ConfirmationModal from '../ui/ConfirmationModal';
import { toast } from 'react-hot-toast';

const CalendarViewWrapper: React.FC = () => {
  const {
    events,
    isLoading,
    error,
    saveAppointment,
    deleteAppointment,
    updateAppointmentDate,
    userCalendars,
    visibleCalendarIds,
    toggleCalendarVisibility,
    syncWithGoogle,
    isAuthenticatedWithGoogle,
    refreshEvents
  } = useAppointments();

  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 2));
  const [appointmentModalState, setAppointmentModalState] = useState<{ isOpen: boolean; event: AppointmentEvent | null; date: Date | null; }>({ isOpen: false, event: null, date: null });
  const [confirmationModalState, setConfirmationModalState] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: (() => void) | null }>({ isOpen: false, title: '', message: '', onConfirm: null });
  const [currentView, setCurrentView] = useState<'month' | 'week'>('month');
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(currentDate);

  const filteredEvents = events.filter(event => 
    event.calendarId && visibleCalendarIds.has(event.calendarId)
  );

  const changeDate = (amount: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (currentView === 'week') {
        newDate.setDate(newDate.getDate() + (amount * 7));
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
    const calendar = userCalendars.find(cal => cal.id === event.calendarId);
    const eventWithCorrectProfessional = {
      ...event,
      professional: calendar ? calendar.summary : event.professional,
    };
    setAppointmentModalState({ isOpen: true, event: eventWithCorrectProfessional, date: event.start });
  };

  const handleSaveAppointment = async (data: Omit<AppointmentEvent, 'title' | 'id'> & { id?: string | number }) => {
    const result = await saveAppointment(data);
    if (result.success) {
      setAppointmentModalState({ isOpen: false, event: null, date: null });
      toast.success('Cita guardada con éxito.');
    } else {
      toast.error('No se pudo guardar la cita.');
    }
    return result;
  };

  const handleViewChange = (view: 'month' | 'week') => {
    if (view === 'week') {
      setCurrentDate(new Date());
    }
    setCurrentView(view);
  };

  useEffect(() => {
    setSelectedDate(currentDate);
  }, [currentDate]);

  const handleDeleteAppointment = (id: string | number, title: string) => {
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
    <div className="flex h-full bg-slate-50 dark:bg-slate-900">
      <CalendarList calendars={userCalendars} visibleCalendars={visibleCalendarIds} onToggleCalendar={toggleCalendarVisibility} isVisible={isSidebarVisible} />
      <div className="flex flex-col flex-grow">
        <header className="flex flex-wrap justify-between items-center flex-shrink-0 gap-4 p-6 pb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarVisible(!isSidebarVisible)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <PanelLeft className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </button>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Calendario de Citas</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticatedWithGoogle ? (
              <button onClick={syncWithGoogle} className="flex items-center px-3 py-2 text-xs sm:text-sm font-semibold bg-green-100 text-green-700 dark:bg-green-800/50 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-700/50 transition-colors">
                <CheckCircle className="mr-2 h-4 w-4" /> Sincronizado
              </button>
            ) : (
              <button onClick={syncWithGoogle} className="flex items-center px-3 py-2 text-xs sm:text-sm font-semibold bg-blue-100 text-blue-700 dark:bg-blue-800/50 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-700/50 transition-colors">
                Sincronizar con Google
              </button>
            )}
            <button onClick={refreshEvents} disabled={isLoading} className="flex items-center px-3 py-2 text-xs sm:text-sm font-semibold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors disabled:opacity-50">
              {isLoading ? <LoaderCircle className="animate-spin mr-2 h-4 w-4" /> : <RefreshCw className="mr-2 h-4 w-4" />} 
              Refrescar
            </button>
            <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg">
              <button onClick={() => handleViewChange('month')} className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-l-md transition-colors ${currentView === 'month' ? 'bg-orange-500 text-white' : 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'}`}>Mes</button>
              <button onClick={() => handleViewChange('week')} className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-r-md border-l border-slate-300 dark:border-slate-600 transition-colors ${currentView === 'week' ? 'bg-orange-500 text-white' : 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'}`}>Semana</button>
            </div>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-2 text-xs sm:text-sm font-semibold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">Hoy</button>
            <div className="flex items-center">
              <button onClick={() => changeDate(-1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><ChevronLeft className="h-5 w-5" /></button>
              <span className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-200 w-32 sm:w-40 text-center">
                {getHeaderText()}
              </span>
              <button onClick={() => changeDate(1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><ChevronRight className="h-5 w-5" /></button>
            </div>
          </div>
        </header>
        <main className="flex-grow flex flex-col overflow-hidden p-6 pt-0">
          <div className="flex-grow flex flex-col bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
            {isLoading && events.length === 0 ? (
              <CalendarViewSkeleton />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : (
              <>
                {currentView === 'month' ? (
                  <MonthView 
                    currentDate={currentDate} 
                    events={filteredEvents}
                    onDayClick={handleSlotClick}
                    onEventClick={handleEventClick}
                  />
                ) : (
                  <WeekView
                    currentDate={currentDate}
                    events={filteredEvents}
                    onEventClick={handleEventClick}
                    onUpdateAppointmentDate={updateAppointmentDate}
                    onSlotClick={handleSlotClick}
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
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
        calendars={userCalendars}
      />
      <ConfirmationModal 
        modalState={confirmationModalState} 
        onClose={() => setConfirmationModalState({ isOpen: false, title: '', message: '', onConfirm: null })} 
      />
    </div>
  );
};

export default CalendarViewWrapper;