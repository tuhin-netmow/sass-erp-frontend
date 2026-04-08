import { baseApi } from "@/store/baseApi";
import type {
  RawMaterialCategory,
  RawMaterial,
  RawMaterialSupplier,

  RawMaterialPurchaseOrder,
  RawMaterialPayment,
  RawMaterialInvoice,
  CommonResponse,
  ListResponse
} from "@/shared/types/admin";

// Response Types for this module
type RawMaterialCategoryResponse = ListResponse<RawMaterialCategory>;
type RawMaterialCategoryByIdResponse = CommonResponse<RawMaterialCategory>;
type RawMaterialCategoryUpdateResponse = CommonResponse<RawMaterialCategory>;
type RawMaterialResponse = ListResponse<RawMaterial>;
type RawMaterialByIdResponse = CommonResponse<RawMaterial>;
type RawMaterialSupplierResponse = ListResponse<RawMaterialSupplier>;
type RawMaterialSupplierByIdResponse = CommonResponse<RawMaterialSupplier>;
type RawMaterialPurchaseOrderResponse = ListResponse<RawMaterialPurchaseOrder>;
type RawMaterialPurchaseOrderByIdResponse = CommonResponse<RawMaterialPurchaseOrder>;
type RawMaterialInvoiceResponse = ListResponse<RawMaterialInvoice>;
type RawMaterialInvoiceByIdResponse = CommonResponse<RawMaterialInvoice>;
type RawMaterialPaymentResponse = ListResponse<RawMaterialPayment>;
type RawMaterialPaymentByIdResponse = CommonResponse<RawMaterialPayment>;

