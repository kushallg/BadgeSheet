import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface NameUploaderProps {
  onNamesChange: (names: string[]) => void;
}

const NameUploader = ({ onNamesChange }: NameUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [names, setNames] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const parseCSV = (text: string): string[] => {
    return text
      .split(/[\n,]/)
      .map(name => name.trim())
      .filter(name => name.length > 0);
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsedNames = parseCSV(text);
      setNames(parsedNames);
      onNamesChange(parsedNames);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/csv") {
      handleFileUpload(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const parsedNames = parseCSV(e.target.value);
    setNames(parsedNames);
    onNamesChange(parsedNames);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-textDark">Upload Names</h2>
      
      {/* File Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-gray-200"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="mb-4"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload CSV
        </Button>
        <p className="text-sm text-textDark/60">
          Drag and drop a CSV file here, or click to browse
        </p>
      </div>

      {/* Textarea Fallback */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-textDark">
          Or enter names manually (one per line or comma-separated)
        </label>
        <Textarea
          placeholder="John Doe, Jane Smith&#10;Alice Johnson&#10;Bob Wilson"
          className="min-h-[100px]"
          onChange={handleTextareaChange}
        />
      </div>

      {/* Preview */}
      {names.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-textDark/60 mb-2">
            {names.length} names loaded
          </p>
          <div className="bg-bgLight rounded-lg p-4">
            <div className="text-sm text-textDark/80">
              {names.slice(0, 3).join(", ")}
              {names.length > 3 ? ` and ${names.length - 3} more...` : ""}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NameUploader; 