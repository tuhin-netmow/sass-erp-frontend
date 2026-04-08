/* =======================
   Company Types
   ======================= */

export interface CompanyStats {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  pendingOrders: number;
  revenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  storageUsed: number;
  storageLimit: number;
  apiCalls: number;
  apiLimit: number;
}

export interface CompanyInfo {
  id: string;
  name: string;
  subdomain: string;
  domain: string;
  status: 'active' | 'inactive' | 'suspended';
  logo?: string;
  plan?: {
    id: string;
    name: string;
    price: number;
    cycle: 'monthly' | 'yearly';
  };
  billing?: {
    nextBillingDate: string;
    monthlyCost: number;
  };
  createdAt: string;
}

export interface CompanyStatsResponse {
  success: boolean;
  message: string;
  data: CompanyStats;
}

export interface CompanyInfoResponse {
  success: boolean;
  message: string;
  data: CompanyInfo;
}


