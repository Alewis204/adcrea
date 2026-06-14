import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { getDb } from '../db';

export interface StoredAsset {
  id: string;
  userId: string;
  originalFilename: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
}

export async function storeUploadedFile(
  userId: string,
  file: Express.Multer.File,
  metadata?: { width?: number; height?: number; prompt?: string; aiModel?: string; source?: string }
): Promise<StoredAsset> {
  const db = getDb();
  const assetId = uuidv4();

  const stmt = db.prepare(`
    INSERT INTO assets (id, user_id, original_filename, storage_path, mime_type, file_size, width, height, prompt, ai_model, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    assetId,
    userId,
    file.originalname,
    file.path,
    file.mimetype,
    file.size,
    metadata?.width || null,
    metadata?.height || null,
    metadata?.prompt || null,
    metadata?.aiModel || null,
    metadata?.source || 'upload'
  );

  return {
    id: assetId,
    userId,
    originalFilename: file.originalname,
    storagePath: file.path,
    mimeType: file.mimetype,
    fileSize: file.size,
    width: metadata?.width || null,
    height: metadata?.height || null,
  };
}

export async function storeGeneratedAsset(
  userId: string,
  imageBuffer: Buffer,
  filename: string,
  mimeType: string,
  metadata: { width?: number; height?: number; prompt?: string; aiModel?: string }
): Promise<StoredAsset> {
  const assetDir = path.join(config.uploadDir, 'generated', userId);
  if (!fs.existsSync(assetDir)) {
    fs.mkdirSync(assetDir, { recursive: true });
  }

  const assetId = uuidv4();
  const ext = path.extname(filename) || '.png';
  const storageFilename = `${assetId}${ext}`;
  const storagePath = path.join(assetDir, storageFilename);

  fs.writeFileSync(storagePath, imageBuffer);

  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO assets (id, user_id, original_filename, storage_path, mime_type, file_size, width, height, prompt, ai_model, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ai_generated')
  `);

  stmt.run(
    assetId,
    userId,
    filename,
    storagePath,
    mimeType,
    imageBuffer.length,
    metadata.width || null,
    metadata.height || null,
    metadata.prompt || null,
    metadata.aiModel || null
  );

  return {
    id: assetId,
    userId,
    originalFilename: filename,
    storagePath,
    mimeType,
    fileSize: imageBuffer.length,
    width: metadata.width || null,
    height: metadata.height || null,
  };
}

export async function getAsset(assetId: string): Promise<StoredAsset | null> {
  const db = getDb();
  const row = db.prepare('SELECT * FROM assets WHERE id = ?').get(assetId) as any;
  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    originalFilename: row.original_filename,
    storagePath: row.storage_path,
    mimeType: row.mime_type,
    fileSize: row.file_size,
    width: row.width,
    height: row.height,
  };
}

export async function getUserAssets(userId: string, page: number = 1, limit: number = 20): Promise<{ assets: StoredAsset[]; total: number }> {
  const db = getDb();
  const offset = (page - 1) * limit;

  const total = (db.prepare('SELECT COUNT(*) as count FROM assets WHERE user_id = ?').get(userId) as any).count;
  const rows = db.prepare('SELECT * FROM assets WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?').all(userId, limit, offset) as any[];

  return {
    assets: rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      originalFilename: row.original_filename,
      storagePath: row.storage_path,
      mimeType: row.mime_type,
      fileSize: row.file_size,
      width: row.width,
      height: row.height,
    })),
    total,
  };
}

export async function deleteAssetFile(assetId: string): Promise<boolean> {
  const asset = await getAsset(assetId);
  if (!asset) return false;

  // Delete file from disk
  try {
    if (fs.existsSync(asset.storagePath)) {
      fs.unlinkSync(asset.storagePath);
    }
  } catch {
    // File may already be gone
  }

  // Delete from database
  const db = getDb();
  db.prepare('DELETE FROM assets WHERE id = ?').run(assetId);

  // Cascade deletes exports
  const exports = db.prepare('SELECT storage_path FROM exports WHERE asset_id = ?').all(assetId) as any[];
  for (const exp of exports) {
    try {
      if (fs.existsSync(exp.storage_path)) {
        fs.unlinkSync(exp.storage_path);
      }
    } catch {
      // ignore
    }
  }
  db.prepare('DELETE FROM exports WHERE asset_id = ?').run(assetId);

  return true;
}