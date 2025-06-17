import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2022-11-15",
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { email, plan } = await req.json();

  let priceId, mode;
  if (plan === "subscription") {
    priceId = Deno.env.get("STRIPE_PRICE_ID_SUBSCRIPTION");
    mode = "subscription";
  } else {
    priceId = Deno.env.get("STRIPE_PRICE_ID_ONE_TIME");
    mode = "payment";
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
    success_url: `${Deno.env.get("SITE_URL")}/generate?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${Deno.env.get("SITE_URL")}/generate?canceled=true`,
    customer_email: email,
  });

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}); 