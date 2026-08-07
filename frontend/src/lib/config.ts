/**
 * Sarath Search Engine v11.0 — Centralized Configuration & Security Loader
 */

export const CONFIG = {
  APP_NAME: 'Sarath Search',
  VERSION: '11.0.0',
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  SUPABASE: {
    URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tjyvgkpcjlswjkkfffnt.supabase.co',
    ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqeXZna3Bjamxzd2pra2ZmZm50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNTk1MzYsImV4cCI6MjA5NjkzNTUzNn0.-ndvoCBk547CO3waRKVU3K39mTi0iH0BribZOAjr7Aw',
    SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },

  AI: {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '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',
    DEFAULT_MODEL: 'google/gemini-3.6-flash',
    MAX_TOKENS: 3000,
    TEMPERATURE: 0.3,
  },

  GOOGLE_SEARCH: {
    API_KEY: process.env.GOOGLE_SEARCH_API_KEY || 'AIzaSyCOmaT7tYxwUdyJj2ehem7Mm3tQ3lhEH5g',
    ENGINE_ID: process.env.GOOGLE_SEARCH_ENGINE_ID || process.env.GOOGLE_SEARCH_CX || process.env.GOOGLE_CX || '',
  },
};

export function validateServerConfig() {
  const missingKeys: string[] = [];
  if (!CONFIG.SUPABASE.URL) missingKeys.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!CONFIG.SUPABASE.ANON_KEY) missingKeys.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (missingKeys.length > 0) {
    console.warn(`[ConfigWarning] Missing environment variables: ${missingKeys.join(', ')}`);
  }

  return {
    valid: missingKeys.length === 0,
    missingKeys,
  };
}
