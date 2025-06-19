import { supabase } from '@/integrations/supabase/client';
import { PaymentStatus, CheckoutSession, PlanType } from '@/types';
import { withRetry } from '@/utils/errorHandling';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

class ApiService {
  private async getAuthHeader(): Promise<Headers> {
    const session = await supabase.auth.getSession();
    const headers = new Headers({
      'Content-Type': 'application/json',
    });
    
    if (session.data.session?.access_token) {
      headers.append('Authorization', `Bearer ${session.data.session.access_token}`);
    }
    
    return headers;
  }

  async getPaymentStatus(): Promise<PaymentStatus> {
    return withRetry(async () => {
      const headers = await this.getAuthHeader();
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/get-payment-status`,
        { headers }
      );
      
      if (!response.ok) {
        throw new Error('Failed to get payment status');
      }
      
      return response.json();
    });
  }

  async createCheckoutSession(email: string, plan: PlanType): Promise<CheckoutSession> {
    return withRetry(async () => {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, plan }),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }
      
      return response.json();
    });
  }

  async generatePdf(names: string[], color: string, sessionId?: string): Promise<Blob> {
    return withRetry(async () => {
      const headers = await this.getAuthHeader();
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/generate-pdf`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ names, color, session_id: sessionId }),
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate PDF');
      }
      
      return response.blob();
    });
  }

  async verifyPayment(sessionId: string): Promise<{ paid: boolean; plan: PlanType | null }> {
    return withRetry(async () => {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/verify-payment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }
      
      return response.json();
    });
  }
}

export const apiService = new ApiService(); 