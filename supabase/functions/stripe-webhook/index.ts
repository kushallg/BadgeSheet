import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import Stripe from "npm:stripe@12.15.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2022-11-15",
});

serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig!,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Only handle checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const customerId = session.customer;
    let email = session.customer_email;
    const plan = session.metadata?.plan;
    const paymentStatus = session.payment_status;
    const sessionId = session.id;
    const subscriptionId = session.subscription;

    // If email is null, fetch from Stripe customer object
    if (!email && customerId) {
      const customer = await stripe.customers.retrieve(customerId);
      email = customer.email;
    }

    console.log('Webhook received:', { plan, paymentStatus, sessionId, email, subscriptionId });

    // Update users table
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    if (email && customerId) {
      await supabase
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("email", email);
    }

    // Insert one-time payment record if plan is one_time and payment is successful
    if (plan === "one_time" && paymentStatus === "paid") {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();
      if (user) {
        const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
        const { error: insertError } = await supabase.from("payments").insert([
          {
            user_id: user.id,
            purchase_type: "one_time",
            stripe_session_id: sessionId,
            expires_at: expiresAt,
          },
        ]);
        if (insertError) {
          console.error('Failed to insert payment:', insertError);
        } else {
          console.log('Inserted one-time payment for user:', user.id);
        }
      } else {
        console.error('User not found for email:', email, userError);
      }
    }

    // Insert subscription record if plan is subscription and payment is successful
    if (plan === "subscription" && paymentStatus === "paid" && subscriptionId) {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();
      if (user) {
        const { error: insertError } = await supabase.from("subscriptions").insert([
          {
            user_id: user.id,
            stripe_subscription_id: subscriptionId,
            status: "active",
          },
        ]);
        if (insertError) {
          console.error('Failed to insert subscription:', insertError);
        } else {
          console.log('Inserted subscription for user:', user.id);
        }
      } else {
        console.error('User not found for email:', email, userError);
      }
    }
  }

  return new Response("ok", { status: 200 });
}); 