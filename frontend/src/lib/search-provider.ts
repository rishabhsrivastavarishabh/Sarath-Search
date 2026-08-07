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

  // STEP 2: Check Supabase Cache First
  let cacheHit = false;
  try {
    const cachedLocalResults = await searchLocalIndex({ query: targetQuery, category, limit: 20 });
    if (cachedLocalResults && cachedLocalResults.length >= pageSize) {
      cacheHit = true;
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

  // STEP 4: Query Expansion & Retry Strategy (Broader / Key Term Retries)
  if (aggregatedResults.length === 0 && targetQuery !== cleanQuery) {
    try {
      const retryResults = await fetchGoogleCustomSearchResults(cleanQuery, page, pageSize);
      if (retryResults && retryResults.length > 0) {
        aggregatedResults.push(...retryResults);
      }
    } catch (e) {
      // Retry catch
    }
  }

  // STEP 5: Multi-Provider & Curated Tech Index Fallback
  if (aggregatedResults.length === 0) {
    const curated = getCuratedFallbackResults(cleanQuery) || getCuratedFallbackResults(targetQuery);
    if (curated && curated.length > 0) {
      aggregatedResults.push(...curated);
    }
  }

  // STEP 6: Domain Deduplication & Quality Ranking
  const deduplicatedResults = deduplicateByDomain(aggregatedResults);
  deduplicatedResults.sort((a, b) => b.score - a.score);

  // STEP 7: Pagination Slice
  const startIndex = (page - 1) * pageSize;
  const paginatedResults = deduplicatedResults.slice(startIndex, startIndex + pageSize);

  // STEP 8: Store Live Results in Supabase Cache & Trigger Background Web Crawling
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
    provider: aggregatedResults.length > 0 ? 'Google CSE + Live Providers' : 'Native Index',
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
 * Enterprise Query Normalization Pipeline: Unicode NFC normalization, trimming, lowering & whitespace collapse
 */
export function normalizeQueryString(rawQuery: string): string {
  if (!rawQuery) return '';
  return rawQuery
    .normalize('NFC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * 10-Tier Domain Authority Ranking Matrix (Sarath Engine v23.0)
 */
function calculateUniversalAuthorityScore(domain: string, isAbstract: boolean): number {
  let baseScore = isAbstract ? 0.96 : 0.75;
  const d = domain.toLowerCase();

  if (d.includes('nextjs.org') || d.includes('python.org') || d.includes('react.dev') || d.includes('nodejs.org') || d.includes('supabase.com') || d.includes('google.com')) {
    baseScore += 0.24; // Priority 1: Official Website
  } else if (d.endsWith('.gov') || d.endsWith('.gov.in')) {
    baseScore += 0.23; // Priority 2: Government
  } else if (d.endsWith('.edu') || d.endsWith('.ac.in')) {
    baseScore += 0.22; // Priority 3: Educational
  } else if (d.includes('developer.mozilla.org') || d.includes('w3.org') || d.includes('docs.')) {
    baseScore += 0.20; // Priority 4: Official Documentation
  } else if (d.includes('wikipedia.org')) {
    baseScore += 0.19; // Priority 5: Wikipedia
  } else if (d.includes('github.com') || d.includes('npmjs.com') || d.includes('pypi.org')) {
    baseScore += 0.18; // Priority 6: GitHub & Open Source
  } else if (d.includes('bbc.') || d.includes('reuters.') || d.includes('nytimes.')) {
    baseScore += 0.16; // Priority 7: Trusted News
  } else if (d.endsWith('.org') || d.endsWith('.io') || d.endsWith('.ai') || d.endsWith('.in')) {
    baseScore += 0.14; // Priority 8: High Authority TLDs
  } else if (d.includes('stackoverflow.com') || d.includes('reddit.com')) {
    baseScore += 0.12; // Priority 9: Community
  } else {
    baseScore += 0.08; // Priority 10: Blogs & Personal Sites
  }

  return Number(Math.min(0.99, baseScore).toFixed(2));
}

/**
 * Deduplicates results only when BOTH exact URL and hostname match, preserving subdomains (e.g. help.instagram.com, play.google.com, apps.apple.com)
 */
function deduplicateByDomain(items: SearchResultItem[]): SearchResultItem[] {
  const urlMap = new Map<string, SearchResultItem>();

  items.forEach((item) => {
    // Normalize URL key to allow subdomains & distinct subpaths
    const key = item.url.trim().toLowerCase().replace(/\/$/, '');
    if (!urlMap.has(key)) {
      urlMap.set(key, item);
    }
  });

  return Array.from(urlMap.values());
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

  if (q.includes('instagram')) {
    return [
      {
        id: 'instagram-home',
        title: 'Instagram - Photo & Video Sharing Social Platform',
        url: 'https://www.instagram.com',
        domain: 'instagram.com',
        meta_description: 'Create an account or log in to Instagram - A simple, fun & creative way to capture, edit & share photos, videos & messages with friends & family.',
        favicon_url: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=64',
        reading_time_min: 1,
        published_date: 'Official Site',
        category: 'all',
        score: 0.99,
        verified_domain: true,
      },
      {
        id: 'instagram-web',
        title: 'Instagram Web - Explore Photos & Reels',
        url: 'https://www.instagram.com/explore',
        domain: 'instagram.com',
        meta_description: 'Explore photos, videos, and trending reels on Instagram Web.',
        favicon_url: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=64',
        reading_time_min: 1,
        published_date: 'Official Platform',
        category: 'all',
        score: 0.95,
        verified_domain: true,
      },
    ];
  }

  if (q.includes('youtube')) {
    return [
      {
        id: 'youtube-home',
        title: 'YouTube - Enjoy the Videos and Music You Love',
        url: 'https://www.youtube.com',
        domain: 'youtube.com',
        meta_description: 'Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on YouTube.',
        favicon_url: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64',
        reading_time_min: 1,
        published_date: 'Official Video Platform',
        category: 'videos',
        score: 0.99,
        verified_domain: true,
      },
    ];
  }

  if (q === 'google' || q.includes('google.com')) {
    return [
      {
        id: 'google-home',
        title: 'Google',
        url: 'https://www.google.com',
        domain: 'google.com',
        meta_description: 'Search the world\'s information, including webpages, images, videos and more. Google has many special features to help you find exactly what you\'re looking for.',
        favicon_url: 'https://www.google.com/s2/favicons?domain=google.com&sz=64',
        reading_time_min: 1,
        published_date: 'Official Search Engine',
        category: 'all',
        score: 0.99,
        verified_domain: true,
      },
    ];
  }

  if (q.includes('react')) {
    return [
      {
        id: 'react-home',
        title: 'React - The Library for Web and Native User Interfaces',
        url: 'https://react.dev',
        domain: 'react.dev',
        meta_description: 'React lets you build user interfaces out of individual pieces called components. Create your own React components like Thumbnail, LikeButton, and Video.',
        favicon_url: 'https://www.google.com/s2/favicons?domain=react.dev&sz=64',
        reading_time_min: 2,
        published_date: 'Official Documentation',
        category: 'docs',
        score: 0.99,
        verified_domain: true,
      },
    ];
  }

  return [];
}
