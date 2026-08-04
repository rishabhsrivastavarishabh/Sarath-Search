export interface RobotsRules {
  domain: string;
  isAllowed: boolean;
  crawlDelayMs: number;
  disallowedPaths: string[];
  allowedPaths: string[];
  sitemaps: string[];
}

export interface CanonicalMetaInfo {
  canonicalUrl?: string;
  metaRobotsIndex: boolean;
  metaRobotsFollow: boolean;
}

/**
 * Parses robots.txt content and determines crawl permissions according to standard web rules
 */
export function parseRobotsTxt(domain: string, robotsContent: string, targetPath = '/'): RobotsRules {
  const lines = robotsContent.split('\n');
  let isTargetUserAgent = true;
  let crawlDelayMs = 0;
  const disallowedPaths: string[] = [];
  const allowedPaths: string[] = [];
  const sitemaps: string[] = [];

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;

    const [key, ...valParts] = line.split(':');
    const value = valParts.join(':').trim();
    const keyLower = key.trim().toLowerCase();

    if (keyLower === 'user-agent') {
      isTargetUserAgent = value === '*' || value.toLowerCase().includes('sarathbot') || value.toLowerCase().includes('bot');
    } else if (isTargetUserAgent) {
      if (keyLower === 'disallow') {
        if (value) disallowedPaths.push(value);
      } else if (keyLower === 'allow') {
        if (value) allowedPaths.push(value);
      } else if (keyLower === 'crawl-delay') {
        crawlDelayMs = parseInt(value, 10) * 1000 || 0;
      }
    }

    if (keyLower === 'sitemap' && value) {
      sitemaps.push(value);
    }
  }

  // Check if target path matches any disallow rules
  const isDisallowed = disallowedPaths.some((p) => targetPath.startsWith(p));
  const isExplicitlyAllowed = allowedPaths.some((p) => targetPath.startsWith(p));
  const isAllowed = isExplicitlyAllowed || !isDisallowed;

  return {
    domain,
    isAllowed,
    crawlDelayMs,
    disallowedPaths,
    allowedPaths,
    sitemaps,
  };
}

/**
 * Inspects meta tags for index, follow, and canonical URLs
 */
export function parseHtmlMetaRobots(html: string, pageUrl: string): CanonicalMetaInfo {
  const lowerHtml = html.toLowerCase();
  
  let metaRobotsIndex = !lowerHtml.includes('name="robots" content="noindex"') && !lowerHtml.includes('content="noindex"');
  let metaRobotsFollow = !lowerHtml.includes('rel="nofollow"') && !lowerHtml.includes('content="nofollow"');

  let canonicalUrl = pageUrl;
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  if (canonicalMatch && canonicalMatch[1]) {
    canonicalUrl = canonicalMatch[1];
  }

  return {
    canonicalUrl,
    metaRobotsIndex,
    metaRobotsFollow,
  };
}
