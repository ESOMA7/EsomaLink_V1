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
    patient: string;
    phone: string;
    reason: string;
    date: string;
    status: 'Resuelto' | 'En Proceso' | 'Pendiente';
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