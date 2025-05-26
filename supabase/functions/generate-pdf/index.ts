import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";
serve(async (req)=>{
  try {
    console.log('Received request:', req.method, req.url);
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
        }
      });
    }
    const { names, templateId } = await req.json();
    console.log('Request body:', {
      names,
      templateId
    });
    if (!Array.isArray(names) || names.length === 0) {
      throw new Error('Names array is required and must not be empty');
    }
    if (!templateId) {
      throw new Error('Template ID is required');
    }
    // Create a new PDF document
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([
      595,
      842
    ]) // A4 in points
    ;
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 24;
    // Layout configuration
    const cols = 2;
    const rows = 3;
    const badgeW = 595 / cols;
    const badgeH = (842 - 40) / rows;
    const margin = 20;
    // Draw badges
    names.forEach((name, i)=>{
      const col = i % cols;
      const row = Math.floor(i / cols) % rows;
      const x = col * badgeW + margin / 2;
      const y = 842 - margin - (row + 1) * badgeH;
      // Draw badge border
      page.drawRectangle({
        x,
        y,
        width: badgeW - margin,
        height: badgeH - margin,
        borderColor: rgb(0.6, 0.6, 0.6),
        borderWidth: 1
      });
      // Draw name
      const textWidth = font.widthOfTextAtSize(name, fontSize);
      page.drawText(name, {
        x: x + (badgeW - margin - textWidth) / 2,
        y: y + badgeH / 2.5,
        size: fontSize,
        font,
        color: rgb(0.1, 0.1, 0.1)
      });
    });
    // Save the PDF
    const pdfBytes = await pdf.save();
    console.log('PDF generated successfully, size:', pdfBytes.length);
    // Convert to base64 for safe transmission
    const base64 = btoa(String.fromCharCode.apply(null, pdfBytes));
    return new Response(JSON.stringify({
      pdf: base64
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });
  } catch (error) {
    console.error('Error in generate-pdf function:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });
  }
});
