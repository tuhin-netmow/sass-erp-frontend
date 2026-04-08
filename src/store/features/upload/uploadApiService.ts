import { baseApi } from '@/store/baseApi';
import type { UploadResponse, UploadListResponse, UploadMultipleResponse } from "@/shared/types/upload";

// Upload API Service
export const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ============================================================================
    // IMAGES MODULE
    // ============================================================================
    uploadImagesImage: builder.mutation<UploadResponse, FormData>({
      query: (formData) => ({
        url: '/upload/images',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Upload'],
    }),

    uploadImagesMultiple: builder.mutation<UploadMultipleResponse, FormData>({
      query: (formData) => ({
        url: '/upload/images/multiple',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Upload'],
    }),

    // ============================================================================
    // DOCUMENTS MODULE
    // ============================================================================
    uploadDocument: builder.mutation<UploadResponse, FormData>({
      query: (formData) => ({
        url: '/upload/documents',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Upload'],
    }),

    uploadDocumentsMultiple: builder.mutation<UploadMultipleResponse, FormData>({
      query: (formData) => ({
        url: '/upload/documents/multiple',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Upload'],
    }),

    // ============================================================================
    // PROFILE MODULE
    // ============================================================================
    uploadProfile: builder.mutation<UploadResponse, FormData>({
      query: (formData) => ({
        url: '/upload/profile',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Upload'],
    }),

    uploadProfileMultiple: builder.mutation<UploadMultipleResponse, FormData>({
      query: (formData) => ({
        url: '/upload/profile/multiple',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Upload'],
    }),

    // ============================================================================
    // PRODUCTS MODULE
    // ============================================================================
    uploadProduct: builder.mutation<UploadResponse, FormData>({
      query: (formData) => ({
        url: '/upload/products',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Upload'],
    }),

    uploadProductsMultiple: builder.mutation<UploadMultipleResponse, FormData>({
      query: (formData) => ({
        url: '/upload/products/multiple',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Upload'],
    }),

    // ============================================================================
    // CUSTOMERS MODULE
    // ============================================================================
    uploadCustomer: builder.mutation<UploadResponse, FormData>({
      query: (formData) => ({
        url: '/upload/customers',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Upload'],
    }),

    uploadCustomersMultiple: builder.mutation<UploadMultipleResponse, FormData>({
      query: (formData) => ({
        url: '/upload/customers/multiple',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Upload'],
    }),

    // ============================================================================
    // LIST & DELETE ENDPOINTS
    // ============================================================================
    listImages: builder.query<UploadListResponse, { page?: number; limit?: number; module?: string }>({
      query: ({ page = 1, limit = 12, module }) => ({
        url: '/upload/images',
        method: 'GET',
        params: { page, limit, module },
      }),
      providesTags: ['Upload'],
    }),

    deleteImage: builder.mutation<{ message: string; filename: string }, string>({
      query: (filename) => ({
        url: `/upload/images/${filename}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Upload'],
    }),
  }),
});

export const {
  // Images Module
  useUploadImagesImageMutation,
  useUploadImagesMultipleMutation,
  // Documents Module
  useUploadDocumentMutation,
  useUploadDocumentsMultipleMutation,
  // Profile Module
  useUploadProfileMutation,
  useUploadProfileMultipleMutation,
  // Products Module
  useUploadProductMutation,
  useUploadProductsMultipleMutation,
  // Customers Module
  useUploadCustomerMutation,
  useUploadCustomersMultipleMutation,
  // List & Delete
  useListImagesQuery,
  useDeleteImageMutation,
} = uploadApi;
