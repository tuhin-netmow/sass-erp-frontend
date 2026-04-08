/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "@/store/baseApi";
import type {
  CreditHead,
  DebitHead,
  Expense,
  Income,
  Payroll,
  Transaction,
  CreateTransactionInput,
  LedgerReportResponse,
  ProductProfitLossResponse,
  BalanceSheetResponse,
} from "@/shared/types/app";
import type {
  // API Response types
  OverviewResponse,
  ListResponse,
  IncomeResponse,
  ExpenseResponse,
  CreditHeadResponse,
  IncomeHeadResponse,
  CreditHeadByIdResponse,
  DebitHeadResponse,
  DebitHeadByIdResponse,
  RecentActivityResponse,
  ExpenseBreakdownResponse,
  PayrollResponse,
  ChartResponse,
  IncomeExpenseTrendResponse,
  ChartOfAccount,
  JournalEntry,
  JournalEntryDetail,
  JournalReportResponse,
  JournalByIdResponse,
  TrialBalanceResponse,
  ProfitLossResponse,
  TaxSubmission,
  TaxSubmissionResponse,

} from "@/shared/types/api";

export type {
  OverviewResponse,
  ListResponse,
  IncomeResponse,
  ExpenseResponse,
  CreditHeadResponse,
  IncomeHeadResponse,
  CreditHeadByIdResponse,
  DebitHeadResponse,
  DebitHeadByIdResponse,
  RecentActivityResponse,
  ExpenseBreakdownResponse,
  PayrollResponse,
  ChartResponse,
  IncomeExpenseTrendResponse,
  ChartOfAccount,
  JournalEntry,
  JournalEntryDetail,
  JournalReportResponse,
  JournalByIdResponse,
  TrialBalanceResponse,
  ProfitLossResponse,
  TaxSubmission,
  TaxSubmissionResponse,
};


// -------------------- RTK QUERY SERVICE --------------------

