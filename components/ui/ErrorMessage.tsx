
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center h-full p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
        <AlertCircle className="w-12 h-12 mb-4" />
        <h3 className="text-xl font-semibold">Ocurrió un Error</h3>
        <p className="mt-2 text-center">{message}</p>
        {onRetry && (
            <button
                onClick={onRetry}
                className="mt-6 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700 transition-colors"
            >
                Reintentar
            </button>
        )}
    </div>
);
