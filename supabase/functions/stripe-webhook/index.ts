import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import Stripe from "npm:stripe@^15.0.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

// Initialize Supabase client once outside handler
const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);

serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
  
  if (event.type !== "checkout.session.completed") {
    return new Response("ok - event not handled", { status: 200 });
  }

  const session = event.data.object;
  const { customer, customer_details, metadata, payment_status, id: sessionId, subscription: subscriptionId } = session;
  let email = customer_details?.email;

  // Retrieve customer email from customer object if not in session details
  if (!email && typeof customer === 'string') {
    const customerObj = await stripe.customers.retrieve(customer);
    email = customerObj.email;
  }
  
  if (!email) {
    console.error("Webhook Error: No email found for session:", sessionId);
    return new Response("ok - user email not found", { status: 200 });
  }

  // --- OPTIMIZATION: Fetch user ID once, then run all DB operations ---
  const { data: user, error: userError } = await supabase.from("users").select("id").eq("email", email).single();
  if (userError || !user) {
    console.error('Webhook Error: User not found for email:', email, userError);
    return new Response("ok - user not found", { status: 200 });
  }

  // Build an array of promises for all database writes
  const dbPromises = [];

  // Promise 1: Update stripe_customer_id on the user record
  if (typeof customer === 'string') {
    dbPromises.push(
        supabase.from("users").update({ stripe_customer_id: customer }).eq("id", user.id)
    );
  }

  // Promise 2: Insert one-time payment record
  if (metadata?.plan === "one_time" && payment_status === "paid") {
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
    dbPromises.push(
      supabase.from("payments").insert({
        user_id: user.id,
        purchase_type: "one_time",
        stripe_session_id: sessionId,
        expires_at: expiresAt,
      })
    );
  }

  // Promise 3: Insert subscription record
  if (metadata?.plan === "subscription" && payment_status === "paid" && subscriptionId) {
    dbPromises.push(
      supabase.from("subscriptions").insert({
        user_id: user.id,
        stripe_subscription_id: subscriptionId,
        status: "active",
      })
    );
  }

  // --- OPTIMIZATION: Execute all database writes in parallel ---
  if (dbPromises.length > 0) {
    const results = await Promise.allSettled(dbPromises);
    results.forEach((result, i) => {
        if (result.status === 'rejected') {
            console.error(`DB Operation ${i} failed:`, result.reason);
        }
    });
  }

  return new Response("ok", { status: 200 });
});