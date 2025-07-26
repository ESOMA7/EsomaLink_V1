
import React from 'react';
import { Calendar, LayoutDashboard, DollarSign, AlertTriangle, Power, Settings, BookText, ClipboardList } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { APP_LOGO_URL } from '../constants';

interface SidebarProps {
    onLogout: () => void;
    newInterventionAvailable: boolean;
}

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/calendar', icon: Calendar, label: 'Calendario' },
    { path: '/payments', icon: DollarSign, label: 'Pagos' },
    { path: '/interventions', icon: AlertTriangle, label: 'Intervenciones' },
    { path: '/notes', icon: BookText, label: 'Notas' },
    { path: '/waiting-patients', icon: ClipboardList, label: 'Pacientes en Espera' },
    { path: '/settings', icon: Settings, label: 'Configuración' },
];




export const Sidebar: React.FC<SidebarProps> = ({ onLogout, newInterventionAvailable }) => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <aside className="w-20 lg:w-64 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex flex-col shadow-lg dark:shadow-black/20 flex-shrink-0">
            <div className="flex items-center justify-center lg:justify-start p-4 lg:p-6 border-b border-slate-200 dark:border-slate-700">
                <img src={APP_LOGO_URL} alt="EsomaLink Logo" className="w-10 h-10 flex-shrink-0"/>
                <div className="hidden lg:block ml-3">
                    <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500 leading-tight">EsomaLink</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">versión 1.0</p>
                </div>
            </div>
            <nav className="mt-6">
                <ul>
                    {navItems.map(item => (
                        <li key={item.path} className="px-4 lg:px-6 mb-2">
                            <button 
                                onClick={() => navigate(item.path)} 
                                className={`relative flex items-center p-3 rounded-lg transition-colors duration-200 w-full text-left ${location.pathname === item.path ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                            >
                                <item.icon className="h-6 w-6 flex-shrink-0" />
                                <span className="hidden lg:block ml-4 font-medium">{item.label}</span>
                                {item.path === '/interventions' && newInterventionAvailable && (
                                    <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-white dark:ring-slate-800"></span>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="p-4 lg:p-6 border-t border-slate-200 dark:border-slate-700 mt-auto">
                <a href="#" onClick={(e) => { e.preventDefault(); onLogout();}} className="flex items-center p-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                    <Power className="h-6 w-6" />
                    <span className="hidden lg:block ml-4 font-medium">Cerrar Sesión</span>
                </a>
            </div>
        </aside>
    );
};