import { useState, useEffect, useCallback } from 'react';
import { Note } from '../types';
import { supabase } from '../services/supabaseClient';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notes from Supabase
  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Transform Supabase data to match our Note interface
      const transformedNotes: Note[] = (data || []).map(note => ({
        id: note.id,
        title: note.title,
        content: note.content,
        updatedAt: note.updated_at
      }));

      setNotes(transformedNotes);
    } catch (e) {
      setError('Error al cargar las notas desde la base de datos.');
      console.error('Error fetching notes:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const saveNote = useCallback(async (noteToSave: Note) => {
    try {
      const now = new Date().toISOString();
      
      if (noteToSave.id && noteToSave.id > 0) {
        // Update existing note
        const { error: updateError } = await supabase
          .from('notes')
          .update({
            title: noteToSave.title,
            content: noteToSave.content,
            updated_at: now
          })
          .eq('id', noteToSave.id);

        if (updateError) {
          throw updateError;
        }

        // Update local state
        setNotes(prev => 
          prev.map(note => 
            note.id === noteToSave.id 
              ? { ...noteToSave, updatedAt: now }
              : note
          ).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        );
      } else {
        // Create new note
        const { data, error: insertError } = await supabase
          .from('notes')
          .insert({
            title: noteToSave.title,
            content: noteToSave.content,
            updated_at: now
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        // Transform and add to local state
        const newNote: Note = {
          id: data.id,
          title: data.title,
          content: data.content,
          updatedAt: data.updated_at
        };

        setNotes(prev => 
          [newNote, ...prev].sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        );
      }
    } catch (e) {
      setError('Error al guardar la nota.');
      console.error('Error saving note:', e);
      throw e; // Re-throw to handle in component if needed
    }
  }, []);

  const deleteNote = useCallback(async (noteId: number) => {
    try {
      const { error: deleteError } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (deleteError) {
        throw deleteError;
      }

      // Update local state
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch (e) {
      setError('Error al eliminar la nota.');
      console.error('Error deleting note:', e);
      throw e; // Re-throw to handle in component if needed
    }
  }, []);

  return { notes, isLoading, error, saveNote, deleteNote };
};