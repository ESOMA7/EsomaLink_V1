import React, { useState, FormEvent } from 'react';
import { DollarSign, X } from 'lucide-react';

interface AddPaymentModalProps {
    modalState: {
        isOpen: boolean;
    };
    onClose: () => void;
    onSave: (data: { patient: string; whatsapp: string; para: string; amount: number; bank: string; }) => void;
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ modalState, onClose, onSave }) => {
    const { isOpen } = modalState;
    const [patient, setPatient] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [para, setPara] = useState('');
    const [amount, setAmount] = useState('');
    const [bank, setBank] = useState('Bancolombia');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (!patient.trim() || !para.trim() || isNaN(numericAmount) || numericAmount <= 0) {
            return;
        }
        onSave({ 
            patient, 
            whatsapp, 
            para, 
            amount: numericAmount, 
            bank 
        });
        // Reset form
        setPatient('');
        setWhatsapp('');
        setPara('');
        setAmount('');
        setBank('Bancolombia');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <DollarSign className="h-6 w-6 text-orange-500 mr-3" />
                                <h3 className="text-xl leading-6 font-bold text-slate-900 dark:text-slate-100">Añadir Nuevo Pago</h3>
                            </div>
                            <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label htmlFor="payment-patient-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre del Paciente</label>
                                <input 
                                    type="text" 
                                    id="payment-patient-name" 
                                    value={patient} 
                                    onChange={(e) => setPatient(e.target.value)} 
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                    required 
                                />
                            </div>
                            <div>
                                <label htmlFor="payment-whatsapp" className="block text-sm font-medium text-slate-700 dark:text-slate-300">WhatsApp</label>
                                <input 
                                    type="tel" 
                                    id="payment-whatsapp" 
                                    value={whatsapp} 
                                    onChange={(e) => setWhatsapp(e.target.value)} 
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                             <div>
                                <label htmlFor="payment-amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Monto</label>
                                <input 
                                    type="number" 
                                    id="payment-amount" 
                                    value={amount} 
                                    onChange={(e) => setAmount(e.target.value)} 
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                    required 
                                    placeholder="Ej: 150000"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="payment-concept" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Concepto</label>
                                <input 
                                    type="text" 
                                    id="payment-concept" 
                                    value={para} 
                                    onChange={(e) => setPara(e.target.value)} 
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                    required 
                                    placeholder="Ej: Abono Botox"
                                />
                            </div>
                             <div className="sm:col-span-2">
                                <label htmlFor="payment-bank" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Banco / Medio de Pago</label>
                                <select 
                                    id="payment-bank"
                                    value={bank} 
                                    onChange={(e) => setBank(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option>Bancolombia</option>
                                    <option>Davivienda</option>
                                    <option>Nequi</option>
                                    <option>Daviplata</option>
                                    <option>Efectivo</option>
                                    <option>Otro</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 flex justify-end items-center space-x-3">
                        <button type="button" onClick={onClose} className="inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-500 px-4 py-2 bg-white dark:bg-slate-600 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-500 transition-colors">Cancelar</button>
                        <button type="submit" className="inline-flex justify-center rounded-md border border-transparent px-4 py-2 bg-orange-600 text-sm font-medium text-white hover:bg-orange-700 transition-colors">
                            Guardar Pago
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

export default AddPaymentModal;