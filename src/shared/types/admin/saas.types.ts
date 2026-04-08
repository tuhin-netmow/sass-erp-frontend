/* =======================
   SaaS Types
   ======================= */

export interface SubscriptionPlan {
  _id: string;
  id: string;
  name: string;
  slug: string;
  description: string;
  price: {
    monthly: number | string;
    yearly: number | string;
    $numberDecimal?: string;
  };
  limits: {
    users: number;
    storage: number;
    companies: number;
    apiCallsPerMonth: number;
  };
  maxUsers: number;
  features: Array<{
    name: string;
    included: boolean;
    limit?: number;
  }>;
  dbTier: string;
  status: string;
  displayOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlansResponse {
  status: boolean;
  data: SubscriptionPlan[];
}
