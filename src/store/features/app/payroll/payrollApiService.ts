import { baseApi } from "@/store/baseApi";
import type {
  PayrollRun,
  PayrollItem,
  PayrollResponse,
  PayrollQueryParams,
  PayrollAdvanceReturn,
  PayrollAdvance
} from "@/shared/types";

export const payrollApiService = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // ... (existing endpoints)
        getAllPayrollRuns: builder.query<PayrollResponse<PayrollRun[]>, PayrollQueryParams | void>({
            query: (params) => ({
                url: "/payroll",
                method: "GET",
                params: (params as PayrollQueryParams) || undefined,
            }),
            providesTags: ["Payroll"],
        }),

        getPayrollRunById: builder.query<PayrollResponse<PayrollRun>, number>({
            query: (id) => ({
                url: `/payroll/${id}`,
                method: "GET",
            }),
            providesTags: ["Payroll"],
        }),

        generatePayrollRun: builder.mutation<PayrollResponse<PayrollRun>, { month: string; staff_ids?: number[] }>({
            query: (body) => ({
                url: "/payroll/generate",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Payroll"],
        }),

        approvePayrollRun: builder.mutation<PayrollResponse<PayrollRun>, number>({
            query: (id) => ({
                url: `/payroll/${id}/approve`,
                method: "PATCH",
            }),
            invalidatesTags: ["Payroll"],
        }),

        payPayrollRun: builder.mutation<PayrollResponse<PayrollRun>, number>({
            query: (id) => ({
                url: `/payroll/${id}/pay`,
                method: "PATCH",
            }),
            invalidatesTags: ["Payroll"],
        }),

        deletePayrollRun: builder.mutation<PayrollResponse<null>, number>({
            query: (id) => ({
                url: `/payroll/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Payroll"],
        }),

        // Advance Endpoints
        getAllAdvances: builder.query<PayrollResponse<PayrollAdvance[]>, { staffId?: number | string, status?: string, month?: string, page?: number, limit?: number } | void>({
            query: (params) => ({
                url: "/payroll/advances",
                method: "GET",
                params: params || undefined,
            }),
            providesTags: ["Payroll"],
        }),

        createAdvance: builder.mutation<PayrollResponse<PayrollAdvance>, Partial<PayrollAdvance>>({
            query: (body) => ({
                url: "/payroll/advances",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Payroll"],
        }),

        updateAdvance: builder.mutation<PayrollResponse<PayrollAdvance>, { id: number; body: Partial<PayrollAdvance> }>({
            query: ({ id, body }) => ({
                url: `/payroll/advances/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["Payroll"],
        }),

        returnAdvance: builder.mutation<PayrollResponse<PayrollAdvanceReturn>, { id: number; body: { amount: number, return_date: string, remarks?: string } }>({
            query: ({ id, body }) => ({
                url: `/payroll/advances/${id}/return`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["Payroll"],
        }),

        deleteAdvance: builder.mutation<PayrollResponse<null>, number>({
            query: (id) => ({
                url: `/payroll/advances/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Payroll"],
        }),

        // Get Advance by ID
        getAdvanceById: builder.query<PayrollResponse<PayrollAdvance>, number>({
            query: (id) => ({
                url: `/payroll/advances/${id}`,
                method: "GET",
            }),
            providesTags: ["Payroll"],
        }),

        // Add Payment to Individual Item
        addItemPayment: builder.mutation<PayrollResponse<PayrollItem>, { itemId: number; body: { amount: number; paymentDate: string; paymentMethod?: string; notes?: string } }>({
            query: ({ itemId, body }) => ({
                url: `/payroll/items/${itemId}/pay`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["Payroll"],
        }),
    }),
});

export const {
    useGetAllPayrollRunsQuery,
    useGetPayrollRunByIdQuery,
    useGeneratePayrollRunMutation,
    useApprovePayrollRunMutation,
    usePayPayrollRunMutation,
    useDeletePayrollRunMutation,
    useGetAllAdvancesQuery,
    useCreateAdvanceMutation,
    useUpdateAdvanceMutation,
    useReturnAdvanceMutation,
    useDeleteAdvanceMutation,
    useGetAdvanceByIdQuery,
    useAddItemPaymentMutation,
} = payrollApiService;


