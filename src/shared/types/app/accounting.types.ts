

// -------------------- OVERVIEW --------------------
export type Overview = {
  today: {
    income: number;
    expense: number;
    net: number;
  };
  thisWeek: {
    income: number;
    expense: number;
    net: number;
  };
  thisMonth: {
    income: number;
    expense: number;
    net: number;
  };
  thisYear: {
    income: number;
    expense: number;
    net: number;
  };
};



// -------------------- INCOME / EXPENSE --------------------
export type IncomeExpense = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  status: any;
  _id: string;
  title: string;
  creditHeadId?: string;
  debitHeadId?: string;
  amount: number;
  incomeDate?: string;   // for income
  expenseDate?: string;  // for expense
  description?: string;
  paymentMethod?: string;
  referenceNumber?: string;
};

export type Income = {
  _id: string;
  date: string;
  description: string;
  creditHeadId: string;
  creditHead: {
    _id: string;
    name: string;
    code: string;
  };
  amount: number;
  receivedVia: string | null;
  reference: string | null;
  status: string;
  incomeDate?: string;
  paymentMethod?: string;
  referenceNumber?: string;
};

export type Expense = {
  _id: string;
  date: string;
  description: string;
  debitHeadId: string;
  debitHead: {
    _id: string;
    name: string;
    code: string;
  };
  category: string;
  amount: number;
  paidVia: string;
  reference: string;
  status: string;
  expenseDate?: string;
  paymentMethod?: string;
  referenceNumber?: string;
};


// -------------------- PAYROLL --------------------
export type Payroll = {
  _id: string;
  staffId: string;
  salaryMonth: string; // e.g., "2025-01"
  netSalary: number;
  status: string;
};

// -------------------- Credit Head --------------------
export type CreditHead = {
  _id: string;
  name: string;
  code: string;
  type: string;
  parentId: string | null;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

// -------------------- Debit Head --------------------
export type DebitHead = {
  _id: string;
  name: string;
  code: string;
  type?: string;
  parentId?: string | null;
  description?: string;
  isActive?: boolean;
  /** @deprecated use isActive */
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

// -------------------- TRANSACTIONS --------------------
export type Transaction = {
  _id: string;
  date: string;
  type: string;
  amount: number;
  paymentMode: string;
  description: string;
  person?: string;
  supplier?: string;
  category?: string;
};

export type CreateTransactionInput = {
  type: string;
  amount: number;
  paymentMode: string;
  date: string;
  description: string;
};

// -------------------- RECENT ACTIVITY --------------------
export type RecentActivity = {
  title: string;
  date: string;
  amount: string;
};

// -------------------- EXPENSE BREAKDOWN --------------------
export type ExpenseBreakdown = {
  name: string;
  value: number;
};

// -------------------- PRODUCT PROFIT LOSS --------------------
export type ProductProfitLoss = {
  productId: string;
  productName: string;
  sku: string;
  specification?: string;
  quantitySold: number;
  revenue: number;
  cost: number;
  profit: number;
};

export type ProductProfitLossResponse = {
  status: boolean;
  message: string;
  data: ProductProfitLoss[];
};

// -------------------- LEDGER REPORT --------------------
export type LedgerTransaction = {
  date: string;
  debit: number;
  credit: number;
  balance: number;
  narration: string;
};

export type LedgerReportResponse = {
  status: boolean;
  message: string;
  data: {
    account: string;
    openingBalance: number;
    closingBalance: number;
    transactions: LedgerTransaction[];
  };
};

// -------------------- TAX SUBMISSIONS --------------------


export type CreateTaxSubmissionInput = {
  taxType: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  submissionDate: string;
  referenceNumber?: string;
  attachmentUrl?: string;
  status?: 'PENDING' | 'SUBMITTED' | 'PAID';
  notes?: string;
  paymentMode?: 'BANK' | 'CASH';
};
// -------------------- BALANCE SHEET --------------------
export type BalanceSheetItem = {
  name: string;
  code: string;
  balance: number;
};

export type BalanceSheetData = {
  assets: BalanceSheetItem[];
  liabilities: BalanceSheetItem[];
  equity: BalanceSheetItem[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  asOfDate: string;
};

export type BalanceSheetResponse = {
  status: boolean;
  message: string;
  data: BalanceSheetData;
};
