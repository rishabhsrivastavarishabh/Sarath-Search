import { SearchResultItem } from '@/types';
import { fetchGoogleCustomSearchResults } from './google-search';
import { searchLocalIndex } from './search-index';
import { crawlWebsiteUrl } from './crawler';
import { supabaseAdmin } from './supabase';
import { correctQuerySpelling, SpellCorrectionResult } from './spell-corrector';

export interface SearchProviderResponse {
  query: string;
  original_query: string;
  corrected_query: string | null;
  is_corrected: boolean;
  did_you_mean: string | null;
  results: SearchResultItem[];
  total: number;
  provider: string;
  page: number;
  pageSize: number;
}

/**
 * Strips tracking parameters, fragments (#), and resolves real canonical URLs
 */
export function resolveRealDestinationUrl(rawUrl: string): { url: string; domain: string } | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;

  try {
    let cleanUrlStr = rawUrl.trim();

    // Decode wrapped redirect URLs
    if (cleanUrlStr.includes('duckduckgo.com/l/?uddg=')) {
      const match = cleanUrlStr.match(/uddg=([^&]+)/);
      if (match && match[1]) {
        cleanUrlStr = decodeURIComponent(match[1]);
      }
    } else if (cleanUrlStr.includes('google.com/url?q=')) {
      const match = cleanUrlStr.match(/[?&]q=([^&]+)/);
      if (match && match[1]) {
        cleanUrlStr = decodeURIComponent(match[1]);
      }
    }

    const parsed = new URL(cleanUrlStr);

    // Filter out internal proxy/wrapper domains
    if (
      parsed.hostname.includes('duckduckgo.com') ||
      parsed.hostname.includes('google.com/search') ||
      parsed.hostname.includes('bing.com/search')
    ) {
      return null;
    }

    // Strip tracking parameters
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'ref', 'source'];
    trackingParams.forEach((param) => parsed.searchParams.delete(param));

    // Strip fragments
    parsed.hash = '';

    const domain = parsed.hostname.replace(/^www\./, '');
    return {
      url: parsed.toString(),
      domain,
    };
  } catch (e) {
    return null;
  }
}

/**
 * Sarath Search Engine v15.0 Pipeline
 * Cache-First Architecture: Checks Supabase Cache first -> Google Custom Search API Fallback -> Cache Live Results
 */
export async function performDuckDuckGoSearch(
  query: string,
  category = 'all',
  page = 1,
  pageSize = 10
): Promise<SearchProviderResponse> {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return {
      query: '',
      original_query: '',
      corrected_query: null,
      is_corrected: false,
      did_you_mean: null,
      results: [],
      total: 0,
      provider: 'Sarath Search',
      page: 1,
      pageSize,
    };
  }

  // STEP 1: Execute Spell Correction & Normalization Pipeline
  const spellInfo = correctQuerySpelling(cleanQuery);
  const targetQuery = spellInfo.isCorrected ? spellInfo.correctedQuery : cleanQuery;

  // STEP 2: Search Supabase Cache First
  try {
    const cachedLocalResults = await searchLocalIndex({ query: targetQuery, category, limit: 20 });
    if (cachedLocalResults && cachedLocalResults.length >= pageSize) {
      const deduplicatedCache = deduplicateByDomain(cachedLocalResults);
      const paginatedCache = deduplicatedCache.slice((page - 1) * pageSize, page * pageSize);

      return {
        query: targetQuery,
        original_query: cleanQuery,
        corrected_query: spellInfo.isCorrected ? spellInfo.correctedQuery : null,
        is_corrected: spellInfo.isCorrected,
        did_you_mean: spellInfo.didYouMean,
        results: filterByCategory(paginatedCache, category),
        total: deduplicatedCache.length,
        provider: 'Supabase Cache Index',
        page,
        pageSize,
      };
    }
  } catch (e) {
    console.warn('[SearchPipeline] Supabase cache lookup notice:', e);
  }

  const aggregatedResults: SearchResultItem[] = [];

  // STEP 3: Live Search Fallback via Google Custom Search JSON API
  try {
    const googleResults = await fetchGoogleCustomSearchResults(targetQuery, page, pageSize);
    if (googleResults && googleResults.length > 0) {
      aggregatedResults.push(...googleResults);
    }
  } catch (e) {
    console.warn('[SearchPipeline] Google CSE API call notice:', e);
  }

  // STEP 3: Multi-Provider & Curated Tech Index Fallback
  if (aggregatedResults.length === 0) {
    const curated = getCuratedFallbackResults(cleanQuery);
    if (curated.length > 0) {
      aggregatedResults.push(...curated);
    }
  }

  // STEP 4: Domain Deduplication & Quality Ranking
  const deduplicatedResults = deduplicateByDomain(aggregatedResults);
  deduplicatedResults.sort((a, b) => b.score - a.score);

  // STEP 5: Pagination Slice
  const startIndex = (page - 1) * pageSize;
  const paginatedResults = deduplicatedResults.slice(startIndex, startIndex + pageSize);

  // STEP 6: Store Live Results in Supabase Cache & Trigger Background Web Crawling
  try {
    if (paginatedResults.length > 0) {
      cacheResultsToDatabase(paginatedResults, cleanQuery);
      if (paginatedResults[0]) {
        crawlWebsiteUrl(paginatedResults[0].url);
      }
    }
  } catch (e) {
    // Non-blocking
  }

  return {
    query: targetQuery,
    original_query: cleanQuery,
    corrected_query: spellInfo.isCorrected ? spellInfo.correctedQuery : null,
    is_corrected: spellInfo.isCorrected,
    did_you_mean: spellInfo.didYouMean,
    results: filterByCategory(paginatedResults, category),
    total: deduplicatedResults.length,
    provider: 'Google CSE + Live Providers',
    page,
    pageSize,
  };
}

