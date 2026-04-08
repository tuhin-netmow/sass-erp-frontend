import { baseApi } from "@/store/baseApi";
import type { ReportResponse,  RevenueChartResponse } from "@/shared/types/app";

export const reportsApiService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ===================== SALES REPORTS =====================

    // GET /api/reports/sales/summary
    getSalesSummary: builder.query<
      ReportResponse,
      { startDate: string; endDate: string }
    >({
      query: (params) => ({
        url: "/reports/sales/summary",
        method: "GET",
        params,
      }),
      providesTags: ["Reports"],
    }),

    // GET /api/reports/sales/top-customers
    getTopCustomers: builder.query<
      ReportResponse,
      { page?: number; limit?: number; search?: string }
    >({
      query: () => ({
        url: "/reports/sales/top-customers",
        method: "GET",
      }),
      providesTags: ["Reports"],
    }),

    // GET /api/reports/sales/top-products
    getTopProducts: builder.query<
      ReportResponse,
      { page?: number; limit?: number; search?: string }
    >({
      query: () => ({
        url: "/reports/sales/top-products",
        method: "GET",
      }),
      providesTags: ["Reports"],
    }),

    getSalesChartData: builder.query<
      RevenueChartResponse,
      { startDate: string; endDate: string }
    >({
      query: (params) => ({
        url: "/sales/reports/charts",
        method: "GET",
        params,
      }),
      providesTags: ["Reports"],
    }),

    // ===================== PURCHASE REPORTS =====================

    // GET /api/reports/purchase/summary
    getPurchaseSummary: builder.query<ReportResponse, void>({
      query: () => ({
        url: "/reports/purchase/summary",
        method: "GET",
      }),
      providesTags: ["Reports"],
    }),

    // GET /api/reports/purchase/by-supplier
    getPurchaseBySupplier: builder.query<ReportResponse, void>({
      query: () => ({
        url: "/reports/purchase/by-supplier",
        method: "GET",
      }),
      providesTags: ["Reports"],
    }),

    // ===================== INVENTORY REPORTS =====================

    // GET /api/reports/inventory/status
    getInventoryStatus: builder.query<ReportResponse, void>({
      query: () => ({
        url: "/reports/inventory/status",
        method: "GET",
      }),
      providesTags: ["Reports"],
    }),

    // GET /api/reports/inventory/valuation
    getInventoryValuation: builder.query<ReportResponse, void>({
      query: () => ({
        url: "/reports/inventory/valuation",
        method: "GET",
      }),
      providesTags: ["Reports"],
    }),

    // GET /api/reports/inventory/low-stock-list
    getInventoryLowStockList: builder.query<
      ReportResponse,
      { page?: number; limit?: number; search?: string }
    >({
      query: (params) => ({
        url: "/reports/inventory/low-stock-list",
        method: "GET",
        params,
      }),
      providesTags: ["Reports"],
    }),

    // ===================== Customer Reports =====================

    getSalesReportByCustomer: builder.query<
      ReportResponse,
      { page?: number; limit?: number; search?: string }
    >({
      query: (params) => ({
        url: "/reports/sales/by-customer",
        method: "GET",
        params,
      }),
      providesTags: ["Reports"],
    }),

    getAccountsReceivableReport: builder.query<
      ReportResponse,
      { page?: number; limit?: number; search?: string }
    >({
      query: (params) => ({
        url: "/reports/customers/account-receivables",
        method: "GET",
        params,
      }),
      providesTags: ["Reports"],
    }),

    // GET /api/reports/customers - Customer Statistics
    getCustomerStatistics: builder.query<
      {
        success: boolean;
        message: string;
        data: {
          totalCustomers: number;
          totalSales: number;
          totalOutstandingBalance: number;
        };
      },
      void
    >({
      query: () => ({
        url: "/reports/customers",
        method: "GET",
      }),
      providesTags: ["Reports"],
    }),

    // ===================== HR REPORTS =====================

    // GET /api/reports/hr/attendance
    getHrAttendance: builder.query<ReportResponse, void>({
      query: () => ({
        url: "/reports/hr/attendance",
        method: "GET",
      }),
      providesTags: ["Reports"],
    }),

    // GET /api/reports/hr/payroll
    getHrPayroll: builder.query<ReportResponse, void>({
      query: () => ({
        url: "/reports/hr/payroll",
        method: "GET",
      }),
      providesTags: ["Reports"],
    }),

    // ===================== FINANCE REPORTS =====================

    // GET /api/reports/finance/profit-loss
    getProfitLoss: builder.query<ReportResponse, void>({
      query: () => ({
        url: "/reports/finance/profit-loss",
        method: "GET",
      }),
      providesTags: ["Reports"],
    }),

    // GET /api/reports/sales/staff-wise
    getStaffWiseSales: builder.query<
      ReportResponse,
      {
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
        search?: string;
        staffId?: string | number;
      }
    >({
      query: (params) => ({
        url: "/reports/sales/staff-wise",
        method: "GET",
        params,
      }),
      providesTags: ["Reports"],
    }),
  }),
});

export const {
  useGetSalesSummaryQuery,
  useGetTopCustomersQuery,
  useGetTopProductsQuery,
  useGetSalesChartDataQuery,
  useGetPurchaseSummaryQuery,
  useGetPurchaseBySupplierQuery,
  useGetInventoryStatusQuery,
  useGetInventoryValuationQuery,
  useGetInventoryLowStockListQuery,
  useGetSalesReportByCustomerQuery,
  useGetAccountsReceivableReportQuery,
  useGetCustomerStatisticsQuery,
  useGetHrAttendanceQuery,
  useGetHrPayrollQuery,
  useGetProfitLossQuery,
  useGetStaffWiseSalesQuery,
} = reportsApiService;
