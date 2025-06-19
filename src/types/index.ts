export interface PaymentStatus {
  hasActiveSubscription: boolean;
  hasValidOneTime: boolean;
}

export interface CheckoutSession {
  url: string;
}

export type PlanType = 'one_time' | 'subscription'; 