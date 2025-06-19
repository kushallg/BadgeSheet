import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "npm:stripe@13.0.0";

const SITE_URL = Deno.env.get("SITE_URL")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": SITE_URL,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-08-16",
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, plan } = await req.json();

    let priceId, mode;
    if (plan === "subscription") {
      priceId = Deno.env.get("STRIPE_PRICE_ID_SUBSCRIPTION");
      mode = "subscription";
    } else {
      priceId = Deno.env.get("STRIPE_PRICE_ID_ONE_TIME");
      mode = "payment";
    }

    // Ensure a Stripe customer exists for this email
    let customer;
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length > 0) {
      customer = customers.data[0].id;
    } else {
      const newCustomer = await stripe.customers.create({ email });
      customer = newCustomer.id;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode,
      success_url: `${SITE_URL}/generate?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/generate?canceled=true`,
      customer, // Always set customer
      metadata: { plan },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Stripe error:", error);
    return new Response(
      JSON.stringify({ error: error.message || String(error) }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
}); 