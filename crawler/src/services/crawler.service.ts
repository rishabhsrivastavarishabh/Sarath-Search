import axios from 'axios';
import * as cheerio from 'cheerio';
import robotsParser from 'robots-parser';
import { createClient } from 'redis';
import { Pool } from 'pg';

const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });

redisClient.connect().catch(console.error);

export class CrawlerService {
    private static async getRobotsTxt(url: string) {
        try {
            const domain = new URL(url).hostname;
            const response = await axios.get(`http://${domain}/robots.txt`);
            return robotsParser(response.data);
        } catch (e) {
            return robotsParser(''); // Default robots.txt if not found
        }
    }

    private static async normalizeUrl(url: string): Promise<string> {
        const parsed = new URL(url);
        parsed.hash = '';
        return parsed.toString();
    }

    public static async crawlPage(url: string) {
        const normalizedUrl = await this.normalizeUrl(url);

        // Check if already crawled
        const exists = await redisClient.sIsMember('crawled_urls', normalizedUrl);
        if (exists) return null;

        const robots = await this.getRobotsTxt(normalizedUrl);
        if (!robots.isAllowed(normalizedUrl)) {
            console.log(`Blocked by robots.txt: ${normalizedUrl}`);
            return null;
        }

        try {
            const { data } = await axios.get(normalizedUrl, {
                timeout: 10000,
                headers: { 'User-Agent': 'SarathBot/1.0' }
            });
            const $ = cheerio.load(data);

            const pageData = {
                url: normalizedUrl,
                title: $('title').text(),
                description: $('meta[name="description"]').attr('content'),
                keywords: $('meta[name="keywords"]').attr('content'),
                content: $('body').text().replace(/\s+/g, ' ').trim(),
                links: [] as string[]
            };

            $('a[href]').each((_, el) => {
                const href = $(el).attr('href');
                if (href) {
                    try {
                        const absolute = new URL(href, normalizedUrl).href;
                        pageData.links.push(absolute);
                    } catch (e) {}
                }
            });

            // Mark as crawled
            await redisClient.sAdd('crawled_urls', normalizedUrl);

            // Push to indexer (via Redis Queue)
            await redisClient.lPush('indexing_queue', JSON.stringify(pageData));

            return pageData;
        } catch (error) {
            console.error(`Error crawling ${normalizedUrl}:`, error);
            return null;
        }
    }

    public static async processQueue() {
        while (true) {
            const url = await redisClient.rPop('crawl_queue');
            if (url) {
                console.log(`Crawling: ${url}`);
                await this.crawlPage(url);
            } else {
                // Wait a bit if queue is empty
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
}
