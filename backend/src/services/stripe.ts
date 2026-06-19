import { config } from '../config';
import { getDb } from '../db';

/**
 * Stripe Service
 * Handles subscription management and webhooks
 * 
 * In development/test mode, this operates without real Stripe keys
 */

export interface StripeCustomer {
  id: string;
  email: string;
}

export async function createStripeCustomer(email: string, name: string): Promise<StripeCustomer | null> {
  const { secretKey } = config.stripe;
  if (!secretKey || secretKey === 'sk_test_placeholder') {
    // Mock mode
    return { id: `mock_cus_${Date.now()}`, email };
  }

  try {
    const stripe = await getStripeClient();
    const customer = await stripe.customers.create({ email, name });
    return { id: customer.id, email: customer.email || email };
  } catch (error) {
    console.error('Stripe customer creation failed:', error);
    return null;
  }
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string | null> {
  const { secretKey } = config.stripe;
  if (!secretKey || secretKey === 'sk_test_placeholder') {
    return `mock_checkout_${Date.now()}`;
  }

  try {
    const stripe = await getStripeClient();
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return session.url;
  } catch (error) {
    console.error('Checkout session creation failed:', error);
    return null;
  }
}

export async function createPortalSession(customerId: string, returnUrl: string): Promise<string | null> {
  const { secretKey } = config.stripe;
  if (!secretKey || secretKey === 'sk_test_placeholder') {
    return returnUrl;
  }

  try {
    const stripe = await getStripeClient();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session.url;
  } catch (error) {
    console.error('Portal session creation failed:', error);
    return null;
  }
}

export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  const { secretKey } = config.stripe;
  if (!secretKey || secretKey === 'sk_test_placeholder') {
    return true;
  }

  try {
    const stripe = await getStripeClient();
    await stripe.subscriptions.cancel(subscriptionId);
    return true;
  } catch (error) {
    console.error('Subscription cancellation failed:', error);
    return false;
  }
}

export interface WebhookEvent {
  type: string;
  data: any;
}

export async function handleWebhookEvent(event: WebhookEvent): Promise<void> {
  const db = getDb();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const customerId = session.customer;
      const subscriptionId = session.subscription;

      // Find user by Stripe customer ID
      const user = db.prepare('SELECT id FROM users WHERE stripe_customer_id = ?').get(customerId) as any;
      if (user) {
        const priceId = session.line_items?.data?.[0]?.price?.id;
        const plan = priceId === config.stripe.prices.pro ? 'pro' : priceId === config.stripe.prices.agency ? 'agency' : 'free';
        const exportLimit = plan === 'pro' ? 100 : plan === 'agency' ? 500 : 5;

        db.prepare(`
          UPDATE users SET plan = ?, stripe_subscription_id = ?, exports_limit = ?, updated_at = datetime('now')
          WHERE id = ?
        `).run(plan, subscriptionId, exportLimit, user.id);
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const status = subscription.status;

      const user = db.prepare('SELECT id FROM users WHERE stripe_subscription_id = ?').get(subscription.id) as any;
      if (user) {
        if (status === 'canceled' || status === 'unpaid' || status === 'incomplete_expired') {
          // Downgrade to free
          db.prepare(`
            UPDATE users SET plan = 'free', stripe_subscription_id = NULL, exports_limit = 5, updated_at = datetime('now')
            WHERE id = ?
          `).run(user.id);
        }
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const user = db.prepare('SELECT id FROM users WHERE stripe_customer_id = ?').get(invoice.customer) as any;
      if (user) {
        console.warn(`Payment failed for user ${user.id}`);
      }
      break;
    }
  }
}

let stripeClient: any = null;

async function getStripeClient(): Promise<any> {
  if (stripeClient) return stripeClient;
  const { default: Stripe } = await import('stripe');
  stripeClient = new Stripe(config.stripe.secretKey);
  return stripeClient;
}