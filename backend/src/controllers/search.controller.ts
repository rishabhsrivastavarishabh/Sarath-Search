import { Request, Response } from 'express';
import { SearchCore } from '../../../search-core/src/services/search.service';

export class SearchController {
    public static async query(req: Request, res: Response) {
        try {
            const { q } = req.query;
            if (!q) return res.status(400).json({ error: 'Query parameter q is required' });

            const results = await SearchCore.search(q as string);
            res.json({
                results,
                query: q,
                total: results.length,
                time: Date.now() // Should be actual search time
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public static async suggest(req: Request, res: Response) {
        try {
            const { q } = req.query;
            if (!q) return res.json([]);

            const suggestions = await SearchCore.fuzzySearch(q as string);
            res.json(suggestions);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