export const rawMaterialApiService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /*******************************************************
    Raw Material Category APIs
    ******************************************************/
    addRawMaterialCategory: builder.mutation<
      RawMaterialCategoryResponse,
      Partial<RawMaterialCategory>
    >({
      query: (body) => ({
        url: "/raw-materials/category",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RawMaterialCategory"],
    }),

    getAllRawMaterialCategories: builder.query<
      RawMaterialCategoryResponse,
      void | { page?: number; limit?: number; search?: string }
    >({
      query: (params) => {
        const safeParams = params ?? {};

        return {
          url: "/raw-materials/category",
          method: "GET",
          params: safeParams,
        };
      },
      providesTags: ["RawMaterialCategory"],
    }),

    getRawMaterialCategoryById: builder.query<
      RawMaterialCategoryByIdResponse,
      string | number
    >({
      query: (id) => ({
        url: `/raw-materials/category/${id}`,
        method: "GET",
      }),
      providesTags: ["RawMaterialCategory"],
    }),

    updateRawMaterialCategory: builder.mutation<
      RawMaterialCategoryUpdateResponse,
      { id: string | number; body: Partial<RawMaterialCategory> }
    >({
      query: (payload) => ({
        url: `/raw-materials/category/${payload.id}`,
        method: "PUT",
        body: payload.body,
      }),
      invalidatesTags: ["RawMaterialCategory"],
    }),

    deleteRawMaterialCategory: builder.mutation<
      RawMaterialCategoryResponse,
      string | number
    >({
      query: (id) => ({
        url: `/raw-materials/category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RawMaterialCategory"],
    }),

    /*******************************************************
    Raw Material APIs
    ******************************************************/
    addRawMaterial: builder.mutation<
      RawMaterialByIdResponse,
      Partial<RawMaterial>
    >({
      query: (body) => ({
        url: "/raw-materials",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RawMaterial"],
    }),

    getAllRawMaterials: builder.query<
      RawMaterialResponse,
      void | { page?: number; limit?: number; search?: string }
    >({
      query: (params) => {
        const safeParams = params ?? {};
        return {
          url: "/raw-materials",
          method: "GET",
          params: safeParams,
        };
      },
      providesTags: ["RawMaterial"],
    }),

    getRawMaterialById: builder.query<RawMaterialByIdResponse, number>({
      query: (id) => ({
        url: `/raw-materials/${id}`,
        method: "GET",
      }),
      providesTags: ["RawMaterial"],
    }),

    updateRawMaterial: builder.mutation<
      RawMaterialByIdResponse,
      { id: number; body: Partial<RawMaterial> }
    >({
      query: (payload) => ({
        url: `/raw-materials/${payload.id}`,
        method: "PUT",
        body: payload.body,
      }),
      invalidatesTags: ["RawMaterial"],
    }),

    deleteRawMaterial: builder.mutation<RawMaterialResponse, number>({
      query: (id) => ({
        url: `/raw-materials/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RawMaterial"],
    }),

    /*******************************************************
    Raw Material Supplier APIs
    ******************************************************/

    addRawMaterialSupplier: builder.mutation<
      RawMaterialSupplierByIdResponse,
      Partial<RawMaterialSupplier>
    >({
      query: (body) => ({
        url: "/raw-materials/supplier",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RawMaterialSupplier"],
    }),

    getAllRawMaterialSuppliers: builder.query<
      RawMaterialSupplierResponse,
      void | { page?: number; limit?: number; search?: string }
    >({
      query: (params) => {
        const safeParams = params ?? {};
        return {
          url: "/raw-materials/supplier",
          method: "GET",
          params: safeParams,
        };
      },
      providesTags: ["RawMaterialSupplier"],
    }),

    getRawMaterialSupplierById: builder.query<
      RawMaterialSupplierByIdResponse,
      string | number
    >({
      query: (id) => ({
        url: `/raw-materials/supplier/${id}`,
        method: "GET",
      }),
      providesTags: ["RawMaterialSupplier"],
    }),

    updateRawMaterialSupplier: builder.mutation<
      RawMaterialSupplierByIdResponse,
      { id: string | number; body: Partial<RawMaterialSupplier> }
    >({
      query: (payload) => ({
        url: `/raw-materials/supplier/${payload.id}`,
        method: "PUT",
        body: payload.body,
      }),
      invalidatesTags: ["RawMaterialSupplier"],
    }),

    deleteRawMaterialSupplier: builder.mutation<
      RawMaterialSupplierByIdResponse,
      string | number
    >({
      query: (id) => ({
        url: `/raw-materials/supplier/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RawMaterialSupplier"],
    }),

    /*******************************************************
    Raw Material Purchase Order APIs
    ******************************************************/
    addRawMaterialPurchaseOrder: builder.mutation<
      RawMaterialPurchaseOrderByIdResponse,
      Partial<RawMaterialPurchaseOrder>
    >({
      query: (body) => ({
        url: "/raw-materials/purchase-orders",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RawMaterialPurchaseOrder"],
    }),

    getAllRawMaterialPurchaseOrders: builder.query<
      RawMaterialPurchaseOrderResponse,
      void | { page?: number; limit?: number; search?: string }
    >({
      query: (params) => {
        const safeParams = params ?? {};
        return {
          url: "/raw-materials/purchase-orders",
          method: "GET",
          params: safeParams,
        };
      },
      providesTags: ["RawMaterialPurchaseOrder"],
    }),

    getRawMaterialPurchaseOrderById: builder.query<
      RawMaterialPurchaseOrderByIdResponse,
      string | number
    >({
      query: (id) => ({
        url: `/raw-materials/purchase-orders/${id}`,
        method: "GET",
      }),
      providesTags: ["RawMaterialPurchaseOrder"],
    }),

    updateRawMaterialPurchaseOrder: builder.mutation<
      RawMaterialPurchaseOrderByIdResponse,
      { id: string | number; body: Partial<RawMaterialPurchaseOrder> }
    >({
      query: (payload) => ({
        url: `/raw-materials/purchase-orders/${payload.id}`,
        method: "PUT",
        body: payload.body,
      }),
      invalidatesTags: ["RawMaterialPurchaseOrder"],
    }),

    deleteRawMaterialPurchaseOrder: builder.mutation<
      RawMaterialPurchaseOrderByIdResponse,
      string | number
    >({
      query: (id) => ({
        url: `/raw-materials/purchase-orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RawMaterialPurchaseOrder"],
    }),

    /*******************************************************
    Raw Material Purchase Invoice APIs
    ******************************************************/
    createRawMaterialPurchaseInvoice: builder.mutation<
      RawMaterialInvoiceByIdResponse,
      Partial<RawMaterialInvoice>
    >({
      query: (body) => ({
        url: "/raw-materials/purchase-orders/invoice",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RawMaterialPurchaseInvoice"],
    }),

    getAllRawMaterialPurchaseInvoices: builder.query<
      RawMaterialInvoiceResponse,
      void | { page?: number; limit?: number; search?: string }
    >({
      query: (params) => {
        const safeParams = params ?? {};

        return {
          url: "/raw-materials/purchase-orders/invoice",
          method: "GET",
          params: safeParams,
        };
      },
      providesTags: ["RawMaterialPurchaseInvoice"],
    }),

    getRawMaterialPurchaseInvoiceById: builder.query<
      RawMaterialInvoiceByIdResponse,
      string | number
    >({
      query: (id) => ({
        url: `/raw-materials/purchase-orders/invoice/${id}`,
        method: "GET",
      }),
      providesTags: ["RawMaterialPurchaseInvoice"],
    }),

    updateRawMaterialPurchaseInvoice: builder.mutation<
      RawMaterialInvoiceByIdResponse,
      { id: string | number; body: Partial<RawMaterialInvoice> }
    >({
      query: (payload) => ({
        url: `/raw-materials/purchase-orders/invoice/${payload.id}`,
        method: "PUT",
        body: payload.body,
      }),
      invalidatesTags: ["RawMaterialPurchaseInvoice"],
    }),

    deleteRawMaterialPurchaseInvoice: builder.mutation<
      RawMaterialInvoiceByIdResponse,
      string | number
    >({
      query: (id) => ({
        url: `/raw-materials/purchase-orders/invoice/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RawMaterialPurchaseInvoice"],
    }),

    /*******************************************************
    Raw Material Payment APIs
    ******************************************************/
    addRawMaterialPayment: builder.mutation<
      RawMaterialPaymentByIdResponse,
      Partial<RawMaterialPayment>
    >({
      query: (body) => ({
        url: "/raw-materials/purchase-orders/payments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RawMaterialPayment", "RawMaterialPurchaseInvoice"],
    }),

    getAllRawMaterialPayments: builder.query<
      RawMaterialPaymentResponse,
      void | { page?: number; limit?: number; search?: string }
    >({
      query: (params) => {
        const safeParams = params ?? {};

        return {
          url: "/raw-materials/purchase-orders/payments",
          method: "GET",
          params: safeParams,
        };
      },
      providesTags: ["RawMaterialPayment"],
    }),

    getRawMaterialPaymentById: builder.query<
      RawMaterialPaymentByIdResponse,
      string | number
    >({
      query: (id) => ({
        url: `/raw-materials/purchase-orders/payments/${id}`,
        method: "GET",
      }),
      providesTags: ["RawMaterialPayment"],
    }),

    updateRawMaterialPayment: builder.mutation<
      RawMaterialPaymentByIdResponse,
      { id: string | number; body: Partial<RawMaterialPayment> }
    >({
      query: (payload) => ({
        url: `/raw-materials/purchase-orders/payments/${payload.id}`,
        method: "PUT",
        body: payload.body,
      }),
      invalidatesTags: ["RawMaterialPayment"],
    }),

    deleteRawMaterialPayment: builder.mutation<
      RawMaterialPaymentByIdResponse,
      string | number
    >({
      query: (id) => ({
        url: `/raw-materials/purchase-orders/payments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RawMaterialPayment"],
    }),

  }),
});

export const {
  // Raw Material Category
  useAddRawMaterialCategoryMutation,
  useGetAllRawMaterialCategoriesQuery,
  useGetRawMaterialCategoryByIdQuery,
  useUpdateRawMaterialCategoryMutation,
  useDeleteRawMaterialCategoryMutation,

  // Raw Material
  useAddRawMaterialMutation,
  useGetAllRawMaterialsQuery,
  useGetRawMaterialByIdQuery,
  useUpdateRawMaterialMutation,
  useDeleteRawMaterialMutation,

  // Raw Material Supplier
  useAddRawMaterialSupplierMutation,
  useGetAllRawMaterialSuppliersQuery,
  useGetRawMaterialSupplierByIdQuery,
  useUpdateRawMaterialSupplierMutation,
  useDeleteRawMaterialSupplierMutation,

  // Raw Material Purchase Order
  useAddRawMaterialPurchaseOrderMutation,
  useGetAllRawMaterialPurchaseOrdersQuery,
  useGetRawMaterialPurchaseOrderByIdQuery,
  useUpdateRawMaterialPurchaseOrderMutation,
  useDeleteRawMaterialPurchaseOrderMutation,

  // Raw Material Purchase Invoice
  useCreateRawMaterialPurchaseInvoiceMutation,
  useGetAllRawMaterialPurchaseInvoicesQuery,
  useGetRawMaterialPurchaseInvoiceByIdQuery,
  useUpdateRawMaterialPurchaseInvoiceMutation,
  useDeleteRawMaterialPurchaseInvoiceMutation,

  // Raw Material Payment
  useAddRawMaterialPaymentMutation,
  useGetAllRawMaterialPaymentsQuery,
  useGetRawMaterialPaymentByIdQuery,
  useUpdateRawMaterialPaymentMutation,
  useDeleteRawMaterialPaymentMutation,
} = rawMaterialApiService;
