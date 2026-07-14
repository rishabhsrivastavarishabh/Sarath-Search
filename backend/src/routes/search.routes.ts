import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';
import { AdminController } from '../controllers/admin.controller';

const router = Router();

router.get('/search', SearchController.query);
router.get('/suggest', SearchController.suggest);
router.get('/admin/stats', AdminController.getStats);

export default router;
