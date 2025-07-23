
import React from 'react';
import { Switch } from '../ui/switch';
import { TestTubeDiagonal } from 'lucide-react';

interface SettingsViewProps {
  areNotificationsEnabled: boolean;
  onToggleNotifications: () => void;
  onTestNewIntervention: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  areNotificationsEnabled, 
  onToggleNotifications, 
  onTestNewIntervention,
  theme,
  onToggleTheme
}) => {
  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-200">Configuración</h2>
      
      <div className="space-y-6">
        {/* General Settings */}
        <div className="p-4 border rounded-lg dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-300">General</h3>
          <div className="flex items-center justify-between">
            <label htmlFor="theme-toggle" className="text-slate-600 dark:text-slate-400">Tema Oscuro</label>
            <Switch
              checked={theme === 'dark'}
              onChange={onToggleTheme}
            />
          </div>
        </div>

        {/* Notification Settings */}
        <div className="p-4 border rounded-lg dark:border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-300">Notificaciones</h3>
            <div className="flex items-center justify-between mb-4">
                <label htmlFor="notifications-toggle" className="text-slate-600 dark:text-slate-400">Habilitar notificaciones</label>
                <Switch
                checked={areNotificationsEnabled}
                onChange={onToggleNotifications}
                />
            </div>
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">Probar sonido de notificación.</p>
                <button 
                    onClick={onTestNewIntervention} 
                    className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                    <TestTubeDiagonal className="h-4 w-4" />
                    <span>Probar</span>
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsView;
