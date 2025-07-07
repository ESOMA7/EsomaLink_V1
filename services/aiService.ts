
import { GoogleGenAI } from "@google/genai";
import { Intervention } from '../types';

/**
 * AI-related API calls.
 * 
 * WARNING: In a production environment, you must not expose your API keys on the client-side.
 * The logic in this file should be moved to a secure backend, such as Supabase Edge Functions,
 * and you would call those functions from the client instead.
 */

// This client-side initialization is for DEMO and DEVELOPMENT PURPOSES ONLY.
const API_KEY = process.env.API_KEY;
let ai: GoogleGenAI | null = null;
if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
    console.warn("API_KEY environment variable not set. AI features will not work.");
}


const generateInterventionResponse = async (intervention: Intervention): Promise<string> => {
    /*
     * PRODUCTION IMPLEMENTATION (example):
     *
     * import { supabase } from './supabaseClient';
     * const { data, error } = await supabase.functions.invoke('generate-intervention-response', {
     *   body: { intervention },
     * });
     * if (error) throw new Error(error.message);
     * return data.responseText;
     */
    
    if (!ai) {
        return "El servicio de IA no está disponible. La API_KEY no está configurada.";
    }

    const { patient, reason } = intervention;

    const prompt = `
        Eres un asistente virtual muy amable y profesional para la clínica de estética 'Malka Gámez'.
        Un paciente llamado **${patient}** ha contactado con el siguiente motivo: "${reason}".

        Tu tarea es redactar una respuesta para enviar por WhatsApp. La respuesta debe ser:
        1.  **Empática y Comprensiva**: Reconoce la situación del paciente.
        2.  **Clara y Concisa**: Ve al grano pero sin ser cortante.
        3.  **Profesional**: Mantén un tono adecuado que represente a la clínica.
        4.  **Orientada a la acción**: Sugiere los siguientes pasos de forma clara (ej. "nuestro equipo te contactará", "puedes agendar una cita", "mantén la calma, estamos aquí para ayudarte").
        5.  **Personalizada**: Dirígete al paciente por su nombre.

        Ejemplo de Tono: "Hola ${patient}, entendemos tu preocupación sobre... Estamos aquí para ayudarte. Nuestro equipo..."

        Genera la respuesta.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
            config: {
                temperature: 0.7,
                topP: 1,
                topK: 32,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating content with Gemini:", error);
        return "Hubo un error al generar la respuesta. Por favor, inténtalo de nuevo.";
    }
};

const aiService = {
    generateInterventionResponse,
};

export default aiService;
