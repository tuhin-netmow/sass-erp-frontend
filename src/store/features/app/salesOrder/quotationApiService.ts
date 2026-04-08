import { baseApi } from "@/store/baseApi";
import type {
  CreateQuotationRequest,
  UpdateQuotationRequest,
} from "@/shared/types/app/quotation.types";
import type {
  QuotationResponse,
  QuotationsResponse,
  ConvertToOrderResponse,
} from "@/shared/types/api";

// ----------------------
// RTK Query Service
// ----------------------

export const quotationApiService = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // GET ALL QUOTATIONS
    getAllQuotations: builder.query<
      QuotationsResponse,
      { page?: number; limit?: number; search?: string; status?: string }
    >({
      query: (params) => ({
        url: "/quotations",
        method: "GET",
        params,
      }),
      providesTags: ["Quotation"],
    }),

    // GET SINGLE QUOTATION
    getQuotationById: builder.query<QuotationResponse, string | number>({
      query: (id) => ({
        url: `/quotations/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Quotation", id }],
    }),

    // CREATE QUOTATION
    createQuotation: builder.mutation<QuotationResponse, CreateQuotationRequest>({
      query: (body) => ({
        url: "/quotations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Quotation"],
    }),

    // UPDATE QUOTATION
    updateQuotation: builder.mutation<
      QuotationResponse,
      { id: string | number; data: UpdateQuotationRequest }
    >({
      query: ({ id, data }) => ({
        url: `/quotations/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Quotation", id },
        "Quotation",
      ],
    }),

    // DELETE QUOTATION
    deleteQuotation: builder.mutation<QuotationResponse, string | number>({
      query: (id) => ({
        url: `/quotations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Quotation"],
    }),

    // CONVERT QUOTATION TO ORDER
    convertToOrder: builder.mutation<ConvertToOrderResponse, string | number>({
      query: (id) => ({
        url: `/quotations/${id}/convert-to-order`,
        method: "POST",
      }),
      invalidatesTags:["Quotation","SalesOrder"]
    }),

  }),
});

// ----------------------
// Hooks
// ----------------------

export const {
  useGetAllQuotationsQuery,
  useGetQuotationByIdQuery,
  useCreateQuotationMutation,
  useUpdateQuotationMutation,
  useDeleteQuotationMutation,
  useConvertToOrderMutation,
} = quotationApiService;
