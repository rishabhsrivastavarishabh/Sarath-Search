import { Pool } from 'pg';
import natural from 'natural';
import { CacheService } from './cache.service';

const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });

export class SearchCore {
    private static async getAvgDocLength(): Promise<number> {
        const res = await pgPool.query('SELECT AVG(LENGTH(content)) as avg_len FROM pages');
        return parseFloat(res.rows[0].avg_len) || 0;
    }

    private static async getDocLength(pageId: number): Promise<number> {
        const res = await pgPool.query('SELECT LENGTH(content) as len FROM pages WHERE id = $1', [pageId]);
        return parseFloat(res.rows[0]?.len) || 0;
    }

    public static async search(query: string) {
        const cached = await CacheService.getQueryCache(query);
        if (cached) return cached;

        const tokens = new natural.WordTokenizer().tokenize(query.toLowerCase());
        const stemmer = natural.PorterStemmer;
        const stemmedTokens = tokens.map(t => stemmer.stem(t));

        // Simple BM25-like ranking using TF-IDF components from DB
        // SQL: find pages that contain all (or most) tokens, order by score

        const termIds = [];
        for (const token of stemmedTokens) {
            const res = await pgPool.query('SELECT id FROM keywords WHERE keyword = $1', [token]);
            if (res.rows.length > 0) {
                termIds.push(res.rows[0].id);
            }
        }

        if (termIds.length === 0) return [];

        // Fetch pages containing these terms
        const searchQuery = `
            SELECT
                p.id,
                p.title,
                p.url,
                p.meta_description,
                SUM(it.tf_idf) as score
            FROM index_terms it
            JOIN pages p ON it.page_id = p.id
            WHERE it.term_id = ANY($1)
            GROUP BY p.id
            ORDER BY score DESC
            LIMIT 50
        `;

        const results = await pgPool.query(searchQuery, [termIds]);
        const rows = results.rows;

        await CacheService.setQueryCache(query, rows);
        return rows;
    }

    public static async fuzzySearch(query: string) {
        const tokens = new natural.WordTokenizer().tokenize(query.toLowerCase());
        const results = [];

        for (const token of tokens) {
            const res = await pgPool.query('SELECT keyword FROM keywords');
            const matches = res.rows.filter(row => {
                return natural.LevenshteinDistance(token, row.keyword) <= 2;
            });
            results.push(...matches.map(m => m.keyword));
        }

        return [...new Set(results)];
    }
}
