import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

serve(async (req) => {
  try {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        },
      });
    }

    // Parse input
    const { names, templateId } = await req.json();
    if (!Array.isArray(names) || names.length === 0) {
      throw new Error("Names array is required and must not be empty");
    }
    if (!templateId) {
      throw new Error("Template ID is required");
    }

    // Create PDF
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]); // A4 in points
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 24;

    // Layout: 2 cols × 3 rows
    const cols = 2;
    const rows = 3;
    const badgeW = 595 / cols;
    const badgeH = (842 - 40) / rows;
    const margin = 20;

    // Draw badges
    names.forEach((name: string, i: number) => {
      const col = i % cols;
      const row = Math.floor(i / cols) % rows;
      const x = col * badgeW + margin / 2;
      const y = 842 - margin - (row + 1) * badgeH;

      // White background fill
      page.drawRectangle({
        x,
        y,
        width: badgeW - margin,
        height: badgeH - margin,
        color: rgb(1, 1, 1),
      });

      // Thin black border
      page.drawRectangle({
        x,
        y,
        width: badgeW - margin,
        height: badgeH - margin,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      // Draw centered name
      const textWidth = font.widthOfTextAtSize(name, fontSize);
      page.drawText(name, {
        x: x + (badgeW - margin - textWidth) / 2,
        y: y + badgeH / 2.5,
        size: fontSize,
        font,
        color: rgb(0.1, 0.1, 0.1),
      });
    });

    // Save and encode
    const pdfBytes = await pdf.save();
    const base64 = btoa(
      String.fromCharCode.apply(null, pdfBytes as unknown as number[])
    );

    // Return JSON payload
    return new Response(JSON.stringify({ pdf: base64 }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  } catch (error: any) {
    console.error("Error in generate-pdf:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        },
      }
    );
  }
});
