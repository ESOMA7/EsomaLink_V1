import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import LoginView from './components/views/LoginView';
import DashboardView from './components/views/DashboardView';
import CalendarView from './components/views/CalendarView';
import PaymentsView from './components/views/PaymentsView';
import InterventionsView from './components/views/InterventionsView';
import NotesView from './components/views/NotesView';
import WaitingPatientsView from './components/views/WaitingPatientsView';
import ConfirmationModal from './components/ui/ConfirmationModal';
import AppointmentModal from './components/ui/AppointmentModal';
import GeminiModal from './components/ui/GeminiModal';
import AddInterventionModal from './components/ui/AddInterventionModal';
import AddPaymentModal from './components/ui/AddPaymentModal';
import AddWaitingPatientModal from './components/ui/AddWaitingPatientModal';
import { useAuth, useAppointments, useInterventions, usePayments, useNotes, useWaitingPatients } from './hooks';
import { AppointmentEvent, Intervention, Payment, WaitingPatient, View } from './types';

import { LoaderCircle } from 'lucide-react';

const App: React.FC = () => {
    const { isAuthenticated, isAuthLoading, authError, setAuthError, loginWithGoogle, logout } = useAuth();
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');
    const [areNotificationsEnabled, setAreNotificationsEnabled] = useState(() => localStorage.getItem('notifications') === 'true');
    const [hasNewIntervention, setHasNewIntervention] = useState(false);

    const { events: appointments, isLoading: loadingAppointments, error: errorAppointments, saveAppointment, deleteAppointment, updateAppointmentDate } = useAppointments();
    const { interventions, isLoading: loadingInterventions, error: errorInterventions, saveIntervention, deleteIntervention, deleteMultipleInterventions, updateInterventionStatus, fetchInterventions } = useInterventions({ onNewIntervention: () => setHasNewIntervention(true) });
    const { payments, isLoading: loadingPayments, error: errorPayments, savePayment, deletePayment, fetchPayments } = usePayments();
    const { notes, isLoading: loadingNotes, error: errorNotes, saveNote, deleteNote } = useNotes();
    const { waitingPatients, isLoading: loadingWaitingPatients, error: errorWaitingPatients, saveWaitingPatient, updateWaitingPatient, deleteWaitingPatient, fetchWaitingPatients } = useWaitingPatients();

    const [appointmentModalState, setAppointmentModalState] = useState<{ isOpen: boolean; event: AppointmentEvent | null; date: Date | null; }>({ isOpen: false, event: null, date: null });
    const [interventionModalState, setInterventionModalState] = useState<{ isOpen: boolean; intervention: Intervention | null; }>({ isOpen: false, intervention: null });
    const [paymentModalState, setPaymentModalState] = useState<{ isOpen: boolean; payment: Payment | null; }>({ isOpen: false, payment: null });
    const [waitingPatientModalState, setWaitingPatientModalState] = useState<{ isOpen: boolean; patient: WaitingPatient | null; }>({ isOpen: false, patient: null });
    const [geminiModalState, setGeminiModalState] = useState<{ isOpen: boolean, intervention: Intervention | null }>({ isOpen: false, intervention: null });
    const [selectedInterventionIds, setSelectedInterventionIds] = useState<number[]>([]);

    const [confirmationModalState, setConfirmationModalState] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: (() => void) | null }>({ isOpen: false, title: '', message: '', onConfirm: null });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('notifications', String(areNotificationsEnabled));
    }, [areNotificationsEnabled]);

    const handleSaveAppointment = async (data: Omit<AppointmentEvent, 'title' | 'id'> & { id?: number }) => {
        await saveAppointment(data);
        setAppointmentModalState({ isOpen: false, event: null, date: null });
        if (areNotificationsEnabled) {
            toast.success('Cita guardada con éxito.');
        }
    };

    const handleDeleteAppointment = (id: number, title: string) => {
        setConfirmationModalState({
            isOpen: true,
            title: `Eliminar Cita: ${title}`,
            message: '¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.',
            onConfirm: async () => {
                try {
                    await deleteAppointment(id);
                    if (areNotificationsEnabled) toast.success('Cita eliminada con éxito.');
                } catch (error) {
                    if (areNotificationsEnabled) toast.error('Error al eliminar la cita.');
                }
                setConfirmationModalState({ isOpen: false, title: '', message: '', onConfirm: null });
            }
        });
    };

    const handleSaveIntervention = async (data: any) => {
        await saveIntervention(data);
        setInterventionModalState({ isOpen: false, intervention: null });
    };

    const handleDeleteIntervention = (id: number, nombre: string) => {
        setConfirmationModalState({
            isOpen: true,
            title: `Eliminar Intervención: ${nombre}`,
            message: '¿Estás seguro de que deseas eliminar esta intervención? Esta acción no se puede deshacer.',
            onConfirm: async () => {
                try {
                    await deleteIntervention(id);
                    if (areNotificationsEnabled) toast.success('Intervención eliminada con éxito.');
                } catch (error) {
                    if (areNotificationsEnabled) toast.error('Error al eliminar la intervención.');
                }
                setConfirmationModalState({ isOpen: false, title: '', message: '', onConfirm: null });
            }
        });
    };

    const handleDeleteSelectedInterventions = () => {
        setConfirmationModalState({
            isOpen: true,
            title: 'Eliminar Intervenciones Seleccionadas',
            message: `¿Estás seguro de que deseas eliminar ${selectedInterventionIds.length} intervenciones? Esta acción no se puede deshacer.`,
            onConfirm: async () => {
                try {
                    await deleteMultipleInterventions(selectedInterventionIds);
                    if (areNotificationsEnabled) toast.success('Intervenciones eliminadas con éxito.');
                    setSelectedInterventionIds([]);
                } catch (error) {
                    if (areNotificationsEnabled) toast.error('Error al eliminar las intervenciones.');
                }
                setConfirmationModalState({ isOpen: false, title: '', message: '', onConfirm: null });
            }
        });
    };

    const handleSavePayment = async (data: any) => {
        await savePayment(data);
        setPaymentModalState({ isOpen: false, payment: null });
    };

    const handleDeletePayment = (id: number, nombre: string) => {
        setConfirmationModalState({
            isOpen: true,
            title: `Eliminar Pago: ${nombre}`,
            message: '¿Estás seguro de que deseas eliminar este pago? Esta acción no se puede deshacer.',
            onConfirm: async () => {
                try {
                    await deletePayment(id);
                    if (areNotificationsEnabled) toast.success('Pago eliminado con éxito.');
                } catch (error) {
                    if (areNotificationsEnabled) toast.error('Error al eliminar el pago.');
                }
                setConfirmationModalState({ isOpen: false, title: '', message: '', onConfirm: null });
            }
        });
    };

    const handleDeleteNote = (id: number, title: string) => {
        setConfirmationModalState({
            isOpen: true,
            title: `Eliminar Nota: ${title}`,
            message: '¿Estás seguro de que deseas eliminar esta nota? Esta acción no se puede deshacer.',
            onConfirm: async () => {
                try {
                    await deleteNote(id);
                    if (areNotificationsEnabled) toast.success('Nota eliminada con éxito.');
                } catch (error) {
                    if (areNotificationsEnabled) toast.error('Error al eliminar la nota.');
                }
                setConfirmationModalState({ isOpen: false, title: '', message: '', onConfirm: null });
            }
        });
    };

    const handleSaveWaitingPatient = async (data: any) => {
        await saveWaitingPatient(data);
        setWaitingPatientModalState({ isOpen: false, patient: null });
    };

    const handleDeleteWaitingPatient = (id: number, nombre: string) => {
        setConfirmationModalState({
            isOpen: true,
            title: `Eliminar Paciente en Espera: ${nombre}`,
            message: '¿Estás seguro de que deseas eliminar este paciente de la lista de espera? Esta acción no se puede deshacer.',
            onConfirm: async () => {
                try {
                    await deleteWaitingPatient(id);
                    if (areNotificationsEnabled) toast.success('Paciente en espera eliminado con éxito.');
                } catch (error) {
                    if (areNotificationsEnabled) toast.error('Error al eliminar el paciente en espera.');
                }
                setConfirmationModalState({ isOpen: false, title: '', message: '', onConfirm: null });
            }
        });
    };

    const handleSlotClick = (date: Date) => {
        setAppointmentModalState({ isOpen: true, event: null, date });
    };

    const handleEventClick = (event: any) => {
        setAppointmentModalState({ isOpen: true, event, date: event.start });
    };

    const handleTestNewIntervention = () => {
        toast.info('Esta es una notificación de prueba para una nueva intervención.', {
            action: {
                label: 'Ver',
                onClick: () => setCurrentView('interventions'),
            },
        });
    };

    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return (
                    <DashboardView
                        setCurrentView={setCurrentView}
                        interventions={interventions}
                        payments={payments}
                        appointments={appointments}
                        isLoading={loadingAppointments || loadingInterventions || loadingPayments}
                        error={errorAppointments || errorInterventions || errorPayments}
                        newInterventionAvailable={hasNewIntervention}
                        onTestNewIntervention={handleTestNewIntervention}
                    />
                );
            case 'calendar':
                return (
                    <CalendarView
                        events={appointments}
                        onSlotClick={handleSlotClick}
                        onEventClick={handleEventClick}
                        onUpdateAppointmentDate={updateAppointmentDate}
                        isLoading={loadingAppointments}
                        error={errorAppointments}
                    />
                );
            case 'interventions':
                return (
                    <InterventionsView
                        interventions={interventions}
                        onUpdateStatus={updateInterventionStatus}
                        onDelete={handleDeleteIntervention}
                        onGenerateResponse={(intervention) => setGeminiModalState({ isOpen: true, intervention })}
                        onAdd={() => setInterventionModalState({ isOpen: true, intervention: null })}
                        onEdit={(intervention) => setInterventionModalState({ isOpen: true, intervention })}
                        isLoading={loadingInterventions}
                        error={errorInterventions}
                        selectedIds={selectedInterventionIds}
                        onSelectionChange={setSelectedInterventionIds}
                        onDeleteSelected={handleDeleteSelectedInterventions}
                        fetchInterventions={fetchInterventions}
                    />
                );
            case 'payments':
                return (
                    <PaymentsView
                        payments={payments}
                        onDelete={handleDeletePayment}
                        onAdd={() => setPaymentModalState({ isOpen: true, payment: null })}
                        onEdit={(payment) => setPaymentModalState({ isOpen: true, payment })}
                        isLoading={loadingPayments}
                        error={errorPayments}
                        fetchPayments={fetchPayments}
                    />
                );
            case 'notes':
                return (
                    <NotesView
                        notes={notes}
                        onSaveNote={saveNote}
                        onDeleteNote={handleDeleteNote}
                        isLoading={loadingNotes}
                        error={errorNotes}
                    />
                );
            case 'waiting_patients':
                return (
                    <WaitingPatientsView
                        patients={waitingPatients}
                        onDelete={handleDeleteWaitingPatient}
                        onUpdateStatus={updateWaitingPatient}
                        onAdd={() => setWaitingPatientModalState({ isOpen: true, patient: null })}
                        onEdit={(patient) => setWaitingPatientModalState({ isOpen: true, patient })}
                        isLoading={loadingWaitingPatients}
                        error={errorWaitingPatients}
                        fetchWaitingPatients={fetchWaitingPatients}
                    />
                );
            case 'settings':
                return <div>Settings View</div>;
            default:
                return (
                    <DashboardView
                        setCurrentView={setCurrentView}
                        interventions={interventions}
                        payments={payments}
                        appointments={appointments}
                        isLoading={loadingAppointments || loadingInterventions || loadingPayments}
                        error={errorAppointments || errorInterventions || errorPayments}
                        newInterventionAvailable={hasNewIntervention}
                        onTestNewIntervention={handleTestNewIntervention}
                    />
                );
        }
    };

    if (isAuthLoading) {
        return <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900"><LoaderCircle className="w-12 h-12 animate-spin text-blue-600" /></div>;
    }

    if (!isAuthenticated) {
        return <LoginView onLoginWithGoogle={loginWithGoogle} isLoading={isAuthLoading} error={authError} setError={setAuthError} />;
    }

    return (
        <div className={`flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 ${theme}`}>
            <Toaster richColors position="top-right" />
            <Sidebar
                currentView={currentView}
                setCurrentView={setCurrentView}
                onLogout={logout}
                theme={theme}
                onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                areNotificationsEnabled={areNotificationsEnabled}
                onToggleNotifications={() => setAreNotificationsEnabled(!areNotificationsEnabled)}
                newInterventionAvailable={hasNewIntervention}
            />
            <main className="flex-1 p-6 overflow-auto">
                {renderView()}
            </main>

            {/* Modals */}
            <ConfirmationModal modalState={confirmationModalState} setModalState={setConfirmationModalState} />
            <AppointmentModal modalState={appointmentModalState} onClose={() => setAppointmentModalState({ isOpen: false, event: null, date: null })} onSave={handleSaveAppointment} onDelete={handleDeleteAppointment} />
            <AddInterventionModal modalState={interventionModalState} onClose={() => setInterventionModalState({ isOpen: false, intervention: null })} onSave={handleSaveIntervention} />
            <AddPaymentModal modalState={paymentModalState} onClose={() => setPaymentModalState({ isOpen: false, payment: null })} onSave={handleSavePayment} />
            <AddWaitingPatientModal modalState={waitingPatientModalState} onClose={() => setWaitingPatientModalState({ isOpen: false, patient: null })} onSave={handleSaveWaitingPatient} />
            <GeminiModal modalState={geminiModalState} onClose={() => setGeminiModalState({ isOpen: false, intervention: null })} />
        </div>
    );
};

export default App;