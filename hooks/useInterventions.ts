
import { useState, useEffect, useCallback } from 'react';
import { Intervention } from '../types';
import { supabase } from '../services/supabaseClient';

interface UseInterventionsProps {
    onNewIntervention?: () => void;
}

export const useInterventions = ({ onNewIntervention }: UseInterventionsProps = {}) => {
    const [interventions, setInterventions] = useState<Intervention[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInterventions = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('interventions')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            setInterventions(data || []);
        } catch (e) {
            setError('Error al cargar las intervenciones.');
            console.error('Error fetching interventions:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInterventions();

        const channel = supabase
            .channel('interventions-realtime')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'interventions' },
                (payload) => {
                    const newIntervention = payload.new as Intervention;
                    setInterventions(prev => [newIntervention, ...prev]);
                    if (onNewIntervention) {
                        onNewIntervention();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchInterventions, onNewIntervention]);

    const saveIntervention = useCallback(async (interventionData: Omit<Intervention, 'id' | 'created_at' | 'updated_at'> & { id?: number }) => {
        try {
            // If an ID exists, it's an update operation.
            if (interventionData.id) {
                const { id, ...dataToUpdate } = interventionData;
                const { error: updateError } = await supabase
                    .from('interventions')
                    .update(dataToUpdate)
                    .eq('id', id);

                if (updateError) throw updateError;
            } else {
                // If no ID exists, it's a create operation.
                // We explicitly exclude 'id' from the object to be inserted.
                const { id, ...dataToInsert } = interventionData;
                const { error: insertError } = await supabase
                    .from('interventions')
                    .insert(dataToInsert); // Supabase will auto-generate the ID.

                if (insertError) throw insertError;
            }
            // After saving, refresh the local data.
            await fetchInterventions();
        } catch (e) {
            setError('Error al guardar la intervención.');
            console.error('Error saving intervention:', e);
            // Re-throw the error to be caught by the calling function if needed.
            throw e;
        }
    }, [fetchInterventions]);

    const deleteIntervention = useCallback(async (interventionId: number) => {
        try {
            const { error: deleteError } = await supabase
                .from('interventions')
                .delete()
                .eq('id', interventionId);

            if (deleteError) throw deleteError;

            setInterventions(prev => prev.filter(i => i.id !== interventionId));
        } catch (e) {
            setError('Error al eliminar la intervención.');
            console.error('Error deleting intervention:', e);
            throw e;
        }
    }, []);

    const updateInterventionStatus = useCallback(async (id: number, newStatus: Intervention['estado']) => {
        try {
            const { error: updateError } = await supabase
                .from('interventions')
                .update({ estado: newStatus })
                .eq('id', id);

            if (updateError) throw updateError;

            setInterventions(prev => prev.map(i => i.id === id ? { ...i, estado: newStatus } : i));
        } catch (e) {
            setError('Error al actualizar el estado.');
            console.error('Error updating status:', e);
        }
    }, []);

    const deleteMultipleInterventions = useCallback(async (interventionIds: number[]) => {
        try {
            const { error: deleteError } = await supabase
                .from('interventions')
                .delete()
                .in('id', interventionIds);

            if (deleteError) throw deleteError;

            setInterventions(prev => prev.filter(i => !interventionIds.includes(i.id)));
        } catch (e) {
            setError('Error al eliminar las intervenciones.');
            console.error('Error deleting multiple interventions:', e);
            throw e;
        }
    }, []);

    return { interventions, isLoading, error, saveIntervention, deleteIntervention, deleteMultipleInterventions, updateInterventionStatus, fetchInterventions };
};