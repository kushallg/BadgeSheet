import { Button } from "@/components/ui/button";
import AuthDialog from "./AuthDialog";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { getPaymentStatus } from "@/utils/getPaymentStatus";

const planDisplay = {
  one_time: {
    label: "One-Time Plan",
    tooltip: "You will need to pay again 3 hours after your payment"
  },
  subscription: {
    label: "Monthly Plan",
    tooltip: "You can print as many badges as you want until your subscription expires."
  },
  none: {
    label: "No Plan Selected",
    tooltip: "You have not selected a plan yet."
  }
};

const Navigation = () => {
  const [user, setUser] = useState<any>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [plan, setPlan] = useState<'one_time' | 'subscription' | null>(null);
  const [planLoading, setPlanLoading] = useState(true);

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

  useEffect(() => {
    // Fetch payment status on mount and when user changes
    if (user) {
      setPlanLoading(true);
      getPaymentStatus().then((status) => {
        if (status.hasActiveSubscription) setPlan('subscription');
        else if (status.hasValidOneTime) setPlan('one_time');
        else setPlan(null);
        setPlanLoading(false);
      });
    } else {
      setPlan(null);
      setPlanLoading(false);
    }
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const planKey = plan === 'one_time' ? 'one_time' : plan === 'subscription' ? 'subscription' : 'none';
  const planInfo = planDisplay[planKey];

  return (
    <TooltipProvider delayDuration={0}>
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
                  {planLoading ? (
                    <span className="text-xs px-3 py-1 rounded-full bg-gray-100 border border-gray-300 font-medium text-gray-700">
                      Checking plan status...
                    </span>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-xs px-3 py-1 rounded-full bg-gray-100 border border-gray-300 cursor-pointer font-medium text-gray-700">
                          {planInfo.label}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {planInfo.tooltip}
                      </TooltipContent>
                    </Tooltip>
                  )}
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
    </TooltipProvider>
  );
};

export default Navigation;
