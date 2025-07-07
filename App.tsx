
import React, { useState, useCallback, useEffect } from 'react';
import { AppointmentEvent, Intervention, Payment, View, Note } from './types';
import { NOTIFICATION_SOUND_URL } from './constants';
import { Sidebar } from './components/Sidebar';
import DashboardView from './components/views/DashboardView';
import CalendarView from './components/views/CalendarView';
import PaymentsView from './components/views/PaymentsView';
import InterventionsView from './components/views/InterventionsView';
import DriveView from './components/views/DriveView';
import NotesView from './components/views/NotesView';
import ConfirmationModal from './components/ui/ConfirmationModal';
import AppointmentModal from './components/ui/AppointmentModal';
import GeminiModal from './components/ui/GeminiModal';
import InterventionModal from './components/ui/AddInterventionModal';
import LoginView from './components/views/LoginView';
import AddPaymentModal from './components/ui/AddPaymentModal';

import { useAuth } from './hooks/useAuth';
import { useAppointments } from './hooks/useAppointments';
import { useInterventions } from './hooks/useInterventions';
import { usePayments } from './hooks/usePayments';
import { useNotes } from './hooks/useNotes';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('dashboard');
    
    // Custom Hooks for state management
    const { isAuthenticated, login, loginWithGoogle, logout, isAuthLoading, authError, setAuthError } = useAuth();
    const { events, saveAppointment, deleteAppointment, updateAppointmentDate, isLoading: appointmentsLoading, error: appointmentsError } = useAppointments();
    const { interventions, saveIntervention, deleteIntervention, updateInterventionStatus, isLoading: interventionsLoading, error: interventionsError } = useInterventions();
    const { payments, savePayment, deletePayment, isLoading: paymentsLoading, error: paymentsError } = usePayments();
    const { notes, saveNote: doSaveNote, deleteNote: doDeleteNote, isLoading: notesLoading, error: notesError } = useNotes();

    // Settings State
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches));
    const [areNotificationsEnabled, setAreNotificationsEnabled] = useState(() => localStorage.getItem('notifications') !== 'false');

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    useEffect(() => {
        localStorage.setItem('notifications', String(areNotificationsEnabled));
    }, [areNotificationsEnabled]);

    // Modal States
    const [confirmationModal, setConfirmationModal] = useState<{ isOpen: boolean; message: string; onConfirm: (() => void) | null }>({ isOpen: false, message: '', onConfirm: null });
    const [appointmentModal, setAppointmentModal] = useState<{ isOpen: boolean; event: AppointmentEvent | null; date: Date | null; }>({ isOpen: false, event: null, date: null });
    const [geminiModal, setGeminiModal] = useState<{ isOpen: boolean; intervention: Intervention | null }>({ isOpen: false, intervention: null });
    const [interventionModal, setInterventionModal] = useState<{ isOpen: boolean; intervention: Intervention | null; }>({ isOpen: false, intervention: null });
    const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean }>({ isOpen: false });

    // Action Handlers
    const playNotification = useCallback(() => {
        if (areNotificationsEnabled) {
            new Audio(NOTIFICATION_SOUND_URL).play().catch(console.error);
        }
    }, [areNotificationsEnabled]);

    const handleLogout = useCallback(() => {
        setConfirmationModal({
            isOpen: true,
            message: '¿Estás seguro de que deseas cerrar la sesión?',
            onConfirm: async () => {
                await logout();
                setConfirmationModal({ isOpen: false, message: '', onConfirm: null });
            },
        });
    }, [logout]);

    const handleSaveAppointment = useCallback(async (data: Omit<AppointmentEvent, 'title'>) => {
        await saveAppointment(data);
        setAppointmentModal({ isOpen: false, event: null, date: null });
    }, [saveAppointment]);

    const handleDeleteAppointment = useCallback((eventId: number, eventTitle: string) => {
        setConfirmationModal({ isOpen: true, message: `¿Estás seguro de que deseas eliminar la cita "${eventTitle}"?`, onConfirm: async () => {
            await deleteAppointment(eventId);
            setAppointmentModal({ isOpen: false, event: null, date: null });
            setConfirmationModal({ isOpen: false, message: '', onConfirm: null });
        }});
    }, [deleteAppointment]);
    
    const handleSavePayment = useCallback(async (data: Omit<Payment, 'id' | 'date'>) => {
        await savePayment(data);
        playNotification();
        setPaymentModal({ isOpen: false });
    }, [savePayment, playNotification]);

    const handleDeletePayment = useCallback((paymentId: string, patientName: string) => {
        setConfirmationModal({ isOpen: true, message: `¿Estás seguro de que deseas eliminar el pago de "${patientName}"?`, onConfirm: async () => {
            await deletePayment(paymentId);
            setConfirmationModal({ isOpen: false, message: '', onConfirm: null });
        }});
    }, [deletePayment]);

    const handleSaveIntervention = useCallback(async (data: { id?: number; patient: string; phone: string; reason: string; }) => {
        await saveIntervention(data);
        if(!data.id) playNotification();
        setInterventionModal({ isOpen: false, intervention: null });
    }, [saveIntervention, playNotification]);
    
    const handleDeleteIntervention = useCallback((interventionId: number, patientName:string) => {
        setConfirmationModal({ isOpen: true, message: `¿Estás seguro de que deseas eliminar la intervención de "${patientName}"?`, onConfirm: async () => {
            await deleteIntervention(interventionId);
            setConfirmationModal({ isOpen: false, message: '', onConfirm: null });
        }});
    }, [deleteIntervention]);

    const handleSaveNote = useCallback(async (note: Note) => {
        await doSaveNote(note);
    }, [doSaveNote]);

    const handleDeleteNote = useCallback((noteId: number, noteTitle: string) => {
        setConfirmationModal({ isOpen: true, message: `¿Estás seguro de que deseas eliminar la nota "${noteTitle}"?`, onConfirm: async () => {
            await doDeleteNote(noteId);
            setConfirmationModal({ isOpen: false, message: '', onConfirm: null });
        }});
    }, [doDeleteNote]);


    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return <DashboardView 
                    interventions={interventions} 
                    payments={payments} 
                    appointments={events} 
                    setCurrentView={setCurrentView} 
                    isLoading={interventionsLoading || paymentsLoading || appointmentsLoading}
                    error={interventionsError || paymentsError || appointmentsError}
                />;
            case 'calendar':
                return <CalendarView 
                            events={events} 
                            onSlotClick={(date: Date) => setAppointmentModal({ isOpen: true, event: null, date })} 
                            onEventClick={(event: AppointmentEvent) => setAppointmentModal({ isOpen: true, event, date: event.start })} 
                            onUpdateAppointmentDate={updateAppointmentDate}
                            isLoading={appointmentsLoading}
                            error={appointmentsError}
                        />;
            case 'payments':
                return <PaymentsView 
                            payments={payments} 
                            onDelete={handleDeletePayment} 
                            onAdd={() => setPaymentModal({ isOpen: true })} 
                            isLoading={paymentsLoading}
                            error={paymentsError}
                        />;
            case 'interventions':
                return <InterventionsView 
                            interventions={interventions} 
                            onUpdateStatus={updateInterventionStatus} 
                            onDelete={handleDeleteIntervention}
                            onGenerateResponse={(intervention: Intervention) => setGeminiModal({ isOpen: true, intervention })}
                            onAdd={() => setInterventionModal({ isOpen: true, intervention: null })}
                            onEdit={(intervention: Intervention) => setInterventionModal({ isOpen: true, intervention })}
                            isLoading={interventionsLoading}
                            error={interventionsError}
                        />;
            case 'drive':
                return <DriveView />;
            case 'notes':
                return <NotesView 
                            notes={notes}
                            onSaveNote={handleSaveNote}
                            onDeleteNote={handleDeleteNote}
                            isLoading={notesLoading}
                            error={notesError}
                        />;
            default:
                return <DashboardView interventions={interventions} payments={payments} appointments={events} setCurrentView={setCurrentView} isLoading={false} error={null} />;
        }
    };

    if (!isAuthenticated) {
        return <LoginView onLogin={login} onLoginWithGoogle={loginWithGoogle} isLoading={isAuthLoading} error={authError} setError={setAuthError} />;
    }

    return (
        <div className="flex h-screen font-sans text-slate-800 dark:text-slate-200">
            <Sidebar 
                currentView={currentView} 
                setCurrentView={setCurrentView} 
                onLogout={handleLogout}
                isDarkMode={isDarkMode}
                onToggleTheme={() => setIsDarkMode(prev => !prev)}
                areNotificationsEnabled={areNotificationsEnabled}
                onToggleNotifications={() => setAreNotificationsEnabled(prev => !prev)}
            />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col overflow-y-auto">
                {renderView()}
            </main>
            
            <ConfirmationModal modalState={confirmationModal} setModalState={setConfirmationModal} />
            <AppointmentModal modalState={appointmentModal} onClose={() => setAppointmentModal({ isOpen: false, event: null, date: null })} onSave={handleSaveAppointment} onDelete={handleDeleteAppointment} />
            <GeminiModal modalState={geminiModal} onClose={() => setGeminiModal({ isOpen: false, intervention: null })} />
            <InterventionModal modalState={interventionModal} onClose={() => setInterventionModal({ isOpen: false, intervention: null })} onSave={handleSaveIntervention} />
            <AddPaymentModal modalState={paymentModal} onClose={() => setPaymentModal({ isOpen: false })} onSave={handleSavePayment} />
        </div>
    );
};

export default App;
