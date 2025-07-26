
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppointmentEvent, Intervention, Payment, UserCalendar } from '../../types';
import { Calendar, AlertTriangle, DollarSign, CheckCircle } from 'lucide-react';
import InfoCard from '../ui/InfoCard';
import { DashboardViewSkeleton } from '../ui/LoadingSkeletons';
import { ErrorMessage } from '../ui/ErrorMessage';

interface DashboardViewProps {
    interventions: Intervention[];
    payments: Payment[];
    appointments: AppointmentEvent[];
    userCalendars: UserCalendar[];
    setCurrentView: (view: string) => void; // Legacy prop, no longer used
    isLoading: boolean;
    error: string | null;
    onTestNewIntervention?: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ interventions, payments, appointments, userCalendars, isLoading, error }) => {
    const navigate = useNavigate();
    
    // Use a mock date consistent with the demo data to ensure the dashboard reflects the correct state.
    if (isLoading) {
        return <DashboardViewSkeleton />;
    }
    
    if (error) {
        return <ErrorMessage message={error} />;
    }

    const todaysAppointments = appointments.filter(a => new Date(a.start).toDateString() === new Date().toDateString()).length;
    
    const pendingCount = interventions.filter(i => i.estado === 'Pendiente').length;
    const inProcessCount = interventions.filter(i => i.estado === 'En Proceso').length;

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
        interventionsSubtitle = `${inProcessCount} en proceso`;
    } else if (inProcessCount > 0) {
        interventionsIcon = AlertTriangle;
        interventionsTitle = "Intervenciones en Proceso";
        interventionsValue = inProcessCount.toString();
        interventionsColor = 'yellow';
        interventionsSubtitle = "Seguimiento activo";
    } else {
        interventionsIcon = CheckCircle;
        interventionsTitle = "Intervenciones al Día";
        interventionsValue = "0";
        interventionsColor = 'green';
        interventionsSubtitle = "No hay casos urgentes";
    }
    
    const totalRevenue = payments.reduce((acc, curr) => acc + curr.valor, 0);

    const upcomingAppointments = appointments
        .filter(a => new Date(a.start) >= new Date())
        .sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime())
        .slice(0, 5);

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Centro de Control</h1>

            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoCard 
                    icon={Calendar}
                    title="Citas para Hoy"
                    value={todaysAppointments.toString()}
                    subtitle="Eventos agendados"
                    color="blue"
                    onClick={() => navigate('/calendar')}
                />
                <InfoCard 
                    icon={interventionsIcon}
                    title={interventionsTitle}
                    value={interventionsValue}
                    subtitle={interventionsSubtitle}
                    color={interventionsColor}
                    onClick={() => navigate('/interventions')}
                />
                <InfoCard 
                    icon={DollarSign}
                    title="Ingresos Totales"
                    value={`$${totalRevenue.toLocaleString('es-CO')}`}
                    subtitle="Total acumulado"
                    color="green"
                    isSensitive={true}
                    onClick={() => navigate('/payments')}
                />
            </div>

            <div className="mt-12 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-6">Próximas Citas</h3>
                <div className="relative pl-6 after:absolute after:inset-y-0 after:w-px after:bg-slate-200 dark:after:bg-slate-700 after:left-0">
                    {upcomingAppointments.map((app) => (
                        <div key={app.id} className="mb-8 relative">
                            <span className="absolute -left-[34px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-200 dark:bg-green-500/20 ring-8 ring-white dark:ring-slate-800">
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </span>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{app.patient} - <span className="font-normal">{app.procedure}</span></p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Responsable: {userCalendars.find(c => c.id === app.calendarId)?.summary || app.professional}</p>
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