/**
 * Checks if a domain is explicitly trusted
 */
function isTrustedDomain(domain: string): boolean {
  const trustedList = ['wikipedia.org', 'github.com', 'developer.mozilla.org', 'w3.org', 'python.org', 'india.gov.in', 'iitk.ac.in', 'openflip.in'];
  return trustedList.some((td) => domain === td || domain.endsWith('.' + td));
}

/**
 * Authority Ranking based on real domain extension and type
 */
function calculateUniversalAuthorityScore(domain: string, isAbstract: boolean): number {
  let baseScore = isAbstract ? 0.96 : 0.75;

  if (domain.endsWith('.gov') || domain.endsWith('.edu') || domain.endsWith('.ac.in') || domain.endsWith('.gov.in')) {
    baseScore += 0.22;
  } else if (domain.includes('developer.mozilla.org') || domain.includes('w3.org') || domain.includes('docs.')) {
    baseScore += 0.20;
  } else if (domain.includes('github.com') || domain.includes('npmjs.com') || domain.includes('pypi.org') || domain.includes('wikipedia.org')) {
    baseScore += 0.18;
  } else if (domain.endsWith('.org') || domain.endsWith('.in') || domain.endsWith('.co.in') || domain.endsWith('.io') || domain.endsWith('.ai')) {
    baseScore += 0.15;
  } else {
    baseScore += 0.10;
  }

  return Number(Math.min(0.99, baseScore).toFixed(2));
}

/**
 * Enforces strict domain deduplication (1 result per domain per page)
 */
function deduplicateByDomain(items: SearchResultItem[]): SearchResultItem[] {
  const domainMap = new Map<string, SearchResultItem>();

  items.forEach((item) => {
    const existing = domainMap.get(item.domain);
    if (!existing || item.score > existing.score) {
      domainMap.set(item.domain, item);
    }
  });

  return Array.from(domainMap.values());
}

function determineCategory(url: string, text: string): 'all' | 'images' | 'videos' | 'news' | 'docs' | 'maps' | 'shopping' {
  const lower = (url + ' ' + text).toLowerCase();
  if (lower.includes('youtube.com') || lower.includes('video') || lower.includes('vimeo')) return 'videos';
  if (lower.includes('github.com') || lower.includes('docs') || lower.includes('documentation') || lower.includes('pdf')) return 'docs';
  if (lower.includes('news') || lower.includes('article') || lower.includes('blog')) return 'news';
  if (lower.includes('maps.google.com') || lower.includes('map') || lower.includes('location')) return 'maps';
  if (lower.includes('shop') || lower.includes('amazon') || lower.includes('store') || lower.includes('buy')) return 'shopping';
  if (lower.includes('image') || lower.includes('photo') || lower.includes('unsplash')) return 'images';
  return 'all';
}

function filterByCategory(items: SearchResultItem[], category: string): SearchResultItem[] {
  if (!category || category === 'all') return items;
  const filtered = items.filter((item) => item.category === category);
  return filtered.length > 0 ? filtered : items;
}

