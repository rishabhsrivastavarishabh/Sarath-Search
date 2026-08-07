import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tjyvgkpcjlswjkkfffnt.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqeXZna3Bjamxzd2pra2ZmZm50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNTk1MzYsImV4cCI6MjA5NjkzNTUzNn0.-ndvoCBk547CO3waRKVU3K39mTi0iH0BribZOAjr7Aw';

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqeXZna3Bjamxzd2pra2ZmZm50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTM1OTUzNiwiZXhwIjoyMDk2OTM1NTUzNn0.WLjwzUKYXvVj5AY4mLHylveZw_h0P7kqjmPSDSHjChU';

// Browser client for client-side Auth & RLS
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for backend server operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Executes a database operation with exponential backoff retries for transient failures
 */
export async function executeDbWithRetry<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  maxRetries = 2
): Promise<{ data: T | null; error: any }> {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const result = await operation();
      if (!result.error) return result;

      // If it's a non-transient error, break immediately
      if (result.error?.code === 'PGRST116' || result.error?.code === '23505') {
        return result;
      }

      attempt++;
      if (attempt <= maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 200));
      } else {
        return result;
      }
    } catch (err) {
      attempt++;
      if (attempt > maxRetries) {
        return { data: null, error: err };
      }
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 200));
    }
  }
  return { data: null, error: 'Database execution failed after retries' };
}
