import { baseApi } from "@/store/baseApi";
import type { CheckoutResponse, PortalUrlResponse, UpdatePlanResponse, BillingHistoryResponse } from "@/shared/types/app";

export const billingApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createCheckout: builder.mutation<CheckoutResponse, { planId: number, cycle?: string }>({
            query: (body) => ({
                url: "/billing/checkout",
                method: "POST",
                body,
            }),
        }),
        getPortalUrl: builder.mutation<PortalUrlResponse, void>({
            query: () => ({
                url: "/billing/portal",
                method: "GET",
            }),
        }),
        cancelSubscription: builder.mutation<{ status: boolean, message: string }, void>({
            query: () => ({
                url: "/billing/cancel",
                method: "POST",
            }),
            invalidatesTags: ['Auth'], // Match the auth query tag
        }),
        resumeSubscription: builder.mutation<{ status: boolean, message: string }, void>({
            query: () => ({
                url: "/billing/resume",
                method: "POST",
            }),
            invalidatesTags: ['Auth'], // Match the auth query tag
        }),
        updatePlan: builder.mutation<UpdatePlanResponse, { planId: number, cycle: string }>({
            query: (body) => ({
                url: "/billing/update-plan",
                method: "POST",
                body,
            }),
            invalidatesTags: ['Auth'], // Match the auth query tag
        }),
        getBillingHistory: builder.query<BillingHistoryResponse, void>({
            query: () => "/billing/history",
            providesTags: ['Auth'],
        }),
    }),
});

export const {
    useCreateCheckoutMutation,
    useGetPortalUrlMutation,
    useCancelSubscriptionMutation,
    useResumeSubscriptionMutation,
    useUpdatePlanMutation,
    useGetBillingHistoryQuery
} = billingApi;
