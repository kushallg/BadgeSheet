import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const templates = [
  {
    id: 'classic',
    render: (name: string) => `
      <div class="w-full h-full flex items-center justify-center border-2 border-dashed p-4 text-center">
        <span class="text-xl font-bold">${name}</span>
      </div>
    `
  },
  {
    id: 'modern',
    render: (name: string) => `
      <div class="w-full h-full flex items-center justify-center bg-primary/10 rounded-lg p-3">
        <span class="text-primary font-semibold text-lg">${name}</span>
      </div>
    `
  }
];

const generateHTML = (names: string[], templateId: string) => {
  const template = templates.find(t => t.id === templateId);
  if (!template) throw new Error('Template not found');

  const badges = names.map(name => template.render(name)).join('');
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Badge Inserts</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
          }
          
          .page {
            width: 210mm;
            height: 297mm;
            padding: 10mm;
            box-sizing: border-box;
            page-break-after: always;
          }
          
          .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10mm;
            height: 100%;
          }
          
          .badge {
            width: 100%;
            height: 100%;
            page-break-inside: avoid;
          }
          
          @media print {
            .page {
              margin: 0;
              border: none;
            }
          }
        </style>
      </head>
      <body>
        ${names.reduce((pages, _, index) => {
          if (index % 6 === 0) {
            const pageNames = names.slice(index, index + 6);
            return pages + `
              <div class="page">
                <div class="grid">
                  ${pageNames.map(name => `
                    <div class="badge">
                      ${template.render(name)}
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }
          return pages;
        }, '')}
      </body>
    </html>
  `;
};

serve(async (req) => {
  try {
    const { names, templateId } = await req.json();
    
    if (!Array.isArray(names) || names.length === 0) {
      throw new Error('Names array is required and must not be empty');
    }
    
    if (!templateId) {
      throw new Error('Template ID is required');
    }

    const html = generateHTML(names, templateId);
    
    // Launch browser
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Create new page
    const page = await browser.newPage();
    
    // Set content
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });
    
    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0'
      }
    });
    
    // Close browser
    await browser.close();
    
    // Return PDF
    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="badges.pdf"'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}); 