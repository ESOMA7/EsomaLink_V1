import React, { useState, useCallback } from 'react';
import InterventionsView from './InterventionsView';
import { useInterventions } from '../../hooks/useInterventions';
import { Intervention } from '../../types';
import { toast } from 'react-hot-toast';

interface InterventionsViewWrapperProps {
  setInterventionModalState: (state: any) => void;
  setConfirmationModalState: (state: any) => void;
  tempInterventions: Intervention[];
  setTempInterventions: (interventions: Intervention[]) => void;
}

const InterventionsViewWrapper: React.FC<InterventionsViewWrapperProps> = ({
  setInterventionModalState,
  setConfirmationModalState,
  tempInterventions,
  setTempInterventions
}) => {
  const [selectedInterventionIds, setSelectedInterventionIds] = useState<number[]>([]);
  
  const onNewIntervention = useCallback(() => {
    // This callback is kept for the subscription, but doesn't need to set state anymore.
  }, []);

  const { 
    interventions: dbInterventions, 
    isLoading: loadingInterventions, 
    error: errorInterventions, 
    saveIntervention, 
    deleteIntervention, 
    deleteMultipleInterventions, 
    updateInterventionStatus, 
    fetchInterventions 
  } = useInterventions({ onNewIntervention });

  const interventions = [...tempInterventions, ...dbInterventions];

  const handleDeleteIntervention = (interventionId: number) => {
    const onConfirmDelete = async () => {
      if (interventionId < 0) {
        setTempInterventions(tempInterventions.filter(i => i.id !== interventionId));
        toast.success('Intervención de prueba eliminada.');
        return;
      }
      try {
        await deleteIntervention(interventionId);
        toast.success('Intervención eliminada con éxito.');
      } catch (error) {
        toast.error('Error al eliminar la intervención.');
      }
    };

    setConfirmationModalState({
      isOpen: true,
      title: 'Confirmar Eliminación',
      message: '¿Estás seguro de que deseas eliminar esta intervención?',
      onConfirm: onConfirmDelete,
    });
  };

  const confirmDeleteSelectedInterventions = () => {
    const onConfirmDelete = async () => {
      const tempIds = selectedInterventionIds.filter(id => id < 0);
      const dbIds = selectedInterventionIds.filter(id => id >= 0);

      if (tempIds.length > 0) {
        setTempInterventions(tempInterventions.filter(i => !tempIds.includes(i.id)));
      }

      if (dbIds.length > 0) {
        try {
          await deleteMultipleInterventions(dbIds);
        } catch (error) {
          toast.error('Error al eliminar las intervenciones de la base de datos.');
          return;
        }
      }

      toast.success(`${selectedInterventionIds.length} intervenciones eliminadas.`);
      setSelectedInterventionIds([]);
      setConfirmationModalState({ isOpen: false, title: '', message: '', onConfirm: null });
    };

    setConfirmationModalState({
      isOpen: true,
      title: 'Confirmar Eliminación Múltiple',
      message: `¿Seguro que quieres eliminar ${selectedInterventionIds.length} intervenciones?`,
      onConfirm: onConfirmDelete,
    });
  };

  const handleGenerateResponse = (_intervention: Intervention) => {
    toast('La generación de respuestas con IA está deshabilitada temporalmente.');
  };

  return (
    <InterventionsView 
      interventions={interventions}
      onUpdateStatus={updateInterventionStatus}
      onDelete={handleDeleteIntervention}
      onGenerateResponse={handleGenerateResponse}
      onAdd={() => setInterventionModalState({ isOpen: true, intervention: null })}
      onEdit={(intervention) => setInterventionModalState({ isOpen: true, intervention })}
      isLoading={loadingInterventions}
      error={errorInterventions ? new Error(errorInterventions) : null}
      selectedIds={selectedInterventionIds}
      onSelectionChange={setSelectedInterventionIds}
      onDeleteSelected={confirmDeleteSelectedInterventions}
      fetchInterventions={fetchInterventions}
    />
  );
};

export default InterventionsViewWrapper;