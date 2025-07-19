import React from 'react';
import { Settings, ExternalLink } from 'lucide-react';

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-slate-100 dark:bg-slate-900 rounded-md p-4 mt-4 text-left text-sm text-slate-800 dark:text-slate-200 overflow-x-auto">
        <code>{children}</code>
    </pre>
);

const ConfigurationNeeded: React.FC = () => {
    const filePath = `services/supabaseClient.ts`;
    const codeSnippet = `
// services/supabaseClient.ts

// ... (comments)

// 👇 Reemplaza estas dos líneas con tus propias credenciales
const supabaseUrl = "https://tu-proyecto.supabase.co"; 
const supabaseAnonKey = "tu-clave-anon-publica"; 

// ... (resto del código)
`.trim();

    return (
        <div className="flex items-center justify-center w-full h-screen bg-slate-100 dark:bg-slate-900 p-4">
            <div className="w-full max-w-2xl p-8 space-y-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl text-center">
                <Settings className="w-16 h-16 mx-auto text-orange-500" />
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-4">
                    Configuración Requerida
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                    ¡Casi listo! Para que la aplicación funcione, primero debes conectar tu backend de Supabase.
                </p>
                
                <div className="border-t border-b border-slate-200 dark:border-slate-700 py-6">
                    <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                        Paso 1: Edita el siguiente archivo en tu código:
                    </p>
                    <p className="font-mono text-base bg-slate-100 dark:bg-slate-700/50 text-orange-600 dark:text-orange-400 py-2 px-4 rounded-md inline-block mt-2">
                        {filePath}
                    </p>
                    
                    <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 mt-6">
                        Paso 2: Reemplaza las credenciales de ejemplo con las tuyas:
                    </p>
                    <CodeBlock>{codeSnippet}</CodeBlock>
                </div>

                <p className="text-slate-600 dark:text-slate-300">
                    Puedes encontrar tu URL y tu Clave Anónima (Anon Key) en la configuración de tu proyecto de Supabase.
                </p>

                <a 
                    href="https://supabase.com/dashboard/projects"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700 transition-all duration-200 transform hover:scale-105"
                >
                    Ir a mi Dashboard de Supabase
                    <ExternalLink className="w-4 h-4 ml-2" />
                </a>
            </div>
        </div>
    );
};

export default ConfigurationNeeded;
