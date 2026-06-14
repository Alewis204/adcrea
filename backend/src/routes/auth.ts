import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { getDb } from '../db';
import { signToken } from '../utils/jwt';
import { createStripeCustomer } from '../services/stripe';
import { authMiddleware } from '../middleware/auth';

const router = Router();

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, name, password } = signupSchema.parse(req.body);
    const db = getDb();

    // Check if user already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create Stripe customer (mock or real)
    const stripeCustomer = await createStripeCustomer(email, name);

    // Insert user
    const userId = uuidv4();
    db.prepare(`
      INSERT INTO users (id, email, name, password_hash, plan, exports_limit, stripe_customer_id)
      VALUES (?, ?, ?, ?, 'free', 5, ?)
    `).run(userId, email, name, passwordHash, stripeCustomer?.id || null);

    // Generate JWT
    const token = signToken({ userId, email, plan: 'free' });

    res.status(201).json({
      token,
      user: {
        id: userId,
        email,
        name,
        plan: 'free',
        exportsUsed: 0,
        exportsLimit: 5,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const db = getDb();

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email, plan: user.plan });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        exportsUsed: user.exports_used,
        exportsLimit: user.exports_limit,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req: Request, res: Response) => {
  const db = getDb();
  const user = db.prepare('SELECT id, email, name, plan, exports_used, exports_limit, created_at FROM users WHERE id = ?').get(req.user!.userId) as any;

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    exportsUsed: user.exports_used,
    exportsLimit: user.exports_limit,
    createdAt: user.created_at,
  });
});

export default router;