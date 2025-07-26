import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy load components
const DashboardView = React.lazy(() => import('../components/views/DashboardView'));
const CalendarViewWrapper = React.lazy(() => import('../components/views/CalendarViewWrapper'));
const InterventionsViewWrapper = React.lazy(() => import('../components/views/InterventionsViewWrapper'));
const PaymentsViewWrapper = React.lazy(() => import('../components/views/PaymentsViewWrapper'));
const NotesViewWrapper = React.lazy(() => import('../components/views/NotesViewWrapper'));
const WaitingPatientsViewWrapper = React.lazy(() => import('../components/views/WaitingPatientsViewWrapper'));
const SettingsView = React.lazy(() => import('../components/views/SettingsView'));
import { Intervention, Payment, Appointment, UserCalendar, Note, WaitingPatient } from '../types';

interface AppRoutesProps {
  // Dashboard props (still needed for dashboard)
  interventions: Intervention[];
  payments: Payment[];
  appointments: Appointment[];
  userCalendars: UserCalendar[];
  loadingAppointments: boolean;
  loadingInterventions: boolean;
  loadingPayments: boolean;
  errorAppointments: string | null;
  errorInterventions: string | null;
  errorPayments: string | null;
  onTestNewIntervention: () => void;
  setCurrentView: (view: string) => void;
  
  // Modal states (shared across components)
  setInterventionModalState: (state: any) => void;
  setPaymentModalState: (state: any) => void;
  setWaitingPatientModalState: (state: any) => void;
  setConfirmationModalState: (state: any) => void;
  
  // Temp interventions (for test interventions)
  tempInterventions: Intervention[];
  setTempInterventions: (interventions: Intervention[]) => void;
  
  // Settings props
  areNotificationsEnabled: boolean;
  setAreNotificationsEnabled: (enabled: boolean) => void;
  theme: string;
  setTheme: (theme: string) => void;
}

const AppRoutes: React.FC<AppRoutesProps> = ({
  interventions,
  payments,
  appointments,
  userCalendars,
  loadingAppointments,
  loadingInterventions,
  loadingPayments,
  errorAppointments,
  errorInterventions,
  errorPayments,
  onTestNewIntervention,
  setCurrentView,
  setInterventionModalState,
  setPaymentModalState,
  setWaitingPatientModalState,
  setConfirmationModalState,
  tempInterventions,
  setTempInterventions,
  areNotificationsEnabled,
  setAreNotificationsEnabled,
  theme,
  setTheme
}) => {
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">Cargando...</span>
    </div>
  );

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
      <Route 
        path="/" 
        element={
          <DashboardView 
            setCurrentView={setCurrentView}
            interventions={interventions}
            payments={payments}
            appointments={appointments}
            userCalendars={userCalendars}
            isLoading={loadingAppointments || loadingInterventions || loadingPayments}
            error={errorAppointments || errorInterventions || errorPayments}
            onTestNewIntervention={onTestNewIntervention}
          />
        } 
      />
      <Route 
        path="/dashboard" 
        element={<Navigate to="/" replace />} 
      />
      <Route 
        path="/calendar" 
        element={<CalendarViewWrapper />} 
      />
      <Route 
        path="/interventions" 
        element={
          <InterventionsViewWrapper 
            setInterventionModalState={setInterventionModalState}
            setConfirmationModalState={setConfirmationModalState}
            tempInterventions={tempInterventions}
            setTempInterventions={setTempInterventions}
          />
        } 
      />
      <Route 
        path="/payments" 
        element={
          <PaymentsViewWrapper 
            setPaymentModalState={setPaymentModalState}
            setConfirmationModalState={setConfirmationModalState}
          />
        } 
      />
      <Route 
        path="/notes" 
        element={
          <NotesViewWrapper 
            setConfirmationModalState={setConfirmationModalState}
          />
        } 
      />
      <Route 
        path="/waiting-patients" 
        element={
          <WaitingPatientsViewWrapper 
            setWaitingPatientModalState={setWaitingPatientModalState}
            setConfirmationModalState={setConfirmationModalState}
          />
        } 
      />
      <Route 
        path="/settings" 
        element={
          <SettingsView 
            areNotificationsEnabled={areNotificationsEnabled}
            onToggleNotifications={() => setAreNotificationsEnabled(!areNotificationsEnabled)}
            onTestNewIntervention={onTestNewIntervention}
            theme={theme}
            onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          />
        } 
      />
      {/* Redirect any unknown routes to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
};

export default AppRoutes;