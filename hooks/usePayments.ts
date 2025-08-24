
import { useState, useEffect, useCallback } from 'react';
import { Payment } from '../types';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './useAuth';

export const usePayments = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPayments = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('payments')
                .select('*')
                .eq('id_usuario', user.id)
                .order('fecha', { ascending: false });

            if (fetchError) throw fetchError;

            setPayments(data || []);
        } catch (e: any) {
            setError('Error al cargar los pagos: ' + e.message);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchPayments();
        }
    }, [user, fetchPayments]);

    const savePayment = useCallback(async (paymentData: Omit<Payment, 'id' | 'fecha' | 'referencia' | 'creado_en' | 'id_usuario'>) => {
        if (!user) return { success: false };

        const newPayment = {
            ...paymentData,
            referencia: `TXN${Date.now().toString().slice(-6)}`,
            fecha: new Date().toISOString().split('T')[0],
            id_usuario: user.id,
        };

        const { error: insertError } = await supabase.from('payments').insert(newPayment);

        if (insertError) {
            setError('Error al guardar el pago: ' + insertError.message);
            return { success: false };
        }

        await fetchPayments();
        return { success: true };
    }, [user, fetchPayments]);

    const updatePayment = useCallback(async (paymentToUpdate: Payment) => {
        if (!user) return { success: false };

        const { error: updateError } = await supabase
            .from('payments')
            .update({
                nombre: paymentToUpdate.nombre,
                whatsapp: paymentToUpdate.whatsapp,
                concepto: paymentToUpdate.concepto,
                valor: paymentToUpdate.valor,
                banco: paymentToUpdate.banco,
            })
            .eq('id', paymentToUpdate.id)
            .eq('id_usuario', user.id);

        if (updateError) {
            setError('Error al actualizar el pago: ' + updateError.message);
            return { success: false };
        }

        await fetchPayments();
        return { success: true };
    }, [user, fetchPayments]);

    const deletePayment = useCallback(async (paymentId: number) => {
        if (!user) return { success: false };

        const { error: deleteError } = await supabase
            .from('payments')
            .delete()
            .eq('id', paymentId)
            .eq('id_usuario', user.id);

        if (deleteError) {
            setError('Error al eliminar el pago: ' + deleteError.message);
            return { success: false };
        }

        setPayments(prev => prev.filter(p => p.id !== paymentId));
        return { success: true };
    }, [user]);

    return { payments, isLoading, error, fetchPayments, savePayment, updatePayment, deletePayment };
};