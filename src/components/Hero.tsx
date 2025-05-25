
import { Upload } from "lucide-react";

const Hero = () => {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold text-textDark leading-tight">
                Print-Ready Badge Inserts in 60s
              </h1>
              <p className="text-lg text-textDark/75 leading-7 max-w-lg">
                Upload names, pick a template, cut along the dotted lines. No adhesives needed.
              </p>
            </div>
            <button className="bg-primary text-white py-3 px-6 rounded-lg shadow-lg hover:bg-primary/90 transition-colors duration-200 font-semibold inline-flex items-center gap-2">
              <Upload size={20} />
              Generate Badges Now
            </button>
          </div>

          {/* Right Mockup */}
          <div className="flex justify-center lg:justify-end">
            <div className="bg-bgLight rounded-2xl p-8 shadow-xl max-w-sm">
              <div className="bg-white rounded-lg p-6 space-y-4">
                <div className="text-center text-sm text-textDark/60 mb-4">A4 PDF Preview</div>
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="border-2 border-dashed border-primary/40 rounded-lg p-3 text-center">
                      <div className="text-xs text-textDark/60 mb-1">Guest {i + 1}</div>
                      <div className="text-sm font-semibold text-textDark">John Doe</div>
                      <div className="text-xs text-textDark/50">Company Inc.</div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-textDark/40 text-center mt-4">✂️ Cut along dotted lines</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
