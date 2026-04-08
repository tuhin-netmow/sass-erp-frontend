import type { User } from "@/shared";
import type { AuthUserResponse, LoginRequest, LoginResponse, OnboardRequest, OnboardResponse } from "./types";
import { baseApi } from "@/store/baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 🔐 Universal Login - Single login for all user types
    // Works for: Super Admin, Company User (Shared DB), Company User (Dedicated DB)
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
    onboard: builder.mutation<OnboardResponse, OnboardRequest>({
      query: (body) => ({
        url: "/auth/onboard",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
    me: builder.query<AuthUserResponse, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),
    updateProfile: builder.mutation<AuthUserResponse, Partial<User>>({
      query: (body) => ({
        url: "/auth/profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getUsageStats: builder.query<any, void>({
      query: () => ({
        url: "/auth/usage-stats",
        method: "GET",
      }),
      providesTags: ["UsageStats"],
    }),
  }),
});

export const {
  useLoginMutation,
  useOnboardMutation,
  useLogoutMutation,
  useMeQuery,
  useUpdateProfileMutation,
  useGetUsageStatsQuery
} = authApi;

// Aliases for backward compatibility
export const useAuthUserQuery = useMeQuery;
export const useAuthOnboardMutation = useOnboardMutation;
