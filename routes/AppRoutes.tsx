import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardView from '../components/views/DashboardView';
import CalendarView from '../components/views/CalendarView';
import InterventionsView from '../components/views/InterventionsView';
import PaymentsView from '../components/views/PaymentsView';
import NotesView from '../components/views/NotesView';
import WaitingPatientsView from '../components/views/WaitingPatientsView';
import SettingsView from '../components/views/SettingsView';
import { Intervention, Payment, Appointment, UserCalendar, Note, WaitingPatient } from '../types';

interface AppRoutesProps {
  // Dashboard props
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
  
  // Interventions props
  updateInterventionStatus: (id: number, status: string) => void;
  handleDeleteIntervention: (id: number) => void;
  handleGenerateResponse: (intervention: Intervention) => void;
  setInterventionModalState: (state: any) => void;
  selectedInterventionIds: number[];
  setSelectedInterventionIds: (ids: number[]) => void;
  confirmDeleteSelectedInterventions: () => void;
  fetchInterventions: () => void;
  
  // Payments props
  handleDeletePayment: (id: number, nombre: string) => void;
  setPaymentModalState: (state: any) => void;
  loadingPayments: boolean;
  errorPayments: string | null;
  fetchPayments: () => void;
  
  // Notes props
  notes: Note[];
  saveNote: (note: any) => void;
  handleDeleteNote: (id: number, title: string) => void;
  loadingNotes: boolean;
  errorNotes: string | null;
  
  // Waiting patients props
  waitingPatients: WaitingPatient[];
  handleDeleteWaitingPatient: (id: number, nombre: string) => void;
  updateWaitingPatient: (patient: WaitingPatient) => void;
  setWaitingPatientModalState: (state: any) => void;
  loadingWaitingPatients: boolean;
  errorWaitingPatients: string | null;
  fetchWaitingPatients: () => void;
  
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
  updateInterventionStatus,
  handleDeleteIntervention,
  handleGenerateResponse,
  setInterventionModalState,
  selectedInterventionIds,
  setSelectedInterventionIds,
  confirmDeleteSelectedInterventions,
  fetchInterventions,
  handleDeletePayment,
  setPaymentModalState,
  fetchPayments,
  notes,
  saveNote,
  handleDeleteNote,
  loadingNotes,
  errorNotes,
  waitingPatients,
  handleDeleteWaitingPatient,
  updateWaitingPatient,
  setWaitingPatientModalState,
  loadingWaitingPatients,
  errorWaitingPatients,
  fetchWaitingPatients,
  areNotificationsEnabled,
  setAreNotificationsEnabled,
  theme,
  setTheme
}) => {
  return (
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
        element={<CalendarView />} 
      />
      <Route 
        path="/interventions" 
        element={
          <InterventionsView 
            interventions={interventions}
            onUpdateStatus={updateInterventionStatus}
            onDelete={handleDeleteIntervention}
            onGenerateResponse={handleGenerateResponse}
            onAdd={() => setInterventionModalState({ isOpen: true, intervention: null })}
            onEdit={(intervention) => setInterventionModalState({ isOpen: true, intervention })}
            isLoading={loadingInterventions}
            error={errorInterventions ? new Error(errorInterventions) : null}
            selectedIds={selectedInterventionIds}
            onSelectionChange={setSelectedInterventionIds}
            onDeleteSelected={confirmDeleteSelectedInterventions}
            fetchInterventions={fetchInterventions}
          />
        } 
      />
      <Route 
        path="/payments" 
        element={
          <PaymentsView 
            payments={payments}
            onDelete={handleDeletePayment}
            onAdd={() => setPaymentModalState({ isOpen: true, payment: null })}
            onEdit={(payment) => setPaymentModalState({ isOpen: true, payment })}
            isLoading={loadingPayments}
            error={errorPayments}
            fetchPayments={fetchPayments}
          />
        } 
      />
      <Route 
        path="/notes" 
        element={
          <NotesView 
            notes={notes}
            onSaveNote={saveNote}
            onDeleteNote={handleDeleteNote}
            isLoading={loadingNotes}
            error={errorNotes}
          />
        } 
      />
      <Route 
        path="/waiting-patients" 
        element={
          <WaitingPatientsView 
            patients={waitingPatients}
            onDelete={handleDeleteWaitingPatient}
            onUpdateStatus={(id, estado) => {
              const patient = waitingPatients.find(p => p.id === id);
              if (patient) {
                updateWaitingPatient({ ...patient, estado });
              }
            }}
            onAdd={() => setWaitingPatientModalState({ isOpen: true, patient: null })}
            onEdit={(patient) => setWaitingPatientModalState({ isOpen: true, patient })}
            isLoading={loadingWaitingPatients}
            error={errorWaitingPatients}
            fetchWaitingPatients={fetchWaitingPatients}
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
  );
};

export default AppRoutes;