import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import LoginView from './components/views/LoginView';
import DashboardView from './components/views/DashboardView';
import CalendarView from './components/views/CalendarView';
import PaymentsView from './components/views/PaymentsView';
import InterventionsView from './components/views/InterventionsView';
import NotesView from './components/views/NotesView';
import WaitingPatientsView from './components/views/WaitingPatientsView';
import SettingsView from './components/views/SettingsView';
import ConfirmationModal from './components/ui/ConfirmationModal';
import AddInterventionModal from './components/ui/AddInterventionModal';
import AddPaymentModal from './components/ui/AddPaymentModal';
import AddWaitingPatientModal from './components/ui/AddWaitingPatientModal';
import { useAuth, useInterventions, usePayments, useNotes, useWaitingPatients } from '@/hooks';
import { useAppointmentsContext } from './contexts/AppointmentsContext';
import { Intervention, Payment, WaitingPatient, View } from './types';
import { Toaster, toast } from 'react-hot-toast';
import { LoaderCircle } from 'lucide-react';

const App: React.FC = () => {
    const { isAuthenticated, isAuthLoading, authError, setAuthError, loginWithGoogle, logout: supabaseLogout } = useAuth();

    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');
    const [areNotificationsEnabled, setAreNotificationsEnabled] = useState(() => localStorage.getItem('notifications') === 'true');
    const [tempInterventions, setTempInterventions] = useState<Intervention[]>([]);

    const onNewIntervention = useCallback(() => {
        // This callback is kept for the subscription, but doesn't need to set state anymore.
    }, []);

    const { interventions: dbInterventions, isLoading: loadingInterventions, error: errorInterventions, saveIntervention, deleteIntervention, deleteMultipleInterventions, updateInterventionStatus, fetchInterventions } = useInterventions({ onNewIntervention });
    const interventions = [...tempInterventions, ...dbInterventions];
    const { payments, isLoading: loadingPayments, error: errorPayments, savePayment, deletePayment, fetchPayments } = usePayments();
    const { notes, isLoading: loadingNotes, error: errorNotes, saveNote, deleteNote } = useNotes();
    const { waitingPatients, isLoading: loadingWaitingPatients, error: errorWaitingPatients, saveWaitingPatient, updateWaitingPatient, deleteWaitingPatient, fetchWaitingPatients } = useWaitingPatients();
    const { events: appointments, isLoading: loadingAppointments, error: errorAppointments, userCalendars } = useAppointmentsContext();

    const hasPendingInterventions = interventions.some(i => i.estado === 'Pendiente');

    const [interventionModalState, setInterventionModalState] = useState<{ isOpen: boolean; intervention: Intervention | null; }>({ isOpen: false, intervention: null });
    const [paymentModalState, setPaymentModalState] = useState<{ isOpen: boolean; payment: Payment | null; }>({ isOpen: false, payment: null });
    const [waitingPatientModalState, setWaitingPatientModalState] = useState<{ isOpen: boolean; patient: WaitingPatient | null; }>({ isOpen: false, patient: null });
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

    const handleLogout = () => {
        setConfirmationModalState({
            isOpen: true,
            title: 'Cerrar Sesión',
            message: '¿Estás seguro de que deseas cerrar sesión?',
            onConfirm: async () => {
                await supabaseLogout();
                setConfirmationModalState({ isOpen: false, title: '', message: '', onConfirm: null });
            }
        });
    };

    const handleSaveIntervention = async (data: any) => {
        await saveIntervention(data);
        setInterventionModalState({ isOpen: false, intervention: null });
    };

    const handleDeleteIntervention = (interventionId: number) => {
        const onConfirmDelete = async () => {
            if (interventionId < 0) {
                setTempInterventions(prev => prev.filter(i => i.id !== interventionId));
                toast.success('Intervención de prueba eliminada.');
                return;
            }
            try {
                await deleteIntervention(interventionId);
                toast.success('Intervención eliminada con éxito.');
            } catch (error) {
                toast.error('Error al eliminar la intervención.');
            }
        };

        setConfirmationModalState({
            isOpen: true,
            title: 'Confirmar Eliminación',
            message: '¿Estás seguro de que deseas eliminar esta intervención?',
            onConfirm: onConfirmDelete,
        });
    };

    const confirmDeleteSelectedInterventions = () => {
        const onConfirmDelete = async () => {
            const tempIds = selectedInterventionIds.filter(id => id < 0);
            const dbIds = selectedInterventionIds.filter(id => id >= 0);

            if (tempIds.length > 0) {
                setTempInterventions(prev => prev.filter(i => !tempIds.includes(i.id)));
            }

            if (dbIds.length > 0) {
                try {
                    await deleteMultipleInterventions(dbIds);
                } catch (error) {
                    toast.error('Error al eliminar las intervenciones de la base de datos.');
                    return; // Stop if DB deletion fails
                }
            }

            toast.success(`${selectedInterventionIds.length} intervenciones eliminadas.`);
            setSelectedInterventionIds([]);
            setConfirmationModalState({ isOpen: false, title: '', message: '', onConfirm: null });
        };

        setConfirmationModalState({
            isOpen: true,
            title: 'Confirmar Eliminación Múltiple',
            message: `¿Seguro que quieres eliminar ${selectedInterventionIds.length} intervenciones?`,
            onConfirm: onConfirmDelete,
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
                    toast.success('Pago eliminado con éxito.');
                } catch (error) {
                    toast.error('Error al eliminar el pago.');
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
                    toast.success('Nota eliminada con éxito.');
                } catch (error) {
                    toast.error('Error al eliminar la nota.');
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
            message: '¿Estás seguro de que deseas eliminar este paciente de la lista de espera?',
            onConfirm: async () => {
                try {
                    await deleteWaitingPatient(id);
                    toast.success('Paciente en espera eliminado con éxito.');
                } catch (error) {
                    toast.error('Error al eliminar el paciente en espera.');
                }
                setConfirmationModalState({ isOpen: false, title: '', message: '', onConfirm: null });
            }
        });
    };

    const handleGenerateResponse = (_intervention: Intervention) => {
        toast('La generación de respuestas con IA está deshabilitada temporalmente.');
    };

    const handleTestNewIntervention = () => {
        if (areNotificationsEnabled) {
            toast.success('¡Nueva intervención de prueba recibida!', { icon: '🔔' });
            const audio = new Audio('/notification.mp3');
            audio.play().catch(error => {
                console.warn('No se pudo reproducir el sonido de notificación automáticamente:', error);
            });
        }

        const fakeIntervention: Intervention = {
            id: Math.random() * -1,
            created_at: new Date().toISOString(),
            nombre: 'Paciente de Prueba (Ficticio)',
            caso: 'Esta es una intervención de prueba generada por el botón.',
            estado: 'Pendiente',
            fecha: new Date().toLocaleDateString('es-CO'),
            updated_at: new Date().toISOString(),
            numeros: 'N/A'
        };

        setTempInterventions(prev => [fakeIntervention, ...prev]);
    };

    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return <DashboardView setCurrentView={setCurrentView} interventions={interventions} payments={payments} appointments={appointments} userCalendars={userCalendars} isLoading={loadingAppointments || loadingInterventions || loadingPayments} error={errorAppointments || errorInterventions || errorPayments} onTestNewIntervention={handleTestNewIntervention} />;
            case 'calendar':
                return <CalendarView />;
            case 'interventions':
                return <InterventionsView interventions={interventions} onUpdateStatus={updateInterventionStatus} onDelete={handleDeleteIntervention} onGenerateResponse={handleGenerateResponse} onAdd={() => setInterventionModalState({ isOpen: true, intervention: null })} onEdit={(intervention) => setInterventionModalState({ isOpen: true, intervention })} isLoading={loadingInterventions} error={errorInterventions ? new Error(errorInterventions) : null} selectedIds={selectedInterventionIds} onSelectionChange={setSelectedInterventionIds} onDeleteSelected={confirmDeleteSelectedInterventions} fetchInterventions={fetchInterventions} />;
            case 'payments':
                return <PaymentsView payments={payments} onDelete={handleDeletePayment} onAdd={() => setPaymentModalState({ isOpen: true, payment: null })} onEdit={(payment) => setPaymentModalState({ isOpen: true, payment })} isLoading={loadingPayments} error={errorPayments} fetchPayments={fetchPayments} />;
            case 'notes':
                return <NotesView notes={notes} onSaveNote={saveNote} onDeleteNote={handleDeleteNote} isLoading={loadingNotes} error={errorNotes} />;
            case 'waiting_patients':
                return <WaitingPatientsView patients={waitingPatients} onDelete={handleDeleteWaitingPatient} onUpdateStatus={(id, estado) => { const patient = waitingPatients.find(p => p.id === id); if (patient) { updateWaitingPatient({ ...patient, estado }); } }} onAdd={() => setWaitingPatientModalState({ isOpen: true, patient: null })} onEdit={(patient) => setWaitingPatientModalState({ isOpen: true, patient })} isLoading={loadingWaitingPatients} error={errorWaitingPatients} fetchWaitingPatients={fetchWaitingPatients} />;
            case 'settings':
                return <SettingsView 
                    areNotificationsEnabled={areNotificationsEnabled}
                    onToggleNotifications={() => setAreNotificationsEnabled(!areNotificationsEnabled)}
                    onTestNewIntervention={handleTestNewIntervention}
                    theme={theme}
                    onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                />;
            default:
                return <DashboardView setCurrentView={setCurrentView} interventions={interventions} payments={payments} appointments={appointments} userCalendars={userCalendars} isLoading={loadingAppointments || loadingInterventions || loadingPayments} error={errorAppointments || errorInterventions || errorPayments} />;
        }
    };

    if (isAuthLoading) {
        return <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900"><LoaderCircle className="w-12 h-12 animate-spin text-blue-600" /></div>;
    }

    if (!isAuthenticated) {
        return <LoginView onLoginWithGoogle={loginWithGoogle} isLoading={isAuthLoading} error={authError} setError={setAuthError} />;
    }

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
            <Toaster position="top-center" reverseOrder={false} />
            <ConfirmationModal modalState={confirmationModalState} setModalState={setConfirmationModalState} />
            <Sidebar
                currentView={currentView}
                setCurrentView={setCurrentView}
                onLogout={handleLogout}
                newInterventionAvailable={hasPendingInterventions}
            />
            <main className="flex-1 p-6 overflow-auto">
                {renderView()}
            </main>

            {/* Modals */}
            <AddInterventionModal modalState={interventionModalState} onClose={() => setInterventionModalState({ isOpen: false, intervention: null })} onSave={handleSaveIntervention} />
            <AddPaymentModal modalState={paymentModalState} onClose={() => setPaymentModalState({ isOpen: false, payment: null })} onSave={handleSavePayment} />
            <AddWaitingPatientModal modalState={waitingPatientModalState} onClose={() => setWaitingPatientModalState({ isOpen: false, patient: null })} onSave={handleSaveWaitingPatient} />
        </div>
    );
};

export default App;