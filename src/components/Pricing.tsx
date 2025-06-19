import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AuthDialog from "@/components/AuthDialog";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { useToast } from "@/components/ui/use-toast";
import { apiService } from "@/services/api";
import { getErrorMessage } from "@/utils/errorHandling";
import { User } from "@supabase/supabase-js";

const Pricing = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<"one_time" | "subscription" | null>(null);
  const { toast } = useToast();
  const { hasActiveSubscription, hasValidOneTime, isLoading: planLoading, error } = usePaymentStatus();

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

  // Show error toast if payment status check fails
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleSubscribe = async () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    
    setCheckoutLoading("subscription");
    try {
      const { url } = await apiService.createCheckoutSession(user.email, "subscription");
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("Could not start checkout");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleGetStarted = async () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    
    setCheckoutLoading("one_time");
    try {
      const { url } = await apiService.createCheckoutSession(user.email, "one_time");
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("Could not start checkout");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(null);
    }
  };

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
                  <div className="text-4xl font-bold text-primary">$1</div>
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
                {/* Show active plan message if user has a plan */}
                {!planLoading && (hasActiveSubscription || hasValidOneTime) && (
                  <div className="text-primary font-semibold mt-4 text-center">You already have an active plan!</div>
                )}
                {/* Hide Get Started button if user has active subscription or valid one-time payment */}
                {!planLoading && !hasActiveSubscription && !hasValidOneTime && (
                  <button className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors duration-200 font-semibold"
                    onClick={handleGetStarted}
                    disabled={checkoutLoading === "one_time"}
                  >
                    {checkoutLoading === "one_time" ? "Loading..." : "Get Started"}
                  </button>
                )}
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
                  <div className="text-4xl font-bold text-primary">$4</div>
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
                {/* Show active plan message if user has a plan */}
                {!planLoading && (hasActiveSubscription || hasValidOneTime) && (
                  <div className="text-primary font-semibold mt-4 text-center">You already have an active plan!</div>
                )}
                {/* Hide Subscribe button if user has active subscription or valid one-time payment */}
                {!planLoading && !hasActiveSubscription && !hasValidOneTime && (
                  <>
                    <button
                      className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors duration-200 font-semibold"
                      onClick={handleSubscribe}
                      disabled={checkoutLoading === "subscription"}
                    >
                      {checkoutLoading === "subscription" ? "Loading..." : "Subscribe"}
                    </button>
                    <AuthDialog mode="login" open={loginOpen} onOpenChange={setLoginOpen}>
                      {/* Hidden trigger, modal is controlled by state */}
                      <span />
                    </AuthDialog>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
