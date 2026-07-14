import { Request, Response } from 'express';
import { Pool } from 'pg';

const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });

export class AdminController {
    public static async getStats(req: Request, res: Response) {
        try {
            const stats = await pgPool.query(`
                SELECT
                    (SELECT COUNT(*) FROM pages) as total_pages,
                    (SELECT COUNT(*) FROM domains) as total_domains,
                    (SELECT COUNT(*) FROM search_history) as total_searches,
                    (SELECT COUNT(*) FROM crawl_queue WHERE status = 'pending') as queue_status
            `);
            res.json(stats.rows[0]);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
