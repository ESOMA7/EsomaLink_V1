
import React, { useState, useEffect } from 'react';
import { APP_LOGO_URL } from '../../constants';
import { Mail, Lock, LoaderCircle } from 'lucide-react';

interface LoginViewProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string; }>;
  onLoginWithGoogle: () => Promise<{ success: boolean; }>;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onLoginWithGoogle, isLoading, error, setError }) => {
    const [email, setEmail] = useState('test@esomalink.com');
    const [password, setPassword] = useState('password123');

    useEffect(() => {
        // Clear error on input change
        setError(null);
    }, [email, password, setError]);

    const handleIndependentLogin = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(email, password);
    };

    return (
    <div className="flex items-center justify-center w-full h-screen bg-slate-100 dark:bg-slate-900">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl">
        <div className="text-center">
            <img src={APP_LOGO_URL} alt="EsomaLink Logo" className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">EsomaLink</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 -mt-1">versión 1.0</p>
            <p className="mt-4 text-slate-500 dark:text-slate-300">Bienvenido a su centro de control inteligente</p>
        </div>
        
        <form onSubmit={handleIndependentLogin} className="space-y-4">
            <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                        placeholder="Correo Electrónico"
                        disabled={isLoading}
                    />
                </div>
            </div>
             <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                        placeholder="Contraseña"
                        disabled={isLoading}
                    />
                </div>
            </div>
             {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 transform hover:scale-105 disabled:bg-orange-400 disabled:cursor-not-allowed"
                disabled={isLoading}
            >
                {isLoading ? <LoaderCircle className="animate-spin h-5 w-5" /> : 'Iniciar Sesión'}
            </button>
        </form>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-600" />
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">O</span>
            </div>
        </div>

        <div className="flex justify-center">
           <button 
             onClick={onLoginWithGoogle}
             disabled={isLoading}
             className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
           >
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" className="w-5 h-5 mr-3"/>
            Iniciar Sesión con Google
           </button>
        </div>
      </div>
    </div>
    )
}

export default LoginView;
