import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PDFDocument, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import Stripe from "npm:stripe@^15.0.0";

const SITE_URL = Deno.env.get("SITE_URL") || "https://badgesheet.vercel.app";
const corsHeaders = {
  'Access-Control-Allow-Origin': SITE_URL,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Stripe client
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient()
});

// Helper function moved outside the request handler
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  } : { r: 0.945, g: 0.314, b: 0.145 }; // Default orange
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { names, color = '#F15025' } = await req.json();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }
    
    // Initialize Supabase client with user's auth token
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_ANON_KEY"), // Use anon key for user-context client
      { global: { headers: { Authorization: authHeader } } }
    );
    
    // Get user and user row in one go if possible, or handle separately
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const { data: userRow, error: userRowError } = await supabase.from("users").select("stripe_customer_id").eq("id", user.id).single();
    if (userRowError || !userRow) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: corsHeaders });
    }

    // --- OPTIMIZATION: Run payment checks in parallel ---
    const [subscriptionResult, oneTimeResult] = await Promise.all([
      // Promise 1: Check for active Stripe subscription
      userRow.stripe_customer_id ? stripe.subscriptions.list({
        customer: userRow.stripe_customer_id,
        status: "active", // Only query for active statuses
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

    if (!hasActiveSubscription && !hasValidOneTime) {
      return new Response(JSON.stringify({ error: 'Payment required' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    if (!names || !Array.isArray(names) || names.length === 0) {
      return new Response(JSON.stringify({ error: 'Names array is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    const pdfDoc = await PDFDocument.create();
    
    // --- OPTIMIZATION: Embed fonts once before the loop ---
    const helveticaBoldFont = await pdfDoc.embedFont('Helvetica-Bold');
    const helveticaFont = await pdfDoc.embedFont('Helvetica');
    
    const colorRgb = hexToRgb(color);
    const badgeWidth = 3.5 * 72;
    const badgeHeight = 2.5 * 72;
    const marginY = 0.5 * 72;
    const spacingX = 0.25 * 72;
    const spacingY = 0.25 * 72;
    const marginX = (8.5 * 72 - (2 * badgeWidth + spacingX)) / 2;
    const badgesPerPage = 6;
    let currentPage;

    for (let i = 0; i < names.length; i++) {
      if (i % badgesPerPage === 0) {
        currentPage = pdfDoc.addPage([8.5 * 72, 11 * 72]);
      }

      const pagePosition = i % badgesPerPage;
      const row = Math.floor(pagePosition / 2);
      const col = pagePosition % 2;
      const x = marginX + col * (badgeWidth + spacingX);
      const y = currentPage.getHeight() - marginY - (row + 1) * (badgeHeight + spacingY) + spacingY;

      currentPage.drawRectangle({ x, y, width: badgeWidth, height: badgeHeight, color: rgb(1, 1, 1), borderColor: rgb(0.7, 0.8, 0.9), borderWidth: 2 });
      
      const headerHeight = 45;
      currentPage.drawRectangle({ x, y: y + badgeHeight - headerHeight, width: badgeWidth, height: headerHeight, color: rgb(colorRgb.r, colorRgb.g, colorRgb.b) });

      // Use pre-embedded font
      currentPage.drawText('HELLO MY NAME IS', { x: x + badgeWidth / 2 - 60, y: y + badgeHeight - headerHeight / 2 - 6, size: 10, font: helveticaBoldFont, color: rgb(1, 1, 1) });
      
      const nameText = names[i];
      const nameSize = nameText.length > 15 ? 18 : nameText.length > 10 ? 22 : 26;
      // Use pre-embedded font
      currentPage.drawText(nameText, { x: x + badgeWidth / 2 - nameText.length * nameSize * 0.3, y: y + (badgeHeight - headerHeight) / 2 - 10, size: nameSize, font: helveticaBoldFont, color: rgb(0.1, 0.1, 0.1) });

      // Use pre-embedded font
      currentPage.drawText('Event Badge', { x: x + badgeWidth / 2 - 30, y: y + 15, size: 8, font: helveticaFont, color: rgb(0.4, 0.4, 0.4) });

      const borderWidth = 3;
      currentPage.drawRectangle({ x: x + 5, y: y + 20, width: borderWidth, height: badgeHeight - headerHeight - 40, color: rgb(colorRgb.r * 0.8, colorRgb.g * 0.8, colorRgb.b * 0.8) });
      currentPage.drawRectangle({ x: x + badgeWidth - 5 - borderWidth, y: y + 20, width: borderWidth, height: badgeHeight - headerHeight - 40, color: rgb(colorRgb.r * 0.8, colorRgb.g * 0.8, colorRgb.b * 0.8) });
    }

    const pdfBytes = await pdfDoc.save();
    return new Response(pdfBytes, { headers: { ...corsHeaders, 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="name-badges-${new Date().toISOString().slice(0, 10)}.pdf"` }});

  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate PDF' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }
});