import React, { useState, useCallback, useEffect } from 'react';
import { AppointmentEvent, Intervention, Payment, View, Note, WaitingPatient } from './types';

import { Sidebar } from './components/Sidebar';
import DashboardView from './components/views/DashboardView';
import CalendarView from './components/views/CalendarView';
import PaymentsView from './components/views/PaymentsView';
import InterventionsView from './components/views/InterventionsView';
import DriveView from './components/views/DriveView';
import NotesView from './components/views/NotesView';
import WaitingPatientsView from './components/views/WaitingPatientsView';
import ConfirmationModal from './components/ui/ConfirmationModal';
import AppointmentModal from './components/ui/AppointmentModal';
import GeminiModal from './components/ui/GeminiModal';
import InterventionModal from './components/ui/AddInterventionModal';
import LoginView from './components/views/LoginView';
import AddPaymentModal from './components/ui/AddPaymentModal';
import AddWaitingPatientModal from './components/ui/AddWaitingPatientModal';

import { useAuth } from './hooks/useAuth';
import { useAppointments } from './hooks/useAppointments';
import { useInterventions } from './hooks/useInterventions';
import { usePayments } from './hooks/usePayments';
import { useNotes } from './hooks/useNotes';
import { useWaitingPatients } from './hooks/useWaitingPatients';
import { LoaderCircle } from 'lucide-react';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('dashboard');

    // Settings State
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches));
    const [areNotificationsEnabled, setAreNotificationsEnabled] = useState(() => localStorage.getItem('notifications') !== 'false');
    const [hasNewIntervention, setHasNewIntervention] = useState(false);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    useEffect(() => {
        localStorage.setItem('notifications', String(areNotificationsEnabled));
    }, [areNotificationsEnabled]);

    // Custom Hooks for state management
    const { isAuthenticated, loginWithGoogle, logout, isAuthLoading, authError, setAuthError } = useAuth();
    const { events, saveAppointment, deleteAppointment, updateAppointmentDate, isLoading: appointmentsLoading, error: appointmentsError } = useAppointments();

    const playNotification = useCallback(() => {
        if (areNotificationsEnabled) {
            const audio = new Audio('/notification.mp3'); // Use the correct path directly
            const playPromise = audio.play();

            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // Log error if playback fails for any reason (e.g., browser policy)
                    console.error('Error al reproducir el sonido de notificación:', error);
                });
            }
        }
    }, [areNotificationsEnabled]);

    const handleNewIntervention = useCallback(() => {
        // This now only handles the visual notification part.
        // The sound is played directly on the action that triggers the new intervention.
        if (areNotificationsEnabled) {
            setHasNewIntervention(true);
        }
    }, [areNotificationsEnabled]);

    const { interventions, saveIntervention, deleteIntervention, deleteMultipleInterventions, updateInterventionStatus, isLoading: interventionsLoading, error: interventionsError } = useInterventions({ onNewIntervention: handleNewIntervention });
    const { payments, savePayment, deletePayment, updatePayment, fetchPayments, isLoading: paymentsLoading, error: paymentsError } = usePayments();
    const { notes, saveNote: doSaveNote, deleteNote: doDeleteNote, isLoading: notesLoading, error: notesError } = useNotes();
    const { waitingPatients, saveWaitingPatient, updateWaitingPatient, deleteWaitingPatient, fetchWaitingPatients, isLoading: waitingPatientsLoading, error: waitingPatientsError } = useWaitingPatients();

    const handleTestNewIntervention = useCallback(async () => {
        const randomSuffix = Math.floor(100000 + Math.random() * 900000);
        const testIntervention = {
            nombre: `Paciente de Prueba ${randomSuffix}`,
            numeros: `300${randomSuffix}`,
            fecha: new Date().toISOString().split('T')[0],
            caso: 'Caso de prueba para notificaciones en tiempo real.',
            estado: 'Pendiente' as const,
        };
        try {
            await saveIntervention(testIntervention);
            playNotification();
        } catch (error) {
            console.error("Failed to save test intervention", error);
        }
    }, [saveIntervention, playNotification]);

    const handleUpdateWaitingPatientStatus = useCallback(async (id: number, estado: WaitingPatient['estado']) => {
        const patientToUpdate = waitingPatients.find(p => p.id === id);
        if (patientToUpdate) {
            await updateWaitingPatient({ ...patientToUpdate, estado });
        }
    }, [waitingPatients, updateWaitingPatient]);

    // Modal States
    const [confirmationModal, setConfirmationModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: (() => void) | null }>({ isOpen: false, title: '', message: '', onConfirm: null });
    const [appointmentModal, setAppointmentModal] = useState<{ isOpen: boolean; event: AppointmentEvent | null; date: Date | null; }>({ isOpen: false, event: null, date: null });
    const [geminiModal, setGeminiModal] = useState<{ isOpen: boolean; intervention: Intervention | null }>({ isOpen: false, intervention: null });
    const [selectedInterventionIds, setSelectedInterventionIds] = useState<number[]>([]);
    const [interventionModal, setInterventionModal] = useState<{ isOpen: boolean; intervention: Intervention | null; }>({ isOpen: false, intervention: null });
    const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean; payment: Payment | null; }>({ isOpen: false, payment: null });
    const [waitingPatientModal, setWaitingPatientModal] = useState<{ isOpen: boolean; patient: WaitingPatient | null; }>({ isOpen: false, patient: null });

    const handleSetCurrentView = (view: View) => {
        if (view === 'interventions') {
            setHasNewIntervention(false);
        }
        setCurrentView(view);
    };

    const handleLogout = useCallback(() => {
        setConfirmationModal({
            isOpen: true,
            title: 'Cerrar Sesión',
            message: '¿Estás seguro de que quieres cerrar sesión?',
            onConfirm: () => {
                logout();
                setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null });
            }
        });
    }, [logout]);

    const handleSaveAppointment = useCallback(async (data: Omit<AppointmentEvent, 'title' | 'id'> & {id?:number}) => {
        await saveAppointment(data);
        setAppointmentModal({ isOpen: false, event: null, date: null });
    }, [saveAppointment]);

    const handleDeleteAppointment = useCallback((eventId: number, eventTitle: string) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Confirmar Eliminación de Cita',
            message: `¿Estás seguro de que quieres eliminar la cita "${eventTitle}"?`,
            onConfirm: async () => {
                await deleteAppointment(eventId);
                setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null });
            }
        });
    }, [deleteAppointment]);

    const handleEditPayment = useCallback((payment: Payment) => {
        setPaymentModal({ isOpen: true, payment });
    }, []);

    const handleSaveWaitingPatient = useCallback(async (patientData: Omit<WaitingPatient, 'id' | 'fecha' | 'creado_en' | 'id_usuario'>) => {
        await saveWaitingPatient(patientData);
        playNotification();
        setWaitingPatientModal({ isOpen: false, patient: null });
    }, [saveWaitingPatient, playNotification]);

    const handleDeleteWaitingPatient = useCallback((id: number, nombre: string) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Confirmar Eliminación de Paciente',
            message: `¿Estás seguro de que quieres eliminar al paciente "${nombre}"?`,
            onConfirm: async () => {
                await deleteWaitingPatient(id);
                playNotification();
                setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null });
            }
        });
    }, [deleteWaitingPatient, playNotification]);

    const handleSavePayment = useCallback(async (paymentData: Omit<Payment, 'id' | 'created_at' | 'user_id' | 'fecha' | 'referencia'>) => {
        if (paymentModal.payment) {
            // Ensure you pass the full payment object as expected by the hook
            const updatedPayment = { ...paymentModal.payment, ...paymentData };
            await updatePayment(updatedPayment);
        } else {
            await savePayment(paymentData);
        }
        playNotification();
        setPaymentModal({ isOpen: false, payment: null });
    }, [savePayment, playNotification, paymentModal, updatePayment]);

    const handleDeletePayment = useCallback((id: number, nombre: string) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Confirmar Eliminación de Pago',
            message: `¿Estás seguro de que quieres eliminar el pago de "${nombre}"?`,
            onConfirm: async () => {
                await deletePayment(id);
                setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null });
            }
        });
    }, [deletePayment]);

    const handleSaveIntervention = useCallback(async (data: Omit<Intervention, 'id' | 'created_at' | 'updated_at'> & { id?: number }) => {
        await saveIntervention(data);
        // The notification sound is played here to link it to the user action.
        playNotification();
        setInterventionModal({ isOpen: false, intervention: null });
    }, [saveIntervention, playNotification]);

    const handleDeleteIntervention = useCallback((id: number, nombre: string) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Confirmar Eliminación de Intervención',
            message: `¿Estás seguro de que quieres eliminar la intervención de "${nombre}"?`,
            onConfirm: async () => {
                await deleteIntervention(id);
                setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null });
            }
        });
    }, [deleteIntervention]);

    const handleSaveNote = useCallback(async (note: Note) => {
        await doSaveNote(note);
    }, [doSaveNote]);

    const handleDeleteNote = useCallback((noteId: number, noteTitle: string) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Confirmar Eliminación de Nota',
            message: `¿Estás seguro de que quieres eliminar la nota "${noteTitle}"?`,
            onConfirm: async () => {
                await doDeleteNote(noteId);
                setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null });
            }
        });
    }, [doDeleteNote]);

    const handleEventClick = useCallback((event: AppointmentEvent) => {
        setAppointmentModal({ isOpen: true, event, date: null });
    }, []);

    const handleDateClick = useCallback((date: Date) => {
        setAppointmentModal({ isOpen: true, event: null, date });
    }, []);

    const handleEventDrop = useCallback(async (eventId: number, newDate: Date) => {
        await updateAppointmentDate(eventId, newDate);
    }, [updateAppointmentDate]);

    const handleDeleteSelectedInterventions = () => {
        if (selectedInterventionIds.length === 0) return;

        setConfirmationModal({
            isOpen: true,
            title: 'Confirmar Eliminación Múltiple',
            message: `¿Estás seguro de que quieres eliminar ${selectedInterventionIds.length} intervenciones seleccionadas? Esta acción no se puede deshacer.`,
            onConfirm: async () => {
                try {
                    await deleteMultipleInterventions(selectedInterventionIds);
                    setSelectedInterventionIds([]); // Clear selection after deletion
                } catch (error) {
                    console.error('Failed to delete selected interventions:', error);
                    // Optionally, show an error message to the user
                }
                setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null });
            }
        });
    };

    const handleGenerateResponse = useCallback((intervention: Intervention) => {
        setGeminiModal({ isOpen: true, intervention });
    }, []);



    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return <DashboardView interventions={interventions} payments={payments} appointments={events} setCurrentView={handleSetCurrentView} isLoading={false} error={null} newInterventionAvailable={hasNewIntervention} onTestNewIntervention={handleTestNewIntervention} />;
            case 'calendar':
                return <CalendarView events={events} onEventClick={handleEventClick} onSlotClick={handleDateClick} onUpdateAppointmentDate={handleEventDrop} isLoading={appointmentsLoading} error={appointmentsError} />;
            case 'payments':
                return <PaymentsView 
                            payments={payments} 
                            onEdit={handleEditPayment} 
                            onDelete={handleDeletePayment} 
                            onAdd={() => setPaymentModal({ isOpen: true, payment: null })} 
                            fetchPayments={fetchPayments}
                            isLoading={paymentsLoading} 
                            error={paymentsError} 
                        />;
            case 'interventions':
                return <InterventionsView 
                            interventions={interventions} 
                            onUpdateStatus={updateInterventionStatus}
                            onDelete={handleDeleteIntervention} 
                            onGenerateResponse={handleGenerateResponse}
                            onAdd={() => setInterventionModal({ isOpen: true, intervention: null })} 
                            onEdit={(intervention: Intervention) => setInterventionModal({ isOpen: true, intervention })} 
                            isLoading={interventionsLoading} 
                            error={interventionsError}
                            selectedIds={selectedInterventionIds}
                            onSelectionChange={setSelectedInterventionIds}
                            onDeleteSelected={handleDeleteSelectedInterventions}
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
            case 'waiting_patients':
                return <WaitingPatientsView 
                            patients={waitingPatients}
                            onDelete={handleDeleteWaitingPatient}
                            onEdit={(patient) => setWaitingPatientModal({ isOpen: true, patient })}
                            onAdd={() => setWaitingPatientModal({ isOpen: true, patient: null })}
                            onUpdateStatus={handleUpdateWaitingPatientStatus}
                            isLoading={waitingPatientsLoading}
                            error={waitingPatientsError}
                            fetchWaitingPatients={fetchWaitingPatients}
                        />;
            default:
                return <DashboardView interventions={interventions} payments={payments} appointments={events} setCurrentView={handleSetCurrentView} isLoading={false} error={null} newInterventionAvailable={hasNewIntervention} onTestNewIntervention={handleTestNewIntervention} />;
        }
    };

    if (isAuthLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-100 dark:bg-slate-900">
                <LoaderCircle className="h-12 w-12 animate-spin text-orange-500" />
            </div>
        );
    }
    
    if (!isAuthenticated) {
        return <LoginView onLoginWithGoogle={loginWithGoogle} isLoading={false} error={authError} setError={setAuthError} />;
    }

    return (
        <div className="flex h-screen font-sans text-slate-800 dark:text-slate-200">
            <Sidebar 
                currentView={currentView} 
                setCurrentView={handleSetCurrentView} 
                onLogout={handleLogout}
                newInterventionAvailable={hasNewIntervention}
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
            <AddPaymentModal 
                modalState={paymentModal} 
                onClose={() => setPaymentModal({ isOpen: false, payment: null })} 
                onSave={handleSavePayment} 
            />
            <AddWaitingPatientModal 
                modalState={waitingPatientModal}
                onClose={() => setWaitingPatientModal({ isOpen: false, patient: null })}
                onSave={handleSaveWaitingPatient}
            />
        </div>
    );
};

export default App;