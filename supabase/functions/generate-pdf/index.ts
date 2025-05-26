// supabase/functions/generate-pdf/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

serve(async (req) => {
  // CORS preflight
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

  try {
    // Parse names array
    const { names } = await req.json();
    if (!Array.isArray(names) || names.length === 0) {
      throw new Error("Names array is required and must not be empty");
    }

    // Create PDF
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]); // A4
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 20;

    // Grid: 3 columns × 2 rows (horizontal flow)
    const cols = 3;
    const rows = 2;
    const badgeW = 595 / cols;
    const badgeH = (842 - 40) / rows;
    const margin = 20;
    const fillColor = rgb(241 / 255, 80 / 255, 37 / 255);  // #F15025
    const textColor = rgb(25 / 255, 25 / 255, 25 / 255);   // #191919

    // Draw each badge
    names.forEach((name: string, i: number) => {
      const pageIndex = Math.floor(i / (cols * rows));
      if (pageIndex >= pdf.getPageCount()) {
        pdf.addPage([595, 842]);
      }
      const p = pdf.getPage(pageIndex);

      const idx = i % (cols * rows);
      const col = idx % cols;
      const row = Math.floor(idx / cols);

      // Position from top-left
      const x = margin / 2 + col * badgeW;
      const y = 842 - margin - badgeH - row * badgeH;

      // Orange fill
      p.drawRectangle({
        x,
        y,
        width: badgeW - margin,
        height: badgeH - margin,
        color: fillColor,
      });

      // Centered black text
      const textWidth = font.widthOfTextAtSize(name, fontSize);
      p.drawText(name, {
        x: x + (badgeW - margin - textWidth) / 2,
        y: y + (badgeH - margin) / 2 - fontSize / 2,
        size: fontSize,
        font,
        color: textColor,
      });
    });

    // Serialize & encode
    const pdfBytes = await pdf.save();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));

    // JSON response
    return new Response(JSON.stringify({ pdf: base64 }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });

  } catch (err: any) {
    console.error("Error in generate-pdf:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
