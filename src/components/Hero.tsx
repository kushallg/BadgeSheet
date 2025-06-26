import { Upload } from "lucide-react";
import { useState, useEffect, FC } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AuthDialog from "@/components/AuthDialog";
import { User } from "@supabase/supabase-js";

const Hero: FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) setLoginOpen(false);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleGenerateClick = () => {
    if (user) {
      navigate("/generate");
    } else {
      setLoginOpen(true);
    }
  };

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold text-textDark leading-tight">
                Print-Ready Name Badge Inserts in 60s
              </h1>
              <p className="text-lg text-textDark/75 leading-7 max-w-lg">
                Upload names, pick a template, cut along the dotted lines. No adhesives needed.
              </p>
            </div>
            <button
              className="bg-primary text-white py-3 px-6 rounded-lg shadow-lg hover:bg-primary/90 transition-colors duration-200 font-semibold inline-flex items-center gap-2"
              onClick={handleGenerateClick}
            >
              <Upload size={20} />
              Generate Badges Now
            </button>
            <AuthDialog mode="login" open={loginOpen} onOpenChange={setLoginOpen}>
              {/* Hidden trigger, modal is controlled by state */}
              <span />
            </AuthDialog>
          </div>

          {/* Right Mockup - UPDATED */}
          <div className="flex justify-center lg:justify-start">
            <div className="grid grid-cols-2 gap-4">
              {/* Map to create 4 generic badges */}
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white border-2 border-blue-100 rounded-lg shadow-md overflow-hidden w-48">
                  {/* Orange Header */}
                  <div className="bg-orange-600 text-white text-center py-2">
                    <p className="text-xs font-bold tracking-wide">HELLO MY NAME IS</p>
                  </div>
                  {/* Main Content Area */}
                  <div className="relative bg-white px-2 py-5">
                    <div className="flex justify-center items-center h-full">
                      {/* Name and Subtitle */}
                      <div className="text-center">
                        {/* Name is now "John Doe" */}
                        <p className="text-3xl font-sans font-bold text-gray-800">John Doe</p>
                        <p className="text-xs text-gray-500 mt-3">Event Badge</p>
                      </div>
                    </div>
                    {/* Vertical Side Bars */}
                    <div className="absolute left-2 top-0 bottom-0 flex items-center">
                       <div className="w-1.5 h-12 bg-orange-600" />
                    </div>
                    <div className="absolute right-2 top-0 bottom-0 flex items-center">
                       <div className="w-1.5 h-12 bg-orange-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;