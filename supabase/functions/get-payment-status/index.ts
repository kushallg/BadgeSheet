import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import Stripe from "npm:stripe@12.15.0";

const SITE_URL = Deno.env.get("SITE_URL")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": SITE_URL,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2022-11-15",
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Get Supabase Auth JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Get user from JWT
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  if (!user || userError) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  // Get user row (for stripe_customer_id)
  const { data: userRow, error: userRowError } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!userRow || userRowError) {
    return new Response("User not found", { status: 404, headers: corsHeaders });
  }

  // Check Stripe for active subscription
  let hasActiveSubscription = false;
  if (userRow.stripe_customer_id) {
    const subscriptions = await stripe.subscriptions.list({
      customer: userRow.stripe_customer_id,
      status: "all",
      limit: 10,
    });
    hasActiveSubscription = subscriptions.data.some(
      (sub) => sub.status === "active" || sub.status === "trialing"
    );
  }

  // Check for valid one-time payment (not expired)
  const { data: payment } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", user.id)
    .eq("purchase_type", "one_time")
    .gte("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: false })
    .limit(1)
    .single();

  const hasValidOneTime = !!payment;

  return new Response(
    JSON.stringify({
      hasActiveSubscription,
      hasValidOneTime,
    }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}); 