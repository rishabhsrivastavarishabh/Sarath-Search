import { SearchResultItem } from '@/types';
import { SearchProvider, SerpApiProvider } from '../providers/serpapi-provider';
import { searchLocalIndex } from '@/lib/search-index';
import { getCuratedFallbackResults } from '@/lib/search-provider';

export class BM25Provider implements SearchProvider {
  name = 'Local BM25 Index';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async search(query: string, page = 1): Promise<SearchResultItem[]> {
    try {
      const results = await searchLocalIndex({ query, limit: 10, offset: (page - 1) * 10 });
      return results || [];
    } catch {
      return [];
    }
  }
}

export class CrawlerProvider implements SearchProvider {
  name = 'Web Crawler Index';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async search(query: string): Promise<SearchResultItem[]> {
    try {
      const curated = getCuratedFallbackResults(query);
      return curated || [];
    } catch {
      return [];
    }
  }
}

export class SearchProviderManager {
  private providers: SearchProvider[] = [];

  constructor() {
    // Priority: 1. BM25 Provider, 2. Web Crawler Provider, 3. SerpAPI Provider
    this.providers = [
      new BM25Provider(),
      new CrawlerProvider(),
      new SerpApiProvider(),
    ];
  }

  /**
   * Executes multi-provider search with graceful fallback.
   * If one provider fails, continues with remaining providers so search never fails.
   */
  async executeMultiProviderSearch(query: string, page = 1): Promise<{ results: SearchResultItem[]; activeProviders: string[] }> {
    const aggregated: SearchResultItem[] = [];
    const activeProviders: string[] = [];

    for (const provider of this.providers) {
      try {
        const isAvailable = await provider.isAvailable();
        if (isAvailable) {
          const items = await provider.search(query, page);
          if (items && items.length > 0) {
            aggregated.push(...items);
            activeProviders.push(provider.name);
          }
        }
      } catch (err) {
        console.warn(`[ProviderManager] Provider ${provider.name} error notice:`, err);
      }
    }

    const deduplicated = this.deduplicateByUrl(aggregated);
    return {
      results: deduplicated,
      activeProviders,
    };
  }

  private deduplicateByUrl(items: SearchResultItem[]): SearchResultItem[] {
    const map = new Map<string, SearchResultItem>();
    items.forEach((item) => {
      if (!map.has(item.url)) {
        map.set(item.url, item);
      }
    });
    return Array.from(map.values());
  }
}

export const globalProviderManager = new SearchProviderManager();
