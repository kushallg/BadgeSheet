import { Button } from "@/components/ui/button";
import AuthDialog from "./AuthDialog";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Navigation = () => {
  const [user, setUser] = useState<any>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  useEffect(() => {
    // Get current user on mount
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left - Logo */}
          <div className="flex items-center space-x-3">
            <a href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <img 
                src="/lovable-uploads/361bdbb6-9f48-48aa-a8d1-cce697fb5ca2.png" 
                alt="BadgeSheet" 
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-textDark">BadgeSheet</span>
            </a>
          </div>

          {/* Right - Auth Buttons or User Info */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-700">Signed in as <span className="font-semibold">{user.email}</span></span>
                <Button variant="ghost" className="text-textDark hover:text-primary" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <AuthDialog mode="login" open={loginOpen} onOpenChange={setLoginOpen}>
                  <Button variant="ghost" className="text-textDark hover:text-primary" onClick={() => setLoginOpen(true)}>
                    Login
                  </Button>
                </AuthDialog>
                <AuthDialog mode="signup" open={signupOpen} onOpenChange={setSignupOpen}>
                  <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => setSignupOpen(true)}>
                    Sign Up
                  </Button>
                </AuthDialog>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
