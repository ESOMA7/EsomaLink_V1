import React, { useState, useCallback } from 'react';
import DashboardView from './DashboardView';
import { useInterventions, usePayments } from '../../hooks';
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

  // Data fetching hooks for dashboard (excluding appointments to avoid loading configurations)
  const { interventions: dbInterventions, isLoading: loadingInterventions, error: errorInterventions } = useInterventions({ onNewIntervention });
  const interventions = [...tempInterventions, ...dbInterventions];
  const { payments, isLoading: loadingPayments, error: errorPayments } = usePayments();
  
  // Dashboard doesn't need appointments data to avoid loading configurations endpoint
  const appointments = [];
  const userCalendars = [];
  const loadingAppointments = false;
  const errorAppointments = null;

  return (
    <DashboardView 
      setCurrentView={() => {}} // Legacy prop, no longer used
      interventions={interventions}
      payments={payments}
      appointments={appointments}
      userCalendars={userCalendars}
      isLoading={loadingInterventions || loadingPayments}
      error={errorInterventions || errorPayments}
      onTestNewIntervention={onTestNewIntervention}
    />
  );
};

export default DashboardViewWrapper;