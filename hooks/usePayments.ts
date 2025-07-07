
import { useState, useEffect, useCallback } from 'react';
import { Payment } from '../types';
import { initialPayments } from '../constants';

export const usePayments = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchPayments = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 900));
                setPayments(initialPayments);
            } catch (err) {
                setError("No se pudieron cargar los pagos.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchPayments();
    }, []);

    const savePayment = useCallback(async (data: Omit<Payment, 'id' | 'date'>) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const newPayment: Payment = {
            ...data,
            id: `TXN${Date.now().toString().slice(-6)}`,
            date: new Date().toISOString().split('T')[0],
        };
        setPayments(prev => [newPayment, ...prev]);
        return { success: true };
    }, []);
    
    const deletePayment = useCallback(async (paymentId: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        setPayments(prev => prev.filter(p => p.id !== paymentId));
        return { success: true };
    }, []);
    
    return { payments, isLoading, error, savePayment, deletePayment };
};
