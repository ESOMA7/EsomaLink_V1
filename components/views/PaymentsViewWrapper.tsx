import React from 'react';
import PaymentsView from './PaymentsView';
import { usePayments } from '../../hooks/usePayments';
import { toast } from 'react-hot-toast';

interface PaymentsViewWrapperProps {
  setPaymentModalState: (state: any) => void;
  setConfirmationModalState: (state: any) => void;
}

const PaymentsViewWrapper: React.FC<PaymentsViewWrapperProps> = ({
  setPaymentModalState,
  setConfirmationModalState
}) => {
  const { 
    payments, 
    isLoading: loadingPayments, 
    error: errorPayments, 
    savePayment, 
    deletePayment, 
    fetchPayments 
  } = usePayments();

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
    <PaymentsView 
      payments={payments}
      onDelete={handleDeletePayment}
      onAdd={() => setPaymentModalState({ isOpen: true, payment: null })}
      onEdit={(payment) => setPaymentModalState({ isOpen: true, payment })}
      isLoading={loadingPayments}
      error={errorPayments}
      fetchPayments={fetchPayments}
    />
  );
};

export default PaymentsViewWrapper;