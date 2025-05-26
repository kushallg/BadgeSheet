import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import NameUploader from "@/components/NameUploader";
import TemplateSelector from "@/components/TemplateSelector";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";

const GenerateBadges = () => {
  const [names, setNames] = useState<string[]>([]);
  const [templateId, setTemplateId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      console.log('Sending request to generate PDF:', { names, templateId });
      
      const { data, error } = await supabase.functions.invoke("generate-pdf", {
        body: { names, templateId },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data received from the function');
      }

      // Convert the response to a Uint8Array
      const pdfBytes = new Uint8Array(data as ArrayBuffer);
      
      // Create blob from the PDF bytes
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      // Create and trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = "Badges.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

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
              Upload names, choose a template, and generate print-ready badge inserts
            </p>
          </div>

          <NameUploader onNamesChange={setNames} />
          <TemplateSelector selected={templateId} onSelect={setTemplateId} />

          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white"
              disabled={!names.length || !templateId || loading}
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