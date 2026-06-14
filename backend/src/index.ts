import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import { getDb, closeDb } from './db';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import assetRoutes from './routes/assets';
import stripeRoutes from './routes/stripe';

const app = express();

// ===== Middleware =====

// CORS - Allow frontend origin
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://0.0.0.0:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure upload directory exists
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

// ===== API Routes =====

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'adcrea-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

// User routes
app.use('/api/users', userRoutes);

// Asset routes (includes upload, generate, export)
app.use('/api/assets', assetRoutes);

// Stripe routes
app.use('/api/stripe', stripeRoutes);

// Platform specs endpoint
app.get('/api/platforms', (_req, res) => {
  const { PLATFORM_SPECS } = require('./utils/platform');
  res.json(PLATFORM_SPECS);
});

// ===== Serve uploaded files =====
app.use('/api/files', express.static(config.uploadDir));

// ===== Error handling =====
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);

  if (err.type === 'entity.too.large') {
    res.status(413).json({ error: 'Request body too large' });
    return;
  }

  if (err.message?.includes('Unsupported file type')) {
    res.status(400).json({ error: err.message });
    return;
  }

  res.status(500).json({
    error: 'Internal server error',
    details: config.nodeEnv === 'development' ? err.message : undefined,
  });
});

// ===== Start Server =====
const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`✨ Adcrea API Server running on http://0.0.0.0:${config.port}`);
  console.log(`   Environment: ${config.nodeEnv}`);

  // Verify database connection
  try {
    getDb();
    console.log('   Database: Connected');
  } catch (error) {
    console.error('   Database: Failed to connect:', error);
  }
});

// ===== Graceful Shutdown =====
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    closeDb();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    closeDb();
    process.exit(0);
  });
});

export default app;