import 'dotenv/config';
import { CrawlerService } from './services/crawler.service';

async function start() {
    console.log('Sarath Crawler starting...');

    // Seed URLs if queue is empty (for demo/init)
    // In production, this would be managed via the Admin Panel
    const seeds = ['https://example.com', 'https://wikipedia.org'];
    for (const seed of seeds) {
        // We use a raw redis client for simplicity here
        const { createClient } = await import('redis');
        const client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
        await client.connect();
        await client.lPush('crawl_queue', seed);
        await client.disconnect();
    }

    await CrawlerService.processQueue();
}

start().catch(console.error);
