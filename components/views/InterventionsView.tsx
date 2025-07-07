
import React, { useState } from 'react';
import { Intervention } from '../../types';
import { MessageSquare, Trash2, Sparkles, Filter, Users, PlusCircle } from 'lucide-react';
import { TableViewSkeleton } from '../ui/LoadingSkeletons';
import { ErrorMessage } from '../ui/ErrorMessage';

interface InterventionsViewProps {
    interventions: Intervention[];
    onUpdateStatus: (id: number, status: Intervention['status']) => void;
    onDelete: (id: number, patientName: string) => void;
    onGenerateResponse: (intervention: Intervention) => void;
    onAdd: () => void;
    onEdit: (intervention: Intervention) => void;
    isLoading: boolean;
    error: string | null;
}

const statusColors: Record<Intervention['status'], string> = {
    'Resuelto': 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
    'En Proceso': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
    'Pendiente': 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
};

const InterventionsView: React.FC<InterventionsViewProps> = ({ interventions, onUpdateStatus, onDelete, onGenerateResponse, onAdd, onEdit, isLoading, error }) => {
    const [filter, setFilter] = useState<Intervention['status'] | 'Todos'>('Todos');

    const filteredInterventions = interventions.filter(i => filter === 'Todos' || i.status === filter);
    
    const handleWhatsappClick = (e: React.MouseEvent, phone: string) => {
        e.stopPropagation();
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/57${cleanPhone}`, '_blank');
    };

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Gestión de Intervenciones</h2>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <Filter className="h-5 w-5 text-slate-500 dark:text-slate-400 mr-2" />
                        <select 
                            value={filter} 
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                        >
                            <option value="Todos">Todos los Estados</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="En Proceso">En Proceso</option>
                            <option value="Resuelto">Resuelto</option>
                        </select>
                    </div>
                     <button 
                        onClick={onAdd}
                        className="inline-flex items-center justify-center px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg shadow-sm hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                        <PlusCircle className="h-5 w-5 mr-2" />
                        Añadir Intervención
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto">
                {isLoading ? (
                    <TableViewSkeleton />
                ) : error ? (
                    <ErrorMessage message={error} />
                ) : (
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Paciente</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Motivo</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Fecha</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Estado</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredInterventions.length > 0 ? filteredInterventions.map((intervention) => (
                                <tr 
                                    key={intervention.id} 
                                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                                    onClick={() => onEdit(intervention)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                                <Users className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{intervention.patient}</div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">{intervention.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-900 dark:text-slate-300 max-w-xs truncate">{intervention.reason}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{intervention.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                         <select
                                            value={intervention.status}
                                            onChange={(e) => onUpdateStatus(intervention.id, e.target.value as Intervention['status'])}
                                            onClick={(e) => e.stopPropagation()}
                                            className={`text-xs font-semibold rounded-full px-3 py-1 border-none focus:ring-2 focus:ring-offset-1 dark:bg-transparent ${statusColors[intervention.status]} ${intervention.status === 'Resuelto' ? 'focus:ring-green-500' : intervention.status === 'En Proceso' ? 'focus:ring-yellow-500' : 'focus:ring-red-500'}`}
                                        >
                                            <option value="Pendiente">Pendiente</option>
                                            <option value="En Proceso">En Proceso</option>
                                            <option value="Resuelto">Resuelto</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button onClick={(e) => { e.stopPropagation(); onGenerateResponse(intervention); }} className="p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-full transition-colors" title="Generar Respuesta con IA">
                                                <Sparkles className="h-5 w-5" />
                                            </button>
                                            <button onClick={(e) => handleWhatsappClick(e, intervention.phone)} className="p-2 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/50 rounded-full transition-colors" title="Contactar por WhatsApp">
                                                <MessageSquare className="h-5 w-5" />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); onDelete(intervention.id, intervention.patient); }} className="p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50 rounded-full transition-colors" title="Eliminar Intervención">
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-slate-500 dark:text-slate-400">
                                        No hay intervenciones que coincidan con el filtro.
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

export default InterventionsView;
