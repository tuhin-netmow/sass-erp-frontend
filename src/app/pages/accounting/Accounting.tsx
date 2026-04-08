"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Plus, Calendar, CalendarDays, CalendarRange, CalendarClock, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useAppSelector } from "@/store/store";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { useGetAccountingOverviewQuery, useGetRecentActivityQuery, useGetIncomeExpenseTrendQuery, useGetExpenseBreakdownQuery } from "@/store/features/app/accounting/accoutntingApiService";
import type { Overview, ExpenseBreakdown } from "@/shared/types/app/accounting.types";
import { useState } from "react";
import AddIncomeModal from "./AddIncomeModal";
import AddExpenseModal from "./AddExpenseModal";
// import { ACTIONS, MODULES } from "@/app/config/permissions";
// import { perm, usePermissions } from "@/shared/hooks/usePermissions";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];




export default function AccountingOverview() {
  // --- Permissions (uncomment to activate) ---
  // const { hasPermission, isAdmin } = usePermissions();
  // const canViewAccounting = isAdmin || hasPermission(perm(MODULES.ACCOUNTING, ACTIONS.VIEW));
  // const canCreateAccounting = isAdmin || hasPermission(perm(MODULES.ACCOUNTING, ACTIONS.CREATE));
  // const canEditAccounting = isAdmin || hasPermission(perm(MODULES.ACCOUNTING, ACTIONS.UPDATE));
  // const canDeleteAccounting = isAdmin || hasPermission(perm(MODULES.ACCOUNTING, ACTIONS.DELETE));

  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const { data: accountingOverview } = useGetAccountingOverviewQuery();
  const { data: recentActivityData } = useGetRecentActivityQuery();

  const now = new Date();
  const { data: expenseBreakdownResponse, isLoading: isLoadingBreakdown } = useGetExpenseBreakdownQuery({
    from: format(startOfMonth(now), "yyyy-MM-dd"),
    to: format(endOfMonth(now), "yyyy-MM-dd")
  });

  const summaryData = accountingOverview?.data;
  const recentActivity = recentActivityData?.data || [];
  const expenseBreakdownData = expenseBreakdownResponse?.data || [];


  const periods: (keyof Overview)[] = ["today", "thisWeek", "thisMonth", "thisYear"];

  const currency = useAppSelector((state) => state.currency.value);

  const { data: trendResponse, isLoading: isLoadingTrend } = useGetIncomeExpenseTrendQuery({ days: 30 });
  const chartTrendData = trendResponse?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold">Accounting Overview</h2>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setIsAddIncomeModalOpen(true)}
            className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" /> Add Income
          </Button>

          <Button
            onClick={() => setIsAddExpenseModalOpen(true)}
            className="gap-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white shadow-lg shadow-rose-500/20"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {summaryData &&
          periods.map((period) => {
            const data = summaryData[period] || { income: 0, expense: 0, net: 0 };
            const periodLabel =
              period === "today"
                ? "Today"
                : period === "thisWeek"
                  ? "This Week"
                  : period === "thisMonth"
                    ? "This Month"
                    : "This Year";

            const income = Number(data.income) || 0;
            const expense = Number(data.expense) || 0;

            let incomePercent = 0;
            let expensePercent = 0;

            if (income === 0 && expense === 0) {
              incomePercent = 0;
              expensePercent = 0;
            } else if (income > 0 && expense === 0) {
              incomePercent = 100;
              expensePercent = 0;
            } else if (expense > 0 && income === 0) {
              incomePercent = 0;
              expensePercent = 100;
            } else {
              const total = income + expense;
              incomePercent = Math.round((income / total) * 100);
              expensePercent = 100 - incomePercent; // GUARANTEED consistency
            }

            const netProfit = data.net || 0;

            // Assign gradient & icon based on period
            let gradientStr = "";
            let shadowStr = "";
            let IconComp = null;

            if (period === "today") {
              gradientStr = "from-blue-600 to-blue-400";
              shadowStr = "shadow-blue-500/30";
              IconComp = <Calendar className="w-6 h-6 text-white" />;
            } else if (period === "thisWeek") {
              gradientStr = "from-emerald-600 to-emerald-400";
              shadowStr = "shadow-emerald-500/30";
              IconComp = <CalendarDays className="w-6 h-6 text-white" />;
            } else if (period === "thisMonth") {
              gradientStr = "from-amber-600 to-amber-400";
              shadowStr = "shadow-amber-500/30";
              IconComp = <CalendarRange className="w-6 h-6 text-white" />;
            } else { // thisYear
              gradientStr = "from-violet-600 to-violet-400";
              shadowStr = "shadow-violet-500/30";
              IconComp = <CalendarClock className="w-6 h-6 text-white" />;
            }


            return (
              <div
                key={period}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradientStr} p-6 shadow-lg ${shadowStr} transition-all duration-300 hover:scale-[1.02] hover:translate-y-[-2px]`}
              >
                {/* Background Pattern */}
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-black/10 blur-2xl" />

                <div className="relative flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-white/90 uppercase tracking-widest">{periodLabel}</p>
                    <h3 className="mt-2 text-2xl font-bold text-white">
                      Net: {currency} {netProfit.toLocaleString()}.00
                    </h3>
                  </div>
                  <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm">
                    {IconComp}
                  </div>
                </div>

                <div className="relative space-y-2">
                  <div className="flex justify-between text-white/90 text-sm">
                    <span>Income</span>
                    <span className="font-semibold">{currency} {data.income.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-black/20 rounded-full h-1.5 mb-1">
                    <div className="bg-white/80 h-1.5 rounded-full" style={{ width: `${incomePercent}%` }}></div>
                  </div>

                  <div className="flex justify-between text-white/90 text-sm pt-1">
                    <span>Expense</span>
                    <span className="font-semibold">{currency} {data.expense.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-black/20 rounded-full h-1.5">
                    <div className="bg-white/40 h-1.5 rounded-full" style={{ width: `${expensePercent}%` }}></div>
                  </div>
                </div>

              </div>
            );
          })}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Trend Chart (Bar/Line) */}
        <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border-b-1 border-blue-100 dark:border-blue-900 py-3 gap-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Income vs Expense Trend</CardTitle>
                <CardDescription>For Last 30 Days</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-6 pt-4">
            <div className="h-[300px]">
              {isLoadingTrend ? (
                <div className="h-full flex items-center justify-center">
                  <Skeleton className="h-[250px] w-full bg-slate-100" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartTrendData}>
                    <XAxis
                      dataKey="date"
                      fontSize={10}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
                      }}
                    />
                    <YAxis fontSize={10} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      labelFormatter={(label) => new Date(label).toDateString()}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 'bold' }} />
                    <Bar dataKey="income" fill="#22c55e" name="Income" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown Pie Chart */}
        <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-orange-200 hover:shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 dark:from-orange-950/30 dark:via-amber-950/30 dark:to-orange-950/30 border-b-1 border-orange-100 dark:border-orange-900 py-3 gap-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg shadow-orange-500/30">
                <CalendarRange className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Expense Breakdown</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-6 pt-4">
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                {isLoadingBreakdown ? (
                  <div className="h-full flex items-center justify-center">
                    <Skeleton className="h-[200px] w-[200px] rounded-full bg-slate-100" />
                  </div>
                ) : (
                  <PieChart>
                    <Pie
                      data={expenseBreakdownData as ExpenseBreakdown[]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {expenseBreakdownData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-lg py-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => {
              const IsIncome = activity.amount.trim().startsWith("+");
              return (
                <div key={idx} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${IsIncome ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {IsIncome ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.date}</p>
                    </div>
                  </div>
                  <div className={`font-semibold ${IsIncome ? 'text-emerald-600' : 'text-red-600'}`}>
                    {activity.amount}
                  </div>
                </div>
              );
            })}

          </div>
        </CardContent>
      </Card>

      {/* Add Income Modal */}
      <AddIncomeModal
        open={isAddIncomeModalOpen}
        onOpenChange={setIsAddIncomeModalOpen}
      />

      {/* Add Expense Modal */}
      <AddExpenseModal
        open={isAddExpenseModalOpen}
        onOpenChange={setIsAddExpenseModalOpen}
      />
    </div>
  );
}
