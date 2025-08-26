import React, { useState } from 'react';
import PaymentsView from './PaymentsView';
import { usePayments } from '../../hooks/usePayments';
import { toast } from 'react-hot-toast';
import AddPaymentModal from '../ui/AddPaymentModal';
import { Payment } from '../../types';

interface PaymentsViewWrapperProps {
  setConfirmationModalState: (state: any) => void;
}

const PaymentsViewWrapper: React.FC<PaymentsViewWrapperProps> = ({ setConfirmationModalState }) => {
  const [modalState, setModalState] = useState<{ isOpen: boolean; payment: Payment | null; }>({ isOpen: false, payment: null });

  const { 
    payments, 
    isLoading: loadingPayments, 
    error: errorPayments, 
    savePayment, 
    deletePayment, 
    fetchPayments 
  } = usePayments();

  const handleSavePayment = async (payment: Omit<Payment, 'id' | 'fecha' | 'referencia' | 'creado_en' | 'id_usuario'> & { id?: number }) => {
    try {
      await savePayment(payment);
      toast.success('Pago guardado con éxito.');
      setModalState({ isOpen: false, payment: null });
    } catch (error) {
      toast.error('Error al guardar el pago.');
    }
  };

  const handleDeletePayment = (id: number, nombre: string) => {
    setConfirmationModalState({
      isOpen: true,
      title: `Eliminar Pago: ${nombre}`,
      message: '¿Estás seguro de que deseas eliminar este pago? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          await deletePayment(id);
          toast.success('Pago eliminado con éxito.');
        } catch (error) {
          toast.error('Error al eliminar el pago.');
        }
        setConfirmationModalState({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  return (
    <>
      <PaymentsView 
        payments={payments}
        onDelete={handleDeletePayment}
        onAdd={() => setModalState({ isOpen: true, payment: null })}
        onEdit={(payment) => setModalState({ isOpen: true, payment })}
        isLoading={loadingPayments}
        error={errorPayments}
        fetchPayments={fetchPayments}
      />
      <AddPaymentModal 
        modalState={modalState}
        onClose={() => setModalState({ isOpen: false, payment: null })}
        onSave={handleSavePayment}
      />
    </>
  );
};

export default PaymentsViewWrapper;