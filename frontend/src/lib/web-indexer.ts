import { supabaseAdmin } from './supabase';
import { resolveRealDestinationUrl } from './search-provider';

export interface ExtractedPageMetadata {
  url: string;
  domain: string;
  title: string;
  meta_description: string;
  meta_keywords: string;
  canonical_url: string;
  language: string;
  main_text: string;
  favicon_url: string;
  outgoing_links: string[];
}

/**
 * Normalizes URL into canonical format stripping tracking parameters and fragments
 */
export function normalizeCanonicalUrl(rawUrl: string): { url: string; domain: string } | null {
  return resolveRealDestinationUrl(rawUrl);
}

/**
 * Fetches and parses robots.txt for crawling permissions
 */
export async function checkRobotsPermission(url: string): Promise<boolean> {
  try {
    const parsed = new URL(url);
    const robotsUrl = `${parsed.protocol}//${parsed.hostname}/robots.txt`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(robotsUrl, {
      headers: { 'User-Agent': 'SarathSearchBot/12.0 (+https://sarath.ai/bot)' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return true; // Default allow if no robots.txt

    const txt = await res.text();
    const path = parsed.pathname;

    const disallows = txt
      .split('\n')
      .filter((line) => line.toLowerCase().startsWith('disallow:'))
      .map((line) => line.split(':')[1].trim());

    for (const rule of disallows) {
      if (rule && path.startsWith(rule)) {
        return false; // Crawl disallowed
      }
    }

    return true;
  } catch {
    return true; // Default allow on fetch timeout/error
  }
}

/**
 * Extracts metadata, content text, and outgoing links from HTML
 */
export function extractHtmlMetadata(html: string, pageUrl: string): ExtractedPageMetadata {
  const resolved = normalizeCanonicalUrl(pageUrl) || { url: pageUrl, domain: 'web.org' };

  // Title Extraction
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : resolved.domain;

  // Meta Description Extraction
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
  const meta_description = descMatch ? descMatch[1].trim() : `Indexed web page for ${title}.`;

  // Keywords Extraction
  const kwMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
  const meta_keywords = kwMatch ? kwMatch[1].trim() : `${title}, ${resolved.domain}`;

  // Canonical Tag Extraction
  const canonMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  const canonical_url = canonMatch ? canonMatch[1].trim() : resolved.url;

  // Main Text Extraction
  const cleanHtml = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const main_text = cleanHtml.substring(0, 5000);

  // Outgoing Links Extraction
  const outgoing_links: string[] = [];
  const linkMatches = html.matchAll(/href=["'](https?:\/\/[^"'\s]+)["']/gi);
  for (const match of linkMatches) {
    const rawLink = match[1];
    const norm = normalizeCanonicalUrl(rawLink);
    if (norm && !outgoing_links.includes(norm.url) && outgoing_links.length < 20) {
      outgoing_links.push(norm.url);
    }
  }

  const favicon_url = `https://www.google.com/s2/favicons?domain=${resolved.domain}&sz=64`;

  return {
    url: resolved.url,
    domain: resolved.domain,
    title,
    meta_description,
    meta_keywords,
    canonical_url,
    language: 'en',
    main_text,
    favicon_url,
    outgoing_links,
  };
}

/**
 * Autonomous Crawl & Index Job
 * Fetches page HTML, extracts metadata, and upserts into Supabase `indexed_pages` table
 */
export async function crawlAndIndexPage(url: string): Promise<boolean> {
  const norm = normalizeCanonicalUrl(url);
  if (!norm) return false;

  const allowed = await checkRobotsPermission(norm.url);
  if (!allowed) {
    console.log(`[SarathCrawler] Crawl disallowed by robots.txt: ${norm.url}`);
    return false;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(norm.url, {
      headers: {
        'User-Agent': 'SarathSearchBot/12.0 (Native Autonomous Web Crawler; +https://sarath.ai)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return false;

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return false;

    const html = await res.text();
    const metadata = extractHtmlMetadata(html, norm.url);

    // Compute Base Authority Score
    let authorityScore = 0.75;
    if (norm.domain.endsWith('.gov') || norm.domain.endsWith('.edu') || norm.domain.endsWith('.ac.in')) authorityScore = 0.95;
    else if (norm.domain.endsWith('.org') || norm.domain.endsWith('.in') || norm.domain.endsWith('.io')) authorityScore = 0.90;

    // Upsert into Supabase `indexed_pages` Table
    await supabaseAdmin.from('indexed_pages').upsert({
      url: metadata.canonical_url,
      domain: metadata.domain,
      title: metadata.title,
      meta_description: metadata.meta_description,
      meta_keywords: metadata.meta_keywords,
      favicon_url: metadata.favicon_url,
      search_score: authorityScore,
      indexed_time: new Date().toISOString(),
    }, { onConflict: 'url', ignoreDuplicates: false });

    console.log(`[SarathCrawler] Successfully indexed: ${metadata.title} (${metadata.domain})`);
    return true;
  } catch (err: any) {
    console.warn(`[SarathCrawler] Index error for ${norm.url}:`, err.message);
    return false;
  }
}
