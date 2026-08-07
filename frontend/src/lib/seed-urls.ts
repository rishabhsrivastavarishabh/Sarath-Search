/**
 * Sarath Search Engine v16.0 — Web Crawler & Supabase Website Discovery Seed List
 */

export interface SeedUrlItem {
  url: string;
  domain: string;
  category: 'tech' | 'docs' | 'education' | 'government' | 'general';
  priority: number;
}

export const GLOBAL_SEED_URLS: SeedUrlItem[] = [
  { url: 'https://www.wikipedia.org', domain: 'wikipedia.org', category: 'general', priority: 1.0 },
  { url: 'https://github.com', domain: 'github.com', category: 'tech', priority: 0.98 },
  { url: 'https://developer.mozilla.org', domain: 'developer.mozilla.org', category: 'docs', priority: 0.98 },
  { url: 'https://react.dev', domain: 'react.dev', category: 'docs', priority: 0.96 },
  { url: 'https://nodejs.org', domain: 'nodejs.org', category: 'docs', priority: 0.95 },
  { url: 'https://www.python.org', domain: 'python.org', category: 'tech', priority: 0.94 },
  { url: 'https://stackoverflow.com', domain: 'stackoverflow.com', category: 'tech', priority: 0.92 },
  { url: 'https://openflip.in', domain: 'openflip.in', category: 'tech', priority: 0.90 },
  { url: 'https://iitk.ac.in', domain: 'iitk.ac.in', category: 'education', priority: 0.90 },
  { url: 'https://india.gov.in', domain: 'india.gov.in', category: 'government', priority: 0.90 },
  { url: 'https://www.w3.org', domain: 'w3.org', category: 'docs', priority: 0.88 },
  { url: 'https://npmjs.com', domain: 'npmjs.com', category: 'tech', priority: 0.86 },
];

/**
 * Returns seed domain initial list for crawler bootstrapping
 */
export function getInitialSeedUrls(): string[] {
  return GLOBAL_SEED_URLS.map((s) => s.url);
}
