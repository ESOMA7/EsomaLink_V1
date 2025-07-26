import React from 'react';
import CalendarView from './CalendarView';
import { useAppointments } from '../../hooks/useAppointments';

const CalendarViewWrapper: React.FC = () => {
  const { events: appointments, isLoading: loadingAppointments, error: errorAppointments, userCalendars } = useAppointments();

  return (
    <CalendarView 
      appointments={appointments}
      userCalendars={userCalendars}
      isLoading={loadingAppointments}
      error={errorAppointments}
    />
  );
};

export default CalendarViewWrapper;