import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_fallback', {
  apiVersion: '2026-06-24.dahlia',
  typescript: true,
});
