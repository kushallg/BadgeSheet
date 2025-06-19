import { useState, useEffect } from 'react';
import { getPaymentStatus } from '@/utils/getPaymentStatus';
import { supabase } from '@/integrations/supabase/client';
import { AppError, handleApiError } from '@/utils/errorHandling';

export interface PaymentStatus {
  hasActiveSubscription: boolean;
  hasValidOneTime: boolean;
  isLoading: boolean;
  error: AppError | null;
}

// Cache for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;
let cachedStatus: PaymentStatus | null = null;
let cacheTimestamp: number | null = null;

function isCacheValid(): boolean {
  return (
    cachedStatus !== null &&
    cacheTimestamp !== null &&
    Date.now() - cacheTimestamp < CACHE_DURATION
  );
}

export function usePaymentStatus(): PaymentStatus {
  const [status, setStatus] = useState<PaymentStatus>(() => 
    cachedStatus || {
      hasActiveSubscription: false,
      hasValidOneTime: false,
      isLoading: true,
      error: null,
    }
  );

  useEffect(() => {
    let mounted = true;

    async function checkStatus() {
      try {
        // Check cache first
        if (isCacheValid() && cachedStatus) {
          setStatus(cachedStatus);
          return;
        }

        const session = await supabase.auth.getSession();
        if (!session.data.session) {
          // If no user is logged in, just return default values without an error
          setStatus({
            hasActiveSubscription: false,
            hasValidOneTime: false,
            isLoading: false,
            error: null,
          });
          return;
        }

        const paymentStatus = await getPaymentStatus();
        if (mounted) {
          const newStatus = {
            hasActiveSubscription: paymentStatus.hasActiveSubscription,
            hasValidOneTime: paymentStatus.hasValidOneTime,
            isLoading: false,
            error: null,
          };
          
          // Update cache
          cachedStatus = newStatus;
          cacheTimestamp = Date.now();
          
          setStatus(newStatus);
        }
      } catch (error) {
        if (mounted) {
          const appError = handleApiError(error);
          setStatus(prev => ({
            ...prev,
            isLoading: false,
            error: appError,
          }));
        }
      }
    }

    checkStatus();

    // Set up auth state change listener
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      // Clear cache on auth state change
      cachedStatus = null;
      cacheTimestamp = null;
      checkStatus();
    });

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  return status;
}

// Utility function to manually clear the cache
export function clearPaymentStatusCache(): void {
  cachedStatus = null;
  cacheTimestamp = null;
} 