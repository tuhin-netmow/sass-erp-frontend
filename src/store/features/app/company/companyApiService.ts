import { baseApi } from "@/store/baseApi";
import type { CompanyInfo, CompanyStatsResponse, CompanyInfoResponse, RecentActivityResponse } from "@/shared/types";

export const companyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get company statistics
    getCompanyStats: builder.query<CompanyStatsResponse, void>({
      query: () => ({
        url: '/company/stats',
        method: 'GET',
      }),
      providesTags: ['CompanyStats'],
    }),
    // Get company information
    getCompanyInfo: builder.query<CompanyInfoResponse, void>({
      query: () => ({
        url: '/company/info',
        method: 'GET',
      }),
      providesTags: ['CompanyInfo'],
    }),
    // Get recent activity
    getCompanyActivity: builder.query<RecentActivityResponse, { limit?: number }>({
      query: ({ limit = 10 }) => ({
        url: '/company/activity',
        method: 'GET',
        params: { limit },
      }),
      providesTags: ['CompanyActivity'],
    }),
    // Update company settings
    updateCompanySettings: builder.mutation<
      CompanyInfoResponse,
      Partial<CompanyInfo>
    >({
      query: (data) => ({
        url: '/company/settings',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['CompanyInfo'],
    }),
    // Upload company logo
    uploadCompanyLogo: builder.mutation<
      { success: boolean; message: string; data: { logo: string } },
      FormData
    >({
      query: (formData) => ({
        url: '/company/logo',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['CompanyInfo'],
    }),
  }),
});

export const {
  useGetCompanyStatsQuery,
  useGetCompanyInfoQuery,
  useGetCompanyActivityQuery,
  useUpdateCompanySettingsMutation,
  useUploadCompanyLogoMutation,
} = companyApi;
