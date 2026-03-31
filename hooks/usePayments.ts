
import { useState, useEffect, useCallback } from 'react';
import { Payment } from '../types';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './useAuth';

// --- CACHÉ EN MEMORIA PARA SOLUCIONAR PANTALLAS BLANCAS ---
const paymentsCache = { data: null as Payment[] | null, timestamp: 0 };
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutos

export const usePayments = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPayments = useCallback(async () => {
        if (!user) return;

        const isCacheValid = paymentsCache.data && (Date.now() - paymentsCache.timestamp < CACHE_TTL_MS);

        if (isCacheValid) {
            setPayments(paymentsCache.data!);
            setIsLoading(false); // Carga instantánea desde memoria
        } else {
            setIsLoading(!paymentsCache.data); // Muestra esqueleto solo si nunca había cargado
        }

        try {
            setError(null);
            const { data, error: fetchError } = await supabase
                .from('payments')
                .select('*')
                .order('fecha', { ascending: false });

            if (fetchError) throw fetchError;

            const fetchedData = data || [];
            setPayments(fetchedData);
            
            // Actualizar la caché global
            paymentsCache.data = fetchedData;
            paymentsCache.timestamp = Date.now();
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

            const channel = supabase.channel('realtime-payments');
            channel
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'payments' }, (payload) => {
                    setPayments(currentPayments => [payload.new as Payment, ...currentPayments]);
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user, fetchPayments]);

    const savePayment = useCallback(async (paymentData: Omit<Payment, 'fecha' | 'referencia' | 'creado_en' | 'id_usuario'> & { id?: number }) => {
        if (!user) return { success: false };

        if (paymentData.id) {
            // Update existing payment
            const { error: updateError } = await supabase
                .from('payments')
                .update({
                    nombre: paymentData.nombre,
                    whatsapp: paymentData.whatsapp,
                    concepto: paymentData.concepto,
                    valor: paymentData.valor,
                    banco: paymentData.banco,
                })
                .eq('id', paymentData.id);

            if (updateError) {
                setError('Error al actualizar el pago: ' + updateError.message);
                return { success: false };
            }
        } else {
            // Create new payment
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
        }

        await fetchPayments();
        return { success: true };
    }, [user, fetchPayments]);

    const deletePayment = useCallback(async (paymentId: number) => {
        setPayments(prev => prev.filter(p => p.id !== paymentId));

        const { error: deleteError } = await supabase
            .from('payments')
            .delete()
            .eq('id', paymentId);

        if (deleteError) {
            setError('Error al eliminar el pago: ' + deleteError.message);
            fetchPayments(); // Revert optimistic update
            return { success: false };
        }

        return { success: true };
    }, [fetchPayments]);

    return { payments, isLoading, error, fetchPayments, savePayment, deletePayment };
};