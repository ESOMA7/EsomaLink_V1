import React from 'react';
import NotesView from './NotesView';
import { useNotes } from '../../hooks/useNotes';
import { toast } from 'react-hot-toast';

interface NotesViewWrapperProps {
  setConfirmationModalState: (state: any) => void;
}

const NotesViewWrapper: React.FC<NotesViewWrapperProps> = ({
  setConfirmationModalState
}) => {
  const { 
    notes, 
    isLoading: loadingNotes, 
    error: errorNotes, 
    saveNote, 
    deleteNote 
  } = useNotes();

  const handleDeleteNote = (id: number, title: string) => {
    setConfirmationModalState({
      isOpen: true,
      title: `Eliminar Nota: ${title}`,
      message: '¿Estás seguro de que deseas eliminar esta nota? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          await deleteNote(id);
          toast.success('Nota eliminada con éxito.');
        } catch (error) {
          toast.error('Error al eliminar la nota.');
        }
        setConfirmationModalState({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  return (
    <NotesView 
      notes={notes}
      onSaveNote={saveNote}
      onDeleteNote={handleDeleteNote}
      isLoading={loadingNotes}
      error={errorNotes}
    />
  );
};

export default NotesViewWrapper;