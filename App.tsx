import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import LoginView from './components/views/LoginView';
import DashboardView from './components/views/DashboardView';
import CalendarView from './components/views/CalendarView';
import PaymentsView from './components/views/PaymentsView';
import InterventionsView from './components/views/InterventionsView';
import NotesView from './components/views/NotesView';
import WaitingPatientsView from './components/views/WaitingPatientsView';
import ConfirmationModal from './components/ui/ConfirmationModal';

// import GeminiModal from './components/ui/GeminiModal';
import AddInterventionModal from './components/ui/AddInterventionModal';
import AddPaymentModal from './components/ui/AddPaymentModal';
import AddWaitingPatientModal from './components/ui/AddWaitingPatientModal';
import { useAuth, useInterventions, usePayments, useNotes, useWaitingPatients } from '@/hooks';
import { Intervention, Payment, WaitingPatient, View } from './types';
import { Toaster, toast } from 'react-hot-toast';
import { LoaderCircle } from 'lucide-react';

const App: React.FC = () => {
        const { isAuthenticated, isAuthLoading, authError, setAuthError, loginWithGoogle, logout: supabaseLogout } = useAuth();


    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');
    const [areNotificationsEnabled, setAreNotificationsEnabled] = useState(() => localStorage.getItem('notifications') === 'true');
    const [hasNewIntervention, setHasNewIntervention] = useState(false);

    const onNewIntervention = useCallback(() => {
        setHasNewIntervention(true);
    }, []);

    const { interventions, isLoading: loadingInterventions, error: errorInterventions, saveIntervention, deleteIntervention, deleteMultipleInterventions, updateInterventionStatus, fetchInterventions } = useInterventions({ onNewIntervention });
    const { payments, isLoading: loadingPayments, error: errorPayments, savePayment, deletePayment, fetchPayments } = usePayments();
    const { notes, isLoading: loadingNotes, error: errorNotes, saveNote, deleteNote } = useNotes();
    const { waitingPatients, isLoading: loadingWaitingPatients, error: errorWaitingPatients, saveWaitingPatient, updateWaitingPatient, deleteWaitingPatient, fetchWaitingPatients } = useWaitingPatients();


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
                // Note: Google token revocation is now handled inside useAppointments
                await supabaseLogout();
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

    const handleGenerateResponse = (_intervention: Intervention) => {
        toast('La generación de respuestas con IA está deshabilitada temporalmente.');
    };

    const handleTestNewIntervention = () => {
        toast((t) => (
            <span className="flex items-center">
                Esta es una notificación de prueba para una nueva intervención.
                <button 
                    className="ml-4 px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => {
                        setCurrentView('interventions');
                        toast.dismiss(t.id);
                    }}
                >
                    Ver
                </button>
            </span>
        ));
    };

    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                                                return <DashboardView setCurrentView={setCurrentView} interventions={interventions} payments={payments} appointments={[]} isLoading={loadingInterventions || loadingPayments} error={errorInterventions || errorPayments} newInterventionAvailable={hasNewIntervention} onTestNewIntervention={handleTestNewIntervention} />;
            case 'calendar':
                return <CalendarView />;
            case 'interventions':
                return <InterventionsView interventions={interventions} onUpdateStatus={updateInterventionStatus} onDelete={handleDeleteIntervention} onGenerateResponse={handleGenerateResponse} onAdd={() => setInterventionModalState({ isOpen: true, intervention: null })} onEdit={(intervention) => setInterventionModalState({ isOpen: true, intervention })} isLoading={loadingInterventions} error={errorInterventions ? new Error(errorInterventions) : null} selectedIds={selectedInterventionIds} onSelectionChange={setSelectedInterventionIds} onDeleteSelected={handleDeleteSelectedInterventions} fetchInterventions={fetchInterventions} />;
            case 'payments':
                return <PaymentsView payments={payments} onDelete={handleDeletePayment} onAdd={() => setPaymentModalState({ isOpen: true, payment: null })} onEdit={(payment) => setPaymentModalState({ isOpen: true, payment })} isLoading={loadingPayments} error={errorPayments} fetchPayments={fetchPayments} />;
            case 'notes':
                return <NotesView notes={notes} onSaveNote={saveNote} onDeleteNote={handleDeleteNote} isLoading={loadingNotes} error={errorNotes} />;
            case 'waiting_patients':
                return <WaitingPatientsView patients={waitingPatients} onDelete={handleDeleteWaitingPatient} onUpdateStatus={(id, estado) => { const patient = waitingPatients.find(p => p.id === id); if (patient) { updateWaitingPatient({ ...patient, estado }); } }} onAdd={() => setWaitingPatientModalState({ isOpen: true, patient: null })} onEdit={(patient) => setWaitingPatientModalState({ isOpen: true, patient })} isLoading={loadingWaitingPatients} error={errorWaitingPatients} fetchWaitingPatients={fetchWaitingPatients} />;
            case 'settings':
                return <div>Settings View</div>;
            default:
                return <DashboardView setCurrentView={setCurrentView} interventions={interventions} payments={payments} appointments={appointments} isLoading={loadingAppointments || loadingInterventions || loadingPayments} error={errorAppointments || errorInterventions || errorPayments} newInterventionAvailable={hasNewIntervention} onTestNewIntervention={handleTestNewIntervention} />;
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
            <Sidebar
                currentView={currentView}
                setCurrentView={setCurrentView}
                onLogout={handleLogout}
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
            
            <AddInterventionModal modalState={interventionModalState} onClose={() => setInterventionModalState({ isOpen: false, intervention: null })} onSave={handleSaveIntervention} />
            <AddPaymentModal modalState={paymentModalState} onClose={() => setPaymentModalState({ isOpen: false, payment: null })} onSave={handleSavePayment} />
            <AddWaitingPatientModal modalState={waitingPatientModalState} onClose={() => setWaitingPatientModalState({ isOpen: false, patient: null })} onSave={handleSaveWaitingPatient} />
        </div>
    );
};

export default App;