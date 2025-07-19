import { AppointmentEvent, Intervention, Payment, Note } from './types';

// --- CORRECCIÓN ---
// Se ha cambiado la ruta para apuntar a la carpeta 'public'.
// Asegúrate de que tu archivo de logo se llame 'logo.png' y esté dentro de la carpeta 'public'.
export const APP_LOGO_URL = '/logo.png';

export const NOTIFICATION_SOUND_URL = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABgAZGF0YQQAAAAAAEA=';

export const getEventColor = (professional: string): string => {
    switch (professional) {
        case 'Malka Gámez':
            return 'bg-pink-500 border-pink-700';
        case 'Loreta Cujia':
            return 'bg-blue-500 border-blue-700';
        case 'Jose Ricardo':
            return 'bg-teal-500 border-teal-700';
        default:
            return 'bg-slate-500 border-slate-700';
    }
};

// Mock data for local development and testing
export const initialEvents: AppointmentEvent[] = [
    { id: 1, title: 'Limpieza Facial - Ana Pérez', start: new Date(2025, 6, 2, 10, 0), end: new Date(2025, 6, 2, 11, 0), professional: 'Malka Gámez', patient: 'Ana Pérez', procedure: 'Limpieza Facial' },
    { id: 2, title: 'Consulta Botox - Carlos Ruiz', start: new Date(2025, 6, 2, 12, 0), end: new Date(2025, 6, 2, 12, 30), professional: 'Jose Ricardo', patient: 'Carlos Ruiz', procedure: 'Consulta Botox' },
    { id: 3, title: 'Peeling Químico - Luisa Vera', start: new Date(2025, 6, 4, 15, 0), end: new Date(2025, 6, 4, 16, 0), professional: 'Loreta Cujia', patient: 'Luisa Vera', procedure: 'Peeling Químico' },
    { id: 4, title: 'Control Post-Operatorio - Elena Solis', start: new Date(2025, 6, 10, 9, 0), end: new Date(2025, 6, 10, 9, 30), professional: 'Malka Gámez', patient: 'Elena Solis', procedure: 'Control Post-Operatorio' },
];

export const initialInterventions: Intervention[] = [
    { id: 1, patient: 'Sofía Castro', phone: '3101234567', reason: 'Paciente pregunta por precios de relleno de labios.', date: '2025-07-01', status: 'Pendiente' },
    { id: 2, patient: 'Mario Vargas', phone: '3119876543', reason: 'Confirmar si el paciente necesita una cita de seguimiento para su tratamiento de acné.', date: '2025-06-28', status: 'En Proceso' },
    { id: 3, patient: 'Carolina Gil', phone: '3207654321', reason: 'Enviar recordatorio de cuidados post-tratamiento láser.', date: '2025-06-25', status: 'Resuelto' },
];

export const initialPayments: Payment[] = [
    { id: 1, transaction_id: 'TXN1A2B3C', patient: 'Ana Pérez', whatsapp: '3151112233', para: 'Abono Limpieza Facial', amount: 150000, bank: 'Bancolombia', date: '2025-07-01' },
    { id: 2, transaction_id: 'TXN4D5E6F', patient: 'Carlos Ruiz', whatsapp: '3162223344', para: 'Consulta Botox', amount: 80000, bank: 'Nequi', date: '2025-06-30' },
    { id: 3, transaction_id: 'TXN7G8H9I', patient: 'Luisa Vera', whatsapp: '3173334455', para: 'Pago completo Peeling', amount: 350000, bank: 'Davivienda', date: '2025-06-29' },
];

export const initialNotes: Note[] = [
    {
        id: 1,
        title: 'Ideas para Promociones de Agosto',
        content: 'Lanzar un 2x1 en limpiezas faciales profundas.\nOfrecer un 20% de descuento en tratamientos de rejuvenecimiento con láser para clientes recurrentes.\nRevisar inventario de productos de skincare para kits promocionales.',
        updatedAt: new Date(2025, 6, 1, 10, 30).toISOString(),
    },
    {
        id: 2,
        title: 'Notas de la Reunión Semanal',
        content: 'Se discutió la necesidad de un nuevo proveedor para los viales de ácido hialurónico. Jose Ricardo investigará opciones.\nLoreta sugiere mejorar la música ambiental de la sala de espera.\nMalka recuerda la importancia de la puntualidad en las citas.',
        updatedAt: new Date(2025, 5, 28, 15, 0).toISOString(),
    },
    {
        id: 3,
        title: 'Checklist Cierre Mensual',
        content: '- [x] Contar inventario\n- [ ] Realizar arqueo de caja\n- [ ] Enviar reportes de ventas\n- [x] Pagar nómina\n- [ ] Planificar contenido de redes sociales para el próximo mes',
        updatedAt: new Date(2025, 5, 30, 18, 45).toISOString(),
    }
];