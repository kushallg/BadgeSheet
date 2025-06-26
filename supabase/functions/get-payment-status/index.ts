import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import Stripe from "npm:stripe@^15.0.0";

const SITE_URL = Deno.env.get("SITE_URL") || "https://badgesheet.vercel.app";
const corsHeaders = {
  "Access-Control-Allow-Origin": SITE_URL,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }
    
    // Create Supabase client with service role for this logic
    const supabase = createClient(
        Deno.env.get("SUPABASE_URL"), 
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (userError || !user) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const { data: userRow, error: userRowError } = await supabase.from("users").select("stripe_customer_id").eq("id", user.id).single();
    if (userRowError || !userRow) {
      return new Response("User not found", { status: 404, headers: corsHeaders });
    }

    // --- OPTIMIZATION: Run payment checks in parallel ---
    const [subscriptionResult, oneTimeResult] = await Promise.all([
      // Promise 1: Check for active Stripe subscription
      userRow.stripe_customer_id ? stripe.subscriptions.list({
        customer: userRow.stripe_customer_id,
        status: "active", // Only query for active
        limit: 1,
      }) : Promise.resolve({ data: [] }),
      // Promise 2: Check for valid one-time payment
      supabase.from("payments")
        .select("user_id") // Only select one column for existence check
        .eq("user_id", user.id)
        .eq("purchase_type", "one_time")
        .gte("expires_at", new Date().toISOString())
        .limit(1)
        .single()
    ]);
    
    const hasActiveSubscription = subscriptionResult.data.length > 0;
    const hasValidOneTime = !!oneTimeResult.data;

    return new Response(JSON.stringify({ hasActiveSubscription, hasValidOneTime }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    console.error("Error getting payment status:", error);
    return new Response(JSON.stringify({ error: "Failed to get payment status" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }});
  }
});