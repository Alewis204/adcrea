import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { getFormatSpec } from '../utils/platform';

export interface ExportOptions {
  assetId: string;
  userId: string;
  inputPath: string;
  platform: string;
  formatName: string;
  mimeType: string;
  watermark: boolean;
  resolution: number; // 0.5 for free, 1.0 for paid
}

export interface ExportResult {
  id: string;
  storagePath: string;
  width: number;
  height: number;
  fileSize: number;
  platform: string;
  format: string;
}

export async function processExport(options: ExportOptions): Promise<ExportResult> {
  const formatSpec = getFormatSpec(options.platform, options.formatName);
  if (!formatSpec) {
    throw new Error(`Unknown format: ${options.platform}/${options.formatName}`);
  }

  const targetWidth = Math.round(formatSpec.width * options.resolution);
  const targetHeight = Math.round(formatSpec.height * options.resolution);

  // Create export directory
  const exportDir = path.join(config.uploadDir, 'exports', options.userId);
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const ext = mimeToExtension(options.mimeType);
  const exportId = uuidv4();
  const outputFilename = `export_${exportId}.${ext}`;
  const outputPath = path.join(exportDir, outputFilename);

  // Process image with sharp
  let image = sharp(options.inputPath);

  // Get metadata
  const metadata = await image.metadata();

  // Resize to target dimensions (cover/crop to fill)
  image = image.resize(targetWidth, targetHeight, {
    fit: 'cover',
    position: 'center',
  });

  // Apply watermark if needed
  if (options.watermark) {
    image = await applyWatermark(image, targetWidth, targetHeight);
  }

  // Convert to target format
  switch (options.mimeType) {
    case 'image/jpeg':
      image = image.jpeg({ quality: 90 });
      break;
    case 'image/png':
      image = image.png();
      break;
    case 'image/webp':
      image = image.webp({ quality: 90 });
      break;
    default:
      image = image.jpeg({ quality: 90 });
  }

  await image.toFile(outputPath);
  const stats = fs.statSync(outputPath);

  return {
    id: exportId,
    storagePath: outputPath,
    width: targetWidth,
    height: targetHeight,
    fileSize: stats.size,
    platform: options.platform,
    format: options.formatName,
  };
}

export async function processBatchExport(
  options: ExportOptions,
  platforms: Array<{ platform: string; formatName: string; mimeType: string }>
): Promise<ExportResult[]> {
  const results: ExportResult[] = [];

  for (const pf of platforms) {
    const result = await processExport({
      ...options,
      platform: pf.platform,
      formatName: pf.formatName,
      mimeType: pf.mimeType,
    });
    results.push(result);
  }

  return results;
}

/**
 * Generate exports for all standard platforms from a single asset
 */
export async function exportToAllPlatforms(
  options: ExportOptions
): Promise<ExportResult[]> {
  const allExports: ExportResult[] = [];

  // Common platform exports
  const platforms = [
    // Facebook/Instagram
    { platform: 'facebook', formatName: 'feed-square', mimeType: 'image/png' },
    { platform: 'facebook', formatName: 'feed-portrait', mimeType: 'image/png' },
    { platform: 'instagram', formatName: 'story-reels', mimeType: 'image/png' },
    // Google
    { platform: 'google', formatName: 'shopping-display', mimeType: 'image/png' },
    { platform: 'google', formatName: 'performance-max-1', mimeType: 'image/png' },
    // Amazon
    { platform: 'amazon', formatName: 'main-image', mimeType: 'image/jpeg' },
    // Shopify
    { platform: 'shopify', formatName: 'product', mimeType: 'image/png' },
    // TikTok
    { platform: 'tiktok', formatName: 'story', mimeType: 'image/png' },
    // LinkedIn
    { platform: 'linkedin', formatName: 'feed-square', mimeType: 'image/png' },
  ];

  return processBatchExport(options, platforms);
}

async function applyWatermark(
  image: sharp.Sharp,
  width: number,
  height: number
): Promise<sharp.Sharp> {
  // Create SVG watermark text
  const svgWatermark = `
    <svg width="${width}" height="${height}">
      <style>
        .text { fill: rgba(255,255,255,0.3); font-family: Arial, sans-serif; font-size: ${Math.round(width * 0.06)}px; font-weight: bold; }
      </style>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" class="text" transform="rotate(-30, ${width/2}, ${height/2})">Adcrea</text>
    </svg>
  `;

  return image.composite([
    {
      input: Buffer.from(svgWatermark),
      top: 0,
      left: 0,
    },
  ]);
}

function mimeToExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
  };
  return map[mimeType] || 'jpg';
}

export function getExportPath(storagePath: string): string {
  return storagePath;
}