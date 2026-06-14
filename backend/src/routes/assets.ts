import { Router, Request, Response } from 'express';
import { upload } from '../middleware/upload';
import { authMiddleware } from '../middleware/auth';
import { getDb } from '../db';
import { storeUploadedFile } from '../services/storage';
import { processExport, processBatchExport, exportToAllPlatforms, ExportOptions } from '../services/export';
import { generateImages, generateProductPhotography, generateUgcContent, generateFacelessVideoFrames } from '../services/ai';
import { PLATFORM_SPECS, getAllPlatforms } from '../utils/platform';
import fs from 'fs';
import sharp from 'sharp';

const router = Router();

// All asset routes require authentication
router.use(authMiddleware);

/**
 * Helper: Check if user has export capacity remaining
 */
function checkUsageLimit(userId: string): { allowed: boolean; usage: any } {
  const db = getDb();
  const user = db.prepare('SELECT plan, exports_used, exports_limit FROM users WHERE id = ?').get(userId) as any;
  return {
    allowed: user.exports_used < user.exports_limit,
    usage: { plan: user.plan, used: user.exports_used, limit: user.exports_limit },
  };
}

/**
 * Helper: Increment usage counter
 */
function incrementUsage(userId: string, count: number = 1): void {
  const db = getDb();
  db.prepare('UPDATE users SET exports_used = exports_used + ?, updated_at = datetime(\'now\') WHERE id = ?').run(count, userId);
}

// GET /api/assets/platforms - list supported platforms and formats
router.get('/platforms', (_req: Request, res: Response) => {
  res.json(PLATFORM_SPECS);
});

// POST /api/assets/upload
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file provided. Send a file as multipart/form-data with field name "file"' });
      return;
    }

    // Get image dimensions
    let width: number | null = null;
    let height: number | null = null;
    try {
      const metadata = await sharp(req.file.path).metadata();
      width = metadata.width || null;
      height = metadata.height || null;
    } catch {
      // Not an image or couldn't read dimensions
    }

    const asset = await storeUploadedFile(req.user!.userId, req.file, { width, height });

    res.status(201).json({
      message: 'File uploaded successfully',
      asset,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

// POST /api/assets/generate - AI image generation
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const {
      prompt,
      negativePrompt,
      width,
      height,
      numImages = 1,
      model = 'dall-e',
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const result = await generateImages(
      { prompt, negativePrompt, width, height, numImages },
      model
    );

    res.json({
      message: 'Images generated successfully',
      generation: result,
    });
  } catch (error: any) {
    console.error('Generation error:', error);
    res.status(500).json({ error: error.message || 'Generation failed' });
  }
});

// POST /api/assets/generate/product-photography
router.post('/generate/product-photography', async (req: Request, res: Response) => {
  try {
    const { productImageUrl, sceneDescription } = req.body;

    if (!productImageUrl || !sceneDescription) {
      res.status(400).json({ error: 'productImageUrl and sceneDescription are required' });
      return;
    }

    const result = await generateProductPhotography(productImageUrl, sceneDescription);
    res.json({ message: 'Product photography generated', generation: result });
  } catch (error: any) {
    console.error('Product photography error:', error);
    res.status(500).json({ error: error.message || 'Generation failed' });
  }
});

// POST /api/assets/generate/ugc
router.post('/generate/ugc', async (req: Request, res: Response) => {
  try {
    const { productDescription, style } = req.body;

    if (!productDescription) {
      res.status(400).json({ error: 'productDescription is required' });
      return;
    }

    const result = await generateUgcContent(productDescription, style);
    res.json({ message: 'UGC content generated', generation: result });
  } catch (error: any) {
    console.error('UGC generation error:', error);
    res.status(500).json({ error: error.message || 'Generation failed' });
  }
});

// POST /api/assets/generate/faceless-video
router.post('/generate/faceless-video', async (req: Request, res: Response) => {
  try {
    const { topic, numFrames = 5 } = req.body;

    if (!topic) {
      res.status(400).json({ error: 'topic is required' });
      return;
    }

    const frames = await generateFacelessVideoFrames(topic, numFrames);
    res.json({ message: 'Video frames generated', frames });
  } catch (error: any) {
    console.error('Faceless video error:', error);
    res.status(500).json({ error: error.message || 'Generation failed' });
  }
});

