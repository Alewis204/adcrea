import { config } from '../config';

export interface AiGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  numImages?: number;
  productImageUrl?: string; // For product photography variations
}

export interface AiGenerationResult {
  urls: string[];
  model: string;
  prompt: string;
}

/**
 * AI Image Generation Service
 * Supports: OpenAI DALL-E 3, Stability AI (via Replicate)
 */
export async function generateImages(
  options: AiGenerationOptions,
  preferredModel: 'dall-e' | 'stable-diffusion' = 'dall-e'
): Promise<AiGenerationResult> {
  switch (preferredModel) {
    case 'dall-e':
      return generateWithDalle(options);
    case 'stable-diffusion':
      return generateWithStableDiffusion(options);
    default:
      return generateWithDalle(options);
  }
}

async function generateWithDalle(options: AiGenerationOptions): Promise<AiGenerationResult> {
  const { openaiApiKey } = config.ai;

  if (!openaiApiKey || openaiApiKey === 'sk-placeholder') {
    // Return mock data for development
    return mockGenerate(options, 'dall-e-3');
  }

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: options.prompt,
      n: options.numImages || 1,
      size: getDalleSize(options.width, options.height),
      quality: 'standard',
      response_format: 'url',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DALL-E API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    urls: data.data.map((img: any) => img.url),
    model: 'dall-e-3',
    prompt: options.prompt,
  };
}

async function generateWithStableDiffusion(options: AiGenerationOptions): Promise<AiGenerationResult> {
  const { replicateApiKey } = config.ai;

  if (!replicateApiKey || replicateApiKey === 'r8_placeholder') {
    return mockGenerate(options, 'stable-diffusion-xl');
  }

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${replicateApiKey}`,
    },
    body: JSON.stringify({
      version: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      input: {
        prompt: options.prompt,
        negative_prompt: options.negativePrompt || '',
        width: options.width || 1024,
        height: options.height || 1024,
        num_outputs: options.numImages || 1,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Replicate API error: ${response.status} - ${error}`);
  }

  const prediction = await response.json();

  // Poll for completion
  let result = prediction;
  while (result.status !== 'succeeded' && result.status !== 'failed') {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const pollResponse = await fetch(result.urls?.get || result.url, {
      headers: { Authorization: `Bearer ${replicateApiKey}` },
    });
    result = await pollResponse.json();
  }

  if (result.status === 'failed') {
    throw new Error(`Stable Diffusion generation failed: ${result.error}`);
  }

  return {
    urls: Array.isArray(result.output) ? result.output : [result.output],
    model: 'stable-diffusion-xl',
    prompt: options.prompt,
  };
}

function getDalleSize(width?: number, height?: number): string {
  // DALL-E 3 supports: 1024x1024, 1792x1024, 1024x1792
  if (!width || !height) return '1024x1024';

  // Determine orientation
  if (width === height) return '1024x1024';
  if (width > height) return '1792x1024';
  return '1024x1792';
}

/**
 * Generate product photography variations from a product image
 */
export async function generateProductPhotography(
  productImageUrl: string,
  sceneDescription: string
): Promise<AiGenerationResult> {
  // Uses DALL-E 3 with image reference (when available) or SD with image-to-image
  return generateWithDalle({
    prompt: `Product photography: ${sceneDescription}. Show the product in a professional studio setting.`,
    productImageUrl,
  });
}

/**
 * Generate UGC (user-generated content) style image
 */
export async function generateUgcContent(
  productDescription: string,
  style: 'lifestyle' | 'unboxing' | 'review' | 'tutorial' = 'lifestyle'
): Promise<AiGenerationResult> {
  const stylePrompts: Record<string, string> = {
    lifestyle: 'Authentic lifestyle photo showing real people using the product naturally, candid style, good lighting',
    unboxing: 'First-person perspective unboxing scene, product just opened, packaging visible, excited discovery moment',
    review: 'Flat lay photo with product and accessories, review setting, natural lighting, authentic feel',
    tutorial: 'Step-by-step tutorial style image showing product usage, instructional layout, clean and clear',
  };

  return generateWithDalle({
    prompt: `UGC-style content: ${productDescription}. ${stylePrompts[style] || stylePrompts.lifestyle}`,
  });
}

/**
 * Generate faceless short-form video frames (storyboard-style)
 */
export async function generateFacelessVideoFrames(
  topic: string,
  numFrames: number = 5
): Promise<AiGenerationResult[]> {
  const framePrompts = [
    `Opening hook: ${topic} - eye-catching visual with bold text overlay, vibrant colors`,
    `Problem statement: Visual showing the challenge related to ${topic}`,
    `Solution introduction: ${topic} solution being presented, clean infographic style`,
    `Key benefits: Visual icons and text showing top benefits of ${topic}`,
    `Call to action: Closing frame with strong CTA for ${topic}, professional design`,
  ];

  const results: AiGenerationResult[] = [];
  for (let i = 0; i < Math.min(numFrames, framePrompts.length); i++) {
    results.push(await generateWithDalle({ prompt: framePrompts[i] }));
  }

  return results;
}

// Mock generation for development without API keys
function mockGenerate(options: AiGenerationOptions, model: string): AiGenerationResult {
  const urls: string[] = [];
  const numImages = options.numImages || 1;

  for (let i = 0; i < numImages; i++) {
    // Generate a colored placeholder URL-like identifier
    const seed = Math.floor(Math.random() * 1000);
    urls.push(`mock://generated/${seed}_${encodeURIComponent(options.prompt.slice(0, 30))}`);
  }

  return {
    urls,
    model,
    prompt: options.prompt,
  };
}