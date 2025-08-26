import React, { useState, useEffect } from 'react';
import { Payment } from '../../types';
import { X } from 'lucide-react';

interface AddPaymentModalProps {
    modalState: {
        isOpen: boolean;
        payment: Payment | null;
    };
    onClose: () => void;
    onSave: (data: Omit<Payment, 'id' | 'fecha' | 'referencia' | 'creado_en' | 'id_usuario'> & { id?: number }) => void;
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ modalState, onClose, onSave }) => {
    const bankOptions = [
        'Bancolombia',
        'Nequi',
        'Daviplata',
        'Davivienda',
        'Banco de Bogotá',
        'BBVA',
        'Banco Agrario',
        'Otro'
    ];
    const { isOpen, payment } = modalState;
    
    const [nombre, setNombre] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [concepto, setConcepto] = useState('');
    const [valor, setValor] = useState<number | ''>('');
    const [banco, setBanco] = useState('');

    useEffect(() => {
        if (isOpen && payment) {
            setNombre(payment.nombre);
            setWhatsapp(payment.whatsapp);
            setConcepto(payment.concepto);
            setValor(payment.valor);
            setBanco(payment.banco);
        } else {
            setNombre('');
            setWhatsapp('');
            setConcepto('');
            setValor('');
            setBanco('');
        }
    }, [payment, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim() || !concepto.trim() || valor === '' || Number(valor) <= 0 || !banco.trim()) {
            return;
        }
        const paymentData: Omit<Payment, 'id' | 'fecha' | 'referencia' | 'creado_en' | 'id_usuario'> & { id?: number } = { 
            nombre, 
            whatsapp, 
            concepto, 
            valor: Number(valor), 
            banco 
        };

        if (payment && payment.id) {
            paymentData.id = payment.id;
        }

        onSave(paymentData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{payment ? 'Editar Pago' : 'Añadir Nuevo Pago'}</h3>
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
                            <label htmlFor="whatsapp" className="block text-sm font-medium text-slate-700 dark:text-slate-300">WhatsApp</label>
                            <input 
                                type="text" 
                                id="whatsapp" 
                                value={whatsapp} 
                                onChange={(e) => setWhatsapp(e.target.value)} 
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="concepto" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Concepto</label>
                            <input 
                                type="text" 
                                id="concepto" 
                                value={concepto} 
                                onChange={(e) => setConcepto(e.target.value)} 
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                required 
                            />
                        </div>
                        <div>
                            <label htmlFor="valor" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Valor</label>
                            <input 
                                type="number" 
                                id="valor" 
                                value={valor} 
                                onChange={(e) => setValor(e.target.value === '' ? '' : Number(e.target.value))} 
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                required 
                                placeholder="Ej: 150000"
                            />
                        </div>
                                                <div>
                            <label htmlFor="banco" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Banco</label>
                            <select 
                                id="banco" 
                                value={banco} 
                                onChange={(e) => setBanco(e.target.value)} 
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                required
                            >
                                <option value="" disabled>Selecciona un banco</option>
                                {bankOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg shadow-sm hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                            {payment ? 'Guardar Cambios' : 'Guardar Pago'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPaymentModal;