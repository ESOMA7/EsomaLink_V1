import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import LoginView from './components/views/LoginView';
import AppRoutes from './routes/AppRoutes';
import ConfirmationModal from './components/ui/ConfirmationModal';
import AddInterventionModal from './components/ui/AddInterventionModal';
import AddPaymentModal from './components/ui/AddPaymentModal';
import AddWaitingPatientModal from './components/ui/AddWaitingPatientModal';
import { useAuth } from '@/hooks';
import { Intervention, Payment, WaitingPatient, View } from './types';
import { Toaster, toast } from 'react-hot-toast';
import { LoaderCircle } from 'lucide-react';

const App: React.FC = () => {
    const { isAuthenticated, isAuthLoading, authError, setAuthError, loginWithGoogle, logout: supabaseLogout } = useAuth();

    // Removed currentView state as we now use React Router
    const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');
    const [areNotificationsEnabled, setAreNotificationsEnabled] = useState(() => localStorage.getItem('notifications') === 'true');
    const [tempInterventions, setTempInterventions] = useState<Intervention[]>([]);

    // No data fetching hooks here anymore - moved to individual wrappers

    const [interventionModalState, setInterventionModalState] = useState<{ isOpen: boolean; intervention: Intervention | null; }>({ isOpen: false, intervention: null });
    const [paymentModalState, setPaymentModalState] = useState<{ isOpen: boolean; payment: Payment | null; }>({ isOpen: false, payment: null });
    const [waitingPatientModalState, setWaitingPatientModalState] = useState<{ isOpen: boolean; patient: WaitingPatient | null; }>({ isOpen: false, patient: null });
    // Removed selectedInterventionIds as it's now handled in wrapper
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

    // Modal handlers will be implemented in individual wrappers

    // Removed other handlers as they're now in wrappers

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

    // Removed renderView function as we now use React Router

    if (isAuthLoading) {
        return <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900"><LoaderCircle className="w-12 h-12 animate-spin text-blue-600" /></div>;
    }

    if (!isAuthenticated) {
        return <LoginView onLoginWithGoogle={loginWithGoogle} isLoading={isAuthLoading} error={authError} setError={setAuthError} />;
    }

    return (
        <Router>
            <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
                <Toaster position="top-center" reverseOrder={false} />
                <ConfirmationModal modalState={confirmationModalState} setModalState={setConfirmationModalState} />
                <Sidebar
                    onLogout={handleLogout}
                    newInterventionAvailable={false} // Will be handled by dashboard wrapper
                />
                <main className="flex-1 p-6 overflow-auto">
                    <AppRoutes
                        setInterventionModalState={setInterventionModalState}
                        setPaymentModalState={setPaymentModalState}
                        setWaitingPatientModalState={setWaitingPatientModalState}
                        setConfirmationModalState={setConfirmationModalState}
                        tempInterventions={tempInterventions}
                        setTempInterventions={setTempInterventions}
                        onTestNewIntervention={handleTestNewIntervention}
                        areNotificationsEnabled={areNotificationsEnabled}
                        setAreNotificationsEnabled={setAreNotificationsEnabled}
                        theme={theme}
                        setTheme={setTheme}
                    />
                </main>

                {/* Modals */}
                <AddInterventionModal modalState={interventionModalState} onClose={() => setInterventionModalState({ isOpen: false, intervention: null })} onSave={() => {}} />
                <AddPaymentModal modalState={paymentModalState} onClose={() => setPaymentModalState({ isOpen: false, payment: null })} onSave={() => {}} />
                <AddWaitingPatientModal modalState={waitingPatientModalState} onClose={() => setWaitingPatientModalState({ isOpen: false, patient: null })} onSave={() => {}} />
            </div>
        </Router>
    );
};

export default App;