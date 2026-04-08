/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "@/store/baseApi";
import type { Staff } from "@/shared/types/common/entities.types";
import type {
  StaffResponse,
  StaffQueryParams,
  StaffWiseRoutes,
} from "@/shared/types/api";














export const staffApiService = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // GET ALL STAFFS
    getAllStaffs: builder.query<StaffResponse<Staff[]>, StaffQueryParams>({
      query: (params) => ({
        url: "/staffs",
        method: "GET",
        params
      }),
      providesTags: ["Staffs"],
    }),

    // ADD STAFF
    addStaff: builder.mutation<StaffResponse<Staff>, Partial<Staff>>({
      query: (body) => ({
        url: "/staffs",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Staffs"],
    }),

    // GET SINGLE STAFF BY ID
    getStaffById: builder.query<StaffResponse<Staff>, string | number>({
      query: (id) => ({
        url: `/staffs/${id}`,
        method: "GET",
      }),
      providesTags: ["Staffs"],
    }),

    // UPDATE STAFF
    updateStaff: builder.mutation<StaffResponse<Staff>, { id: string | number; body: Partial<Staff> }>({
      query: ({ id, body }) => ({
        url: `/staffs/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Staffs"],
    }),

    // DELETE STAFF
    deleteStaff: builder.mutation<StaffResponse<Staff>, string | number>({
      query: (id) => ({
        url: `/staffs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Staffs"],
    }),

    // Staff wise routes
    getAllStaffWiseRoutes: builder.query<StaffResponse<StaffWiseRoutes[]>, StaffQueryParams>({
      query: (params) => ({
        url: "/staffs/routes",
        method: "GET",
        params
      }),
      providesTags: ["staffRoutes"],
    }),

    // UPDATE PAYROLL STRUCTURE
    updatePayrollStructure: builder.mutation<StaffResponse<Staff>, { id: string | number; body: any }>({
      query: ({ id, body }) => ({
        url: `/payroll/structure/${id}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Staffs", "PayrollStructure"],
    }),

    // GET PAYROLL STRUCTURE
    getPayrollStructure: builder.query<StaffResponse<any>, string | number>({
      query: (id) => ({
        url: `/payroll/structure/${id}`,
        method: "GET",
      }),
      providesTags: ["PayrollStructure"],
    }),

  }),
});

export const {
  useGetAllStaffsQuery,
  useAddStaffMutation,
  useGetStaffByIdQuery,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
  useGetAllStaffWiseRoutesQuery,
  useUpdatePayrollStructureMutation,
  useGetPayrollStructureQuery,
} = staffApiService;
