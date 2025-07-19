import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Note } from '../../types';
import { PlusCircle, Search, Trash2, FileText, LoaderCircle } from 'lucide-react';
import { NotesViewSkeleton } from '../ui/LoadingSkeletons';
import { ErrorMessage } from '../ui/ErrorMessage';

interface NotesViewProps {
    notes: Note[];
    onSaveNote: (note: Note) => Promise<void>;
    onDeleteNote: (id: number, title: string) => void;
    isLoading: boolean;
    error: string | null;
}

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export default function NotesView({ notes, onSaveNote, onDeleteNote, isLoading, error }: NotesViewProps) {
    const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [editorTitle, setEditorTitle] = useState('');
    const [editorContent, setEditorContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const debouncedTitle = useDebounce(editorTitle, 500);
    const debouncedContent = useDebounce(editorContent, 500);

    const filteredNotes = useMemo(() => {
        if (!searchTerm) return notes;
        return notes.filter(note => 
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            note.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [notes, searchTerm]);

    const selectedNote = useMemo(() => {
        return notes.find(n => n.id === selectedNoteId);
    }, [notes, selectedNoteId]);
    
    const selectedNoteRef = useRef<Note | undefined>(undefined);
    selectedNoteRef.current = selectedNote;

    useEffect(() => {
        if (selectedNote) {
            setEditorTitle(selectedNote.title);
            setEditorContent(selectedNote.content);
        } else {
            setEditorTitle('');
            setEditorContent('');
        }
    }, [selectedNote]);

    useEffect(() => {
        if (!isLoading && filteredNotes.length > 0 && !filteredNotes.some(n => n.id === selectedNoteId)) {
            setSelectedNoteId(filteredNotes[0].id);
        } else if (filteredNotes.length === 0) {
            setSelectedNoteId(null);
        }
    }, [filteredNotes, selectedNoteId, isLoading]);


    useEffect(() => {
        const currentNote = selectedNoteRef.current;
        if (currentNote && (debouncedTitle !== currentNote.title || debouncedContent !== currentNote.content)) {
            if (debouncedTitle.trim() === '' && debouncedContent.trim() === '') return;
            
            const performSave = async () => {
                setIsSaving(true);
                try {
                    await onSaveNote({
                        ...currentNote,
                        title: debouncedTitle.trim() || 'Nota sin título',
                        content: debouncedContent,
                        updatedAt: new Date().toISOString()
                    });
                } finally {
                    setIsSaving(false);
                }
            };

            performSave();
        }
    }, [debouncedTitle, debouncedContent, onSaveNote]);
    
    const handleCreateNewNote = async () => {
        const newNoteData: Note = { 
            id: 0, // ID will be assigned by the hook
            title: 'Nueva Nota', 
            content: '', 
            updatedAt: new Date().toISOString() 
        };
        await onSaveNote(newNoteData);
        // The selection logic is now handled in the hook, which is more robust
    };
    
    useEffect(() => {
        // Automatically select a newly created note
        const newNote = notes.find(n => n.title === 'Nueva Nota' && n.content === '');
        if (newNote) {
             const timeSinceCreation = new Date().getTime() - new Date(newNote.updatedAt).getTime();
             if (timeSinceCreation < 1500) { // Check if created within the last 1.5s
                setSelectedNoteId(newNote.id);
             }
        }
    }, [notes]);

    const handleDeleteClick = () => {
        if (selectedNote) {
            onDeleteNote(selectedNote.id, selectedNote.title);
        }
    };
    
    const timeSince = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return `hace ${Math.floor(interval)} años`;
        interval = seconds / 2592000;
        if (interval > 1) return `hace ${Math.floor(interval)} meses`;
        interval = seconds / 86400;
        if (interval > 1) return `hace ${Math.floor(interval)} días`;
        interval = seconds / 3600;
        if (interval > 1) return `hace ${Math.floor(interval)} horas`;
        interval = seconds / 60;
        if (interval > 1) return `hace ${Math.floor(interval)} minutos`;
        return `hace unos segundos`;
    }

    if (isLoading) return <NotesViewSkeleton />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="flex flex-col md:flex-row h-full gap-6">
            <div className="w-full md:w-1/3 flex flex-col bg-white dark:bg-slate-800 rounded-lg shadow-md">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Mis Notas</h2>
                        <button onClick={handleCreateNewNote} className="p-2 text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-500/20 rounded-full transition-colors"><PlusCircle className="h-6 w-6" /></button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input type="text" placeholder="Buscar notas..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                    </div>
                </div>
                <div className="overflow-y-auto flex-grow">
                    {filteredNotes.map(note => (
                        <button key={note.id} onClick={() => setSelectedNoteId(note.id)} className={`w-full text-left p-4 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${selectedNoteId === note.id ? 'bg-orange-50 dark:bg-orange-500/10' : ''}`}>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate">{note.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{note.content || 'Sin contenido'}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{timeSince(note.updatedAt)}</p>
                        </button>
                    ))}
                     {filteredNotes.length === 0 && (
                        <div className="text-center p-8 text-slate-500 dark:text-slate-400">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                            <h4 className="font-semibold">{searchTerm ? 'No se encontraron notas' : 'No hay notas'}</h4>
                            <p className="text-sm">{searchTerm ? 'Prueba con otro término de búsqueda.' : 'Crea una nueva para empezar.'}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full md:w-2/3 flex flex-col">
                {selectedNote ? (
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md flex flex-col h-full">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 flex justify-between items-start">
                           <div>
                            <input type="text" value={editorTitle} onChange={e => setEditorTitle(e.target.value)} placeholder="Título de la nota" className="w-full text-2xl font-bold bg-transparent focus:outline-none focus:ring-0 border-0 p-0 text-slate-800 dark:text-slate-100"/>
                             <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 flex items-center">
                                {isSaving ? (
                                    <>
                                        <LoaderCircle className="h-4 w-4 mr-2 animate-spin" /> Guardando...
                                    </>
                                ) : (
                                    `Última modificación: ${new Date(selectedNote.updatedAt).toLocaleString('es-ES')}`
                                )}
                             </p>
                           </div>
                           <button onClick={handleDeleteClick} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-full transition-colors flex-shrink-0 ml-4"><Trash2 className="h-5 w-5"/></button>
                        </div>
                        <div className="flex-grow p-4">
                            <textarea value={editorContent} onChange={e => setEditorContent(e.target.value)} placeholder="Escribe algo increíble..." className="w-full h-full text-base bg-transparent resize-none focus:outline-none leading-relaxed text-slate-700 dark:text-slate-300"></textarea>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md flex flex-col h-full items-center justify-center text-center p-8">
                        <FileText className="h-24 w-24 text-slate-300 dark:text-slate-600" />
                        <h3 className="mt-4 text-xl font-semibold text-slate-700 dark:text-slate-200">Selecciona o crea una nota</h3>
                        <p className="mt-1 text-slate-500 dark:text-slate-400 max-w-sm">Usa el panel de la izquierda para ver tus notas, o crea una nueva para empezar a organizar tus ideas.</p>
                        <button onClick={handleCreateNewNote} className="mt-6 inline-flex items-center px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg shadow-sm hover:bg-orange-700 transition-colors">
                            <PlusCircle className="h-5 w-5 mr-2"/>
                            Crear Mi Primera Nota
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}