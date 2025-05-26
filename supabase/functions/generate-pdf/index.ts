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
    // parse and validate
    const { names, templateId } = await req.json();
    if (!Array.isArray(names) || names.length === 0) {
      throw new Error("Names array is required and must not be empty");
    }
    if (typeof templateId !== "string" || !templateId) {
      throw new Error("Template ID is required");
    }

    // create PDF and embed font
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]); // A4
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 20;

    // grid layout
    const cols = 2;
    const rows = 3;
    const badgeW = 595 / cols;
    const badgeH = (842 - 40) / rows;
    const margin = 20;

    // color schemes
    const COLORS: Record<
      string,
      { fill: [number, number, number]; border: [number, number, number]; text: [number, number, number] }
    > = {
      classic: {
        fill: [1, 1, 1],
        border: [25 / 255, 25 / 255, 25 / 255],
        text: [25 / 255, 25 / 255, 25 / 255],
      },
      primary: {
        fill: [241 / 255, 80 / 255, 37 / 255],
        border: [25 / 255, 25 / 255, 25 / 255],
        text: [1, 1, 1],
      },
      subtle: {
        fill: [230 / 255, 232 / 255, 230 / 255],
        border: [206 / 255, 208 / 255, 206 / 255],
        text: [25 / 255, 25 / 255, 25 / 255],
      },
      outline: {
        fill: [1, 1, 1],
        border: [241 / 255, 80 / 255, 37 / 255],
        text: [241 / 255, 80 / 255, 37 / 255],
      },
    };

    // draw each badge
    names.forEach((name: string, i: number) => {
      const col = i % cols;
      const row = Math.floor(i / cols) % rows;
      const x = col * badgeW + margin / 2;
      const y = 842 - margin - (row + 1) * badgeH;

      // select style
      const style = COLORS[templateId] ?? COLORS.classic;

      // background fill
      page.drawRectangle({
        x,
        y,
        width: badgeW - margin,
        height: badgeH - margin,
        color: rgb(...style.fill),
      });

      // border
      page.drawRectangle({
        x,
        y,
        width: badgeW - margin,
        height: badgeH - margin,
        borderColor: rgb(...style.border),
        borderWidth: 1,
      });

      // centered text
      const textWidth = font.widthOfTextAtSize(name, fontSize);
      page.drawText(name, {
        x: x + (badgeW - margin - textWidth) / 2,
        y: y + (badgeH / 2) - fontSize / 2,
        size: fontSize,
        font,
        color: rgb(...style.text),
      });
    });

    // serialize & encode
    const pdfBytes = await pdf.save();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));

    // respond
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }
});