import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import NameUploader from "@/components/NameUploader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import { Palette } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

const colorOptions = [
  { name: 'Orange', value: '#F15025' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Purple', value: '#9333ea' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Pink', value: '#e91e63' },
  { name: 'Indigo', value: '#4f46e5' }
];

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const planOptions = [
  { label: 'One-Time Purchase', value: 'one_time' },
  { label: 'Monthly Subscription', value: 'subscription' },
];

const GenerateBadges = () => {
  const [names, setNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#F15025');
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'one_time' | 'subscription'>('one_time');
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [plan, setPlan] = useState<'one_time' | 'subscription' | null>(null);

  // Auth check on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
      setAuthChecked(true);
      if (!data?.user) {
        window.location.href = "/";
      }
    });
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (!session?.user) {
        window.location.href = "/";
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Check for session_id in URL (after Stripe redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const session_id = params.get("session_id");
    if (session_id) {
      setSessionId(session_id);
      setVerifying(true);
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id }),
      })
        .then((res) => res.json())
        .then((data) => {
          setHasPaid(data.paid);
          setPlan(data.plan || null);
        })
        .catch(() => {
          setHasPaid(false);
          setPlan(null);
        })
        .finally(() => setVerifying(false));
    }
  }, []);

  const handlePay = async () => {
    const email = user?.email;
    if (!email) {
      toast({
        title: "Error",
        description: "No user email found. Please log in again.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan: selectedPlan }),
      });
      const data = await res.json();
      const stripe = await stripePromise;
      if (stripe && data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: "Could not start checkout. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!hasPaid) {
      toast({
        title: "Payment Required",
        description: "Please pay to download the PDF.",
        variant: "destructive",
      });
      return;
    }
    if (names.length === 0) {
      toast({
        title: "Error",
        description: "Please enter at least one name to generate badges.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          names: names,
          color: selectedColor,
          session_id: sessionId,
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `name-badges-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success!",
        description: "Your badges have been generated successfully.",
      });
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation plan={plan} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-textDark">
              Generate Badge Inserts
            </h1>
            <p className="text-lg text-textDark/75">
              Upload names and generate print-ready badge inserts
            </p>
          </div>

          <NameUploader onNamesChange={setNames} />

          {/* Plan Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Plan
            </label>
            <div className="flex gap-4 mb-4">
              {planOptions.map((plan) => (
                <button
                  key={plan.value}
                  type="button"
                  className={`px-4 py-2 rounded border-2 transition-all ${
                    selectedPlan === plan.value
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                  onClick={() => setSelectedPlan(plan.value as 'one_time' | 'subscription')}
                >
                  {plan.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Palette className="w-4 h-4 inline mr-1" />
              Badge Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-full h-10 rounded-md border-2 transition-all ${
                    selectedColor === color.value 
                      ? 'border-gray-800 ring-2 ring-gray-300' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {selectedColor === color.value && (
                    <span className="text-white text-xs font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Selected: {colorOptions.find(c => c.value === selectedColor)?.name}
            </p>
          </div>

          <div className="flex justify-center">
            {!hasPaid ? (
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white"
                disabled={loading || verifying}
                onClick={handlePay}
              >
                {loading ? "Redirecting..." : "Pay to Download"}
              </Button>
            ) : (
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white"
                disabled={!names.length || loading}
                onClick={handleGenerate}
              >
                {loading ? "Generating..." : "Generate PDF"}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GenerateBadges; 