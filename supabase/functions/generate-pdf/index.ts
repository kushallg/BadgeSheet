import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createCanvas, loadImage } from "https://deno.land/x/canvas@v1.4.1/mod.ts"
import { PDFDocument, rgb } from "https://esm.sh/pdf-lib@1.17.1"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import Stripe from "npm:stripe@12.15.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2022-11-15",
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { names, color = '#F15025', session_id } = await req.json()

    // Get Supabase Auth JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user from JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user || userError) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    // Get user row (for stripe_customer_id)
    const { data: userRow, error: userRowError } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!userRow || userRowError) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: corsHeaders });
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

    if (!(hasActiveSubscription || hasValidOneTime)) {
      return new Response(
        JSON.stringify({ error: 'Payment required: no active subscription or valid one-time payment' }),
        {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!names || !Array.isArray(names) || names.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Names array is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create PDF document
    const pdfDoc = await PDFDocument.create()
    
    // Badge dimensions in points (1 inch = 72 points)
    const badgeWidth = 3.5 * 72  // 252 points
    const badgeHeight = 2.5 * 72 // 180 points
    
    // Page layout
    

    const marginY = 0.5 * 72
    const spacingX = 0.25 * 72
    const spacingY = 0.25 * 72
    const marginX = ((8.5 * 72) - (2 * badgeWidth + spacingX)) / 2; // This centers the content
    
    const badgesPerRow = 2
    const badgesPerCol = 3
    const badgesPerPage = badgesPerRow * badgesPerCol
    
    let currentPage = pdfDoc.addPage([8.5 * 72, 11 * 72]) // Letter size

    for (let i = 0; i < names.length; i++) {
      // Add new page if needed
      if (i > 0 && i % badgesPerPage === 0) {
        currentPage = pdfDoc.addPage([8.5 * 72, 11 * 72])
      }
      
      // Calculate position
      const pagePosition = i % badgesPerPage
      const row = Math.floor(pagePosition / badgesPerRow)
      const col = pagePosition % badgesPerRow
      
      const x = marginX + col * (badgeWidth + spacingX)
      const y = currentPage.getHeight() - marginY - (row + 1) * (badgeHeight + spacingY) + spacingY
      
      // Draw badge background
      currentPage.drawRectangle({
        x: x,
        y: y,
        width: badgeWidth,
        height: badgeHeight,
        color: rgb(1, 1, 1), // White background
        borderColor: rgb(0.7, 0.8, 0.9), // Light blue border
        borderWidth: 2,
      })
      
      // Convert hex color to RGB
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255
        } : { r: 0.945, g: 0.314, b: 0.145 } // Default orange
      }
      
      const colorRgb = hexToRgb(color)
      
      // Draw header background
      const headerHeight = 45
      currentPage.drawRectangle({
        x: x,
        y: y + badgeHeight - headerHeight,
        width: badgeWidth,
        height: headerHeight,
        color: rgb(colorRgb.r, colorRgb.g, colorRgb.b),
      })
      
      // Add "HELLO MY NAME IS" text
      const helveticaFont = await pdfDoc.embedFont('Helvetica-Bold')
      currentPage.drawText('HELLO MY NAME IS', {
        x: x + badgeWidth / 2 - 60,
        y: y + badgeHeight - headerHeight / 2 - 6,
        size: 10,
        font: helveticaFont,
        color: rgb(1, 1, 1), // White text
      })
      
      // Add name text
      const nameFont = await pdfDoc.embedFont('Helvetica-Bold')
      const nameText = names[i]
      const nameSize = nameText.length > 15 ? 18 : nameText.length > 10 ? 22 : 26
      
      currentPage.drawText(nameText, {
        x: x + badgeWidth / 2 - (nameText.length * nameSize * 0.3),
        y: y + (badgeHeight - headerHeight) / 2 - 10,
        size: nameSize,
        font: nameFont,
        color: rgb(0.1, 0.1, 0.1), // Dark gray
      })
      
      // Add footer text
      const footerFont = await pdfDoc.embedFont('Helvetica')
      currentPage.drawText('Event Badge', {
        x: x + badgeWidth / 2 - 30,
        y: y + 15,
        size: 8,
        font: footerFont,
        color: rgb(0.4, 0.4, 0.4), // Gray text
      })
      
      // Draw side borders
      const borderWidth = 3
      currentPage.drawRectangle({
        x: x + 5,
        y: y + 20,
        width: borderWidth,
        height: badgeHeight - headerHeight - 40,
        color: rgb(colorRgb.r * 0.8, colorRgb.g * 0.8, colorRgb.b * 0.8),
      })
      
      currentPage.drawRectangle({
        x: x + badgeWidth - 5 - borderWidth,
        y: y + 20,
        width: borderWidth,
        height: badgeHeight - headerHeight - 40,
        color: rgb(colorRgb.r * 0.8, colorRgb.g * 0.8, colorRgb.b * 0.8),
      })
    }

    const pdfBytes = await pdfDoc.save()
    
    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="name-badges-${new Date().toISOString().slice(0, 10)}.pdf"`,
      },
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate PDF' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
