
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, LayoutDashboard, DollarSign, AlertTriangle, Power, Settings, Sun, Moon, Bell, BellOff, BookText, ClipboardList } from 'lucide-react';
import { View } from '../types';
import { APP_LOGO_URL } from '../constants';

interface SidebarProps {
    currentView: View;
    setCurrentView: (view: View) => void;
    onLogout: () => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    areNotificationsEnabled: boolean;
    onToggleNotifications: () => void;
    newInterventionAvailable: boolean;
}

const navItems = [
    { id: 'dashboard' as View, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'calendar' as View, icon: Calendar, label: 'Calendario' },
    { id: 'payments' as View, icon: DollarSign, label: 'Pagos' },
    { id: 'interventions' as View, icon: AlertTriangle, label: 'Intervenciones' },
    { id: 'notes' as View, icon: BookText, label: 'Notas' },
    { id: 'waiting_patients' as View, icon: ClipboardList, label: 'Pacientes en Espera' },
];

const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`${checked ? 'bg-orange-600' : 'bg-slate-300 dark:bg-slate-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800`}
    >
        <span className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
    </button>
);


export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onLogout, theme, onToggleTheme, areNotificationsEnabled, onToggleNotifications, newInterventionAvailable }) => {
    const isDarkMode = theme === 'dark';
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const settingsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setIsSettingsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                        <li key={item.id} className="px-4 lg:px-6 mb-2">
                            <a 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); setCurrentView(item.id); }} 
                                className={`relative flex items-center p-3 rounded-lg transition-colors duration-200 ${currentView === item.id ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                            >
                                <item.icon className="h-6 w-6 flex-shrink-0" />
                                <span className="hidden lg:block ml-4 font-medium">{item.label}</span>
                                {item.id === 'interventions' && newInterventionAvailable && (
                                    <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-white dark:ring-slate-800"></span>
                                )}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="p-4 lg:p-6 border-t border-slate-200 dark:border-slate-700 mt-auto">
                <div className="relative" ref={settingsRef}>
                    <button onClick={() => setIsSettingsOpen(prev => !prev)} className="w-full flex items-center p-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <Settings className="h-6 w-6" />
                        <span className="hidden lg:block ml-4 font-medium">Configuración</span>
                    </button>
                     {isSettingsOpen && (
                        <div className="absolute left-full ml-2 bottom-0 w-60 bg-white dark:bg-slate-700 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-600 p-4 z-20 lg:left-1/2 lg:-translate-x-1/2 lg:bottom-full lg:mb-2 lg:ml-0">
                           <div className="space-y-4">
                               <div className="flex justify-between items-center">
                                   <div className="flex items-center">
                                       <div className="mr-2">{isDarkMode ? <Moon className="h-5 w-5 text-slate-400" /> : <Sun className="h-5 w-5 text-slate-500"/>}</div>
                                       <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Apariencia Oscura</label>
                                   </div>
                                   <ToggleSwitch checked={isDarkMode} onChange={onToggleTheme} />
                               </div>
                               <div className="flex justify-between items-center">
                                   <div className="flex items-center">
                                        <div className="mr-2">{areNotificationsEnabled ? <Bell className="h-5 w-5 text-slate-500 dark:text-slate-400"/> : <BellOff className="h-5 w-5 text-slate-500 dark:text-slate-400"/>}</div>
                                       <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Notificaciones Sonoras</label>
                                   </div>
                                   <ToggleSwitch checked={areNotificationsEnabled} onChange={onToggleNotifications} />
                               </div>
                           </div>
                        </div>
                    )}
                </div>
                <a href="#" onClick={(e) => { e.preventDefault(); onLogout();}} className="mt-2 flex items-center p-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                    <Power className="h-6 w-6" />
                    <span className="hidden lg:block ml-4 font-medium">Cerrar Sesión</span>
                </a>
            </div>
        </aside>
    );
};