// POST /api/assets/:id/export - Export to a single platform format
router.post('/:id/export', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { platform, format, mimeType = 'image/png' } = req.body;
    const db = getDb();

    // Check asset ownership
    const asset = db.prepare('SELECT * FROM assets WHERE id = ? AND user_id = ?').get(id, req.user!.userId) as any;
    if (!asset) {
      res.status(404).json({ error: 'Asset not found or not owned by you' });
      return;
    }

    // Check usage limits
    const { allowed, usage } = checkUsageLimit(req.user!.userId);
    if (!allowed) {
      res.status(403).json({
        error: 'Export limit reached. Upgrade your plan to create more exports.',
        usage,
      });
      return;
    }

    // Get user plan info
    const user = db.prepare('SELECT plan FROM users WHERE id = ?').get(req.user!.userId) as any;
    const planConfig = require('../config').config.plans[user.plan];

    const exportOptions: ExportOptions = {
      assetId: id,
      userId: req.user!.userId,
      inputPath: asset.storage_path,
      platform,
      formatName: format,
      mimeType,
      watermark: planConfig.watermark,
      resolution: planConfig.resolution,
    };

    const result = await processExport(exportOptions);
    incrementUsage(req.user!.userId);

    // Store export record
    db.prepare(`
      INSERT INTO exports (id, asset_id, user_id, platform, format, width, height, storage_path, file_size, watermark, is_low_res)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(result.id, id, req.user!.userId, result.platform, result.format, result.width, result.height, result.storagePath, result.fileSize, planConfig.watermark ? 1 : 0, planConfig.resolution < 1 ? 1 : 0);

    res.status(201).json({
      message: 'Export created successfully',
      export: result,
    });
  } catch (error: any) {
    console.error('Export error:', error);
    res.status(500).json({ error: error.message || 'Export failed' });
  }
});

// POST /api/assets/:id/export-all - Export to all platforms
router.post('/:id/export-all', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDb();

    const asset = db.prepare('SELECT * FROM assets WHERE id = ? AND user_id = ?').get(id, req.user!.userId) as any;
    if (!asset) {
      res.status(404).json({ error: 'Asset not found or not owned by you' });
      return;
    }

    // Check if user has enough remaining exports (we need ~9 exports for all platforms)
    const { allowed, usage } = checkUsageLimit(req.user!.userId);
    if (!allowed) {
      res.status(403).json({ error: 'Export limit reached. Upgrade your plan.', usage });
      return;
    }

    const user = db.prepare('SELECT plan FROM users WHERE id = ?').get(req.user!.userId) as any;
    const planConfig = require('../config').config.plans[user.plan];

    const exportOptions: ExportOptions = {
      assetId: id,
      userId: req.user!.userId,
      inputPath: asset.storage_path,
      platform: 'facebook',
      formatName: 'feed-square',
      mimeType: 'image/png',
      watermark: planConfig.watermark,
      resolution: planConfig.resolution,
    };

    const results = await exportToAllPlatforms(exportOptions);
    incrementUsage(req.user!.userId, results.length);

    // Store export records
    const insertStmt = db.prepare(`
      INSERT INTO exports (id, asset_id, user_id, platform, format, width, height, storage_path, file_size, watermark, is_low_res)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((results: any[]) => {
      for (const result of results) {
        insertStmt.run(result.id, id, req.user!.userId, result.platform, result.format, result.width, result.height, result.storagePath, result.fileSize, planConfig.watermark ? 1 : 0, planConfig.resolution < 1 ? 1 : 0);
      }
    });

    insertMany(results);

    res.status(201).json({
      message: `Exported to ${results.length} platform formats`,
      exports: results,
    });
  } catch (error: any) {
    console.error('Export all error:', error);
    res.status(500).json({ error: error.message || 'Export failed' });
  }
});

// GET /api/assets/:id - Get asset details
router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const asset = db.prepare('SELECT * FROM assets WHERE id = ? AND user_id = ?').get(req.params.id, req.user!.userId) as any;

  if (!asset) {
    res.status(404).json({ error: 'Asset not found' });
    return;
  }

  // Get associated exports
  const exports = db.prepare('SELECT * FROM exports WHERE asset_id = ?').all(req.params.id);

  res.json({ asset, exports });
});

// GET /api/assets - List user's assets
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = (page - 1) * limit;

  const total = (db.prepare('SELECT COUNT(*) as count FROM assets WHERE user_id = ?').get(req.user!.userId) as any).count;
  const assets = db.prepare('SELECT * FROM assets WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?').all(req.user!.userId, limit, offset);

  res.json({ assets, total, page, limit });
});

export default router;