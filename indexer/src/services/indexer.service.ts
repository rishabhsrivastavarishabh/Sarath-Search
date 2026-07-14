import { createClient } from 'redis';
import { Pool } from 'pg';
import natural from 'natural';

const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

const STOP_WORDS = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'when', 'at', 'from', 'by', 'for', 'with', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very']);

export class IndexerService {
    private static async tokenize(text: string): string[] {
        return tokenizer.tokenize(text.toLowerCase())
            .filter(word => word.length > 2 && !STOP_WORDS.has(word))
            .map(word => stemmer.stem(word));
    }

    public static async indexPage(pageData: any) {
        const client = await pgPool.connect();
        try {
            await client.query('BEGIN');

            // 1. Store page in DB
            const pageRes = await client.query(
                `INSERT INTO pages (url, title, meta_description, meta_keywords, content, html_content)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (url) DO UPDATE SET
                    title = EXCLUDED.title,
                    meta_description = EXCLUDED.meta_description,
                    content = EXCLUDED.content,
                    last_indexed_at = CURRENT_TIMESTAMP
                 RETURNING id`,
                [pageData.url, pageData.title, pageData.description, pageData.keywords, pageData.content, pageData.html_content]
            );
            const pageId = pageRes.rows[0].id;

            // 2. Tokenize content
            const tokens = await this.tokenize(pageData.content + ' ' + (pageData.title || ''));
            const termFrequencies: Record<string, number> = {};

            tokens.forEach(token => {
                termFrequencies[token] = (termFrequencies[token] || 0) + 1;
            });

            // 3. Store terms and update inverted index
            for (const [term, freq] of Object.entries(termFrequencies)) {
                // Ensure keyword exists
                const kwRes = await client.query(
                    `INSERT INTO keywords (keyword) VALUES ($1)
                     ON CONFLICT (keyword) DO UPDATE SET keyword = EXCLUDED.keyword
                     RETURNING id`,
                    [term]
                );
                const termId = kwRes.rows[0].id;

                // Store in inverted index
                await client.query(
                    `INSERT INTO index_terms (term_id, page_id)
                     VALUES ($1, $2)
                     ON CONFLICT (term_id, page_id) DO NOTHING`,
                    [termId, pageId]
                );
            }

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            console.error(`Indexing error for ${pageData.url}:`, e);
        } finally {
            client.release();
        }
    }

    public static async processQueue() {
        await redisClient.connect();
        while (true) {
            const data = await redisClient.rPop('indexing_queue');
            if (data) {
                const pageData = JSON.parse(data);
                console.log(`Indexing: ${pageData.url}`);
                await this.indexPage(pageData);
            } else {
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
}
