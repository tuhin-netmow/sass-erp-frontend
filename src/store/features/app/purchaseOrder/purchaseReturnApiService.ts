/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "@/store/baseApi";
import type { PurchaseReturn } from "@/shared/types/app/purchaseOrder.types";
// import type { PurchaseResponse, PurchasePaymentResponse } from "./purchaseOrderApiService";
import type { PurchaseInvoice } from "@/shared/types/app/PurchaseInvoice.types";
import type { PurchasePayment } from "@/shared/types/app/purchasePayment.types";
import type { PurchasePaymentResponse, PurchaseResponse } from "@/shared";

export const purchaseReturnApiService = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        //-------------------------------------
        //  PURCHASE RETURNS
        //-------------------------------------

        // GET ALL PURCHASE RETURNS
        getAllPurchaseReturns: builder.query<
            PurchaseResponse<PurchaseReturn>,
            { page?: number; limit?: number; search?: string; status?: string }
        >({
            query: (params) => ({
                url: "/purchase/returns",
                method: "GET",
                params,
            }),
            providesTags: ["PurchaseReturns"],
        }),

        // GET SINGLE PURCHASE RETURN BY ID
        getPurchaseReturnById: builder.query<
            PurchaseResponse<PurchaseReturn>,
            string | number
        >({
            query: (id) => ({
                url: `/purchase/returns/${id}`,
                method: "GET",
            }),
            providesTags: ["PurchaseReturn"],
        }),

        // CREATE PURCHASE RETURN
        addPurchaseReturn: builder.mutation<
            PurchaseResponse<PurchaseReturn>,
            Partial<PurchaseReturn>
        >({
            query: (body) => ({
                url: "/purchase/returns",
                method: "POST",
                body,
            }),
            invalidatesTags: ["PurchaseReturns"],
        }),

        // UPDATE PURCHASE RETURN STATUS
        updatePurchaseReturnStatus: builder.mutation<
            PurchaseResponse<PurchaseReturn>,
            { id: string | number; status: string }
        >({
            query: ({ id, status }) => ({
                url: `/purchase/returns/${id}`,
                method: "PUT",
                body: { status },
            }),
            invalidatesTags: ["PurchaseReturn", "PurchaseReturns"],
        }),

        //-------------------------------------
        //  PURCHASE RETURN INVOICES
        //-------------------------------------

        // GET ALL RETURN INVOICES
        getAllPurchaseReturnInvoices: builder.query<
            PurchaseResponse<PurchaseInvoice>,
            { page?: number; limit?: number; search?: string }
        >({
            query: (params) => ({
                url: "/purchase/returns/invoices",
                method: "GET",
                params,
            }),
            providesTags: ["PurchaseReturnInvoices"],
        }),

        // GET SINGLE RETURN INVOICE BY ID
        getPurchaseReturnInvoiceById: builder.query<
            PurchaseResponse<PurchaseInvoice>,
            string | number
        >({
            query: (id) => ({
                url: `/purchase/returns/invoices/${id}`,
                method: "GET",
            }),
            providesTags: ["PurchaseReturnInvoice"],
        }),

        // CREATE RETURN INVOICE
        addPurchaseReturnInvoice: builder.mutation<
            PurchaseResponse<PurchaseInvoice>,
            any
        >({
            query: (body) => ({
                url: "/purchase/returns/invoices",
                method: "POST",
                body,
            }),
            invalidatesTags: ["PurchaseReturnInvoices", "PurchaseReturn"],
        }),

        //-------------------------------------
        //  PURCHASE RETURN PAYMENTS
        //-------------------------------------

        // GET ALL RETURN PAYMENTS
        getAllPurchaseReturnPayments: builder.query<
            PurchasePaymentResponse,
            { page?: number; limit?: number; search?: string }
        >({
            query: (params) => ({
                url: "/purchase/returns/payments",
                method: "GET",
                params,
            }),
            providesTags: ["PurchaseReturnPayments"],
        }),

        // CREATE RETURN PAYMENT
        addPurchaseReturnPayment: builder.mutation<
            PurchaseResponse<PurchasePayment>,
            any
        >({
            query: (body) => ({
                url: "/purchase/returns/payments",
                method: "POST",
                body,
            }),
            invalidatesTags: ["PurchaseReturnPayments"],
        }),

        // GET RETURN PAYMENT BY ID
        getPurchaseReturnPaymentById: builder.query<
            PurchaseResponse<PurchasePayment>,
            string | number
        >({
            query: (id) => ({
                url: `/purchase/returns/payments/${id}`,
                method: "GET",
            }),
            providesTags: ["PurchaseReturnPayments"],
        }),
    }),
});

export const {
    // RETURNS
    useGetAllPurchaseReturnsQuery,
    useGetPurchaseReturnByIdQuery,
    useAddPurchaseReturnMutation,
    useUpdatePurchaseReturnStatusMutation,

    // INVOICES
    useGetAllPurchaseReturnInvoicesQuery,
    useGetPurchaseReturnInvoiceByIdQuery,
    useAddPurchaseReturnInvoiceMutation,

    // PAYMENTS
    useGetAllPurchaseReturnPaymentsQuery,
    useAddPurchaseReturnPaymentMutation,
    useGetPurchaseReturnPaymentByIdQuery,
} = purchaseReturnApiService;