// -------------------- RTK QUERY SERVICE --------------------
export const accountingApiService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET ACCOUNTING OVERVIEW
    getAccountingOverview: builder.query<OverviewResponse, void>({
      query: () => ({ url: "/accounting/overview", method: "GET" }),
      providesTags: ["Accounting"],
    }),

    // GET RECENT ACTIVITY
    getRecentActivity: builder.query<RecentActivityResponse, void>({
      query: () => ({ url: "/accounting/recent-activity", method: "GET" }),
      providesTags: ["Accounting"],
    }),

    // GET EXPENSE BREAKDOWN
    getExpenseBreakdown: builder.query<ExpenseBreakdownResponse, { from?: string; to?: string }>({
      query: (params) => ({
        url: "/accounting/reports/expense-breakdown",
        method: "GET",
        params,
      }),
      providesTags: ["Accounting"],
    }),


    // GET ALL INCOMES
    getIncomes: builder.query<
      IncomeResponse,
      { page?: number; limit?: number; search?: string; date?: string; from?: string; to?: string }
    >({
      query: (params) => ({
        url: "/accounting/incomes",
        method: "GET",
        params,
      }),
      providesTags: ["Accounting"],
    }),

    // ADD INCOME
    addIncome: builder.mutation<IncomeResponse, Partial<Income>>({
      query: (body) => ({ url: "/accounting/incomes/head-wise", method: "POST", body }),
      invalidatesTags: ["Accounting"],
    }),

    // GET ALL EXPENSES
    getExpenses: builder.query<
      ExpenseResponse,
      { page?: number; limit?: number; search?: string; date?: string; from?: string; to?: string }
    >({
      query: (params) => ({
        url: "/accounting/expenses",
        method: "GET",
        params,
      }),
      providesTags: ["Accounting"],
    }),

    // ADD EXPENSE
    addExpense: builder.mutation<ExpenseResponse, Partial<Expense>>({
      query: (body) => ({ url: "/accounting/expenses", method: "POST", body }),
      invalidatesTags: ["Accounting"],
    }),

    //Add credit head
    addCreditHead: builder.mutation<CreditHeadResponse, Partial<CreditHead>>({
      query: (body) => ({
        url: "/accounting/credit-head",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Accounting"],
    }),

    // GET CREDIT HEAD
    getAllCreditHeads: builder.query<
      CreditHeadResponse,
      { page?: number; limit?: number; search?: string }
    >({
      query: (params) => ({
        url: "/accounting/credit-head",
        method: "GET",
        params,
      }),
      providesTags: ["Accounting"],
    }),

    // GET INCOME HEADS
    getIncomeHeads: builder.query<IncomeHeadResponse, void>({
      query: () => ({
        url: "/accounting/accounts/heads/income",
        method: "GET",
      }),
      providesTags: ["Accounting"],
    }),

    //get single credit head
    getSingleCreditHead: builder.query<CreditHeadByIdResponse, string>({
      query: (id) => ({ url: `/accounting/credit-head/${id}`, method: "GET" }),
      providesTags: ["Accounting"],
    }),

    //update credit head
    updateCreditHead: builder.mutation<
      CreditHeadResponse,
      { id: string; body: Partial<CreditHead> }
    >({
      query: ({ id, body }) => ({
        url: `/accounting/credit-head/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Accounting"],
    }),

    //delete credit head
    deleteCreditHead: builder.mutation<CreditHeadResponse, string>({
      query: (id) => ({
        url: `/accounting/credit-head/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Accounting"],
    }),

    //Add debit head
    addDebitHead: builder.mutation<DebitHeadResponse, Partial<DebitHead>>({
      query: (body) => ({
        url: "/accounting/debit-head",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Accounting"],
    }),

    // GET CREDIT HEAD
    getAllDebitHeads: builder.query<
      DebitHeadResponse,
      { page?: number; limit?: number; search?: string }
    >({
      query: (params) => ({
        url: "/accounting/debit-head",
        method: "GET",
        params,
      }),
      providesTags: ["Accounting"],
    }),

    //get single credit head
    getSingleDebitHead: builder.query<DebitHeadByIdResponse, string>({
      query: (id) => ({ url: `/accounting/debit-head/${id}`, method: "GET" }),
      providesTags: ["Accounting"],
    }),

    //update credit head
    updateDebitHead: builder.mutation<
      DebitHeadResponse,
      { id: string; body: Partial<CreditHead> }
    >({
      query: ({ id, body }) => ({
        url: `/accounting/debit-head/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Accounting"],
    }),

    //delete credit head
    deleteDebitHead: builder.mutation<DebitHeadResponse, string>({
      query: (id) => ({
        url: `/accounting/debit-head/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Accounting"],
    }),

    //GET chart data

    getAccountingChartData: builder.query<ChartResponse, void>({
      query: () => ({ url: "/accounting/charts", method: "GET" }),
      providesTags: ["Accounting"],
    }),

    // GET PAYROLL
    getPayroll: builder.query<PayrollResponse, void>({
      query: () => ({ url: "/accounting/payroll", method: "GET" }),
      providesTags: ["Accounting"],
    }),

    // ADD PAYROLL
    addPayroll: builder.mutation<Payroll, Partial<Payroll>>({
      query: (body) => ({ url: "/accounting/payroll", method: "POST", body }),
      invalidatesTags: ["Accounting"],
    }),


    // ===================================================================================
    // New Endpoint of accounting 
    // ===================================================================================




    // ========================== CREDIT HEADS FOR SPECIFIC TYPES ==========================

    // create Income credit head
    createIncomeHead: builder.mutation<CreditHeadResponse, Partial<CreditHead>>({
      query: (body) => ({
        url: "/accounting/accounts/heads/income",
        method: "POST",
        body,
      }),
      invalidatesTags: ["incomeCreditHead", "AccountingAccounts"],
    }),

    // create Income credit head
    createExpanseHead: builder.mutation<ListResponse<CreditHead>, Partial<CreditHead>>({
      query: (body) => ({
        url: "/accounting/accounts/heads/expense",
        method: "POST",
        body,
      }),
      invalidatesTags: ["expenseCreditHead", "AccountingAccounts"],
    }),
    // ======================== GET Expanse head ===========================================================

    getExpenseHeads: builder.query<ListResponse<CreditHead>, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({
        url: "/accounting/accounts/heads/expense",
        method: "GET",
        params,
      }),
      providesTags: ["expenseCreditHead"],
    }),

    // ================================ Accounts API ==================================================

    getAccountingAccounts: builder.query<ListResponse<ChartOfAccount>, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({ url: "/accounting/accounts", method: "GET", params }),
      providesTags: ["AccountingAccounts"],
    }),
    addAccountingAccount: builder.mutation<ListResponse<ChartOfAccount>, Partial<ChartOfAccount>>({
      query: (body) => ({ url: "/accounting/accounts", method: "POST", body }),
      invalidatesTags: ["AccountingAccounts"],
    }),

    // CREATE JOURNAL ENTRY
    addJournalEntry: builder.mutation<JournalReportResponse, { date: string; narration: string; entries: { accountId: string; debit: number; credit: number }[] }>({
      query: (body) => ({
        url: "/accounting/journal-entry",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Accounting", "AccountingAccounts"], // Assuming it affects accounts/overview
    }),

    // GET JOURNAL REPORT
    getJournalReport: builder.query<JournalReportResponse, { page?: number; limit?: number; search?: string; from?: string; to?: string }>({
      query: (params) => ({
        url: "/accounting/reports/journal",
        method: "GET",
        params,
      }),
      providesTags: ["Accounting"],
    }),

    // GET JOURNAL BY ID
    getJournalById: builder.query<JournalByIdResponse, string>({
      query: (id) => ({
        url: `/accounting/reports/journal/${id}`,
        method: "GET",
      }),
      providesTags: ["Accounting"],
    }),

    // GET TRIAL BALANCE
    getTrialBalance: builder.query<TrialBalanceResponse, { date?: string }>({
      query: (params) => ({
        url: "/accounting/reports/trial-balance",
        method: "GET",
        params,
      }),
      providesTags: ["Accounting"],
    }),

    // GET PROFIT & LOSS
    getProfitLoss: builder.query<ProfitLossResponse, { from?: string; to?: string }>({
      query: (params) => ({
        url: "/accounting/reports/profit-and-loss",
        method: "GET",
        params,
      }),
      providesTags: ["Accounting"],
    }),

    // GET BALANCE SHEET
    getBalanceSheet: builder.query<BalanceSheetResponse, { date?: string }>({
      query: (params) => ({
        url: "/accounting/reports/balance-sheet",
        method: "GET",
        params,
      }),
      providesTags: ["Accounting"],
    }),

    // GET PRODUCT PROFIT LOSS
    getProductProfitLoss: builder.query<ProductProfitLossResponse, { from?: string; to?: string }>({
      query: (params) => ({
        url: "/accounting/reports/product-profit-loss",
        method: "GET",
        params,
      }),
      providesTags: ["Accounting"],
    }),

    // GET LEDGER REPORT
    getLedgerReport: builder.query<LedgerReportResponse, { id: string; from?: string; to?: string }>({
      query: ({ id, ...params }) => ({
        url: `/accounting/reports/ledger/${id}`,
        method: "GET",
        params,
      }),
      providesTags: ["Accounting"],
    }),


    updateAccountingAccount: builder.mutation<ListResponse<ChartOfAccount>, { id: string; body: Partial<ChartOfAccount> }>({
      query: ({ id, body }) => ({
        url: `/accounting/accounts/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AccountingAccounts"],
    }),





    // GET TRANSACTIONS
    getTransactions: builder.query<ListResponse<Transaction>, { page?: number; limit?: number; search?: string; date?: string; startDate?: string; endDate?: string; type?: string }>({
      query: (params) => ({
        url: "/accounting/transactions",
        method: "GET",
        params,
      }),
      providesTags: ["Accounting"],
    }),

    // ADD TRANSACTION
    addTransaction: builder.mutation<ListResponse<Transaction>, CreateTransactionInput>({
      query: (body) => ({
        url: "/accounting/transactions",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Accounting"],
    }),






    // income expanse endpoint

    // ADD EXPENSE
    addExpenseHeadwise: builder.mutation<ExpenseResponse, Partial<Expense>>({
      query: (body) => ({ url: "/accounting/expenses/head-wise", method: "POST", body }),
      invalidatesTags: ["Accounting"],
    }),

    // GET INCOME VS EXPENSE TREND
    getIncomeExpenseTrend: builder.query<IncomeExpenseTrendResponse, { days: number }>({
      query: (params) => ({
        url: "/accounting/reports/income-expense-trend",
        method: "GET",
        params,
      }),
      providesTags: ["Accounting"],
    }),

    // GET TAX SUBMISSIONS
    getTaxSubmissions: builder.query<TaxSubmissionResponse, { page?: number; limit?: number; taxType?: string; status?: string }>({
      query: (params) => ({
        url: "/accounting/tax-submissions",
        method: "GET",
        params,
      }),
      providesTags: ["Accounting"],
    }),

    // ADD TAX SUBMISSION
    addTaxSubmission: builder.mutation<TaxSubmission, Partial<TaxSubmission>>({
      query: (body) => ({
        url: "/accounting/tax-submissions",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Accounting"],
    }),

    // SEED ACCOUNTING ACCOUNTS
    seedAccountingAccounts: builder.mutation<{ status: boolean; message: string; data: any }, void>({
      query: () => ({ url: "/accounting/accounts/seed", method: "POST" }),
      invalidatesTags: ["AccountingAccounts"],
    }),

    // UPDATE INCOME HEAD
    updateIncomeHead: builder.mutation<CreditHeadResponse, { id: string; body: Partial<CreditHead> }>({
      query: ({ id, body }) => ({
        url: `/accounting/accounts/heads/income/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["incomeCreditHead", "AccountingAccounts"],
    }),

    // DELETE INCOME HEAD
    deleteIncomeHead: builder.mutation<CreditHeadResponse, string>({
      query: (id) => ({
        url: `/accounting/accounts/heads/income/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["incomeCreditHead", "AccountingAccounts"],
    }),

    // UPDATE EXPENSE HEAD
    updateExpenseHead: builder.mutation<ListResponse<CreditHead>, { id: string; body: Partial<CreditHead> }>({
      query: ({ id, body }) => ({
        url: `/accounting/accounts/heads/expense/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["expenseCreditHead", "AccountingAccounts"],
    }),

    // DELETE EXPENSE HEAD
    deleteExpenseHead: builder.mutation<ListResponse<CreditHead>, string>({
      query: (id) => ({
        url: `/accounting/accounts/heads/expense/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["expenseCreditHead", "AccountingAccounts"],
    }),

    // GET CASH FLOW REPORT
    getCashFlow: builder.query<{ status: boolean; message: string; data: any }, { from?: string; to?: string }>({
      query: (params) => ({
        url: "/accounting/cash-flow",
        method: "GET",
        params,
      }),
      providesTags: ["Accounting"],
    }),

    // GET AGED RECEIVABLES
    getAgedReceivables: builder.query<{ status: boolean; message: string; data: any }, { days?: number }>({
      query: (params) => ({
        url: "/accounting/aged-receivables",
        method: "GET",
        params,
      }),
      providesTags: ["Accounting"],
    }),

    // GET AGED PAYABLES
    getAgedPayables: builder.query<{ status: boolean; message: string; data: any }, { days?: number }>({
      query: (params) => ({
        url: "/accounting/aged-payables",
        method: "GET",
        params,
      }),
      providesTags: ["Accounting"],
    }),





  }),





});

export const {
  useGetAccountingOverviewQuery,
  useGetRecentActivityQuery,
  useGetExpenseBreakdownQuery,
  useGetIncomesQuery,
  useAddIncomeMutation,
  useGetExpensesQuery,
  useAddExpenseMutation,
  useAddCreditHeadMutation,
  useGetAllCreditHeadsQuery,
  useGetIncomeHeadsQuery,
  useGetSingleCreditHeadQuery,
  useUpdateCreditHeadMutation,
  useDeleteCreditHeadMutation,
  useAddDebitHeadMutation,
  useGetAllDebitHeadsQuery,
  useGetSingleDebitHeadQuery,
  useUpdateDebitHeadMutation,
  useDeleteDebitHeadMutation,
  useGetAccountingChartDataQuery,
  useGetPayrollQuery,
  useAddPayrollMutation,
  //  newly added hooks
  useCreateIncomeHeadMutation,
  useCreateExpanseHeadMutation,
  useGetAccountingAccountsQuery,
  useLazyGetAccountingAccountsQuery,
  useAddAccountingAccountMutation,
  useUpdateAccountingAccountMutation,
  useAddJournalEntryMutation,
  useGetJournalReportQuery,
  useGetJournalByIdQuery,
  useGetTransactionsQuery,
  useAddTransactionMutation,
  useGetTrialBalanceQuery,
  useGetProfitLossQuery,
  useGetBalanceSheetQuery,
  useGetProductProfitLossQuery,
  useGetExpenseHeadsQuery,
  useAddExpenseHeadwiseMutation,
  useGetLedgerReportQuery,
  useGetIncomeExpenseTrendQuery,
  useGetTaxSubmissionsQuery,
  useAddTaxSubmissionMutation,
  useSeedAccountingAccountsMutation,
  // Additional hooks
  useUpdateIncomeHeadMutation,
  useDeleteIncomeHeadMutation,
  useUpdateExpenseHeadMutation,
  useDeleteExpenseHeadMutation,
  useGetCashFlowQuery,
  useGetAgedReceivablesQuery,
  useGetAgedPayablesQuery,
} = accountingApiService;
