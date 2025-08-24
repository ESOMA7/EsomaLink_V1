import { useState, useEffect, useCallback } from 'react';
import { WaitingPatient } from '../types';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './useAuth';

export const useWaitingPatients = () => {
    const { user } = useAuth();
    const [waitingPatients, setWaitingPatients] = useState<WaitingPatient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWaitingPatients = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('waiting_patients')
                .select('*')
                .eq('id_usuario', user.id)
                .order('fecha', { ascending: false });

            if (fetchError) throw fetchError;
            setWaitingPatients(data || []);
        } catch (e: any) {
            setError('Error al cargar los pacientes en espera: ' + e.message);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchWaitingPatients();
        }
    }, [user, fetchWaitingPatients]);

    const saveWaitingPatient = useCallback(async (patientData: Omit<WaitingPatient, 'id' | 'fecha' | 'creado_en' | 'id_usuario'>) => {
        if (!user) return { success: false };
        const newPatient = {
            ...patientData,
            fecha: new Date().toISOString().split('T')[0],
            id_usuario: user.id,
        };
        const { error: insertError } = await supabase.from('waiting_patients').insert(newPatient);
        if (insertError) {
            setError('Error al guardar el paciente: ' + insertError.message);
            return { success: false };
        }
        await fetchWaitingPatients();
        return { success: true };
    }, [user, fetchWaitingPatients]);

    const updateWaitingPatient = useCallback(async (patientToUpdate: WaitingPatient) => {
        if (!user) return { success: false };
        const { error: updateError } = await supabase
            .from('waiting_patients')
            .update({
                nombre: patientToUpdate.nombre,
                telefono: patientToUpdate.telefono,
                caso: patientToUpdate.caso,
                estado: patientToUpdate.estado,
            })
            .eq('id', patientToUpdate.id)
            .eq('id_usuario', user.id);

        if (updateError) {
            setError('Error al actualizar el paciente: ' + updateError.message);
            return { success: false };
        }
        await fetchWaitingPatients();
        return { success: true };
    }, [user, fetchWaitingPatients]);

    const deleteWaitingPatient = useCallback(async (patientId: number) => {
        if (!user) return { success: false };
        const { error: deleteError } = await supabase
            .from('waiting_patients')
            .delete()
            .eq('id', patientId)
            .eq('id_usuario', user.id);

        if (deleteError) {
            setError('Error al eliminar el paciente: ' + deleteError.message);
            return { success: false };
        }
        setWaitingPatients(prev => prev.filter(p => p.id !== patientId));
        return { success: true };
    }, [user]);

    return { waitingPatients, isLoading, error, fetchWaitingPatients, saveWaitingPatient, updateWaitingPatient, deleteWaitingPatient };
};
