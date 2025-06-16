import { generateStyledPDF } from './utils/htmlToPdfGenerator'; // adjust path as needed

// Replace your current PDF generation function with this:
const handleGeneratePDF = async () => {
  if (names.length === 0) {
    // Show error message - use your existing toast/alert system
    alert("Please enter at least one name to generate badges.");
    return;
  }

  try {
    // Show loading message - use your existing toast/alert system
    console.log("Generating PDF...");
    
    await generateStyledPDF(names, selectedColor);
    
    // Show success message - use your existing toast/alert system
    console.log("PDF Generated Successfully!");
  } catch (error) {
    console.error('PDF generation error:', error);
    // Show error message - use your existing toast/alert system
    alert("Error generating PDF. Please try again.");
  }
};
