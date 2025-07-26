import React from 'react';
import WaitingPatientsView from './WaitingPatientsView';
import { useWaitingPatients } from '../../hooks/useWaitingPatients';
import { toast } from 'react-hot-toast';
import { WaitingPatient } from '../../types';

interface WaitingPatientsViewWrapperProps {
  setWaitingPatientModalState: (state: any) => void;
  setConfirmationModalState: (state: any) => void;
}

const WaitingPatientsViewWrapper: React.FC<WaitingPatientsViewWrapperProps> = ({
  setWaitingPatientModalState,
  setConfirmationModalState
}) => {
  const { 
    waitingPatients, 
    isLoading: loadingWaitingPatients, 
    error: errorWaitingPatients, 
    saveWaitingPatient, 
    updateWaitingPatient, 
    deleteWaitingPatient, 
    fetchWaitingPatients 
  } = useWaitingPatients();

  const handleDeleteWaitingPatient = (id: number, nombre: string) => {
    setConfirmationModalState({
      isOpen: true,
      title: `Eliminar Paciente en Espera: ${nombre}`,
      message: '¿Estás seguro de que deseas eliminar este paciente de la lista de espera?',
      onConfirm: async () => {
        try {
          await deleteWaitingPatient(id);
          toast.success('Paciente en espera eliminado con éxito.');
        } catch (error) {
          toast.error('Error al eliminar el paciente en espera.');
        }
        setConfirmationModalState({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  return (
    <WaitingPatientsView 
      patients={waitingPatients}
      onDelete={handleDeleteWaitingPatient}
      onUpdateStatus={(id, estado) => {
        const patient = waitingPatients.find(p => p.id === id);
        if (patient) {
          updateWaitingPatient({ ...patient, estado });
        }
      }}
      onAdd={() => setWaitingPatientModalState({ isOpen: true, patient: null })}
      onEdit={(patient) => setWaitingPatientModalState({ isOpen: true, patient })}
      isLoading={loadingWaitingPatients}
      error={errorWaitingPatients}
      fetchWaitingPatients={fetchWaitingPatients}
    />
  );
};

export default WaitingPatientsViewWrapper;