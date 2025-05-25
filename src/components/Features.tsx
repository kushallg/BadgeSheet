
import { Download, Pencil, Image, Check } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Download,
      title: "Instant PDF Export",
      description: "Generate professional A4 PDFs ready for printing in seconds.",
    },
    {
      icon: Pencil,
      title: "Dotted Cut Guides",
      description: "Precise cutting lines ensure perfect badge inserts every time.",
    },
    {
      icon: Image,
      title: "Customizable Templates",
      description: "Choose from professional layouts and customize colors to match your brand.",
    },
    {
      icon: Check,
      title: "No Adhesives Required",
      description: "Badge inserts slide perfectly into standard name badge holders.",
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-textDark mb-4">Why Choose Badge Inserts?</h2>
          <p className="text-lg text-textDark/75">Everything you need for professional event badges</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="space-y-4">
              <feature.icon className="w-8 h-8 text-primary" strokeWidth={2} />
              <h3 className="text-lg font-semibold text-textDark">{feature.title}</h3>
              <p className="text-textDark/75 text-sm leading-6">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
