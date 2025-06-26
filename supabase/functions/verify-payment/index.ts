import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "npm:stripe@^15.0.0";

const SITE_URL = Deno.env.get("SITE_URL") || "https://badgesheet.vercel.app";
const corsHeaders = {
  "Access-Control-Allow-Origin": SITE_URL,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Standardized Stripe client initialization
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();
    if (!session_id) {
      return new Response(JSON.stringify({ paid: false, error: "session_id is required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders }});
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    return new Response(JSON.stringify({
        paid: session.payment_status === "paid",
        plan: session.metadata?.plan || null,
      }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch(error) {
    console.error("Error verifying payment:", error);
    return new Response(JSON.stringify({ paid: false, error: "Could not verify payment session." }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }});
  }
});