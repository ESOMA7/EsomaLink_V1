import React, { useState, useEffect, useRef } from 'react';
import { Intervention } from '../../types';
import { MessageSquare, Trash2, Sparkles, Filter, Users, PlusCircle } from 'lucide-react';
import { TableViewSkeleton } from '../ui/LoadingSkeletons';
import { ErrorMessage } from '../ui/ErrorMessage';

interface InterventionsViewProps {
    interventions: Intervention[];
    onUpdateStatus: (id: number, estado: Intervention['estado']) => void;
    onDelete: (id: number, nombre: string) => void;
    onGenerateResponse: (intervention: Intervention) => void;
    onAdd: () => void;
    onEdit: (intervention: Intervention) => void;
    isLoading: boolean;
    error: Error | null;
    selectedIds: number[];
    onSelectionChange: (ids: number[]) => void;
    onDeleteSelected: () => void;
}

const statusColors: Record<Intervention['estado'], string> = {
    'Resuelto': 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
    'En Proceso': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
    'Pendiente': 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
};

const InterventionsView: React.FC<InterventionsViewProps> = ({ interventions, onUpdateStatus, onDelete, onGenerateResponse, onAdd, onEdit, isLoading, error, selectedIds, onSelectionChange, onDeleteSelected }) => {
    const [filter, setFilter] = useState<Intervention['estado'] | 'Todos'>('Todos');
    const checkboxRef = useRef<HTMLInputElement>(null);

    const filteredInterventions = interventions.filter(i => filter === 'Todos' || i.estado === filter);

    useEffect(() => {
        if (checkboxRef.current) {
            const numSelected = selectedIds.length;
            const numInterventions = filteredInterventions.length;
            checkboxRef.current.indeterminate = numSelected > 0 && numSelected < numInterventions;
        }
    }, [selectedIds, filteredInterventions.length]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const allIds = filteredInterventions.map(i => i.id);
        onSelectionChange(e.target.checked ? allIds : []);
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
        e.stopPropagation();
        if (e.target.checked) {
            onSelectionChange([...selectedIds, id]);
        } else {
            onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
        }
    };

    
    const handleWhatsappClick = (e: React.MouseEvent, numeros: string) => {
        e.stopPropagation();
        const cleanPhone = numeros.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/57${cleanPhone}`, '_blank');
    };

    return (
        <div className="flex flex-col h-full">
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
                    {selectedIds.length > 0 && (
                        <button 
                            onClick={onDeleteSelected}
                            className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Trash2 className="h-5 w-5 mr-2" />
                            Eliminar ({selectedIds.length})
                        </button>
                    )}
                     <button 
                        onClick={onAdd}
                        className="inline-flex items-center justify-center px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg shadow-sm hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                        <PlusCircle className="h-5 w-5 mr-2" />
                        Añadir Intervención
                    </button>
                </div>
            </div>

            <div className="flex-grow bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-auto">
                {isLoading ? (
                    <TableViewSkeleton />
                ) : error ? (
                    <ErrorMessage message={error.message} />
                ) : (
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700">
                            <tr>
                                <th scope="col" className="p-4">
                                    <div className="flex items-center">
                                        <input
                                            id="checkbox-all"
                                            type="checkbox"
                                            ref={checkboxRef}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            checked={filteredInterventions.length > 0 && selectedIds.length === filteredInterventions.length}
                                            onChange={handleSelectAll}
                                        />
                                        <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Nombre</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Caso</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Fecha</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Estado</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredInterventions.length > 0 ? filteredInterventions.map((intervention) => (
                                <tr key={intervention.id} onClick={() => onEdit(intervention)} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer ${selectedIds.includes(intervention.id) ? 'bg-orange-50 dark:bg-orange-900/20' : ''}`}>
                                    <td className="w-4 p-4">
                                     <div className="flex items-center">
                                         <input
                                             id={`checkbox-table-${intervention.id}`}
                                             type="checkbox"
                                             className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                             checked={selectedIds.includes(intervention.id)}
                                             onChange={(e) => handleSelectOne(e, intervention.id)}
                                             onClick={(e) => e.stopPropagation()}
                                         />
                                         <label htmlFor={`checkbox-table-${intervention.id}`} className="sr-only">checkbox</label>
                                     </div>
                                 </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                                                    <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-slate-900 dark:text-slate-300">{intervention.nombre}</div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">{intervention.numeros}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-900 dark:text-slate-300 max-w-xs truncate">{intervention.caso}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{intervention.fecha}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                         <select
                                            value={intervention.estado}
                                            onChange={(e) => onUpdateStatus(intervention.id, e.target.value as Intervention['estado'])}
                                            onClick={(e) => e.stopPropagation()}
                                            className={`text-xs font-semibold rounded-full px-3 py-1 border-none focus:ring-2 focus:ring-offset-1 dark:bg-transparent ${statusColors[intervention.estado]} ${intervention.estado === 'Resuelto' ? 'focus:ring-green-500' : intervention.estado === 'En Proceso' ? 'focus:ring-yellow-500' : 'focus:ring-red-500'}`}
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
                                            <button onClick={(e) => handleWhatsappClick(e, intervention.numeros)} className="p-2 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/50 rounded-full transition-colors" title="Contactar por WhatsApp">
                                                <MessageSquare className="h-5 w-5" />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); onDelete(intervention.id, intervention.nombre); }} className="p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50 rounded-full transition-colors" title="Eliminar Intervención">
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-slate-500 dark:text-slate-400">
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
