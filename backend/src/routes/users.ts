import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getDb } from '../db';
import { getUserAssets, deleteAssetFile } from '../services/storage';
import { getExportPath } from '../services/export';

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

// GET /api/users/assets
router.get('/assets', (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

  const result = getUserAssets(req.user!.userId, page, limit);
  res.json(result);
});

// DELETE /api/users/assets/:id
router.delete('/assets/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  // Verify ownership
  const db = getDb();
  const asset = db.prepare('SELECT * FROM assets WHERE id = ? AND user_id = ?').get(id, req.user!.userId) as any;

  if (!asset) {
    res.status(404).json({ error: 'Asset not found or not owned by you' });
    return;
  }

  await deleteAssetFile(id);
  res.json({ message: 'Asset deleted successfully' });
});

// GET /api/users/exports
router.get('/exports', (req: Request, res: Response) => {
  const db = getDb();
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = (page - 1) * limit;

  const total = (db.prepare('SELECT COUNT(*) as count FROM exports WHERE user_id = ?').get(req.user!.userId) as any).count;
  const rows = db.prepare(`
    SELECT e.*, a.original_filename 
    FROM exports e 
    LEFT JOIN assets a ON e.asset_id = a.id 
    WHERE e.user_id = ? 
    ORDER BY e.created_at DESC 
    LIMIT ? OFFSET ?
  `).all(req.user!.userId, limit, offset);

  res.json({
    exports: rows,
    total,
    page,
    limit,
  });
});

// GET /api/users/usage
router.get('/usage', (req: Request, res: Response) => {
  const db = getDb();
  const user = db.prepare('SELECT plan, exports_used, exports_limit FROM users WHERE id = ?').get(req.user!.userId) as any;

  res.json({
    plan: user.plan,
    exportsUsed: user.exports_used,
    exportsLimit: user.exports_limit,
    exportsRemaining: user.exports_limit - user.exports_used,
  });
});

export default router;