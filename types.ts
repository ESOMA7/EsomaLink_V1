// Simple User type for mock authentication
export interface User {
    id: string;
    email: string;
    name: string;
}

export interface AppointmentEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    professional: string;
    patient: string;
    procedure: string;
}

export interface Intervention {
    id: number;
    nombre: string;
    numeros: string;
    fecha: string;
    caso: string;
    estado: 'Pendiente' | 'En Proceso' | 'Resuelto';
    created_at?: string;
    updated_at?: string;
}

export interface Payment {
    id: number;
    transaction_id: string;
    patient: string;
    whatsapp: string;
    para: string; // "Concept"
    amount: number;
    bank: string;
    date: string;
}

export interface Note {
    id: number;
    title: string;
    content: string;
    updatedAt: string; // ISO string format
}

export type View = 'dashboard' | 'calendar' | 'payments' | 'interventions' | 'drive' | 'notes';