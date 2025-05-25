
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ProcessSteps from "@/components/ProcessSteps";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen font-sans">
      <Navigation />
      <Hero />
      <ProcessSteps />
      <Features />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
