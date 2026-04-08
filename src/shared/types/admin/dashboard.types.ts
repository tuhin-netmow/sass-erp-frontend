/* =======================
   Dashboard Types
   ======================= */

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  activeCustomers: number;
  lowStock: number;
  revenue: number;
  activeStaff: number;
}

export interface DashboardStatsResponse {
  status: boolean;
  message: string;
  data: DashboardStats;
}
