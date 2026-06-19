import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getDb } from '../db';
import { config } from '../config';
import { createCheckoutSession, createPortalSession, cancelSubscription, handleWebhookEvent } from '../services/stripe';

const router = Router();

// POST /api/stripe/create-checkout-session
router.post('/create-checkout-session', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { priceId, plan } = req.body;
    const db = getDb();

    const user = db.prepare('SELECT id, email, stripe_customer_id FROM users WHERE id = ?').get(req.user!.userId) as any;
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Determine price ID based on plan if not provided
    let actualPriceId = priceId;
    if (!actualPriceId && plan) {
      actualPriceId = plan === 'pro' ? config.stripe.prices.pro : plan === 'agency' ? config.stripe.prices.agency : '';
    }

    if (!actualPriceId) {
      res.status(400).json({ error: 'priceId or plan is required' });
      return;
    }

    const origin = req.headers.origin || 'http://localhost:3000';

    const sessionUrl = await createCheckoutSession(
      user.stripe_customer_id || `mock_cus_${user.id}`,
      actualPriceId,
      `${origin}/dashboard?checkout=success`,
      `${origin}/pricing?checkout=canceled`
    );

    if (!sessionUrl) {
      res.status(500).json({ error: 'Failed to create checkout session' });
      return;
    }

    res.json({ url: sessionUrl });
  } catch (error: any) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
});

// POST /api/stripe/create-portal-session
router.post('/create-portal-session', authMiddleware, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const user = db.prepare('SELECT stripe_customer_id FROM users WHERE id = ?').get(req.user!.userId) as any;

    if (!user?.stripe_customer_id) {
      res.status(400).json({ error: 'No Stripe customer found. Subscribe first.' });
      return;
    }

    const origin = req.headers.origin || 'http://localhost:3000';
    const portalUrl = await createPortalSession(user.stripe_customer_id, `${origin}/dashboard`);

    if (!portalUrl) {
      res.status(500).json({ error: 'Failed to create portal session' });
      return;
    }

    res.json({ url: portalUrl });
  } catch (error: any) {
    console.error('Portal error:', error);
    res.status(500).json({ error: error.message || 'Failed to create portal session' });
  }
});

// POST /api/stripe/cancel-subscription
router.post('/cancel-subscription', authMiddleware, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const user = db.prepare('SELECT stripe_subscription_id FROM users WHERE id = ?').get(req.user!.userId) as any;

    if (!user?.stripe_subscription_id) {
      res.status(400).json({ error: 'No active subscription found' });
      return;
    }

    const success = await cancelSubscription(user.stripe_subscription_id);
    if (!success) {
      res.status(500).json({ error: 'Failed to cancel subscription' });
      return;
    }

    // Downgrade to free
    db.prepare(`
      UPDATE users SET plan = 'free', stripe_subscription_id = NULL, exports_limit = 5, exports_used = 0, updated_at = datetime('now')
      WHERE id = ?
    `).run(req.user!.userId);

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error: any) {
    console.error('Cancel error:', error);
    res.status(500).json({ error: error.message || 'Failed to cancel subscription' });
  }
});

// POST /api/stripe/webhook - Stripe webhook handler
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const rawBody = req.body; // Raw body needed for signature verification

    let event: any;

    if (config.stripe.webhookSecret && sig) {
      const { default: Stripe } = await import('stripe');
      const stripe = new Stripe(config.stripe.secretKey);
      event = stripe.webhooks.constructEvent(rawBody, sig, config.stripe.webhookSecret);
    } else {
      // Mock mode - parse directly
      event = {
        type: req.body.type,
        data: { object: req.body.data?.object || req.body },
      };
    }

    await handleWebhookEvent({
      type: event.type,
      data: event.data.object,
    });

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message || 'Webhook processing failed' });
  }
});

export default router;