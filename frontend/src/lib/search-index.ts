import { supabaseAdmin } from './supabase';
import { SearchResultItem } from './search-provider';

export interface IndexedSearchOptions {
  query: string;
  category?: string;
  limit?: number;
  offset?: number;
}

/**
 * BM25 Relevance Calculator
 * Computes BM25 score based on term frequency, document length, and field weights.
 */
export function calculateBM25Score(
  query: string,
  title: string,
  description: string,
  keywords = ''
): number {
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  if (terms.length === 0) return 0.5;

  const docText = `${title} ${title} ${description} ${keywords}`.toLowerCase();
  const docLength = docText.split(/\s+/).length;
  const avgDocLength = 150;

  const k1 = 1.2;
  const b = 0.75;

  let score = 0;

  terms.forEach(term => {
    const tf = (docText.match(new RegExp(term, 'gi')) || []).length;
    if (tf > 0) {
      const idf = Math.log(1 + 100 / (tf + 1));
      const numerator = tf * (k1 + 1);
      const denominator = tf + k1 * (1 - b + b * (docLength / avgDocLength));
      score += idf * (numerator / denominator);
    }
  });

  return Number(Math.min(0.99, score / 10).toFixed(4));
}

/**
 * Searches Supabase indexed_pages using BM25 relevance & Full-Text Search
 */
export async function searchLocalIndex(options: IndexedSearchOptions): Promise<SearchResultItem[]> {
  const cleanQ = options.query.trim();
  if (!cleanQ) return [];

  try {
    const { data: dbPages, error } = await supabaseAdmin
      .from('indexed_pages')
      .select('*')
      .or(`title.ilike.%${cleanQ}%,meta_description.ilike.%${cleanQ}%,meta_keywords.ilike.%${cleanQ}%`)
      .order('search_score', { ascending: false })
      .limit(options.limit || 20);

    if (error || !dbPages || dbPages.length === 0) {
      return [];
    }

    return dbPages.map((page) => {
      const bm25 = calculateBM25Score(cleanQ, page.title, page.meta_description || '', page.meta_keywords || '');
      const finalScore = Number(Math.min(0.99, (page.search_score || 0.8) * 0.5 + bm25 * 0.5).toFixed(2));

      return {
        id: page.id,
        title: page.title,
        url: page.url,
        domain: page.domain || extractDomain(page.url),
        meta_description: page.meta_description || `Canonical search result for ${cleanQ}.`,
        favicon_url: page.favicon_url || `https://www.google.com/s2/favicons?domain=${page.domain || extractDomain(page.url)}&sz=64`,
        reading_time_min: 2,
        published_date: page.indexed_time ? new Date(page.indexed_time).toLocaleDateString() : 'Indexed',
        category: 'all',
        score: finalScore,
        verified_domain: true,
      };
    });
  } catch (e) {
    console.warn('[SearchIndex] Local database index search fallback', e);
    return [];
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'web.org';
  }
}
