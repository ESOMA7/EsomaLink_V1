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
    referencia: string;
    nombre: string;
    whatsapp: string;
    concepto: string;
    valor: number;
    banco: string;
    fecha: string;
    creado_en?: string;
    id_usuario?: string;
}

export interface Note {
    id: number;
    title: string;
    content: string;
    updatedAt: string; // ISO string format
}

export type View = 'dashboard' | 'calendar' | 'payments' | 'interventions' | 'drive' | 'notes' | 'waiting_patients';

export interface WaitingPatient {
  id: number;
  nombre: string;
  telefono: string;
  caso: string;
  fecha: string;
  estado: 'Pendiente' | 'En Proceso' | 'Resuelto';
  id_usuario: string;
  creado_en: string;
}