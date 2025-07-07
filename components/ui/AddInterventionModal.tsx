
import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Intervention } from '../../types';

interface InterventionModalProps {
    modalState: {
        isOpen: boolean;
        intervention: Intervention | null;
    };
    onClose: () => void;
    onSave: (data: { id?: number; patient: string; phone: string; reason: string; }) => void;
}

const InterventionModal: React.FC<InterventionModalProps> = ({ modalState, onClose, onSave }) => {
    const { isOpen, intervention } = modalState;
    const [patient, setPatient] = useState('');
    const [phone, setPhone] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (!isOpen) return;

        if (intervention) {
            setPatient(intervention.patient);
            setPhone(intervention.phone);
            setReason(intervention.reason);
        } else {
            // Reset for new intervention
            setPatient('');
            setPhone('');
            setReason('');
        }
    }, [isOpen, intervention]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!patient.trim() || !reason.trim()) {
            // Phone is optional for now
            return;
        }
        onSave({ 
            id: intervention?.id,
            patient, 
            phone, 
            reason 
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <AlertTriangle className="h-6 w-6 text-orange-500 mr-3" />
                                <h3 className="text-xl leading-6 font-bold text-slate-900 dark:text-slate-100">
                                    {intervention ? 'Editar Intervención' : 'Añadir Nueva Intervención'}
                                </h3>
                            </div>
                            <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="patient-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre del Paciente/Cliente</label>
                                <input 
                                    type="text" 
                                    id="patient-name" 
                                    value={patient} 
                                    onChange={(e) => setPatient(e.target.value)} 
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                    required 
                                />
                            </div>
                            <div>
                                <label htmlFor="phone-number" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Teléfono de Contacto (Opcional)</label>
                                <input 
                                    type="tel" 
                                    id="phone-number" 
                                    value={phone} 
                                    onChange={(e) => setPhone(e.target.value)} 
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="reason" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Motivo / Tarea</label>
                                <textarea 
                                    id="reason" 
                                    value={reason} 
                                    onChange={(e) => setReason(e.target.value)} 
                                    rows={4} 
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                    required 
                                />
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 flex justify-end items-center space-x-3">
                        <button type="button" onClick={onClose} className="inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-500 px-4 py-2 bg-white dark:bg-slate-600 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-500 transition-colors">Cancelar</button>
                        <button type="submit" className="inline-flex justify-center rounded-md border border-transparent px-4 py-2 bg-orange-600 text-sm font-medium text-white hover:bg-orange-700 transition-colors">
                            {intervention ? 'Guardar Cambios' : 'Guardar Intervención'}
                        </button>
                    </div>
                </form>
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

export default InterventionModal;