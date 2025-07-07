
import { useState, useEffect, useCallback } from 'react';
import { Note } from '../types';
import { initialNotes } from '../constants';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Simulate API call to Supabase
        await new Promise(resolve => setTimeout(resolve, 1200));
        const sortedInitialNotes = [...initialNotes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setNotes(sortedInitialNotes);
      } catch (err: any) {
        setError("No se pudieron cargar las notas.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const saveNote = useCallback(async (noteToSave: Note) => {
    // Simulate API call to Supabase
    await new Promise(resolve => setTimeout(resolve, 200));
    setNotes(prevNotes => {
        if (noteToSave.id && prevNotes.some(n => n.id === noteToSave.id)) { // Update
            const updatedNotes = prevNotes.map(n => n.id === noteToSave.id ? { ...noteToSave, updatedAt: new Date().toISOString() } : n);
            return updatedNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        } else { // Create
            const newNote = { ...noteToSave, id: Date.now(), updatedAt: new Date().toISOString() };
            const updatedNotes = [newNote, ...prevNotes];
            return updatedNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        }
    });
  }, []);

  const deleteNote = useCallback(async (noteId: number) => {
    // Simulate API call to Supabase
    await new Promise(resolve => setTimeout(resolve, 300));
    setNotes(prev => prev.filter(n => n.id !== noteId));
  }, []);

  return { notes, isLoading, error, saveNote, deleteNote };
};
