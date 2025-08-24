import { Database } from './supabase';

// Base type from Supabase, omitting fields that will be redefined for the app's needs.
type AppointmentBase = Omit<Database['public']['Tables']['appointments']['Row'], 'id' | 'start' | 'end'>;

// App-specific type that allows for Google Calendar events (string ID) and makes ID optional for new events.
export interface AppointmentEvent extends AppointmentBase {
    id?: number | string; // Supabase uses number, Google Calendar uses string. Optional for new events.
    start: Date;
    end: Date;
    title: string; // Not in DB, used for display in the calendar UI.
    calendarId?: string; // For Google Calendar sync
    color?: string; // For event color in UI
}
