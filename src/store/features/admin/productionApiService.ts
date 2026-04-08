import { baseApi } from "@/store/baseApi";
import type {
  ProductionBatch,
  BillOfMaterial,
  FinishedGood,
  CommonResponse,
  ListResponse
} from "@/shared/types/admin";

export const productionApiService = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Batches
        addBatch: builder.mutation<CommonResponse<ProductionBatch>, Partial<ProductionBatch>>({
            query: (body) => ({ url: "/production/batches", method: "POST", body }),
            invalidatesTags: ["ProductionBatch"],
        }),
        getBatches: builder.query<ListResponse<ProductionBatch>, void | { page?: number; limit?: number; search?: string }>({
            query: (params) => ({ url: "/production/batches", method: "GET", params: params ?? {} }),
            providesTags: ["ProductionBatch"],
        }),
        getBatchById: builder.query<CommonResponse<ProductionBatch>, string>({
            query: (id) => ({ url: `/production/batches/${id}`, method: "GET" }),
            providesTags: ["ProductionBatch"],
        }),
        updateBatch: builder.mutation<CommonResponse<ProductionBatch>, { id: string; body: Partial<ProductionBatch> }>({
            query: ({ id, body }) => ({ url: `/production/batches/${id}`, method: "PUT", body }),
            invalidatesTags: ["ProductionBatch"],
        }),
        deleteBatch: builder.mutation<CommonResponse<void>, string>({
            query: (id) => ({ url: `/production/batches/${id}`, method: "DELETE" }),
            invalidatesTags: ["ProductionBatch"],
        }),

        // BOMs
        addBom: builder.mutation<CommonResponse<BillOfMaterial>, Partial<BillOfMaterial>>({
            query: (body) => ({ url: "/production/boms", method: "POST", body }),
            invalidatesTags: ["BillOfMaterial"],
        }),
        getBoms: builder.query<ListResponse<BillOfMaterial>, void | { page?: number; limit?: number; search?: string }>({
            query: (params) => ({ url: "/production/boms", method: "GET", params: params ?? {} }),
            providesTags: ["BillOfMaterial"],
        }),
        getBomById: builder.query<CommonResponse<BillOfMaterial>, string>({
            query: (id) => ({ url: `/production/boms/${id}`, method: "GET" }),
            providesTags: ["BillOfMaterial"],
        }),
        updateBom: builder.mutation<CommonResponse<BillOfMaterial>, { id: string; body: Partial<BillOfMaterial> }>({
            query: ({ id, body }) => ({ url: `/production/boms/${id}`, method: "PUT", body }),
            invalidatesTags: ["BillOfMaterial"],
        }),
        deleteBom: builder.mutation<CommonResponse<void>, string>({
            query: (id) => ({ url: `/production/boms/${id}`, method: "DELETE" }),
            invalidatesTags: ["BillOfMaterial"],
        }),

        // Finished Goods
        addFinishedGood: builder.mutation<CommonResponse<FinishedGood>, Partial<FinishedGood>>({
            query: (body) => ({ url: "/production/finished-goods", method: "POST", body }),
            invalidatesTags: ["FinishedGood"],
        }),
        getFinishedGoods: builder.query<ListResponse<FinishedGood>, void | { page?: number; limit?: number; search?: string }>({
            query: (params) => ({ url: "/production/finished-goods", method: "GET", params: params ?? {} }),
            providesTags: ["FinishedGood"],
        }),
        getFinishedGoodById: builder.query<CommonResponse<FinishedGood>, string>({
            query: (id) => ({ url: `/production/finished-goods/${id}`, method: "GET" }),
            providesTags: ["FinishedGood"],
        }),
        updateFinishedGood: builder.mutation<CommonResponse<FinishedGood>, { id: string; body: Partial<FinishedGood> }>({
            query: ({ id, body }) => ({ url: `/production/finished-goods/${id}`, method: "PUT", body }),
            invalidatesTags: ["FinishedGood"],
        }),
        deleteFinishedGood: builder.mutation<CommonResponse<void>, string>({
            query: (id) => ({ url: `/production/finished-goods/${id}`, method: "DELETE" }),
            invalidatesTags: ["FinishedGood"],
        }),
    }),
});

export const {
    // Batches
    useAddBatchMutation,
    useGetBatchesQuery,
    useGetBatchByIdQuery,
    useUpdateBatchMutation,
    useDeleteBatchMutation,

    // BOMs
    useAddBomMutation,
    useGetBomsQuery,
    useGetBomByIdQuery,
    useUpdateBomMutation,
    useDeleteBomMutation,

    // Finished Goods
    useAddFinishedGoodMutation,
    useGetFinishedGoodsQuery,
    useGetFinishedGoodByIdQuery,
    useUpdateFinishedGoodMutation,
    useDeleteFinishedGoodMutation,
} = productionApiService;
