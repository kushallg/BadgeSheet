import { supabase } from "@/integrations/supabase/client";

export async function getPaymentStatus() {
  const session = await supabase.auth.getSession();
  const accessToken = session.data.session?.access_token;
  if (!accessToken) return { hasActiveSubscription: false, hasValidOneTime: false };
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-payment-status`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (!res.ok) return { hasActiveSubscription: false, hasValidOneTime: false };
  return res.json();
} 