
import { useState, useEffect, useCallback } from 'react';
import { Intervention } from '../types';
import { initialInterventions } from '../constants';

export const useInterventions = () => {
    const [interventions, setInterventions] = useState<Intervention[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        // Simulate fetching data
        setIsLoading(true);
        setTimeout(() => {
            try {
                setInterventions(initialInterventions);
                setError(null);
            } catch (e) {
                setError("Error al cargar los datos de las intervenciones.");
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }, 800);
    }, []);

    const saveIntervention = useCallback(async (data: { id?: number; patient: string; phone: string; reason: string; }) => {
        setInterventions(prev => {
            if (data.id) {
                // Update
                return prev.map(i => i.id === data.id ? { ...i, ...data } : i);
            } else {
                // Create
                const newIntervention: Intervention = {
                    id: Date.now(),
                    ...data,
                    date: new Date().toISOString().split('T')[0],
                    status: 'Pendiente',
                };
                return [newIntervention, ...prev];
            }
        });
        return { success: true };
    }, []);
    
    const deleteIntervention = useCallback(async (interventionId: number) => {
        setInterventions(prev => prev.filter(i => i.id !== interventionId));
        return { success: true };
    }, []);

    const updateInterventionStatus = useCallback(async (id: number, newStatus: Intervention['status']) => {
        setInterventions(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
    }, []);

    return { interventions, isLoading, error, saveIntervention, deleteIntervention, updateInterventionStatus };
};