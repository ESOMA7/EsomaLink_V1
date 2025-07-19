
import React, { useState } from 'react';
import { APP_LOGO_URL } from '../../constants';
import { LoaderCircle } from 'lucide-react';

interface LoginViewProps {
  onLoginWithGoogle: () => Promise<{ success: boolean; }>;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginWithGoogle, isLoading, error, setError }) => {
    const [rememberMe, setRememberMe] = useState(true);

    const handleGoogleLoginClick = () => {
        setError(null); // Clear previous errors on a new attempt
        onLoginWithGoogle();
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
        
        <div className="pt-2 space-y-6">
            <button 
                onClick={handleGoogleLoginClick}
                disabled={isLoading}
                className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading 
                    ? <LoaderCircle className="animate-spin h-5 w-5 text-slate-500" /> 
                    : <>
                        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" className="w-5 h-5 mr-3"/>
                        Iniciar Sesión con Google
                      </>
                }
            </button>
            <div className="flex items-center justify-center">
                <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 dark:bg-slate-700 dark:border-slate-600 dark:focus:ring-orange-600 dark:ring-offset-slate-800"
                    disabled={isLoading}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900 dark:text-slate-300">
                    Recordar sesión
                </label>
            </div>
        </div>

        {error && <p className="text-sm text-red-500 text-center !-mt-2">{error}</p>}

      </div>
    </div>
    );
};

export default LoginView;