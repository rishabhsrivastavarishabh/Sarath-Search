import { supabaseAdmin } from './supabase';
import { GLOBAL_SEED_URLS } from './seed-urls';
import { resolveRealDestinationUrl } from './search-provider';

export interface CrawlEngineStats {
  seedsLoaded: number;
  websitesDiscovered: number;
  pagesCrawled: number;
  urlsQueued: number;
  errors: number;
  status: 'idle' | 'crawling' | 'completed' | 'paused';
}

/**
 * Normalizes URL into canonical format stripping tracking parameters and fragments
 */
export function normalizeCrawlerUrl(rawUrl: string): { url: string; domain: string; rootUrl: string } | null {
  const resolved = resolveRealDestinationUrl(rawUrl);
  if (!resolved) return null;

  try {
    const parsed = new URL(resolved.url);
    const rootUrl = `${parsed.protocol}//${parsed.hostname}`;
    return {
      url: resolved.url,
      domain: resolved.domain,
      rootUrl,
    };
  } catch {
    return null;
  }
}

/**
 * Bootstraps Supabase `websites` table with initial Seed URLs if not present
 */
export async function bootstrapSeedWebsites(): Promise<number> {
  let insertedCount = 0;

  for (const seed of GLOBAL_SEED_URLS) {
    try {
      const norm = normalizeCrawlerUrl(seed.url);
      if (!norm) continue;

      const { data: existing } = await supabaseAdmin
        .from('websites')
        .select('id')
        .eq('domain', norm.domain)
        .single();

      if (!existing) {
        await supabaseAdmin.from('websites').insert({
          domain: norm.domain,
          root_url: norm.rootUrl,
          language: 'en',
          country: 'US',
          favicon: `https://www.google.com/s2/favicons?domain=${norm.domain}&sz=64`,
          robots: `${norm.rootUrl}/robots.txt`,
          sitemap: `${norm.rootUrl}/sitemap.xml`,
          status: 'active',
          pages: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        insertedCount++;
      }
    } catch (e) {
      // Non-blocking loop
    }
  }

  return insertedCount;
}

/**
 * Fetches and parses robots.txt for crawling permissions
 */
export async function checkRobotsPermission(domain: string, path = '/'): Promise<boolean> {
  try {
    const robotsUrl = `https://${domain}/robots.txt`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(robotsUrl, {
      headers: { 'User-Agent': 'SarathSearchBot/16.0 (Supabase Web Indexer; +https://sarath.ai/bot)' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return true; // Default allow if no robots.txt

    const txt = await res.text();
    const disallows = txt
      .split('\n')
      .filter((line) => line.toLowerCase().startsWith('disallow:'))
      .map((line) => line.split(':')[1].trim());

    for (const rule of disallows) {
      if (rule && path.startsWith(rule)) {
        return false;
      }
    }

    return true;
  } catch {
    return true;
  }
}

/**
 * Crawls a single URL, extracts page content, discovers external websites, and saves to Supabase
 */
export async function crawlPageAndDiscoverWebsites(targetUrl: string): Promise<{ success: boolean; newWebsitesFound: number; linksDiscovered: number }> {
  const norm = normalizeCrawlerUrl(targetUrl);
  if (!norm) return { success: false, newWebsitesFound: 0, linksDiscovered: 0 };

  const path = new URL(norm.url).pathname;
  const allowed = await checkRobotsPermission(norm.domain, path);
  if (!allowed) {
    console.log(`[SarathCrawlerEngine] Disallowed by robots.txt: ${norm.url}`);
    return { success: false, newWebsitesFound: 0, linksDiscovered: 0 };
  }

  let newWebsitesFound = 0;
  let linksDiscovered = 0;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(norm.url, {
      headers: {
        'User-Agent': 'SarathSearchBot/16.0 (Web Crawler & Supabase Discovery System)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return { success: false, newWebsitesFound: 0, linksDiscovered: 0 };

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return { success: false, newWebsitesFound: 0, linksDiscovered: 0 };

    const html = await res.text();

    // Extract Title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : norm.domain;

    // Extract Meta Description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    const meta_description = descMatch ? descMatch[1].trim() : `Official web page for ${title}.`;

    // Extract Keywords
    const kwMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
    const meta_keywords = kwMatch ? kwMatch[1].trim() : `${title}, ${norm.domain}`;

    // Favicon URL
    const favicon_url = `https://www.google.com/s2/favicons?domain=${norm.domain}&sz=64`;

    // Compute Base Search Score
    let search_score = 0.75;
    if (norm.domain.endsWith('.gov') || norm.domain.endsWith('.edu') || norm.domain.endsWith('.ac.in')) search_score = 0.95;
    else if (norm.domain.endsWith('.org') || norm.domain.endsWith('.in') || norm.domain.endsWith('.io')) search_score = 0.90;

    // 1. Save Crawled Page to Supabase `indexed_pages` Table
    await supabaseAdmin.from('indexed_pages').upsert({
      url: norm.url,
      domain: norm.domain,
      title,
      meta_description,
      meta_keywords,
      favicon_url,
      search_score,
      indexed_time: new Date().toISOString(),
    }, { onConflict: 'url', ignoreDuplicates: false });

    // 2. Discover Outgoing Links & Auto-Register New External Domains into Supabase `websites` Table
    const linkMatches = html.matchAll(/href=["'](https?:\/\/[^"'\s]+)["']/gi);
    for (const match of linkMatches) {
      const discoveredNorm = normalizeCrawlerUrl(match[1]);
      if (!discoveredNorm) continue;
      linksDiscovered++;

      // Check if domain exists in Supabase `websites` table
      if (discoveredNorm.domain !== norm.domain) {
        try {
          const { data: existingWebsite } = await supabaseAdmin
            .from('websites')
            .select('id')
            .eq('domain', discoveredNorm.domain)
            .single();

          if (!existingWebsite) {
            // Automatically insert newly discovered website into Supabase `websites` table
            await supabaseAdmin.from('websites').insert({
              domain: discoveredNorm.domain,
              root_url: discoveredNorm.rootUrl,
              language: 'en',
              country: 'US',
              favicon: `https://www.google.com/s2/favicons?domain=${discoveredNorm.domain}&sz=64`,
              robots: `${discoveredNorm.rootUrl}/robots.txt`,
              sitemap: `${discoveredNorm.rootUrl}/sitemap.xml`,
              status: 'pending',
              pages: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            newWebsitesFound++;
            console.log(`[SarathDiscoveryEngine] Discovered new website domain: ${discoveredNorm.domain}`);
          }
        } catch {
          // Ignore duplicate insert conflicts
        }
      }

      // Queue URL into Supabase `submitted_urls` for incremental crawling queue
      try {
        await supabaseAdmin.from('submitted_urls').insert({
          url: discoveredNorm.url,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        });
      } catch {
        // Ignore duplicates
      }

      if (linksDiscovered >= 25) break; // Limit per page discovery
    }

    console.log(`[SarathCrawlerEngine] Crawled ${norm.domain} (${linksDiscovered} links, ${newWebsitesFound} new domains discovered)`);
    return { success: true, newWebsitesFound, linksDiscovered };
  } catch (err: any) {
    console.warn(`[SarathCrawlerEngine] Fetch error for ${norm.url}:`, err.message);
    return { success: false, newWebsitesFound: 0, linksDiscovered: 0 };
  }
}

/**
 * Executes a distributed Crawler Engine batch run
 */
export async function runCrawlerBatchJob(batchSize = 5): Promise<CrawlEngineStats> {
  const seedsLoaded = await bootstrapSeedWebsites();
  let totalPagesCrawled = 0;
  let totalNewWebsites = 0;
  let totalUrlsQueued = 0;
  let errors = 0;

  // Crawl Seed List Items
  const seedTargets = GLOBAL_SEED_URLS.slice(0, batchSize).map((s) => s.url);

  for (const url of seedTargets) {
    const result = await crawlPageAndDiscoverWebsites(url);
    if (result.success) {
      totalPagesCrawled++;
      totalNewWebsites += result.newWebsitesFound;
      totalUrlsQueued += result.linksDiscovered;
    } else {
      errors++;
    }
  }

  return {
    seedsLoaded,
    websitesDiscovered: totalNewWebsites,
    pagesCrawled: totalPagesCrawled,
    urlsQueued: totalUrlsQueued,
    errors,
    status: 'completed',
  };
}
