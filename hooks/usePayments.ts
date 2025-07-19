
import { useState, useEffect, useCallback } from 'react';
import { Payment } from '../types';
import { initialPayments } from '../constants';

export const usePayments = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        // Simulate fetching data
        setIsLoading(true);
        setTimeout(() => {
            try {
                setPayments(initialPayments);
                setError(null);
            } catch (e) {
                setError("Error al cargar los datos de los pagos.");
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }, 1200);
    }, []);

    const savePayment = useCallback(async (data: Omit<Payment, 'id' | 'date' | 'transaction_id'>) => {
        const newPayment: Payment = {
            id: Date.now(),
            ...data,
            transaction_id: `TXN${Date.now().toString().slice(-6)}`,
            date: new Date().toISOString().split('T')[0],
        };
        setPayments(prev => [newPayment, ...prev]);
        return { success: true };
    }, []);
    
    const deletePayment = useCallback(async (paymentId: number) => {
        setPayments(prev => prev.filter(p => p.id !== paymentId));
        return { success: true };
    }, []);
    
    return { payments, isLoading, error, savePayment, deletePayment };
};