/**
 * Background caching of real search result metadata to Supabase indexed_pages
 */
async function cacheResultsToDatabase(results: SearchResultItem[], query: string) {
  if (!results || results.length === 0) return;

  try {
    const rowsToUpsert = results.map((r) => ({
      url: r.url,
      title: r.title,
      domain: r.domain,
      meta_description: r.meta_description,
      favicon_url: r.favicon_url,
      meta_keywords: `${query}, ${r.domain}, web search`,
      search_score: r.score,
      indexed_time: new Date().toISOString(),
    }));

    await supabaseAdmin
      .from('indexed_pages')
      .upsert(rowsToUpsert, { onConflict: 'url', ignoreDuplicates: true });
  } catch (err) {
    // Non-blocking background caching
  }
}

/**
 * Returns trusted curated web results for well-known tech terms when external search APIs are unavailable
 */
export function getCuratedFallbackResults(query: string): SearchResultItem[] {
  const q = query.toLowerCase().trim();

  if (q.includes('next.js') || q.includes('nextjs')) {
    return [
      {
        id: 'nextjs-home',
        title: 'Next.js 15 by Vercel - The React Framework for the Web',
        url: 'https://nextjs.org',
        domain: 'nextjs.org',
        meta_description: 'Used by some of the world\'s largest companies, Next.js enables you to create high-quality web applications with React components, server-side rendering, and static generation.',
        favicon_url: 'https://www.google.com/s2/favicons?domain=nextjs.org&sz=64',
        reading_time_min: 2,
        published_date: 'Official Site',
        category: 'docs',
        score: 0.98,
        verified_domain: true,
      },
      {
        id: 'nextjs-docs',
        title: 'Next.js 15 Documentation & Server Actions',
        url: 'https://nextjs.org/docs',
        domain: 'nextjs.org',
        meta_description: 'Welcome to the Next.js documentation. Learn how to build full-stack React applications with App Router, Server Actions, React Server Components, and Caching.',
        favicon_url: 'https://www.google.com/s2/favicons?domain=nextjs.org&sz=64',
        reading_time_min: 3,
        published_date: 'Documentation',
        category: 'docs',
        score: 0.96,
        verified_domain: true,
      },
      {
        id: 'vercel-blog-next15',
        title: 'Vercel Blog - Announcing Next.js 15',
        url: 'https://vercel.com/blog/next-15',
        domain: 'vercel.com',
        meta_description: 'Next.js 15 is now generally available. Featuring support for React 19, async request APIs, un-cached GET requests by default, and improved build speeds.',
        favicon_url: 'https://www.google.com/s2/favicons?domain=vercel.com&sz=64',
        reading_time_min: 4,
        published_date: 'Official Announcement',
        category: 'news',
        score: 0.94,
        verified_domain: true,
      },
      {
        id: 'github-nextjs',
        title: 'GitHub - vercel/next.js: The React Framework',
        url: 'https://github.com/vercel/next.js',
        domain: 'github.com',
        meta_description: 'Official open source repository for Next.js by Vercel. Explore source code, releases, bug reports, and discussions.',
        favicon_url: 'https://www.google.com/s2/favicons?domain=github.com&sz=64',
        reading_time_min: 2,
        published_date: 'Open Source Repository',
        category: 'docs',
        score: 0.92,
        verified_domain: true,
      },
      {
        id: 'npm-next',
        title: 'next - npm Package',
        url: 'https://www.npmjs.com/package/next',
        domain: 'npmjs.com',
        meta_description: 'The React Framework for the Web. Latest version 15.x. Install via npm install next react react-dom.',
        favicon_url: 'https://www.google.com/s2/favicons?domain=npmjs.com&sz=64',
        reading_time_min: 1,
        published_date: 'Package Manager',
        category: 'docs',
        score: 0.90,
        verified_domain: true,
      },
    ];
  }

  if (q.includes('ai') || q.includes('artificial intelligence')) {
    return [
      {
        id: 'wiki-ai',
        title: 'Artificial Intelligence - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
        domain: 'wikipedia.org',
        meta_description: 'Artificial intelligence (AI) is the intelligence of machines or software, as opposed to the intelligence of living beings, primarily of humans.',
        favicon_url: 'https://www.google.com/s2/favicons?domain=wikipedia.org&sz=64',
        reading_time_min: 5,
        published_date: 'Encyclopedia',
        category: 'all',
        score: 0.97,
        verified_domain: true,
      },
    ];
  }

  return [];
}
