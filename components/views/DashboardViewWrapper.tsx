import React, { useState, useCallback } from 'react';
import DashboardView from './DashboardView';
import { useInterventions, usePayments, useAppointments } from '../../hooks';
import { Intervention } from '../../types';

interface DashboardViewWrapperProps {
  tempInterventions: Intervention[];
  onTestNewIntervention: () => void;
}

const DashboardViewWrapper: React.FC<DashboardViewWrapperProps> = ({
  tempInterventions,
  onTestNewIntervention
}) => {
  const onNewIntervention = useCallback(() => {
    // This callback is kept for the subscription, but doesn't need to set state anymore.
  }, []);

  // Data fetching hooks for dashboard
  const { interventions: dbInterventions, isLoading: loadingInterventions, error: errorInterventions } = useInterventions({ onNewIntervention });
  const interventions = [...tempInterventions, ...dbInterventions];
  const { payments, isLoading: loadingPayments, error: errorPayments } = usePayments();
  const [today] = useState(new Date());
  const { 
    events: appointments, 
    calendars: userCalendars, 
    isLoading: loadingAppointments, 
    error: errorAppointments 
  } = useAppointments(today, 'day');

  return (
    <DashboardView 
      setCurrentView={() => {}} // Legacy prop, no longer used
      interventions={interventions}
      payments={payments}
      appointments={appointments || []}
      userCalendars={userCalendars || []}
      isLoading={loadingInterventions || loadingPayments || loadingAppointments}
      error={errorInterventions || errorPayments || errorAppointments}
      onTestNewIntervention={onTestNewIntervention}
    />
  );
};

export default DashboardViewWrapper;