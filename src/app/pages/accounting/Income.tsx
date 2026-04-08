/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { DataTable } from "@/app/components/dashboard/DataTable";

import { useGetIncomesQuery } from "@/store/features/app/accounting/accoutntingApiService";
import { useAppSelector } from "@/store/store";
import type { Income } from "@/shared/types/app/accounting.types";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, DollarSign, TrendingUp, CreditCard, Printer } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useState } from "react";
import { Link } from "react-router";
import { format } from "date-fns";
import { DateRangePicker } from "@/shared/components/ui/date-range-picker";
import type { DateRange } from "react-day-picker";

export default function IncomePage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [limit, setLimit] = useState(10);

  const {
    data: fetchedIncomes,
    isFetching,
    isError,
  } = useGetIncomesQuery({
    page,
    limit,
    search,
    from: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    to: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
  });

  const incomes: Income[] = fetchedIncomes?.data || [];
  const currency = useAppSelector((state) => state.currency.value);

  // Stats Data
  const { data: allIncomesData } = useGetIncomesQuery({
    limit: 1000,
    from: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    to: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
  });
  const allIncomes = allIncomesData?.data || [];

  const totalIncome = allIncomes.reduce((sum: number, item: Income) => sum + Number(item.amount), 0);
  const totalTransactions = allIncomes.length;
  const avgTransaction = totalTransactions > 0 ? totalIncome / totalTransactions : 0;

  const stats = [
    {
      label: "Total Income",
      value: `${currency} ${totalIncome.toLocaleString()}`,
      gradient: "from-blue-600 to-blue-400",
      shadow: "shadow-blue-500/30",
      icon: <DollarSign className="w-6 h-6 text-white" />,
    },
    {
      label: "Total Transactions",
      value: totalTransactions,
      gradient: "from-emerald-600 to-emerald-400",
      shadow: "shadow-emerald-500/30",
      icon: <TrendingUp className="w-6 h-6 text-white" />,
    },
    {
      label: "Avg. Transaction",
      value: `${currency} ${avgTransaction.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      gradient: "from-violet-600 to-violet-400",
      shadow: "shadow-violet-500/30",
      icon: <CreditCard className="w-6 h-6 text-white" />,
    },
  ];

  const incomeColumns: ColumnDef<Income>[] = [
    {
      accessorKey: "publicId",
      header: "ID",
      meta: { className: "md:sticky md:left-0 z-20 bg-background min-w-[120px]" } as any,
      cell: ({ row }: { row: any }) => <span className="font-medium text-blue-700">{(row.original as any).publicId || row.original._id}</span>,
    },
    {
      accessorKey: "creditHead",
      header: "Credit Head",
      cell: ({ row }: { row: any }) => {
        const creditHead = row?.original?.creditHead?.name;
        return <span className="font-medium">{creditHead}</span>;
      },
    },
    { accessorKey: "incomeDate", header: "Date" },
    { accessorKey: "paymentMethod", header: "Payment Method" },
    { accessorKey: "referenceNumber", header: "Reference" },
    {
      accessorKey: "title",
      header: "Title",
    },
    { accessorKey: "description", header: "Description" },
    {
      accessorKey: "amount",
      header: () => (
        <div className="text-right">Amount ({currency})</div>
      ),
      cell: ({ row }: { row: any }) => (
        <div className="text-right font-bold text-gray-900">{Number(row.getValue("amount")).toFixed(2)}</div>
      ),
    },
  ];

  if (isError) return <p>Error loading incomes</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-2xl font-bold">All Income</h2>

        <div className="flex gap-2 items-center">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={(range: DateRange | undefined) => {
              setDateRange(range);
              setPage(1);
            }}
          />
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Link to={"/dashboard/accounting/add-income"}>
            <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-blue-500/40 active:translate-y-0 active:shadow-none">
              <Plus size={18} /> Add Income
            </button>
          </Link>
        </div>
      </div>

      {/* Print Only Header */}
      <div className="hidden print:block text-center mb-[15px] pb-1">
        <h1 className="text-4xl font-extrabold uppercase tracking-tight">INCOMELIST</h1>
        <div className="mt-1 text-sm text-gray-700 font-semibold">
          {dateRange?.from ? (
            <>
              <span>From: {format(dateRange.from, 'd MMMM yyyy')}</span>
              {dateRange.to && <span> - To: {format(dateRange.to, 'd MMMM yyyy')}</span>}
            </>
          ) : (
            <span>Report Generated On: {format(new Date(), 'd MMMM yyyy')}</span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 print:hidden">
        {stats.map((item, idx) => (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${item.gradient} p-6 shadow-lg ${item.shadow} transition-all duration-300 hover:scale-[1.02] hover:translate-y-[-2px]`}
          >
            {/* Background Pattern */}
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-black/10 blur-2xl" />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white/90">{item.label}</p>
                <h3 className="mt-2 text-3xl font-bold text-white">
                  {item.value}
                </h3>
              </div>
              <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm">
                {item.icon}
              </div>
            </div>

            {/* Progress/Indicator line (optional visual flair) */}
            <div className="mt-4 h-1 w-full rounded-full bg-black/10">
              <div className="h-full w-2/3 rounded-full bg-white/40" />
            </div>
          </div>
        ))}
      </div>
      <DataTable
        columns={incomeColumns}
        data={incomes}
        pageIndex={page - 1}
        pageSize={limit}
        totalCount={fetchedIncomes?.pagination?.total || 0}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setLimit(size);
          setPage(1);
        }}
        onSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
        isFetching={isFetching}
      />

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
                @media print {
                    .no-print, 
                    header, 
                    nav, 
                    aside, 
                    button,
                    .print\\:hidden {
                        display: none !important;
                    }
                    .text-4xl {
                        font-size: 18px !important;
                        margin-bottom: 4px !important;
                        line-height: 1 !important;
                    }
                    .text-4xl + div {
                        line-height: 1 !important;
                        margin-top: 2px !important;
                    }
                    .border {
                        border: none !important;
                    }
                    .shadow-lg, .shadow-md, .shadow-sm {
                        box-shadow: none !important;
                    }
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }
                    th, td {
                        border-bottom: 1px solid #eee !important;
                        padding: 3px 6px !important;
                        font-size: 9px !important;
                    }
                    th {
                        line-height: 1.2 !important;
                        padding: 4px 6px !important;
                        text-transform: uppercase !important;
                    }
                    /* Hide Title and Description columns when printing */
                    th:nth-child(6), td:nth-child(6),
                    th:nth-child(7), td:nth-child(7) {
                        display: none !important;
                    }
                    /* Aggressively remove unnecessary gaps but keep requested heading margin */
                    .mb-8, .mb-6, .pb-2, .pb-4 {
                        margin-bottom: 0 !important;
                        padding-bottom: 0 !important;
                    }
                    .mt-2, .mt-1 {
                        margin-top: 0 !important;
                    }
                    /* Ensure heading section has exactly 15px margin */
                    .hidden.print\\:block.mb-\\[15px\\] {
                        margin-bottom: 15px !important;
                    }
                    /* Hide search input in DataTable when printing */
                    [placeholder="Search..."], 
                    .flex.items-center.justify-between.py-4,
                    .py-6, .mb-6 {
                        display: none !important;
                    }
                    /* Ensure table container has no top padding */
                    div:has(> table), .rounded-md.border {
                        margin-top: 0 !important;
                        padding-top: 0 !important;
                        border: none !important;
                    }
                }
            `}} />
    </div>
  );
}
