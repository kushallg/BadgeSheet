
const Pricing = () => {
  return (
    <section className="bg-bgMedium py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-textDark mb-4">Simple, Flat Pricing</h2>
            <p className="text-lg text-textDark/75">Choose the plan that works for you</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Pay-Per-Event */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold text-textDark">Pay-Per-Event</h3>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-primary">$3</div>
                  <div className="text-textDark/60">per PDF</div>
                </div>
                <div className="text-textDark/75">One-time fee</div>
                <ul className="space-y-3 text-left">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-textDark/75">Perfect for single events</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-textDark/75">No monthly commitment</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-textDark/75">Instant download</span>
                  </li>
                </ul>
                <button className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors duration-200 font-semibold">
                  Get Started
                </button>
              </div>
            </div>

            {/* Unlimited */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-primary">
              <div className="text-center space-y-4">
                <div className="bg-primary text-white text-xs px-3 py-1 rounded-full inline-block">
                  MOST POPULAR
                </div>
                <h3 className="text-2xl font-bold text-textDark">Unlimited</h3>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-primary">$5</div>
                  <div className="text-textDark/60">/month</div>
                </div>
                <div className="text-textDark/75">Unlimited events</div>
                <ul className="space-y-3 text-left">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-textDark/75">Unlimited PDF generation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-textDark/75">Priority support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-textDark/75">Cancel anytime</span>
                  </li>
                </ul>
                <button className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors duration-200 font-semibold">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
