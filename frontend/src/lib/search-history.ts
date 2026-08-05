import { supabase } from './supabase';

export interface SearchHistoryItem {
  id: string;
  user_id?: string;
  query: string;
  language: string;
  country: string;
  search_type: string;
  clicked_url?: string;
  clicked_domain?: string;
  ai_mode: boolean;
  is_pinned: boolean;
  created_at: string;
}

/**
 * Saves search history to Supabase database & local cache
 */
export async function recordSearchHistory(params: {
  query: string;
  language?: string;
  country?: string;
  search_type?: string;
  ai_mode?: boolean;
  clicked_url?: string;
  clicked_domain?: string;
}): Promise<void> {
  const cleanQ = params.query.trim();
  if (!cleanQ) return;

  // 1. Always sync to LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const localHistory = localStorage.getItem('sarath_recent_searches');
      let historyArr: string[] = localHistory ? JSON.parse(localHistory) : [];
      historyArr = [cleanQ, ...historyArr.filter(item => item.toLowerCase() !== cleanQ.toLowerCase())].slice(0, 20);
      localStorage.setItem('sarath_recent_searches', JSON.stringify(historyArr));
    } catch (e) {
      // ignore
    }
  }

  // 2. Sync to Supabase Database if authenticated
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('search_history').insert({
        user_id: session.user.id,
        query: cleanQ,
        language: params.language || 'en',
        country: params.country || 'US',
        search_type: params.search_type || 'all',
        ai_mode: params.ai_mode || false,
        clicked_url: params.clicked_url || null,
        clicked_domain: params.clicked_domain || null,
        is_pinned: false,
      });
    }
  } catch (err) {
    console.warn('[SearchHistory] Database sync fallback', err);
  }
}

/**
 * Fetches user search history from Supabase with LocalStorage fallback
 */
export async function fetchUserSearchHistory(): Promise<SearchHistoryItem[]> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        return data as SearchHistoryItem[];
      }
    }
  } catch (e) {
    console.warn('[SearchHistory] DB fetch fallback', e);
  }

  // Local fallback
  if (typeof window !== 'undefined') {
    try {
      const localHistory = localStorage.getItem('sarath_recent_searches');
      if (localHistory) {
        const historyArr: string[] = JSON.parse(localHistory);
        return historyArr.map((q, idx) => ({
          id: `local-${idx}`,
          query: q,
          language: 'en',
          country: 'US',
          search_type: 'all',
          ai_mode: false,
          is_pinned: false,
          created_at: new Date().toISOString(),
        }));
      }
    } catch (e) {
      // ignore
    }
  }

  return [];
}

/**
 * Deletes a single history record
 */
export async function deleteHistoryItem(id: string, query?: string): Promise<void> {
  if (id.startsWith('local-')) {
    if (typeof window !== 'undefined' && query) {
      const localHistory = localStorage.getItem('sarath_recent_searches');
      if (localHistory) {
        let historyArr: string[] = JSON.parse(localHistory);
        historyArr = historyArr.filter(q => q !== query);
        localStorage.setItem('sarath_recent_searches', JSON.stringify(historyArr));
      }
    }
    return;
  }

  try {
    await supabase.from('search_history').delete().eq('id', id);
  } catch (e) {
    console.warn('[SearchHistory] Delete item exception', e);
  }
}

/**
 * Deletes multiple history records
 */
export async function deleteMultipleHistoryItems(ids: string[]): Promise<void> {
  try {
    await supabase.from('search_history').delete().in('id', ids);
  } catch (e) {
    console.warn('[SearchHistory] Delete multiple exception', e);
  }
}

/**
 * Clears all search history for authenticated user
 */
export async function clearAllSearchHistory(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sarath_recent_searches');
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('search_history').delete().eq('user_id', session.user.id);
    }
  } catch (e) {
    console.warn('[SearchHistory] Clear all exception', e);
  }
}

/**
 * Toggles pin status for a search item
 */
export async function togglePinHistoryItem(id: string, currentPinned: boolean): Promise<void> {
  try {
    await supabase.from('search_history').update({ is_pinned: !currentPinned }).eq('id', id);
  } catch (e) {
    console.warn('[SearchHistory] Toggle pin exception', e);
  }
}
