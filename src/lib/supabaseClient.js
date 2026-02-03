import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fail gracefully if keys are missing (for dev environment safety)
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Key is missing. Check your .env file.');
}

export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        from: () => ({
            select: () => ({ eq: () => ({ data: [] }) }), // Mock chain
            insert: () => ({ error: 'Supabase not configured' }),
            delete: () => ({ error: 'Supabase not configured' }),
            update: () => ({ error: 'Supabase not configured' }),
        }),
        auth: {
            signInWithOAuth: () => Promise.resolve({ error: { message: 'Supabase keys missing' } })
        }
    };
