
import React, { useState, useEffect, useCallback } from 'react';
import { Intervention } from '../../types';
import { X, Sparkles, Clipboard, Check, LoaderCircle } from 'lucide-react';
import aiService from '../../services/aiService';

interface GeminiModalProps {
    modalState: {
        isOpen: boolean;
        intervention: Intervention | null;
    };
    onClose: () => void;
}

const GeminiModal: React.FC<GeminiModalProps> = ({ modalState, onClose }) => {
    const { isOpen, intervention } = modalState;
    const [isLoading, setIsLoading] = useState(false);
    const [generatedText, setGeneratedText] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = useCallback(async () => {
        if (!intervention) return;
        setIsLoading(true);
        setGeneratedText('');
        try {
            const response = await aiService.generateInterventionResponse(intervention);
            setGeneratedText(response);
        } catch (error) {
            console.error(error);
            setGeneratedText("Ocurrió un error al generar la respuesta.");
        } finally {
            setIsLoading(false);
        }
    }, [intervention]);

    useEffect(() => {
        if (isOpen && intervention) {
            handleGenerate();
        } else {
            // Reset state when modal is closed
            setGeneratedText('');
            setIsLoading(false);
            setIsCopied(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, intervention]);

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    if (!isOpen || !intervention) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl transform transition-all">
                <div className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center">
                            <Sparkles className="h-6 w-6 text-blue-500 mr-3" />
                            <h3 className="text-xl leading-6 font-bold text-slate-900 dark:text-slate-100">Asistente de Respuesta IA</h3>
                        </div>
                         <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-slate-200"><X className="h-5 w-5"/></button>
                    </div>
                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Paciente: <span className="font-bold text-slate-800 dark:text-slate-100">{intervention.patient}</span></p>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">Motivo: <span className="text-slate-800 dark:text-slate-200">{intervention.reason}</span></p>
                    </div>
                </div>

                <div className="px-6 pb-6">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Respuesta Sugerida:</label>
                    <div className="mt-2 w-full min-h-[200px] p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-900 relative">
                        {isLoading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <LoaderCircle className="h-8 w-8 text-blue-500 animate-spin" />
                                <p className="mt-2 text-slate-500 dark:text-slate-400">Generando respuesta...</p>
                            </div>
                        ) : (
                            <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{generatedText}</p>
                        )}
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 flex justify-end items-center space-x-3">
                    <button 
                        onClick={handleGenerate} 
                        disabled={isLoading}
                        className="inline-flex items-center justify-center rounded-md border border-slate-300 dark:border-slate-500 px-4 py-2 bg-white dark:bg-slate-600 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <LoaderCircle className="h-4 w-4 mr-2 animate-spin"/> : <Sparkles className="h-4 w-4 mr-2"/>}
                        Volver a Generar
                    </button>
                    <button 
                        onClick={handleCopy} 
                        disabled={!generatedText || isLoading}
                        className="inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                    >
                        {isCopied ? <Check className="h-4 w-4 mr-2"/> : <Clipboard className="h-4 w-4 mr-2"/>}
                        {isCopied ? 'Copiado' : 'Copiar Texto'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GeminiModal;
