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

  const { session_id } = await req.json();

  if (!session_id) {
    return new Response(JSON.stringify({ paid: false }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const session = await stripe.checkout.sessions.retrieve(session_id);
  const plan = session.metadata?.plan || null;
  return new Response(JSON.stringify({ paid: session.payment_status === "paid", plan }), {
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}); 