import React from 'react';
import { Payment } from '../../types';
import { Trash2, PlusCircle } from 'lucide-react';
import { TableViewSkeleton } from '../ui/LoadingSkeletons';
import { ErrorMessage } from '../ui/ErrorMessage';

interface PaymentsViewProps {
    payments: Payment[];
    onDelete: (id: number, patientName: string) => void;
    onAdd: () => void;
    isLoading: boolean;
    error: string | null;
}

const PaymentsView: React.FC<PaymentsViewProps> = ({ payments, onDelete, onAdd, isLoading, error }) => {
    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Registros de Pago</h2>
                <button 
                    onClick={onAdd}
                    className="inline-flex items-center justify-center px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg shadow-sm hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Añadir Pago
                </button>
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
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">ID Transacción</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Paciente</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Monto</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Banco</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Fecha</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {payments.length > 0 ? payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-mono text-slate-500 dark:text-slate-400">{payment.transaction_id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{payment.patient}</div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">{payment.whatsapp}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-green-700 dark:text-green-400 font-semibold">${payment.amount.toLocaleString('es-CO')}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">
                                            {payment.bank}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{payment.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button 
                                            onClick={() => onDelete(payment.id, payment.patient)}
                                            className="p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50 rounded-full transition-colors"
                                            title="Eliminar Pago"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-slate-500 dark:text-slate-400">
                                        No hay registros de pago.
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

export default PaymentsView;