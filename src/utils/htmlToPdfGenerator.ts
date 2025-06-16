import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generateStyledPDF = async (names: string[], color: string = '#F15025'): Promise<void> => {
  // Create a temporary container for rendering badges
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  document.body.appendChild(container);

  const pdf = new jsPDF('portrait', 'in', 'letter');
  
  // Badge dimensions in inches - keeping the original size
  const badgeWidthIn = 3.5;
  const badgeHeightIn = 2.5;
  
  // Page layout - 2 columns x 3 rows
  const marginX = 0.75;
  const marginY = 0.5;
  const spacingX = 0.25;
  const spacingY = 0.25;
  
  const badgesPerRow = 2; // 2 columns
  const badgesPerCol = 3; // 3 rows
  const badgesPerPage = badgesPerRow * badgesPerCol; // 6 badges per page
  
  let pageAdded = false;

  for (let i = 0; i < names.length; i++) {
    // Add new page if needed
    if (i > 0 && i % badgesPerPage === 0) {
      pdf.addPage();
      pageAdded = true;
    }
    
    // Create badge element with original dimensions
    const badgeElement = document.createElement('div');
    badgeElement.innerHTML = `
      <div class="name-badge bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl shadow-lg overflow-hidden" style="width: 336px; height: 240px;">
        <div class="w-full h-full relative">
          <!-- Header -->
          <div class="h-16 relative" style="background: linear-gradient(to right, ${color}, ${color}dd);">
            <div class="absolute inset-0 bg-white bg-opacity-10"></div>
            <div class="flex items-center justify-center h-full">
              <div class="text-white text-sm font-bold tracking-widest uppercase" style="letter-spacing: 0.1em;">
                HELLO MY NAME IS
              </div>
            </div>
            <!-- Corner decorations -->
            <div class="absolute top-0 left-0 w-4 h-4" style="border-left: 4px solid rgba(255,255,255,0.3); border-top: 4px solid rgba(255,255,255,0.3);"></div>
            <div class="absolute top-0 right-0 w-4 h-4" style="border-right: 4px solid rgba(255,255,255,0.3); border-top: 4px solid rgba(255,255,255,0.3);"></div>
          </div>
          
          <!-- Main content -->
          <div class="flex-1 flex items-center justify-center px-6 py-8 bg-white relative" style="min-height: 140px;">
            <!-- Background pattern -->
            <div class="absolute inset-0" style="opacity: 0.05;">
              <div class="w-full h-full bg-gradient-to-br from-blue-100 to-transparent"></div>
            </div>
            
            <!-- Name -->
            <div class="relative z-10 text-center">
              <div class="text-2xl font-bold text-gray-800 leading-tight break-words max-w-full" style="font-size: 1.75rem; font-weight: 700; color: #1f2937; line-height: 1.25;">
                ${names[i]}
              </div>
            </div>
            
            <!-- Side borders -->
            <div class="absolute left-0 w-1 rounded-full" style="top: 16px; bottom: 16px; background: linear-gradient(to bottom, ${color}80, ${color});"></div>
            <div class="absolute right-0 w-1 rounded-full" style="top: 16px; bottom: 16px; background: linear-gradient(to bottom, ${color}80, ${color});"></div>
          </div>
          
          <!-- Footer -->
          <div class="bg-gray-50 border-t border-gray-200 h-10 flex items-center justify-center" style="background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
            <div class="text-sm text-gray-500 font-medium tracking-wider uppercase" style="font-size: 0.75rem; color: #6b7280; font-weight: 500; letter-spacing: 0.05em;">
              Event Badge
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Apply necessary styles for proper rendering
    badgeElement.style.width = '336px';
    badgeElement.style.height = '240px';
    badgeElement.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    
    container.appendChild(badgeElement);
    
    try {
      // Capture the badge as canvas
      const canvas = await html2canvas(badgeElement, {
        width: 336,
        height: 240,
        scale: 2, // Higher resolution
        backgroundColor: 'white',
        logging: false,
        useCORS: true
      });
      
      // Calculate position on PDF
      const pagePosition = i % badgesPerPage;
      const row = Math.floor(pagePosition / badgesPerRow);
      const col = pagePosition % badgesPerRow;
      
      const x = marginX + col * (badgeWidthIn + spacingX);
      const y = marginY + row * (badgeHeightIn + spacingY);
      
      // Add image to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', x, y, badgeWidthIn, badgeHeightIn);
      
    } catch (error) {
      console.error('Error generating badge:', error);
    }
    
    // Clean up
    container.removeChild(badgeElement);
  }
  
  // Clean up container
  document.body.removeChild(container);
  
  // Save PDF
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  pdf.save(`stylish-name-badges-${timestamp}.pdf`);
}; 