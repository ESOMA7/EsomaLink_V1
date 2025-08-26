import React, { useState } from 'react';
import WaitingPatientsView from './WaitingPatientsView';
import { useWaitingPatients } from '../../hooks/useWaitingPatients';
import { toast } from 'react-hot-toast';
import { WaitingPatient } from '../../types';
import AddWaitingPatientModal from '../ui/AddWaitingPatientModal';

interface WaitingPatientsViewWrapperProps {
  setConfirmationModalState: (state: any) => void;
}

const WaitingPatientsViewWrapper: React.FC<WaitingPatientsViewWrapperProps> = ({
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

  const [modalState, setModalState] = useState<{ isOpen: boolean; patient: WaitingPatient | null; }>({ isOpen: false, patient: null });

  const handleSaveWaitingPatient = async (patient: Omit<WaitingPatient, 'id' | 'created_at'>) => {
    try {
      await saveWaitingPatient(patient);
      toast.success('Paciente en espera guardado con éxito.');
      setModalState({ isOpen: false, patient: null });
    } catch (error) {
      toast.error('Error al guardar el paciente en espera.');
    }
  };

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
    <>
    <WaitingPatientsView 
      patients={waitingPatients}
      onDelete={handleDeleteWaitingPatient}
      onUpdateStatus={(id, estado) => {
        const patient = waitingPatients.find(p => p.id === id);
        if (patient) {
          updateWaitingPatient({ ...patient, estado });
        }
      }}
      onAdd={() => setModalState({ isOpen: true, patient: null })}
      onEdit={(patient) => setModalState({ isOpen: true, patient })}
      isLoading={loadingWaitingPatients}
      error={errorWaitingPatients}
      fetchWaitingPatients={fetchWaitingPatients}
    />
    <AddWaitingPatientModal 
      modalState={modalState}
      onClose={() => setModalState({ isOpen: false, patient: null })}
      onSave={handleSaveWaitingPatient}
    />
    </>
  );
};

export default WaitingPatientsViewWrapper;