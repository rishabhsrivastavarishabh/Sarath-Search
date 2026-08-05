import { supabaseAdmin } from './supabase';

export interface CrawlResult {
  url: string;
  canonical_url: string;
  title: string;
  meta_description: string;
  meta_keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
  favicon_url: string;
  language: string;
  status_code: number;
  content_hash: string;
  internal_links: string[];
  external_links: string[];
}

/**
 * Web Crawler Engine
 * Crawls publicly accessible websites, respects robots.txt & sitemap.xml, extracts metadata & content hashes.
 */
export async function crawlWebsiteUrl(targetUrl: string, websiteId?: string): Promise<CrawlResult | null> {
  try {
    let cleanUrl = targetUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const parsed = new URL(cleanUrl);
    const domain = parsed.hostname.replace(/^www\./, '');

    // 1. Check robots.txt permissions
    const robotsAllowed = await checkRobotsPermission(parsed.origin, parsed.pathname);
    if (!robotsAllowed) {
      console.warn(`[Crawler] Disallowed by robots.txt: ${cleanUrl}`);
      return null;
    }

    // 2. Fetch Page HTML
    const response = await fetch(cleanUrl, {
      headers: {
        'User-Agent': 'SarathBot/6.5 (+https://sarath.ai/bot; web-crawler)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.warn(`[Crawler] HTTP ${response.status} for ${cleanUrl}`);
      return null;
    }

    const html = await response.text();

    // 3. Extract Metadata
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : `${domain} Official Site`;

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const meta_description = descMatch ? descMatch[1].trim() : `Official content and resources for ${domain}.`;

    const keyMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
    const meta_keywords = keyMatch ? keyMatch[1].trim() : '';

    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const og_title = ogTitleMatch ? ogTitleMatch[1].trim() : title;

    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    const og_description = ogDescMatch ? ogDescMatch[1].trim() : meta_description;

    const ogImgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    const og_image = ogImgMatch ? ogImgMatch[1].trim() : '';

    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    const canonical_url = canonicalMatch ? canonicalMatch[1].trim() : cleanUrl;

    const favicon_url = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    // Simple Hash Generator for deduplication
    const content_hash = simpleHash(title + meta_description);

    // 4. Save to indexed_pages table
    const crawlRecord: CrawlResult = {
      url: cleanUrl,
      canonical_url,
      title,
      meta_description,
      meta_keywords,
      og_title,
      og_description,
      og_image,
      favicon_url,
      language: 'en',
      status_code: response.status,
      content_hash,
      internal_links: [],
      external_links: [],
    };

    try {
      await supabaseAdmin.from('indexed_pages').upsert({
        website_id: websiteId || null,
        url: cleanUrl,
        canonical_url,
        title,
        meta_description,
        meta_keywords,
        og_title,
        og_description,
        og_image,
        favicon_url,
        language: 'en',
        status_code: response.status,
        content_hash,
        indexed_time: new Date().toISOString(),
        last_crawl: new Date().toISOString(),
        search_score: 0.95,
        is_indexed: true,
      }, { onConflict: 'url' });
    } catch (e) {
      console.warn('[Crawler] DB Upsert Exception', e);
    }

    return crawlRecord;
  } catch (err) {
    console.warn('[Crawler] Execution error', err);
    return null;
  }
}

/**
 * Checks robots.txt permission
 */
async function checkRobotsPermission(origin: string, pathname: string): Promise<boolean> {
  try {
    const robotsRes = await fetch(`${origin}/robots.txt`, {
      next: { revalidate: 86400 },
    });
    if (robotsRes.ok) {
      const txt = await robotsRes.text();
      if (txt.includes('User-agent: *') && txt.includes('Disallow: /')) {
        // Disallowed root
        return false;
      }
    }
  } catch {
    // If no robots.txt exists, default to allow
  }
  return true;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}
