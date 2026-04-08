import type { Pagination } from "./index";
import type { User } from "../auth/users.types";
import type { Supplier } from "../app/supplier.types";
import type { Leave } from "../app/leave.types";
import type { Attendance } from "../app/Attendence.types";
import type { PurchasePayment } from "../app/purchasePayment.types";
import type { PurchaseOrderLocation } from "../app/purchaseOrder.types";
import type { Quotation } from "../app/quotation.types";
import type {
  CreditHead,
  DebitHead,
  Expense,
  Income,
  Overview,
  RecentActivity,
} from "../app/accounting.types";

// ==================== STAFF API RESPONSE TYPES ====================

export type StaffResponse<T> = {
  status: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
};

export type StaffQueryParams = {
  page?: number;
  limit?: number;
  status?: "active" | "inactive" | "terminated" | "on_leave";
  department?: string;
  roleId?: string | number;
  search?: string;
};

export type RouteStatus = "Active" | "Pending";

export interface Route {
  id: number;
  name: string;
  status: RouteStatus;
  orders: number;
}

export interface StaffStats {
  completedOrders: number;
  rating: number;
}

export interface StaffWiseRoutes {
  id: string;
  name: string;
  role: "Sales Representative" | "Delivery Driver" | "Area Manager";
  thumbUrl: string;
  email: string;
  phone: string;
  active: boolean;
  routes: Route[];
  stats: StaffStats;
}

// ==================== USERS API RESPONSE TYPES ====================

export type UserResponse = {
  success: boolean;
  status: boolean;
  message: string;
  data: User | User[];
  pagination?: Pagination;
};

export type UserParams = {
  page?: number;
  limit?: number;
  search?: string;
};

// ==================== ROLE API RESPONSE TYPES ====================

export type RoleResponse<T> = {
  status: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
};

// ==================== SUPPLIER API RESPONSE TYPES ====================

export type SupplierSingleResponse = {
  status: boolean;
  message: string;
  data: Supplier;
};

export type SupplierListResponse = {
  status: boolean;
  message: string;
  data: Supplier[];
  pagination: Pagination;
};

// ==================== LEAVE API RESPONSE TYPES ====================

export type LeaveResponse = {
  status: boolean;
  message: string;
  data: Leave | Leave[];
};

// ==================== SALES API RESPONSE TYPES ====================

export type SalesResponse<T = unknown> = {
  status: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
};

export interface UpdateInvoiceStatusPayload {
  status: string;
}

// ==================== PURCHASE API RESPONSE TYPES ====================

export type PurchaseResponse<T> = {
  status: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
};

export interface PurchasePaymentResponse {
  success: boolean;
  message: string;
  data: PurchasePayment[];
  pagination: Pagination;
}

export interface PurchaseOrderLocationsData {
  total: number;
  locations: PurchaseOrderLocation[];
}

export interface PurchaseOrderLocationsResponse {
  status: boolean;
  message: string;
  data: PurchaseOrderLocationsData;
}

// ==================== QUOTATION API RESPONSE TYPES ====================

export interface QuotationResponse {
  status: boolean;
  message: string;
  data: Quotation;
}

