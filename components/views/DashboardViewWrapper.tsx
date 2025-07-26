import React, { useState, useCallback } from 'react';
import DashboardView from './DashboardView';
import { useInterventions, usePayments } from '../../hooks';
import { useAppointmentsContext } from '../../contexts/AppointmentsContext';
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
  const { events: appointments, isLoading: loadingAppointments, error: errorAppointments, userCalendars } = useAppointmentsContext();

  return (
    <DashboardView 
      setCurrentView={() => {}} // Legacy prop, no longer used
      interventions={interventions}
      payments={payments}
      appointments={appointments}
      userCalendars={userCalendars}
      isLoading={loadingAppointments || loadingInterventions || loadingPayments}
      error={errorAppointments || errorInterventions || errorPayments}
      onTestNewIntervention={onTestNewIntervention}
    />
  );
};

export default DashboardViewWrapper;