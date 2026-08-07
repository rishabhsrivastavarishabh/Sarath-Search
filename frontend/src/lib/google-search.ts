import { SearchResultItem } from '@/types';
import { resolveRealDestinationUrl } from './search-provider';
import { supabaseAdmin } from './supabase';

const GOOGLE_SEARCH_API_KEY =
  process.env.GOOGLE_SEARCH_API_KEY || 'AIzaSyCOmaT7tYxwUdyJj2ehem7Mm3tQ3lhEH5g';

const GOOGLE_SEARCH_ENGINE_ID =
  process.env.GOOGLE_SEARCH_ENGINE_ID ||
  process.env.GOOGLE_SEARCH_CX ||
  process.env.GOOGLE_CX ||
  '514a2403c527f4da2';

/**
 * Validates Google Custom Search configuration securely on server
 */
export function validateGoogleSearchConfig(): { valid: boolean; apiKey: string; cx: string; message?: string } {
  const apiKey = GOOGLE_SEARCH_API_KEY;
  const cx = GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey) {
    return { valid: false, apiKey: '', cx: '', message: 'GOOGLE_SEARCH_API_KEY is missing in environment variables.' };
  }

  return { valid: true, apiKey, cx };
}

/**
 * Fetches search results from Google Custom Search JSON API with exponential backoff retries & caching
 */
export async function fetchGoogleCustomSearchResults(
  query: string,
  page = 1,
  pageSize = 10
): Promise<SearchResultItem[]> {
  const { valid, apiKey, cx, message } = validateGoogleSearchConfig();

  if (!valid || !apiKey) {
    console.warn(`[GoogleSearchAPI] ${message || 'API key missing'}`);
    return [];
  }

  if (!cx) {
    console.warn('[GoogleSearchAPI] GOOGLE_SEARCH_ENGINE_ID is not configured in .env.local.');
    return [];
  }

  const cleanQuery = query.trim();
  const start = Math.max(1, (page - 1) * pageSize + 1);
  const num = Math.min(10, pageSize);
  const apiUrl = `https://customsearch.googleapis.com/customsearch/v1?key=${encodeURIComponent(apiKey)}&cx=${encodeURIComponent(cx)}&q=${encodeURIComponent(cleanQuery)}&start=${start}&num=${num}`;

  let attempts = 0;
  const maxAttempts = 3;
  let lastError: Error | null = null;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SarathSearchEngine/14.0 (Google CSE Integration)',
        },
        next: { revalidate: 1800 },
      });

      if (response.ok) {
        const data = await response.json();

        if (!data.items || !Array.isArray(data.items)) {
          return [];
        }

        const parsedResults: SearchResultItem[] = [];

        data.items.forEach((item: any, idx: number) => {
          const rawLink = item.link || item.formattedUrl;
          const resolved = resolveRealDestinationUrl(rawLink);

          if (resolved) {
            const title = (item.title || item.htmlTitle || resolved.domain).replace(/<\/?[^>]+(>|$)/g, '');
            const snippet = (item.snippet || item.htmlSnippet || `Official web page for ${title}.`).replace(/<\/?[^>]+(>|$)/g, '');
            const domain = resolved.domain;
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

            // OpenGraph Image & Metatags Extraction
            let ogImage: string | undefined = undefined;
            let pubDate = 'Indexed';

            if (item.pagemap) {
              if (item.pagemap.cse_image && item.pagemap.cse_image[0]?.src) {
                ogImage = item.pagemap.cse_image[0].src;
              } else if (item.pagemap.metatags && item.pagemap.metatags[0]) {
                const meta = item.pagemap.metatags[0];
                if (meta['og:image']) ogImage = meta['og:image'];
                if (meta['article:published_time']) {
                  try { pubDate = new Date(meta['article:published_time']).toLocaleDateString(); } catch { }
                }
              }
            }

            parsedResults.push({
              id: `google-cse-${idx + 1}`,
              title,
              url: resolved.url,
              domain,
              meta_description: snippet,
              favicon_url: faviconUrl,
              reading_time_min: Math.max(1, Math.ceil(snippet.split(' ').length / 150)),
              published_date: pubDate,
              category: determineCategoryFromUrlAndTitle(resolved.url, title, snippet),
              score: Number((0.98 - idx * 0.02).toFixed(2)),
              verified_domain: isTrustedDomain(domain),
              og_image: ogImage,
            });
          }
        });

        // Background Database Caching
        cacheGoogleResultsToDatabase(parsedResults, cleanQuery);

        return parsedResults;
      }

      // Handle non-OK response codes (e.g. 429 quota, 500 server error)
      const errorText = await response.text();
      console.warn(`[GoogleSearchAPI] Response failed (Status ${response.status}): ${errorText.substring(0, 150)}`);

      if (response.status === 429 || response.status >= 500) {
        const delay = Math.pow(2, attempts) * 250;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      } else {
        break;
      }
    } catch (err: any) {
      lastError = err;
      const delay = Math.pow(2, attempts) * 250;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  if (lastError) {
    console.error('[GoogleSearchAPI] Failed after retries:', lastError.message);
  }

  return [];
}

function determineCategoryFromUrlAndTitle(url: string, title: string, snippet: string): any {
  const lower = (url + ' ' + title + ' ' + snippet).toLowerCase();
  if (lower.includes('youtube.com') || lower.includes('vimeo.com') || lower.includes('video')) return 'videos';
  if (lower.includes('github.com') || lower.includes('docs.') || lower.includes('.pdf')) return 'docs';
  if (lower.includes('news') || lower.includes('article') || lower.includes('blog')) return 'news';
  if (lower.includes('shop') || lower.includes('store') || lower.includes('buy') || lower.includes('price')) return 'shopping';
  return 'all';
}

function isTrustedDomain(domain: string): boolean {
  const trustedList = ['wikipedia.org', 'github.com', 'developer.mozilla.org', 'w3.org', 'python.org', 'india.gov.in', 'iitk.ac.in', 'openflip.in'];
  return trustedList.some((td) => domain === td || domain.endsWith('.' + td));
}

/**
 * Caches retrieved search metadata into Supabase `indexed_pages` table
 */
async function cacheGoogleResultsToDatabase(results: SearchResultItem[], query: string) {
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
