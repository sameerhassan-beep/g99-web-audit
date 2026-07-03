import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getServiceSupabase } from '@/database/client';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('Stripe-Signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (error: any) {
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Example: Retrieve clerk_id from metadata
    const clerkId = session.metadata?.clerk_id;

    if (clerkId) {
      // Update the user's stripe customer id or subscription status in Supabase
      const { error } = await supabase
        .from('users')
        .update({ stripe_customer_id: session.customer as string })
        .eq('clerk_id', clerkId);

      if (error) {
        console.error('Error updating user in Supabase:', error);
      }
    }
  }

  return NextResponse.json({ received: true });
}
