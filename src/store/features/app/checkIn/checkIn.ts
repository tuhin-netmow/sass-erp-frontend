
import { baseApi } from "@/store/baseApi";

import type { Customer } from "@/shared/types/app/customers";
import type { StaffAttendance, DataResponse, PaginatedResponse } from "@/shared";



/* =======================
   API Service
======================= */

export const staffAttendanceApiService = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /* =======================
       GET ALL STAFF ATTENDANCE
       GET /api/staff-attendance
    ======================= */
    getAllStaffAttendance: builder.query<
      PaginatedResponse<StaffAttendance>,
      { page?: number; limit?: number; search?: string; date?: string; staffId?: string | number }
    >({
      query: (params) => ({
        url: "/staff-attendance",
        method: "GET",
        params,
      }),
      providesTags: ["StaffCheckIn"],
    }),

    /* =======================
       CREATE STAFF ATTENDANCE
       POST /api/staff-attendance
    ======================= */
    addStaffAttendance: builder.mutation<
      DataResponse<StaffAttendance>,
      Partial<StaffAttendance>
    >({
      query: (body) => ({
        url: "/staff-attendance",
        method: "POST",
        body,
      }),
      invalidatesTags: ["StaffCheckIn"],
    }),

    /* =======================
       GET SINGLE ATTENDANCE
       GET /api/staff-attendance/:id
    ======================= */
    getStaffAttendanceById: builder.query<
      DataResponse<StaffAttendance>,
      string | number
    >({
      query: (id) => ({
        url: `/staff-attendance/${id}`,
        method: "GET",
      }),
      providesTags: ["StaffCheckIn"],
    }),

    /* =======================
       UPDATE ATTENDANCE
       PUT /api/staff-attendance/:id
    ======================= */
    updateStaffAttendance: builder.mutation<
      DataResponse<StaffAttendance>,
      { id: string | number; body: Partial<StaffAttendance> }
    >({
      query: ({ id, body }) => ({
        url: `/staff-attendance/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["StaffCheckIn"],
    }),

    /* =======================
       DELETE ATTENDANCE
       DELETE /api/staff-attendance/:id
    ======================= */
    deleteStaffAttendance: builder.mutation<
      DataResponse<StaffAttendance>,
      string | number
    >({
      query: (id) => ({
        url: `/staff-attendance/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["StaffCheckIn"],
    }),

    /* =======================
       CHECK-IN
       POST /api/staff-attendance/check-in
    ======================= */
    staffCheckIn: builder.mutation<
      DataResponse<StaffAttendance>,
      {
        customerId: string;
        staffId: string;
        checkInTime: string;
        latitude: number;
        longitude: number;
        distanceMeters: number;
        note?: string;
      }
    >({
      query: (body) => ({
        url: "/staff-attendance/check-in",
        method: "POST",
        body,
      }),
      invalidatesTags: ["StaffCheckIn"],
    }),

    /* =======================
       GET CHECK-IN DETAILS
       GET /api/staff-attendance/check-in/:id
    ======================= */
    getCheckInById: builder.query<
      DataResponse<StaffAttendance>,
      string | number
    >({
      query: (id) => ({
        url: `/staff-attendance/check-in/${id}`,
        method: "GET",
      }),
      providesTags: ["StaffCheckIn"],
    }),

    // GET CUSTOMER LIST WITH STAFF CHECK-INS BY DATE
    getCustomerCheckInListByDate: builder.query<
      PaginatedResponse<Customer>,
      {
        date: string;
        page?: number;
        limit?: number;
        search?: string;
      }
    >({
      query: ({ date, page = 1, limit = 10, search }) => ({
        url: `/staff-attendance/customer-list/${date}`,
        method: "GET",
        params: { page, limit, search },
      }),
      providesTags: ["StaffCheckIn"],
    }),


  }),
});

/* =======================
   Hooks Export
======================= */

export const {
  useGetAllStaffAttendanceQuery,
  useAddStaffAttendanceMutation,
  useGetStaffAttendanceByIdQuery,
  useUpdateStaffAttendanceMutation,
  useDeleteStaffAttendanceMutation,
  useStaffCheckInMutation,
  useGetCheckInByIdQuery,
  useGetCustomerCheckInListByDateQuery,
} = staffAttendanceApiService;
