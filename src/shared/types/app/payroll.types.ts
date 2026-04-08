/* =======================
   Payroll Types
   ======================= */

export interface PayrollRun {
  id: number;
  month: string;
  totalGross: number;
  totalNet: number;
  status: "pending" | "approved" | "paid";
  paymentDate: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  items?: PayrollItem[];
}

export interface PayrollItem {
  id: number;
  runId: number;
  staffId: number;
  basicSalary: number;
  allowances: { name: string; amount: number }[];
  deductions: { name: string; amount: number }[];
  grossPay: number;
  grossSalary?: number;
  totalAllowances?: number;
  netPay: number;
  paidAmount?: number;
  paymentStatus?: "unpaid" | "partial" | "paid";
  createdAt: string;
  updatedAt: string;
  staff?: {
    id: number;
    publicId: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
  };
}

export interface PayrollAdvanceReturn {
  id: number;
  advanceId: number;
  amount: number;
  returnDate: string;
  remarks: string | null;
  createdAt: string;
}

export interface PayrollAdvance {
  id: number;
  staffId: number | string;
  amount: number;
  advanceDate: string;
  reason: string | null;
  status: 'pending' | 'approved' | 'paid' | 'returned' | 'cancelled';
  returnedAmount: number;
  returnedDate: string | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
  returns?: PayrollAdvanceReturn[];
  staff?: {
    id: number;
    publicId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}


export interface PayrollQueryParams {
  page?: number;
  limit?: number;
  status?: "pending" | "approved" | "paid";
  month?: string;
}
