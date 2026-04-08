/* =======================
   API Types Index
   ======================= */

// Export global API types
export * from './globals.types';

// Export app API response types
export * from './app-api.types';

/* =======================
   Common API Types
   ======================= */

/* =======================
   Pagination
======================= */

export interface Pagination {
  total: number;
  page: number | string;
  limit: number | string;
  totalPages: number;
}

/* =======================
   Common Response Types
======================= */

export interface BaseResponse {
  status: boolean;
  message: string;
}

export interface DataResponse<T> extends BaseResponse {
  data: T;
}

export interface PaginatedResponse<T> extends BaseResponse {
  data: T[];
  pagination?: Pagination;
}

export interface SuccessResponse {
  success: boolean;
  message: string;
}

export interface SuccessDataResponse<T> extends SuccessResponse {
  data: T;
}

/* =======================
   Query Params Types
======================= */

export interface BaseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface DateRangeQueryParams extends BaseQueryParams {
  startDate?: string;
  endDate?: string;
  from?: string;
  to?: string;
}

export interface StatusQueryParams extends BaseQueryParams {
  status?: string;
}

export interface AdminUsersQueryParams extends BaseQueryParams {
  status?: string;
  dbType?: string;
}
