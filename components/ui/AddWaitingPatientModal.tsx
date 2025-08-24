import React, { useState, useEffect } from 'react';
import { WaitingPatient } from '../../types';
import { X } from 'lucide-react';

interface AddWaitingPatientModalProps {
    modalState: {
        isOpen: boolean;
        patient: WaitingPatient | null;
    };
    onClose: () => void;
    onSave: (data: Omit<WaitingPatient, 'id' | 'fecha' | 'creado_en' | 'id_usuario'>) => void;
}

const AddWaitingPatientModal: React.FC<AddWaitingPatientModalProps> = ({ modalState, onClose, onSave }) => {
    const { isOpen, patient } = modalState;
    
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [caso, setCaso] = useState('');
    const [estado, setEstado] = useState<'Pendiente' | 'En Proceso' | 'Resuelto'>('Pendiente');

    useEffect(() => {
        if (isOpen && patient) {
            setNombre(patient.nombre);
            setTelefono(patient.telefono);
            setCaso(patient.caso);
            setEstado(patient.estado);
        } else {
            setNombre('');
            setTelefono('');
            setCaso('');
            setEstado('Pendiente');
        }
    }, [patient, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim() || !caso.trim()) {
            return;
        }
        const patientData = { nombre, telefono, caso, estado };
        onSave(patientData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{patient ? 'Editar Paciente' : 'Añadir Paciente en Espera'}</h3>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre</label>
                            <input 
                                type="text" 
                                id="nombre" 
                                value={nombre} 
                                onChange={(e) => setNombre(e.target.value)} 
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                required 
                            />
                        </div>
                        <div>
                            <label htmlFor="telefono" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Teléfono</label>
                            <input 
                                type="text" 
                                id="telefono" 
                                value={telefono} 
                                onChange={(e) => setTelefono(e.target.value)} 
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="caso" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Caso</label>
                            <textarea 
                                id="caso" 
                                value={caso} 
                                onChange={(e) => setCaso(e.target.value)} 
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                required 
                                rows={3}
                            />
                        </div>
                        <div>
                            <label htmlFor="estado" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Estado</label>
                            <select 
                                id="estado" 
                                value={estado} 
                                onChange={(e) => setEstado(e.target.value as 'Pendiente' | 'En Proceso' | 'Resuelto')} 
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                required
                            >
                                <option value="Pendiente">Pendiente</option>
                                <option value="En Proceso">En Proceso</option>
                                <option value="Resuelto">Resuelto</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg shadow-sm hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                            {patient ? 'Guardar Cambios' : 'Guardar Paciente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddWaitingPatientModal;
