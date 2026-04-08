/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PurchaseResponse } from "@/shared";
import { baseApi } from "@/store/baseApi";

export const salesReturnApiService = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        //-------------------------------------
        //  SALES RETURNS
        //-------------------------------------

        // GET ALL SALES RETURNS
        getAllSalesReturns: builder.query<
            PurchaseResponse<any>,
            { page?: number; limit?: number; search?: string; status?: string }
        >({
            query: (params) => ({
                url: "/sales/returns",
                method: "GET",
                params,
            }),
            providesTags: ["SalesReturns"],
        }),

        // GET SALES RETURN SUMMARY
        getSalesReturnSummary: builder.query<PurchaseResponse<any>, void>({
            query: () => ({
                url: "/sales/returns/summary",
                method: "GET",
            }),
            providesTags: ["SalesReturns"],
        }),

        // GET APPROVED SALES RETURNS
        getApprovedSalesReturns: builder.query<
            PurchaseResponse<any>,
            { page?: number; limit?: number; search?: string }
        >({
            query: (params) => ({
                url: "/sales/returns/approved",
                method: "GET",
                params,
            }),
            providesTags: ["SalesReturns"],
        }),

        // GET SINGLE SALES RETURN BY ID
        getSalesReturnById: builder.query<
            PurchaseResponse<any>,
            string | number
        >({
            query: (id) => ({
                url: `/sales/returns/${id}`,
                method: "GET",
            }),
            providesTags: ["SalesReturn"],
        }),

        // CREATE SALES RETURN
        addSalesReturn: builder.mutation<
            PurchaseResponse<any>,
            any
        >({
            query: (body) => ({
                url: "/sales/returns",
                method: "POST",
                body,
            }),
            invalidatesTags: ["SalesReturns"],
        }),

        // UPDATE SALES RETURN STATUS
        updateSalesReturnStatus: builder.mutation<
            PurchaseResponse<any>,
            { id: string | number; status: string; notes?: string }
        >({
            query: ({ id, status, notes }) => ({
                url: `/sales/returns/${id}`,
                method: "PUT",
                body: { status, notes },
            }),
            invalidatesTags: ["SalesReturn", "SalesReturns"],
        }),

        //-------------------------------------
        //  SALES RETURN INVOICES
        //-------------------------------------

        // GET ALL SALES RETURN INVOICES
        getAllSalesReturnInvoices: builder.query<
            PurchaseResponse<any>,
            { page?: number; limit?: number; search?: string }
        >({
            query: (params) => ({
                url: "/sales/returns/invoices",
                method: "GET",
                params,
            }),
            providesTags: ["SalesReturnInvoices"],
        }),

        // GET SINGLE SALES RETURN INVOICE BY ID
        getSalesReturnInvoiceById: builder.query<
            PurchaseResponse<any>,
            string | number
        >({
            query: (id) => ({
                url: `/sales/returns/invoices/${id}`,
                method: "GET",
            }),
            providesTags: ["SalesReturnInvoice"],
        }),

        // CREATE SALES RETURN INVOICE
        addSalesReturnInvoice: builder.mutation<
            PurchaseResponse<any>,
            any
        >({
            query: (body) => ({
                url: "/sales/returns/invoices",
                method: "POST",
                body,
            }),
            invalidatesTags: ["SalesReturnInvoices", "SalesReturn"],
        }),

        // UPDATE SALES RETURN INVOICE
        updateSalesReturnInvoice: builder.mutation<
            PurchaseResponse<any>,
            { id: string | number; body: any }
        >({
            query: ({ id, body }) => ({
                url: `/sales/returns/invoices/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["SalesReturnInvoice", "SalesReturnInvoices"],
        }),

        //-------------------------------------
        //  SALES RETURN PAYMENTS
        //-------------------------------------

        // GET ALL SALES RETURN PAYMENTS
        getAllSalesReturnPayments: builder.query<
            PurchaseResponse<any[] | any>,
            { page?: number; limit?: number; search?: string }
        >({
            query: (params) => ({
                url: "/sales/returns/payments",
                method: "GET",
                params,
            }),
            providesTags: ["SalesReturnPayments"],
        }),

        // GET SALES RETURN PAYMENT BY ID
        getSalesReturnPaymentById: builder.query<
            PurchaseResponse<any>,
            string | number
        >({
            query: (id) => ({
                url: `/sales/returns/payments/${id}`,
                method: "GET",
            }),
            providesTags: ["SalesReturnPayments"],
        }),

        // CREATE SALES RETURN PAYMENT
        addSalesReturnPayment: builder.mutation<
            PurchaseResponse<any>,
            any
        >({
            query: (body) => ({
                url: "/sales/returns/payments",
                method: "POST",
                body,
            }),
            invalidatesTags: ["SalesReturnPayments", "SalesReturn", "SalesReturnInvoices", "SalesReturnInvoice"],
        }),
    }),
});

export const {
    // RETURNS
    useGetAllSalesReturnsQuery,
    useGetSalesReturnSummaryQuery,
    useGetApprovedSalesReturnsQuery,
    useGetSalesReturnByIdQuery,
    useAddSalesReturnMutation,
    useUpdateSalesReturnStatusMutation,

    // INVOICES
    useGetAllSalesReturnInvoicesQuery,
    useGetSalesReturnInvoiceByIdQuery,
    useAddSalesReturnInvoiceMutation,
    useUpdateSalesReturnInvoiceMutation,

    // PAYMENTS
    useGetAllSalesReturnPaymentsQuery,
    useGetSalesReturnPaymentByIdQuery,
    useAddSalesReturnPaymentMutation,
} = salesReturnApiService;
