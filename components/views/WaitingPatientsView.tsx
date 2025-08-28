import React from 'react';
import { WaitingPatient } from '../../types';
import { PlusCircle, Edit, Trash2, RefreshCw } from 'lucide-react';
import { TableViewSkeleton } from '../ui/LoadingSkeletons';
import { ErrorMessage } from '../ui/ErrorMessage';
import ExpandableText from '../ui/ExpandableText';

interface WaitingPatientsViewProps {
    patients: WaitingPatient[];
    onDelete: (id: number, nombre: string) => void;
    onEdit: (patient: WaitingPatient) => void;
    onAdd: () => void;
    onUpdateStatus: (id: number, estado: WaitingPatient['estado']) => void;
    isLoading: boolean;
    error: string | null;
    fetchWaitingPatients: () => void;
}

const WaitingPatientsView: React.FC<WaitingPatientsViewProps> = ({ patients, onDelete, onEdit, onAdd, onUpdateStatus, isLoading, error, fetchWaitingPatients }) => {
    const getStatusChip = (status: string) => {
        switch (status) {
            case 'Pendiente':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300';
            case 'En Proceso':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300';
            case 'Resuelto':
                return 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300';
            default:
                return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Pacientes en Espera</h2>
                <div className="flex items-center justify-end space-x-4">
                    <button 
                        onClick={fetchWaitingPatients} 
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>{isLoading ? 'Cargando...' : 'Actualizar'}</span>
                    </button>
                    <button 
                        onClick={onAdd}
                        className="inline-flex items-center justify-center px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg shadow-sm hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                        <PlusCircle className="h-5 w-5 mr-2" />
                        Añadir Paciente
                    </button>
                </div>
            </div>
            <div className="flex-grow bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-auto">
                {isLoading ? (
                    <TableViewSkeleton />
                ) : error ? (
                    <ErrorMessage message={error} />
                ) : (
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Nombre</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Teléfono</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Caso</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Fecha</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Estado</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {patients.length > 0 ? patients.map((patient) => (
                                <tr key={patient.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{patient.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{patient.nombre}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{patient.telefono}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400"><ExpandableText text={patient.caso} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{patient.fecha}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <select
                                            value={patient.estado}
                                            onChange={(e) => onUpdateStatus(patient.id, e.target.value as WaitingPatient['estado'])}
                                            onClick={(e) => e.stopPropagation()}
                                            className={`text-xs font-semibold rounded-full px-3 py-1 border-none focus:ring-2 focus:ring-offset-1 dark:bg-transparent ${getStatusChip(patient.estado)}`}
                                        >
                                            <option value="Pendiente">Pendiente</option>
                                            <option value="En Proceso">En Proceso</option>
                                            <option value="Resuelto">Resuelto</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center flex items-center justify-center space-x-2">
                                        <button 
                                            onClick={() => onEdit(patient)}
                                            className="p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-full transition-colors"
                                            title="Editar Paciente"
                                        >
                                            <Edit className="h-5 w-5" />
                                        </button>
                                        <button 
                                            onClick={() => onDelete(patient.id, patient.nombre)}
                                            className="p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50 rounded-full transition-colors"
                                            title="Eliminar Paciente"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-slate-500 dark:text-slate-400">
                                        No hay pacientes en espera.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default WaitingPatientsView;
