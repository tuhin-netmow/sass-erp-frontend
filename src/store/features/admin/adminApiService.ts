import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryParams, AdminUsersQueryParams } from '@/shared/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5006';

// Base query with admin token handling
const baseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
        const adminToken = localStorage.getItem('admin_token');

        if (adminToken) {
            headers.set('Authorization', `Bearer ${adminToken}`);
        }

        headers.set('Content-Type', 'application/json');
        return headers;
    },
});

// Create API slice
export const adminApi = createApi({
    reducerPath: 'adminApi',
    baseQuery: baseQuery,
    tagTypes: ['Admin', 'User', 'Company', 'Plan', 'Dashboard', 'Settings', 'Module'],
    endpoints: (builder) => ({

        // Admin Authentication
        adminLogin: builder.mutation({
            query: (credentials: { email: string; password: string }) => ({
                url: '/api/v1/admin/auth/login',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Admin'],
        }),

        getAdminProfile: builder.query({
            query: () => ({
                url: '/api/v1/admin/auth/profile',
                method: 'GET',
            }),
            providesTags: ['Admin'],
        }),

        updateAdminProfile: builder.mutation({
            query: (data: { name?: string; email?: string }) => ({
                url: '/api/v1/admin/auth/profile',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Admin'],
        }),

        changeAdminPassword: builder.mutation({
            query: (data: { currentPassword: string; newPassword: string }) => ({
                url: '/api/v1/admin/auth/change-password',
                method: 'POST',
                body: data,
            }),
        }),

        // Dashboard
        getDashboard: builder.query({
            query: () => '/api/v1/admin/dashboard',
            providesTags: ['Dashboard'],
        }),

        // Users
        getAllUsers: builder.query({
            query: (params: BaseQueryParams = {}) => ({
                url: '/api/v1/admin/users',
                params,
            }),
            providesTags: ['User'],
        }),

        /**
         * Get All Users Across All Tenant Databases
         * Fetches users from both shared and dedicated databases
         */
        getAllUsersAcrossAllTenants: builder.query({
            query: (params: AdminUsersQueryParams = {}) => ({
                url: '/api/v1/admin/all-users',
                params,
            }),
            providesTags: ['User'],
        }),

        // Companies
        getAllCompanies: builder.query({
            query: (params: BaseQueryParams = {}) => ({
                url: '/api/v1/admin/companies',
                params,
            }),
            providesTags: ['Company'],
        }),

        getCompanyDetails: builder.query({
            query: (companyId: string) => `/api/v1/admin/companies/${companyId}`,
            providesTags: (result, _error, companyId) =>
                result ? [{ type: 'Company', id: companyId }] : [],
        }),

        // Plans
        getAllPlans: builder.query({
            query: () => '/api/v1/admin/plans',
            providesTags: ['Plan'],
        }),

        // Settings
        getSettings: builder.query({
            query: () => '/api/v1/admin/settings',
            providesTags: ['Settings'],
        }),

        updateSettings: builder.mutation({
            query: ({ category, settings }: { category: string; settings: Record<string, unknown> }) => ({
                url: '/api/v1/admin/settings',
                method: 'PATCH',
                body: { category, settings },
            }),
            invalidatesTags: ['Settings'],
        }),

        testStripeConnection: builder.mutation({
            query: ({ publicKey, secretKey }: { publicKey: string; secretKey: string }) => ({
                url: '/api/v1/admin/settings/test-stripe',
                method: 'POST',
                body: { publicKey, secretKey },
            }),
        }),

        // Mutations
        updateUserStatus: builder.mutation({
            query: ({ userId, status }: { userId: string; status: string }) => ({
                url: `/api/v1/admin/users/${userId}/status`,
                method: 'PATCH',
                body: { status },
            }),
            invalidatesTags: (result, _error, arg) =>
                result ? [{ type: 'User', id: arg.userId }] : [],
        }),

        updateCompanyStatus: builder.mutation({
            query: ({ companyId, isActive }: { companyId: string; isActive: boolean }) => ({
                url: `/api/v1/admin/companies/${companyId}/status`,
                method: 'PATCH',
                body: { isActive },
            }),
            invalidatesTags: (result, _error, arg) =>
                result ? [{ type: 'Company', id: arg.companyId }] : [],
        }),

        updateCompanyPlan: builder.mutation({
            query: ({ companyId, planId }: { companyId: string; planId: number }) => ({
                url: `/api/v1/admin/companies/${companyId}/plan`,
                method: 'PATCH',
                body: { planId },
            }),
            invalidatesTags: (result, _error, arg) =>
                result ? [
                    { type: 'Company', id: arg.companyId },
                    'Dashboard'
                ] : [],
        }),

        deleteUser: builder.mutation({
            query: (userId: string) => ({
                url: `/api/v1/admin/users/${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: () => ['User'],
        }),

        createPlan: builder.mutation({
            query: (planData: Record<string, unknown>) => ({
                url: '/api/v1/admin/plans',
                method: 'POST',
                body: planData,
            }),
            invalidatesTags: ['Plan'],
        }),

        updatePlan: builder.mutation({
            query: ({ planId, ...updates }: { planId: string; [key: string]: unknown }) => ({
                url: `/api/v1/admin/plans/${planId}`,
                method: 'PUT',
                body: updates,
            }),
            invalidatesTags: ['Plan'],
        }),

        deletePlan: builder.mutation({
            query: (planId: string) => ({
                url: `/api/v1/admin/plans/${planId}`,
                method: 'DELETE',
            }),
            invalidatesTags: () => ['Plan'],
        }),

        // Modules
        getAllModules: builder.query({
            query: (params: BaseQueryParams = {}) => ({
                url: '/api/v1/admin/modules',
                params,
            }),
            providesTags: ['Module'],
        }),

        getModuleById: builder.query({
            query: (moduleId: string) => `/api/v1/admin/modules/${moduleId}`,
            providesTags: (result, _error, moduleId) =>
                result ? [{ type: 'Module', id: moduleId }] : [],
        }),

        createModule: builder.mutation({
            query: (moduleData: Record<string, unknown>) => ({
                url: '/api/v1/admin/modules',
                method: 'POST',
                body: moduleData,
            }),
            invalidatesTags: ['Module'],
        }),

        updateModule: builder.mutation({
            query: ({ moduleId, ...updates }: { moduleId: string; [key: string]: unknown }) => ({
                url: `/api/v1/admin/modules/${moduleId}`,
                method: 'PUT',
                body: updates,
            }),
            invalidatesTags: (result, _error, arg) =>
                result ? [{ type: 'Module', id: arg.moduleId }] : [],
        }),

        deleteModule: builder.mutation({
            query: (moduleId: string) => ({
                url: `/api/v1/admin/modules/${moduleId}`,
                method: 'DELETE',
            }),
            invalidatesTags: () => ['Module'],
        }),

        updateModuleStatus: builder.mutation({
            query: ({ moduleId, status }: { moduleId: string; status: string }) => ({
                url: `/api/v1/admin/modules/${moduleId}/status`,
                method: 'PATCH',
                body: { status },
            }),
            invalidatesTags: (result, _error, arg) =>
                result ? [{ type: 'Module', id: arg.moduleId }] : [],
        }),
    }),
});

// Export hooks
export const {
    useAdminLoginMutation,
    useGetAdminProfileQuery,
    useUpdateAdminProfileMutation,
    useChangeAdminPasswordMutation,
    useGetDashboardQuery,
    useGetAllUsersQuery,
    useGetAllUsersAcrossAllTenantsQuery,
    useGetAllCompaniesQuery,
    useLazyGetCompanyDetailsQuery,
    useGetAllPlansQuery,
    useGetSettingsQuery,
    useUpdateSettingsMutation,
    useTestStripeConnectionMutation,
    useUpdateUserStatusMutation,
    useUpdateCompanyStatusMutation,
    useUpdateCompanyPlanMutation,
    useDeleteUserMutation,
    useCreatePlanMutation,
    useUpdatePlanMutation,
    useDeletePlanMutation,
    useGetAllModulesQuery,
    useGetModuleByIdQuery,
    useCreateModuleMutation,
    useUpdateModuleMutation,
    useDeleteModuleMutation,
    useUpdateModuleStatusMutation,
} = adminApi;

export default adminApi;
