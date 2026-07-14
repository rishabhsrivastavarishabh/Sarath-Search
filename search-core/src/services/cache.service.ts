import { createClient } from 'redis';

export class CacheService {
    private static client: any;

    public static async init() {
        if (!this.client) {
            this.client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
            await this.client.connect();
        }
        return this.client;
    }

    public static async setQueryCache(query: string, results: any, ttl = 3600) {
        const client = await this.init();
        await client.set(`search_cache:${query}`, JSON.stringify(results), {
            EX: ttl
        });
    }

    public static async getQueryCache(query: string) {
        const client = await this.init();
        const cached = await client.get(`search_cache:${query}`);
        return cached ? JSON.parse(cached) : null;
    }
}
