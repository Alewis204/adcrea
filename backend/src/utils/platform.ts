export interface PlatformSpec {
  name: string;
  formats: Array<{
    name: string;
    width: number;
    height: number;
    mimeTypes: string[];
  }>;
}

export const PLATFORM_SPECS: Record<string, PlatformSpec> = {
  facebook: {
    name: 'Facebook',
    formats: [
      { name: 'feed-square', width: 1080, height: 1080, mimeTypes: ['image/jpeg', 'image/png', 'video/mp4'] },
      { name: 'feed-portrait', width: 1080, height: 1350, mimeTypes: ['image/jpeg', 'image/png', 'video/mp4'] },
      { name: 'story-reels', width: 1080, height: 1920, mimeTypes: ['video/mp4'] },
      { name: 'carousel', width: 1080, height: 1080, mimeTypes: ['image/jpeg', 'image/png'] },
      { name: 'collection', width: 1200, height: 628, mimeTypes: ['image/jpeg', 'image/png'] },
    ],
  },
  instagram: {
    name: 'Instagram',
    formats: [
      { name: 'feed-square', width: 1080, height: 1080, mimeTypes: ['image/jpeg', 'image/png', 'video/mp4'] },
      { name: 'feed-portrait', width: 1080, height: 1350, mimeTypes: ['image/jpeg', 'image/png', 'video/mp4'] },
      { name: 'story-reels', width: 1080, height: 1920, mimeTypes: ['video/mp4'] },
      { name: 'carousel', width: 1080, height: 1080, mimeTypes: ['image/jpeg', 'image/png'] },
    ],
  },
  google: {
    name: 'Google',
    formats: [
      { name: 'shopping-display', width: 1200, height: 628, mimeTypes: ['image/jpeg', 'image/png'] },
      { name: 'performance-max-1', width: 1200, height: 1200, mimeTypes: ['image/jpeg', 'image/png'] },
      { name: 'performance-max-2', width: 1200, height: 628, mimeTypes: ['image/jpeg', 'image/png'] },
      { name: 'performance-max-3', width: 600, height: 600, mimeTypes: ['image/jpeg', 'image/png'] },
      { name: 'discovery-1', width: 1200, height: 628, mimeTypes: ['image/jpeg', 'image/png'] },
      { name: 'discovery-2', width: 600, height: 600, mimeTypes: ['image/jpeg', 'image/png'] },
    ],
  },
  amazon: {
    name: 'Amazon',
    formats: [
      { name: 'main-image', width: 1000, height: 1000, mimeTypes: ['image/jpeg', 'image/png'] },
      { name: 'infographic', width: 1000, height: 1000, mimeTypes: ['image/jpeg', 'image/png'] },
      { name: 'video', width: 1920, height: 1080, mimeTypes: ['video/mp4'] },
    ],
  },
  shopify: {
    name: 'Shopify',
    formats: [
      { name: 'product', width: 2048, height: 2048, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
      { name: 'collection', width: 1024, height: 1024, mimeTypes: ['image/jpeg', 'image/png'] },
      { name: 'hero-slideshow', width: 1920, height: 800, mimeTypes: ['image/jpeg', 'image/png'] },
    ],
  },
  tiktok: {
    name: 'TikTok',
    formats: [
      { name: 'feed', width: 1080, height: 1920, mimeTypes: ['video/mp4'] },
      { name: 'story', width: 1080, height: 1920, mimeTypes: ['video/mp4', 'image/png'] },
      { name: 'carousel', width: 1080, height: 1920, mimeTypes: ['image/png'] },
    ],
  },
  linkedin: {
    name: 'LinkedIn',
    formats: [
      { name: 'feed-square', width: 1080, height: 1080, mimeTypes: ['image/jpeg', 'image/png'] },
      { name: 'feed-portrait', width: 1080, height: 1350, mimeTypes: ['image/jpeg', 'image/png'] },
      { name: 'carousel', width: 1080, height: 1080, mimeTypes: ['image/jpeg', 'image/png'] },
      { name: 'document-ad', width: 1920, height: 1080, mimeTypes: ['image/jpeg', 'image/png'] },
    ],
  },
};

export function getFormatSpec(platform: string, formatName: string) {
  const platformSpec = PLATFORM_SPECS[platform];
  if (!platformSpec) return null;
  return platformSpec.formats.find(f => f.name === formatName) || null;
}

export function getAllPlatforms(): string[] {
  return Object.keys(PLATFORM_SPECS);
}