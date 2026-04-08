

import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

import { toast } from 'sonner';
import { logout, setCredentials } from './features/auth/authSlice';
import type { RootState } from './store'; // make sure this is your correct path

// Convert snake_case to camelCase
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Recursively convert all object keys from snake_case to camelCase
function transformResponse<T>(data: unknown): T {
  if (data === null || typeof data !== 'object') {
    return data as T;
  }

  if (Array.isArray(data)) {
    return data.map(item => transformResponse(item)) as T;
  }

  const result: Record<string, unknown> = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const camelKey = toCamelCase(key);
      const newKey = key === '_id' ? '_id' : camelKey;
      result[newKey] = transformResponse((data as Record<string, unknown>)[key]);

      // Also add 'id' when '_id' exists
      if (key === '_id') {
        result.id = (data as Record<string, unknown>)[key];
      }
    }
  }
  return result as T;
}

interface RefreshTokenResponse {
  data?: {
    token: string;
  };
}

// 🌐 Multi-tenant: Dynamic API URL based on current subdomain
// This ensures API requests go to the same subdomain as the frontend
// Example: inleads-it-solution-809.lvh.me:5173 → inleads-it-solution-809.lvh.me:5006
const getApiBaseUrl = () => {
  // In development, use the same hostname as frontend but port 5006
  // This preserves the subdomain for tenant detection
  if (import.meta.env.DEV) {
    const hostname = window.location.hostname; // e.g., inleads-it-solution-809.lvh.me
    return `http://${hostname}:5006/api/v1`;
  }

  // In production, use the environment variable or relative path
  return `${import.meta.env.VITE_API_URL}/api/v1`;
};

const API_BASE_URL = getApiBaseUrl();

// Basic baseQuery with auth header
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Enhanced baseQuery with refresh token logic and response transformation
const baseQueryWithRefreshToken: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (arg, api, extraOptions) => {
  let result = await baseQuery(arg, api, extraOptions);

  // Transform successful response data from snake_case to camelCase
  if (result.data) {
    result.data = transformResponse(result.data);
  }

  if (result.error?.status === 404 || result.error?.status === 403) {
    const errorData = result.error.data as { message?: string };
    const url = typeof arg === 'string' ? arg : arg.url || '';

    if (!url.includes('/auth/change-password')) {
      toast.error(errorData?.message || 'Request failed', {
        position: 'top-right',
        style: { backgroundColor: 'red', color: 'white' },
      });
    }
  }

  // Handle 400 Bad Request errors globally (but exclude onboarding to allow component-level handling)
  if (result.error?.status === 400) {
    const errorData = result.error.data as { message?: string; error?: { message?: string } };
    const url = typeof arg === 'string' ? arg : arg.url || '';

    // Skip global toast for onboarding - let component handle it
    if (!url.includes('/auth/onboard')) {
      const errorMsg = errorData?.message || errorData?.error?.message || 'Invalid request';
      toast.error(errorMsg, {
        position: 'top-right',
        duration: 5000,
      });
    }
  }

  if (result.error?.status === 401) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/auth/refresh`,
        {
          credentials: 'include',
          method: 'POST',
        }
      );

      const data: RefreshTokenResponse = await res.json();

      if (data?.data?.token) {
        const user = (api.getState() as RootState).auth.user;
        if (user) {
          api.dispatch(setCredentials({ user, token: data.data.token }));
          // Retry original request with new token
          result = await baseQuery(arg, api, extraOptions);
          // Transform retried response
          if (result.data) {
            result.data = transformResponse(result.data);
          }
        }
      } else {
        api.dispatch(logout());
        // optional: trigger logout endpoint if needed
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      api.dispatch(logout());
    }
  }

  return result;
};

// Create the API instance
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithRefreshToken,
  tagTypes: [
    'Auth',
    'UsageStats',
    'Users',
    'Departments',
    'Category',
    'Unit',
    'Customers',
    'Product',
    'Stock',
    'StockMovement',
    'Attendance',
    'Leaves',
    'Roles',
    'Role',
    'Accounting',
    'Staffs',
    'Suppliers',
    'Purchases',
    'Sales',
    'Expenses',
    'SalesRoutes',
    'Warehouses',
    'SalesInvoices',
    'SalesPayments',
    'SalesOrders',
    'SalesInvoice',
    'SalesInvoiceByCustomers',
    'SalesPayment',
    'SalesRoute',
    "Settings",
    "PurchaseInvoices",
    "PurchasePayments",
    "PurchaseMaps",
    "Purchase",
    "Stats",
    "Reports",
    "SalesOrdersByRoute",
    "RawMaterialCategory",
    "RawMaterialUnit",
    "RawMaterial",
    'RawMaterialSupplier',
    'RawMaterialPurchaseOrder',
    'RawMaterialPurchaseInvoice',
    'RawMaterialPayment',
    'ProductionBatch',
    'BillOfMaterial',
    'FinishedGood',
    'InactiveCustomers',
    'ActiveCustomers',
    'StaffCheckIn',
    'staffRoutes',
    "incomeCreditHead",
    "expenseCreditHead",
    "AccountingAccounts",
    "PayrollStructure",
    "Payroll",
    "PurchaseReturns",
    "PurchaseReturn",
    "PurchaseReturnInvoices",
    "PurchaseReturnInvoice",
    "PurchaseReturnPayments",
    "SalesReturns",
    "SalesReturn",
    "SalesReturnInvoices",
    "SalesReturnInvoice",
    "SalesReturnPayments",
    "Quotation",
    "AuthUser",
    "CompanyStats",
    "CompanyInfo",
    "CompanyActivity",
    // New tags for assets and help
    "Assets",
    "AssetStats",
    "AssetMovements",
    "Maintenance",
    "HelpArticles",
    "FAQs",
    "HelpVideos",
    "SupportTickets",
    "TicketMessages",
    "TicketStats",
    "Upload",
    "SalesOrder"
  ],
  endpoints: () => ({}),
});
