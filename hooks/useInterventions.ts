
import { useState, useEffect, useCallback } from 'react';
import { Intervention } from '../types';
import { initialInterventions } from '../constants';

export const useInterventions = () => {
    const [interventions, setInterventions] = useState<Intervention[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchInterventions = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                setInterventions(initialInterventions.sort((a,b) => b.id - a.id));
            } catch (err) {
                setError("No se pudieron cargar las intervenciones.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchInterventions();
    }, []);

    const saveIntervention = useCallback(async (data: { id?: number; patient: string; phone: string; reason: string; }) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        if (data.id) { // Update
            setInterventions(prev => prev.map(i => 
                i.id === data.id 
                ? { ...i, patient: data.patient, phone: data.phone, reason: data.reason } 
                : i
            ));
        } else { // Create
            const newIntervention: Intervention = {
                id: Date.now(),
                patient: data.patient,
                phone: data.phone,
                reason: data.reason,
                date: new Date().toISOString().split('T')[0],
                status: 'Pendiente'
            };
            setInterventions(prev => [newIntervention, ...prev].sort((a,b) => b.id - a.id));
        }
        return { success: true };
    }, []);
    
    const deleteIntervention = useCallback(async (interventionId: number) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        setInterventions(prev => prev.filter(i => i.id !== interventionId));
        return { success: true };
    }, []);

    const updateInterventionStatus = useCallback(async (id: number, newStatus: Intervention['status']) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        setInterventions(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
        return { success: true };
    }, []);

    return { interventions, isLoading, error, saveIntervention, deleteIntervention, updateInterventionStatus };
};
