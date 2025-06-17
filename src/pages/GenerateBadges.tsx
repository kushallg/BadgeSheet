import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import NameUploader from "@/components/NameUploader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import { Palette } from "lucide-react";

const colorOptions = [
  { name: 'Orange', value: '#F15025' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Purple', value: '#9333ea' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Pink', value: '#e91e63' },
  { name: 'Indigo', value: '#4f46e5' }
];

const GenerateBadges = () => {
  const [names, setNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#F15025');
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (names.length === 0) {
      toast({
        title: "Error",
        description: "Please enter at least one name to generate badges.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          names: names,
          color: selectedColor
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `name-badges-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success!",
        description: "Your badges have been generated successfully.",
      });
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-textDark">
              Generate Badge Inserts
            </h1>
            <p className="text-lg text-textDark/75">
              Upload names and generate print-ready badge inserts
            </p>
          </div>

          <NameUploader onNamesChange={setNames} />

          {/* Color Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Palette className="w-4 h-4 inline mr-1" />
              Badge Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-full h-10 rounded-md border-2 transition-all ${
                    selectedColor === color.value 
                      ? 'border-gray-800 ring-2 ring-gray-300' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {selectedColor === color.value && (
                    <span className="text-white text-xs font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Selected: {colorOptions.find(c => c.value === selectedColor)?.name}
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white"
              disabled={!names.length || loading}
              onClick={handleGenerate}
            >
              {loading ? "Generating..." : "Generate PDF"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GenerateBadges; 