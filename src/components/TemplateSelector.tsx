import { cn } from "@/lib/utils";

export const templates = [
  {
    id: 'classic',
    name: 'Classic',
    render: (name: string) => `
      <div class="w-full h-full flex items-center justify-center border-2 border-dashed p-4 text-center">
        <span class="text-xl font-bold">${name}</span>
      </div>
    `
  },
  {
    id: 'modern',
    name: 'Modern',
    render: (name: string) => `
      <div class="w-full h-full flex items-center justify-center bg-primary/10 rounded-lg p-3">
        <span class="text-primary font-semibold text-lg">${name}</span>
      </div>
    `
  }
] as const;

interface TemplateSelectorProps {
  selected: string;
  onSelect: (templateId: string) => void;
}

const TemplateSelector = ({ selected, onSelect }: TemplateSelectorProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-textDark">Choose a Template</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={cn(
              "p-4 rounded-lg border-2 transition-all duration-200",
              selected === template.id
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-primary/50"
            )}
          >
            <div className="mb-2 font-medium text-textDark">{template.name}</div>
            <div
              className="aspect-[3/2] bg-white rounded"
              dangerouslySetInnerHTML={{ __html: template.render("Sample Name") }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector; 