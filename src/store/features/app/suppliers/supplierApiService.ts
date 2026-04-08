import { baseApi } from "@/store/baseApi";
import type { Supplier } from "@/shared/types/app/supplier.types";
import type { SupplierSingleResponse, SupplierListResponse } from "@/shared/types/api";


export const supplierApiService = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // GET ALL SUPPLIERS
    getAllSuppliers: builder.query<SupplierListResponse, { page?: number; limit?: number; search?: string; sort?: string }>({
      query: (params) => ({
        url: "/suppliers",
        method: "GET",
        params
      }),
      providesTags: ["Suppliers"],
    }),

    // ADD SUPPLIER
    addSupplier: builder.mutation<SupplierSingleResponse, Partial<Supplier>>({
      query: (body) => ({
        url: "/suppliers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Suppliers"],
    }),

    // GET SINGLE SUPPLIER BY ID
    getSupplierById: builder.query<SupplierSingleResponse, string | number>({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: "GET",
      }),
      providesTags: ["Suppliers"],
    }),

    // UPDATE SUPPLIER
    updateSupplier: builder.mutation<
      SupplierSingleResponse,
      { id: string | number; body: Partial<Supplier> }
    >({
      query: ({ id, body }) => ({
        url: `/suppliers/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Suppliers"],
    }),

    // DELETE SUPPLIER
    deleteSupplier: builder.mutation<SupplierSingleResponse, string | number>({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Suppliers"],
    }),

    // GET SUPPLIER STATS
    getSupplierStats: builder.query<{ status: boolean; data: any[] }, void>({
      query: () => ({
        url: "/suppliers/stats",
        method: "GET",
      }),
      providesTags: ["Suppliers"],
    }),

  }),
});

export const {
  useGetAllSuppliersQuery,
  useAddSupplierMutation,
  useGetSupplierByIdQuery,
  useLazyGetSupplierByIdQuery,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useGetSupplierStatsQuery,
} = supplierApiService;