export interface QuotationsResponse {
  status: boolean;
  message: string;
  data: Quotation[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ConvertToOrderResponse {
  status: boolean;
  message: string;
  data: {
    orderId: number;
    orderNumber: string;
  };
}

// ==================== SALES ROUTE API RESPONSE TYPES ====================

export interface SalesRoutePagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SalesRouteResponse<T> {
  status: boolean;
  message: string;
  pagination?: SalesRoutePagination;
  data: T;
}

export interface AssignStaffRequestBody {
  staffIds: string[];
}

// ==================== ACCOUNTING API RESPONSE TYPES ====================

// -------------------- OVERVIEW --------------------
export type OverviewResponse = {
  status: boolean;
  message: string;
  data: Overview;
};

// -------------------- INCOME / EXPENSE --------------------
export type ListResponse<T> = {
  status: boolean;
  message: string;
  pagination: Pagination;
  data: T[];
};

export type IncomeResponse = ListResponse<Income>;
export type ExpenseResponse = ListResponse<Expense>;

// -------------------- Credit Head --------------------
export type CreditHeadResponse = ListResponse<CreditHead>;

export type IncomeHeadResponse = {
  status: boolean;
  message: string;
  data: CreditHead[];
};

export type CreditHeadByIdResponse = {
  status: boolean;
  message: string;
  data: CreditHead;
};

// -------------------- Debit Head --------------------
export type DebitHeadResponse = ListResponse<DebitHead>;

export type DebitHeadByIdResponse = {
  status: boolean;
  message: string;
  data: DebitHead;
};

// -------------------- RECENT ACTIVITY --------------------
export type RecentActivityResponse = {
  status: boolean;
  message: string;
  data: RecentActivity[];
};

// -------------------- EXPENSE BREAKDOWN --------------------
export interface ExpenseBreakdownData {
  name: string;
  value: number;
  [key: string]: unknown;
}

export type ExpenseBreakdownResponse = {
  status: boolean;
  message: string;
  data: ExpenseBreakdownData[];
};

// -------------------- PAYROLL --------------------
export interface PayrollResponse<T = any> {
  status: boolean;
  message: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// -------------------- CHART DATA --------------------
export type ChartDataPoint = {
  date: string;
  income: number;
  expense: number;
};

export type ChartResponse = {
  status: boolean;
  message: string;
  data: ChartDataPoint[];
};

export interface IncomeExpenseTrendData {
  date: string;
  income: number;
  expense: number;
}

export interface IncomeExpenseTrendResponse {
  status: boolean;
  message: string;
  data: IncomeExpenseTrendData[];
}

// -------------------- ACCOUNT TYPE --------------------
export type AccountType =
  | "Asset"
  | "Liability"
  | "Equity"
  | "Income"
  | "Expense";

export interface ChartOfAccount {
  _id: string;
  code: string;
  name: string;
  type: AccountType;
  parent: string | null;
  level: number;
  debit?: number;
  credit?: number;
}

// -------------------- JOURNAL REPORT --------------------
export interface JournalEntryAccount {
  code: string;
  name: string;
}

export interface JournalEntryDetail {
  _id: string;
  journalId: string;
  accountId: string;
  debit: string;
  credit: string;
  account: JournalEntryAccount;
}

export interface JournalEntry {
  _id: string;
  publicId: string;
  date: string;
  referenceType: string;
  referenceId: string | null;
  narration: string;
  createdAt: string;
  updatedAt: string;
  entries: JournalEntryDetail[];
}

export type JournalReportResponse = ListResponse<JournalEntry>;

export type JournalByIdResponse = {
  status: boolean;
  message: string;
  data: JournalEntry;
};

// -------------------- TRIAL BALANCE --------------------
export interface TrialBalanceItem {
  account: string;
  code: string;
  type: string;
  debit: number;
  credit: number;
}

export interface TrialBalanceResponse {
  status: boolean;
  message: string;
  data: {
    trialBalance: TrialBalanceItem[];
    totalDebit: number;
    totalCredit: number;
    status: "BALANCED" | "UNBALANCED";
  };
}

// -------------------- PROFIT & LOSS --------------------
export interface ProfitLossItem {
  code: string;
  name: string;
  amount: number;
}

export interface ProfitLossResponse {
  status: boolean;
  message: string;
  data: {
    income: ProfitLossItem[];
    expense: ProfitLossItem[];
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
  };
}

// -------------------- TAX SUBMISSIONS --------------------
export interface TaxSubmission {
  _id: string;
  taxType: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  submissionDate: string;
  referenceNumber: string | null;
  attachmentUrl: string | null;
  status: 'PENDING' | 'SUBMITTED' | 'PAID';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaxSubmissionStats {
  totalTax: number;
  totalPaid: number;
  totalDue: number;
}

export type TaxSubmissionResponse = ListResponse<TaxSubmission> & {
  stats: TaxSubmissionStats;
};

// ==================== ATTENDANCE API RESPONSE TYPES ====================

export type AttendanceResponse = {
  status: boolean;
  message: string;
  data: Attendance | Attendance[];
};

export type StaffAttendanceResponse = {
  status: boolean;
  message: string;
  data: Attendance[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type AttendanceStatsResponse = {
  status: boolean;
  message: string;
  data: {
    total: number;
    present: number;
    late: number;
    absent: number;
    on_leave: number;
  };
};
