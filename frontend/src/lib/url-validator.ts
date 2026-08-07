/**
 * Sarath Search Engine v20.0 — URL Validation & Real Web Metadata Extraction Module
 */

export interface ValidatedWebPage {
  url: string;
  domain: string;
  canonicalUrl: string;
  title: string;
  description: string;
  faviconUrl: string;
  httpStatus: number;
  isValid: boolean;
}

/**
 * Validates a web URL, strips tracking parameters, and checks HTTP response status
 */
export async function validateAndExtractPageMetadata(rawUrl: string): Promise<ValidatedWebPage | null> {
  if (!rawUrl || typeof rawUrl !== 'string') return null;

  try {
    const cleanUrl = rawUrl.trim();
    const parsed = new URL(cleanUrl);

    // Filter out internal wrappers
    if (
      parsed.hostname.includes('duckduckgo.com') ||
      parsed.hostname.includes('google.com/search') ||
      parsed.hostname.includes('bing.com/search')
    ) {
      return null;
    }

    // Strip tracking query parameters
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'ref', 'source'];
    trackingParams.forEach((param) => parsed.searchParams.delete(param));
    parsed.hash = '';

    const canonicalUrl = parsed.toString();
    const domain = parsed.hostname.replace(/^www\./, '');
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    // Fast HEAD/GET HTTP Validation
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(canonicalUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'SarathSearchBot/20.0 (Live Internet Web Validator; +https://sarath.ai/bot)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeout);

    if (!res || !res.ok) {
      return {
        url: canonicalUrl,
        domain,
        canonicalUrl,
        title: domain,
        description: `Official web page for ${domain}.`,
        faviconUrl,
        httpStatus: res ? res.status : 504,
        isValid: false,
      };
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return {
        url: canonicalUrl,
        domain,
        canonicalUrl,
        title: domain,
        description: `Document at ${domain}.`,
        faviconUrl,
        httpStatus: res.status,
        isValid: true,
      };
    }

    const html = await res.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : domain;

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1].trim() : `${title} - ${domain} official website.`;

    return {
      url: canonicalUrl,
      domain,
      canonicalUrl,
      title,
      description,
      faviconUrl,
      httpStatus: res.status,
      isValid: true,
    };
  } catch {
    return null;
  }
}
