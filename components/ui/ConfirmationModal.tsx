import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
    modalState: {
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: (() => void) | null;
    };
    setModalState: (state: { isOpen: boolean; title: string; message: string; onConfirm: (() => void) | null }) => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ modalState, setModalState }) => {
    if (!modalState.isOpen) return null;

    const handleConfirm = () => {
        if (modalState.onConfirm) {
            modalState.onConfirm();
        }
    };

    const handleCancel = () => {
        setModalState({ isOpen: false, title: '', message: '', onConfirm: null });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-md transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
                <div className="p-6">
                    <div className="flex items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="ml-4 text-left flex-grow">
                            <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-slate-100">{modalState.title}</h3>
                            <div className="mt-2">
                                <p className="text-sm text-slate-600 dark:text-slate-300">{modalState.message}</p>
                            </div>
                        </div>
                         <button onClick={handleCancel} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-3 sm:px-6 flex flex-row-reverse">
                    <button 
                        type="button" 
                        onClick={handleConfirm} 
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Confirmar
                    </button>
                    <button 
                        type="button" 
                        onClick={handleCancel} 
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-800 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fade-in-scale {
                    0% { transform: scale(0.95); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-fade-in-scale {
                    animation: fade-in-scale 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ConfirmationModal;