import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  databasePath: process.env.DATABASE_PATH || './data/adcrea.db',
  jwt: {
    secret: process.env.JWT_SECRET || 'adcrea-dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  uploadDir: path.resolve(process.env.UPLOAD_DIR || './uploads'),
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    prices: {
      pro: process.env.STRIPE_PRO_PRICE_ID || '',
      agency: process.env.STRIPE_AGENCY_PRICE_ID || '',
    },
  },
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    replicateApiKey: process.env.REPLICATE_API_KEY || '',
  },
  nodeEnv: process.env.NODE_ENV || 'development',
  plans: {
    free: { exports: 5, watermark: true, resolution: 0.5 },
    pro: { exports: 100, watermark: false, resolution: 1.0, price: 29 },
    agency: { exports: 500, watermark: false, resolution: 1.0, price: 99 },
  },
};