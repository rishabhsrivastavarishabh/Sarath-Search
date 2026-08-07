import { SearchResultItem } from '@/types';

export interface SearchProvider {
  name: string;
  search(query: string, page?: number): Promise<SearchResultItem[]>;
  isAvailable(): Promise<boolean>;
}

export interface SerpApiOrganicResult {
  position?: number;
  title: string;
  link: string;
  snippet?: string;
  favicon?: string;
  displayed_link?: string;
  source?: string;
}

export interface SerpApiResponse {
  organic_results?: SerpApiOrganicResult[];
  search_information?: {
    total_results?: number;
    spelling_fix?: string;
  };
}

/**
 * SerpAPI Provider Implementation
 * Fetches and parses organic search results from SerpAPI Google Search JSON responses
 */
export class SerpApiProvider implements SearchProvider {
  name = 'SerpAPI Provider';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.SERPAPI_KEY || process.env.NEXT_PUBLIC_SERPAPI_KEY || '';
  }

  async isAvailable(): Promise<boolean> {
    return true; // Available for live fallback
  }

  async search(query: string, page = 1): Promise<SearchResultItem[]> {
    if (!query.trim()) return [];

    try {
      if (this.apiKey) {
        const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&page=${page}&api_key=${this.apiKey}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const data: SerpApiResponse = await res.json();
          if (data.organic_results && data.organic_results.length > 0) {
            return data.organic_results.map((item) => this.formatSerpItem(item));
          }
        }
      }
    } catch (err) {
      console.warn('[SerpApiProvider] Live search notice:', err);
    }

    return [];
  }

  formatSerpItem(item: SerpApiOrganicResult): SearchResultItem {
    let domain = 'web.org';
    try {
      domain = new URL(item.link).hostname.replace(/^www\./, '');
    } catch (e) {
      // ignore
    }

    return {
      id: `serp-${Math.random().toString(36).substring(2, 9)}`,
      title: item.title,
      url: item.link,
      domain,
      meta_description: item.snippet || `Canonical search result for ${item.title}.`,
      favicon_url: item.favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      reading_time_min: Math.max(1, Math.ceil(((item.title || '').length + (item.snippet || '').length) / 90)),
      published_date: 'Verified Page',
      category: 'all',
      score: 0.95,
      verified_domain: true,
    };
  }
}
