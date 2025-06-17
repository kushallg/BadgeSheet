import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createCanvas, loadImage } from "https://deno.land/x/canvas@v1.4.1/mod.ts"
import { PDFDocument, rgb } from "https://esm.sh/pdf-lib@1.17.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { names, color = '#F15025' } = await req.json()

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
    const marginX = 0.75 * 72
    const marginY = 0.5 * 72
    const spacingX = 0.25 * 72
    const spacingY = 0.25 * 72
    
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
