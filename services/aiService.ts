
import { GoogleGenAI } from "@google/genai";
import { Intervention } from '../types';

/**
 * AI-related API calls.
 * 
 * WARNING: In a production environment, you must not expose your API keys on the client-side.
 * The logic in this file should be moved to a secure backend, such as Supabase Edge Functions,
 * and you would call those functions from the client instead.
 */

// --- IMPORTANT ---
// The value below is a placeholder. You must replace it with your own
// Google AI API Key for the AI features to work.
// You can get a key from Google AI Studio.
const API_KEY = "YOUR_GEMINI_API_KEY"; // Replace with your API Key

let ai: GoogleGenAI | null = null;

// Only initialize the AI client if a real API key has been provided.
if (API_KEY && API_KEY !== "YOUR_GEMINI_API_KEY") {
    ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
    console.warn("Google AI API Key not configured. Please replace the placeholder in `services/aiService.ts`. AI features will not work.");
}


const generateInterventionResponse = async (intervention: Intervention): Promise<string> => {
    if (!ai) {
        return "El servicio de IA no está disponible. Por favor, configura tu API_KEY en el archivo `services/aiService.ts`.";
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
            model: "gemini-2.5-flash",
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

export const aiService = {
    generateInterventionResponse,
};
