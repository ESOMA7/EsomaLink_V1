
import React from 'react';
import { AppointmentEvent, Intervention, Payment, View } from '../../types';
import { Calendar, AlertTriangle, DollarSign, CheckCircle } from 'lucide-react';
import InfoCard from '../ui/InfoCard';
import { DashboardViewSkeleton } from '../ui/LoadingSkeletons';
import { ErrorMessage } from '../ui/ErrorMessage';

interface DashboardViewProps {
    interventions: Intervention[];
    payments: Payment[];
    appointments: AppointmentEvent[];
    setCurrentView: (view: View) => void;
    isLoading: boolean;
    error: string | null;
}

const DashboardView: React.FC<DashboardViewProps> = ({ interventions, payments, appointments, setCurrentView, isLoading, error }) => {
    // Use a mock date consistent with the demo data to ensure the dashboard reflects the correct state.
    const MOCK_NOW = new Date(2025, 6, 2); 

    if (isLoading) {
        return <DashboardViewSkeleton />;
    }
    
    if (error) {
        return <ErrorMessage message={error} />;
    }

    const todaysAppointments = appointments.filter(a => new Date(a.start).toDateString() === MOCK_NOW.toDateString()).length;
    
    const pendingCount = interventions.filter(i => i.status === 'Pendiente').length;
    const inProcessCount = interventions.filter(i => i.status === 'En Proceso').length;
    const resueltoCount = interventions.filter(i => i.status === 'Resuelto').length;

    let interventionsIcon: React.ComponentType<any>;
    let interventionsTitle: string;
    let interventionsValue: string;
    let interventionsColor: 'red' | 'yellow' | 'green';
    let interventionsSubtitle: string;

    if (pendingCount > 0) {
        interventionsIcon = AlertTriangle;
        interventionsTitle = "Intervenciones Pendientes";
        interventionsValue = pendingCount.toString();
        interventionsColor = 'red';
        interventionsSubtitle = "Requieren acción inmediata";
    } else if (inProcessCount > 0) {
        interventionsIcon = AlertTriangle;
        interventionsTitle = "Intervenciones en Proceso";
        interventionsValue = inProcessCount.toString();
        interventionsColor = 'yellow';
        interventionsSubtitle = "Seguimiento activo";
    } else {
        interventionsIcon = CheckCircle;
        interventionsTitle = "Intervenciones al Día";
        interventionsValue = resueltoCount.toString();
        interventionsColor = 'green';
        interventionsSubtitle = "No hay casos urgentes";
    }
    
    const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

    const upcomingAppointments = appointments
        .filter(a => a.start >= MOCK_NOW)
        .sort((a,b) => a.start.getTime() - b.start.getTime())
        .slice(0, 5);

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8">Centro de Control</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoCard 
                    icon={Calendar}
                    title="Citas para Hoy"
                    value={todaysAppointments.toString()}
                    subtitle="Eventos agendados"
                    color="blue"
                    onClick={() => setCurrentView('calendar')}
                />
                <InfoCard 
                    icon={interventionsIcon}
                    title={interventionsTitle}
                    value={interventionsValue}
                    subtitle={interventionsSubtitle}
                    color={interventionsColor}
                    onClick={() => setCurrentView('interventions')}
                />
                <InfoCard 
                    icon={DollarSign}
                    title="Ingresos Totales"
                    value={`$${totalRevenue.toLocaleString('es-CO')}`}
                    subtitle="Total acumulado"
                    color="green"
                    isSensitive={true}
                    onClick={() => setCurrentView('payments')}
                />
            </div>

            <div className="mt-12 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-6">Próximas Citas</h3>
                <div className="relative pl-6 after:absolute after:inset-y-0 after:w-px after:bg-slate-200 dark:after:bg-slate-700 after:left-0">
                    {upcomingAppointments.map((app, index) => (
                        <div key={app.id} className="mb-8 relative">
                            <span className="absolute -left-[34px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-200 dark:bg-green-500/20 ring-8 ring-white dark:ring-slate-800">
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </span>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{app.title}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{app.professional}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-slate-700 dark:text-slate-300">{app.start.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{app.start.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {upcomingAppointments.length === 0 && (
                        <div className="relative">
                             <span className="absolute -left-[34px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 ring-8 ring-white dark:ring-slate-800">
                                <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            </span>
                             <p className="py-1 text-slate-500 dark:text-slate-400">No hay próximas citas agendadas.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
