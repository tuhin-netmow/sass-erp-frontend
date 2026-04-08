import { baseApi } from "@/store/baseApi";
import type {
  CreateCustomerRequest,
  UpdateCustomerRequest,
  GetCustomersParams,
  GetCustomersResponse,
  CustomerResponse,
  DeleteCustomerResponse,
  GetCustomerMapsResponse,
} from "../../../../shared/types/app/customers";

export const customersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ------------------------------------------
    // GET CUSTOMER STATS
    // ------------------------------------------
    getCustomerStats: builder.query({
      query: () => ({
        url: "/customers/stats",
        method: "GET",
      }),
      providesTags: [{ type: "Customers", id: "STATS" }],
    }),

    // ------------------------------------------
    // GET ALL CUSTOMERS
    // ------------------------------------------
    getCustomers: builder.query<
      GetCustomersResponse,
      GetCustomersParams | void
    >({
      query: (params) => ({
        url: "/customers",
        method: "GET",
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Customers" as const,
                id: _id,
              })),
              { type: "Customers", id: "LIST" },
            ]
          : [{ type: "Customers", id: "LIST" }],
    }),

    // ------------------------------------------
    // GET ACTIVE CUSTOMERS
    // ------------------------------------------
    getActiveCustomers: builder.query<
      GetCustomersResponse,
      GetCustomersParams | void
    >({
      query: (params) => ({
        url: "/customers/active",
        method: "GET",
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Customers" as const,
                id: _id,
              })),
              { type: "Customers", id: "LIST" },
              { type: "Customers", id: "ACTIVE" },
            ]
          : [{ type: "Customers", id: "LIST" }, { type: "Customers", id: "ACTIVE" }],
    }),

    // ------------------------------------------
    // GET INACTIVE CUSTOMERS
    // ------------------------------------------
    getInactiveCustomers: builder.query<
      GetCustomersResponse,
      GetCustomersParams | void
    >({
      query: (params) => ({
        url: "/customers/inactive",
        method: "GET",
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Customers" as const,
                id: _id,
              })),
              { type: "Customers", id: "LIST" },
              { type: "Customers", id: "INACTIVE" },
            ]
          : [{ type: "Customers", id: "LIST" }, { type: "Customers", id: "INACTIVE" }],
    }),

    // ------------------------------------------
    // GET SINGLE CUSTOMER
    // ------------------------------------------
    getCustomerById: builder.query<CustomerResponse, number | string>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: "GET",
      }),
      providesTags: (_r, _e, id) => [{ type: "Customers", id }],
    }),

    // ------------------------------------------
    // CREATE CUSTOMER
    // ------------------------------------------
    createCustomer: builder.mutation<CustomerResponse, CreateCustomerRequest>({
      query: (data) => ({
        url: "/customers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: "Customers", id: "LIST" },
        { type: "Customers", id: "STATS" },
        { type: "Customers", id: "ACTIVE" },
        { type: "Customers", id: "INACTIVE" },
      ],
    }),

    // ------------------------------------------
    // UPDATE CUSTOMER
    // ------------------------------------------
    updateCustomer: builder.mutation<
      CustomerResponse,
      { id: number | string; data: UpdateCustomerRequest }
    >({
      query: ({ id, data }) => ({
        url: `/customers/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Customers", id },
        { type: "Customers", id: "LIST" },
        { type: "Customers", id: "STATS" },
        { type: "Customers", id: "ACTIVE" },
        { type: "Customers", id: "INACTIVE" },
      ],
    }),

    // ------------------------------------------
    // DELETE CUSTOMER
    // ------------------------------------------
    deleteCustomer: builder.mutation<DeleteCustomerResponse, number | string>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Customers", id },
        { type: "Customers", id: "LIST" },
        { type: "Customers", id: "STATS" },
        { type: "Customers", id: "ACTIVE" },
        { type: "Customers", id: "INACTIVE" },
      ],
    }),

    // ------------------------------------------
    // GET MAP DATA
    // ------------------------------------------
    getCustomerMaps: builder.query<GetCustomerMapsResponse, void>({
      query: () => ({
        url: "/customers/maps",
        method: "GET",
      }),
      providesTags: [{ type: "Customers", id: "MAP" }],
    }),
  }),
});

export const {
  useGetCustomerStatsQuery,
  useGetCustomersQuery,
  useLazyGetCustomersQuery,
  useGetActiveCustomersQuery,
  useLazyGetActiveCustomersQuery,
  useGetInactiveCustomersQuery,
  useLazyGetInactiveCustomersQuery,
  useGetCustomerByIdQuery,
  useLazyGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useGetCustomerMapsQuery,
} = customersApi;
