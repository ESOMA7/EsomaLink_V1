import React from 'react';
import { FolderKanban, UploadCloud } from 'lucide-react';

const DriveView: React.FC = () => {
    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Explorador de Documentos</h2>
            <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-slate-800 rounded-lg shadow-md border-2 border-dashed border-slate-300 dark:border-slate-600 p-12 text-center">
                <FolderKanban className="h-24 w-24 text-slate-400 dark:text-slate-500 mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Integración con Google Drive</h3>
                <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-md">
                    Esta sección permitirá explorar, buscar y gestionar documentos de pacientes almacenados de forma segura en Google Drive. La funcionalidad está en desarrollo.
                </p>
                <button className="mt-6 inline-flex items-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-colors">
                    <UploadCloud className="h-5 w-5 mr-2" />
                    Próximamente
                </button>
            </div>
        </div>
    );
};

export default DriveView;