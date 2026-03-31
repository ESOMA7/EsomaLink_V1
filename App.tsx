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
import { supabase } from './services/supabaseClient';
import { requestDesktopNotificationPermission, sendDesktopNotification } from './services/desktopNotificationService';

const App: React.FC = () => {
    const { isAuthenticated, isAuthLoading, authError, setAuthError, loginWithGoogle, logout: supabaseLogout } = useAuth();

    const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');
    const [areNotificationsEnabled, setAreNotificationsEnabled] = useState(() => localStorage.getItem('notifications') === 'true');
    const [tempInterventions, setTempInterventions] = useState<Intervention[]>([]);
    const [newInterventionAvailable, setNewInterventionAvailable] = useState(false);

    const [interventionModalState, setInterventionModalState] = useState<{ isOpen: boolean; intervention: Intervention | null; }>({ isOpen: false, intervention: null });
    const [paymentModalState, setPaymentModalState] = useState<{ isOpen: boolean; payment: Payment | null; }>({ isOpen: false, payment: null });
    const [confirmationModalState, setConfirmationModalState] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: (() => void) | null }>({ isOpen: false, title: '', message: '', onConfirm: null });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('notifications', String(areNotificationsEnabled));
        if (areNotificationsEnabled) {
            requestDesktopNotificationPermission();
        }
    }, [areNotificationsEnabled]);

    // Listener Global de Supabase para Notificaciones de Escritorio
    useEffect(() => {
        if (!isAuthenticated || !areNotificationsEnabled) return;

        const globalChannel = supabase
            .channel('global-interventions-notifications')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'interventions' },
                (payload) => {
                    const newIntervention = payload.new as Intervention;
                    setNewInterventionAvailable(true);
                    toast.success(`¡Nueva Intervención: ${newIntervention.nombre}!`, { icon: '🔔' });
                    sendDesktopNotification('Nueva Intervención Creada', `Paciente: ${newIntervention.nombre}\nDetalles: ${newIntervention.caso}`);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(globalChannel);
        };
    }, [isAuthenticated, areNotificationsEnabled]);

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

    const handleTestNewIntervention = () => {
        if (areNotificationsEnabled) {
            toast.success('¡Nueva intervención de prueba recibida!', { icon: '🔔' });
            sendDesktopNotification('Intervención de Prueba', 'Esta es una validación nativa del sistema.');
            setNewInterventionAvailable(true);
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
                        setPaymentModalState={setPaymentModalState}
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
                <AddPaymentModal modalState={paymentModalState} onClose={() => setPaymentModalState({ isOpen: false, payment: null })} onSave={() => {}} />
            </div>
        </Router>
    );
};

export default App;