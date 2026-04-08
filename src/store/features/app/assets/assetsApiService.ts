/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "@/store/baseApi";
import type {
  Asset,
  AssetStats,
  AssetMovement,
  MaintenanceSchedule,
  AssetResponse,
  AssetQueryParams
} from "@/shared/types/app";

export const assetsApiService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET ALL ASSETS
    getAllAssets: builder.query<AssetResponse<Asset[]>, AssetQueryParams>({
      query: (params) => ({
        url: "/assets",
        method: "GET",
        params,
      }),
      providesTags: ["Assets"],
    }),

    // GET ASSET STATS
    getAssetStats: builder.query<AssetResponse<AssetStats>, void>({
      query: () => ({
        url: "/assets/stats",
        method: "GET",
      }),
      providesTags: ["AssetStats"],
    }),

    // GET ASSET BY ID
    getAssetById: builder.query<AssetResponse<Asset>, string>({
      query: (id) => ({
        url: `/assets/${id}`,
        method: "GET",
      }),
      providesTags: ["Assets"],
    }),

    // CREATE ASSET
    createAsset: builder.mutation<AssetResponse<Asset>, Partial<Asset>>({
      query: (body) => ({
        url: "/assets",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Assets", "AssetStats"],
    }),

    // UPDATE ASSET
    updateAsset: builder.mutation<
      AssetResponse<Asset>,
      { id: string; body: Partial<Asset> }
    >({
      query: ({ id, body }) => ({
        url: `/assets/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Assets", "AssetStats"],
    }),

    // DELETE ASSET
    deleteAsset: builder.mutation<AssetResponse<Asset>, string>({
      query: (id) => ({
        url: `/assets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Assets", "AssetStats"],
    }),

    // GET ASSET MOVEMENTS
    getAssetMovements: builder.query<
      AssetResponse<AssetMovement[]>,
      { id: string; params?: AssetQueryParams }
    >({
      query: ({ id, params }) => ({
        url: `/assets/${id}/movements`,
        method: "GET",
        params,
      }),
      providesTags: ["AssetMovements"],
    }),

    // TRANSFER ASSET
    transferAsset: builder.mutation<
      AssetResponse<Asset>,
      {
        assetId: string;
        toLocation: string;
        assignedTo?: { id: string; type: "staff" | "department" };
        reason?: string;
        notes?: string;
      }
    >({
      query: (body) => ({
        url: "/assets/transfer",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Assets", "AssetMovements"],
    }),

    // CALCULATE DEPRECIATION
    calculateDepreciation: builder.mutation<
      AssetResponse<{ asset: Asset; depreciationAmount: number; newValue: number }>,
      { id: string; method?: "straight_line" | "declining_balance"; years?: number }
    >({
      query: ({ id, ...body }) => ({
        url: `/assets/${id}/depreciation`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Assets", "AssetStats"],
    }),

    // SCHEDULE MAINTENANCE
    scheduleMaintenance: builder.mutation<
      AssetResponse<MaintenanceSchedule>,
      Partial<MaintenanceSchedule>
    >({
      query: (body) => ({
        url: "/assets/maintenance/schedule",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Maintenance"],
    }),

    // COMPLETE MAINTENANCE
    completeMaintenance: builder.mutation<
      AssetResponse<MaintenanceSchedule>,
      {
        id: string;
        completedDate: string;
        cost?: number;
        notes?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/assets/maintenance/${id}/complete`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Maintenance", "Assets"],
    }),

    // GET UPCOMING MAINTENANCE
    getUpcomingMaintenance: builder.query<
      AssetResponse<MaintenanceSchedule[]>,
      { days?: number; limit?: number }
    >({
      query: (params) => ({
        url: "/assets/maintenance/upcoming",
        method: "GET",
        params,
      }),
      providesTags: ["Maintenance"],
    }),
  }),
});

export const {
  useGetAllAssetsQuery,
  useGetAssetStatsQuery,
  useGetAssetByIdQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
  useGetAssetMovementsQuery,
  useTransferAssetMutation,
  useCalculateDepreciationMutation,
  useScheduleMaintenanceMutation,
  useCompleteMaintenanceMutation,
  useGetUpcomingMaintenanceQuery,
} = assetsApiService;
