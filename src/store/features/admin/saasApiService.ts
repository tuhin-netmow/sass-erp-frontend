import { baseApi } from "@/store/baseApi";
import type { PlansResponse } from "@/shared/types/admin";

export const saasApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPublicPlans: builder.query<PlansResponse, void>({
            query: () => "/saas/plans",
            providesTags: ["Settings"], // Using Settings tag for cache simplicity or add/use specific tag
        }),
    }),
});

export const { useGetPublicPlansQuery } = saasApi;
