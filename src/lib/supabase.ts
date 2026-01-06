import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabaseInstance: SupabaseClient | null = null;

function getCredentialsFromEnv(): { url?: string; anonKey?: string } {
  // Vite environment variables (recommended)
  const url = (import.meta.env && import.meta.env.VITE_SUPABASE_URL) || undefined;
  const anonKey = (import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || undefined;
  return { url, anonKey };
}

export function getSupabaseClient(): SupabaseClient {
  if (_supabaseInstance) return _supabaseInstance;

  const { url, anonKey } = getCredentialsFromEnv();

  if (!url || !anonKey) {
    throw new Error('Supabase credentials not found. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
  }

  _supabaseInstance = createClient(url, anonKey, {
    auth: { persistSession: false },
  });

  return _supabaseInstance;
}

// Ensure unique singleton export named 'supabase'
export const supabase = getSupabaseClient();
