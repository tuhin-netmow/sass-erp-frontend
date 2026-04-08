/* =======================
   Reports Types
   ======================= */

export interface ReportResponse<T = any> {
  status: boolean;
  message: string;
  data: T;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RevenuePoint {
  date: string;
  amount: number;
  orderCount: number;
}

export interface RevenueChartResponse {
  status: boolean;
  message: string;
  data: {
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
    year: number;
    month: number | null;
    quarter: number | null;
    data: RevenuePoint[];
  };
}
