import { useState, useEffect, useCallback } from 'react';
import { Note } from '../types';
import { initialNotes } from '../constants';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching data
    setIsLoading(true);
    setTimeout(() => {
        try {
            setNotes(initialNotes.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
            setError(null);
        } catch (e) {
            setError("Error al cargar las notas.");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, 500);
  }, []);

  const saveNote = useCallback(async (noteToSave: Note) => {
    setNotes(prev => {
        const now = new Date().toISOString();
        if (noteToSave.id && prev.some(n => n.id === noteToSave.id)) { // Update
            return prev.map(note => 
                note.id === noteToSave.id 
                ? { ...noteToSave, updatedAt: now } 
                : note
            ).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        } else { // Create
            const newNote = { 
                ...noteToSave, 
                id: Date.now(),
                updatedAt: now 
            };
            return [newNote, ...prev].sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        }
    });
  }, []);

  const deleteNote = useCallback(async (noteId: number) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  }, []);

  return { notes, isLoading, error, saveNote, deleteNote };
};