import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tjyvgkpcjlswjkkfffnt.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqeXZna3Bjamxzd2pra2ZmZm50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNTk1MzYsImV4cCI6MjA5NjkzNTUzNn0.-ndvoCBk547CO3waRKVU3K39mTi0iH0BribZOAjr7Aw';

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqeXZna3Bjamxzd2pra2ZmZm50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTM1OTUzNiwiZXhwIjoyMDk2OTM1NTUzNn0.WLjwzUKYXvVj5AY4mLHylveZw_h0P7kqjmPSDSHjChU';

// Public Supabase client for browser authentication & RLS queries
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role admin client for backend APIs and admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
