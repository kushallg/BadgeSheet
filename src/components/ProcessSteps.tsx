
import { Upload, Pencil, Download } from "lucide-react";

const ProcessSteps = () => {
  const steps = [
    {
      icon: Upload,
      title: "1. Upload Guest List",
      description: "CSV or text.",
    },
    {
      icon: Pencil,
      title: "2. Pick Layout & Colors",
      description: "Choose from templates.",
    },
    {
      icon: Download,
      title: "3. Download & Print",
      description: "A4 PDF with dotted cut guides.",
    },
  ];

  return (
    <section className="bg-bgLight py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-textDark mb-4">How It Works</h2>
          <p className="text-lg text-textDark/75">Simple, fast, and professional</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <step.icon className="w-8 h-8 text-primary" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-textDark">{step.title}</h3>
              <p className="text-textDark/75">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSteps;
