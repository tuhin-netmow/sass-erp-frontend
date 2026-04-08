import { baseApi } from "@/store/baseApi";
import type { DashboardStatsResponse } from "@/shared/types/admin";

export const dashboardApiService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStatsResponse, void>({
      query: () => ({
        url: `/dashboard`,
        method: "GET",
      }),
      providesTags: ["Stats"],
    }),
    getDashboardCharts: builder.query({
      query: () => ({
        url: `/dashboard/charts`,
        method: "GET",
      }),
      providesTags: ["Stats"],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetDashboardChartsQuery

} = dashboardApiService;
