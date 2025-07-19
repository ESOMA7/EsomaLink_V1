
import { useState, useEffect, useCallback } from 'react';
import { Intervention } from '../types';
import { supabase } from '../services/supabaseClient';

export const useInterventions = () => {
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
    }, [fetchInterventions]);

    const saveIntervention = useCallback(async (interventionData: Omit<Intervention, 'id' | 'created_at' | 'updated_at'> & { id?: number }) => {
        try {
            const { id, ...dataToSave } = interventionData;

            if (id) {
                // Update
                const { error: updateError } = await supabase
                    .from('interventions')
                    .update(dataToSave)
                    .eq('id', id);
                if (updateError) throw updateError;
            } else {
                // Create
                const { error: insertError } = await supabase
                    .from('interventions')
                    .insert(dataToSave);
                if (insertError) throw insertError;
            }
            await fetchInterventions(); // Refresh data
        } catch (e) {
            setError('Error al guardar la intervención.');
            console.error('Error saving intervention:', e);
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

    return { interventions, isLoading, error, saveIntervention, deleteIntervention, updateInterventionStatus };
};