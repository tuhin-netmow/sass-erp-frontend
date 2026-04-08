/* =======================
   Billing Types
   ======================= */

export interface CheckoutResponse {
  status: boolean;
  data: {
    url: string;
    isFree?: boolean;
  };
}

export interface PortalUrlResponse {
  status: boolean;
  data: {
    url: string;
  };
}

export interface UpdatePlanResponse {
  status: boolean;
  data: {
    message?: string;
    checkoutUrl?: string;
    needsCheckout?: boolean;
    isFree?: boolean;
  };
}

export interface BillingHistoryResponse {
  status: boolean;
  data: any[];
}
