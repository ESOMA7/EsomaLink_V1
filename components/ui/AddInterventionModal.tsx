
import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Intervention } from '../../types';

interface InterventionModalProps {
    modalState: {
        isOpen: boolean;
        intervention: Intervention | null;
    };
    onClose: () => void;
    onSave: (data: Omit<Intervention, 'id' | 'created_at' | 'updated_at'> & { id?: number }) => void;
}

const InterventionModal: React.FC<InterventionModalProps> = ({ modalState, onClose, onSave }) => {
    const { isOpen, intervention } = modalState;
    const [nombre, setNombre] = useState('');
    const [numeros, setNumeros] = useState('');
    const [caso, setCaso] = useState('');
    const [fecha, setFecha] = useState('');
    const [estado, setEstado] = useState<'Pendiente' | 'En Proceso' | 'Resuelto'>('Pendiente');

    useEffect(() => {
        if (!isOpen) return;

        if (intervention) {
            setNombre(intervention.nombre);
            setNumeros(intervention.numeros);
            setCaso(intervention.caso);
            setFecha(intervention.fecha);
            setEstado(intervention.estado);
        } else {
            // Reset for new intervention
            setNombre('');
            setNumeros('');
            setCaso('');
            setFecha(new Date().toISOString().split('T')[0]);
            setEstado('Pendiente');
        }
    }, [isOpen, intervention]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim() || !caso.trim() || !fecha.trim()) {
            return;
        }
        onSave({
            id: intervention?.id,
            nombre,
            numeros,
            fecha,
            caso,
            estado
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
                                <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre</label>
                                <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" required />
                            </div>
                            <div>
                                <label htmlFor="numeros" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Números</label>
                                <input type="text" id="numeros" value={numeros} onChange={(e) => setNumeros(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="fecha" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label>
                                <input type="date" id="fecha" value={fecha} onChange={(e) => setFecha(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" required />
                            </div>
                            <div>
                                <label htmlFor="caso" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Caso</label>
                                <textarea id="caso" value={caso} onChange={(e) => setCaso(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" required />
                            </div>
                            <div>
                                <label htmlFor="estado" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Estado</label>
                                <select id="estado" value={estado} onChange={(e) => setEstado(e.target.value as typeof estado)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm">
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="En Proceso">En Proceso</option>
                                    <option value="Resuelto">Resuelto</option>
                                </select>
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