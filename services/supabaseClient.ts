import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// --- IMPORTANT ---
// The values below are placeholders. You must replace them with your own
// Supabase Project URL and Public Anon Key for the application to work correctly.
// You can find these in your Supabase project's settings under 'API'.
export const supabaseUrl = "https://wpmwcuqslatkovlckojs.supabase.co"; // Replace with your Supabase URL
export const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwbXdjdXFzbGF0a292bGNrb2pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NDg3NjQsImV4cCI6MjA1NzAyNDc2NH0.LFNeFirB4AnqPf9sNs_QGWi_GvsU_whWTEZKbLWBXm8"; // Replace with your Supabase Anon Key

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);