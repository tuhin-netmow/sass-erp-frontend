"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Printer } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { useGetProfitLossQuery } from "@/store/features/app/accounting/accoutntingApiService";

export default function ProfitAndLoss() {
    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: new Date(),
        to: new Date(),
    });

    const { data: reportData, isLoading } = useGetProfitLossQuery(
        {
            from: dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
            to: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined
        }
    );

    const incomeData = reportData?.data?.income || [];
    const expenseData = reportData?.data?.expense || [];
    const totalIncome = reportData?.data?.totalIncome || 0;
    const totalExpense = reportData?.data?.totalExpense || 0;
    const netProfit = reportData?.data?.netProfit || 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Profit & Loss</h2>
                    <p className="text-muted-foreground">Income Statement (Revenue vs Expense).</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => window.print()}
                        className="flex items-center gap-2"
                    >
                        <Printer className="h-4 w-4" />
                        Print
                    </Button>
                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[140px] justify-start text-left font-normal",
                                        !dateRange.from && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange.from ? format(dateRange.from, "PP") : <span>From Date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    mode="single"
                                    selected={dateRange.from}
                                    onSelect={(d) => setDateRange(prev => ({ ...prev, from: d }))}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <span className="text-muted-foreground">-</span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[140px] justify-start text-left font-normal",
                                        !dateRange.to && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange.to ? format(dateRange.to, "PP") : <span>To Date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    mode="single"
                                    selected={dateRange.to}
                                    onSelect={(d) => setDateRange(prev => ({ ...prev, to: d }))}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>

            {/* Print Only Header */}
            <div className="hidden print:block text-center mb-[15px] pb-1">
                <h1 className="text-4xl font-extrabold uppercase tracking-tight">PROFIT & LOSS STATEMENT</h1>
                <div className="mt-1 text-sm text-gray-700 font-semibold">
                    {dateRange.from ? (
                        <>
                            <span>From: {format(dateRange.from, 'd MMMM yyyy')}</span>
                            {dateRange.to && <span> - To: {format(dateRange.to, 'd MMMM yyyy')}</span>}
                        </>
                    ) : (
                        <span>Report Generated On: {format(new Date(), 'd MMMM yyyy')}</span>
                    )}
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* INCOME COLUMN */}
                <Card className="border-emerald-200 bg-emerald-50/10 py-6">
                    <CardHeader>
                        <CardTitle className="text-emerald-700">Income</CardTitle>
                        <CardDescription>Revenue generated during the period</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? (
                            <div className="space-y-2">
                                <div className="h-4 w-3/4 bg-emerald-100 animate-pulse rounded" />
                                <div className="h-4 w-1/2 bg-emerald-100 animate-pulse rounded" />
                            </div>
                        ) : incomeData.length > 0 ? (
                            incomeData.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                    <span>{item.name} <span className="text-muted-foreground text-xs">({item.code})</span></span>
                                    <span className="font-medium">{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-muted-foreground italic">No income recorded.</div>
                        )}
                        <Separator className="bg-emerald-200" />
                        <div className="flex justify-between items-center text-lg font-bold text-emerald-800">
                            <span>Total Income</span>
                            <span>{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* EXPENSE COLUMN */}
                <Card className="border-red-200 bg-red-50/10 py-6">
                    <CardHeader>
                        <CardTitle className="text-red-700">Expenses</CardTitle>
                        <CardDescription>Costs incurred during the period</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? (
                            <div className="space-y-2">
                                <div className="h-4 w-3/4 bg-red-100 animate-pulse rounded" />
                                <div className="h-4 w-1/2 bg-red-100 animate-pulse rounded" />
                            </div>
                        ) : expenseData.length > 0 ? (
                            expenseData.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                    <span>{item.name} <span className="text-muted-foreground text-xs">({item.code})</span></span>
                                    <span className="font-medium">{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-muted-foreground italic">No expenses recorded.</div>
                        )}
                        <Separator className="bg-red-200" />
                        <div className="flex justify-between items-center text-lg font-bold text-red-800">
                            <span>Total Expense</span>
                            <span>{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* NET PROFIT SUMMARY */}
            <Card className={cn("border-2", netProfit >= 0 ? "border-emerald-500 bg-emerald-50" : "border-red-500 bg-red-50")}>
                <CardContent className="p-8 text-center space-y-2">
                    <h3 className="text-lg font-medium text-muted-foreground uppercase tracking-widest">
                        {netProfit >= 0 ? "Net Profit" : "Net Loss"}
                    </h3>
                    <div className={cn("text-5xl font-extrabold", netProfit >= 0 ? "text-emerald-600" : "text-red-600")}>
                        {isLoading ? "..." : netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-sm text-muted-foreground pt-2">
                        Total Income ({totalIncome.toLocaleString()}) - Total Expense ({totalExpense.toLocaleString()})
                    </p>
                </CardContent>
            </Card>

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
                    .border, .border-2 {
                        border: 1px solid #eee !important;
                    }
                    .shadow-lg, .shadow-md, .shadow-sm {
                        box-shadow: none !important;
                    }
                    /* Layout optimization for two-column on paper if possible, or stacked */
                    .grid.md\\:grid-cols-2 {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr !important;
                        gap: 10px !important;
                    }
                    .py-6 {
                        padding-top: 10px !important;
                        padding-bottom: 10px !important;
                    }
                    .p-8 {
                        padding: 15px !important;
                    }
                    .text-5xl {
                        font-size: 24px !important;
                    }
                    .text-lg {
                        font-size: 11px !important;
                    }
                    .text-sm {
                        font-size: 9px !important;
                    }
                    /* Aggressively remove unnecessary gaps */
                    .mb-8, .mb-6, .mt-8 {
                        margin-bottom: 5px !important;
                        margin-top: 5px !important;
                    }
                    /* Ensure heading section has exactly 15px margin */
                    .hidden.print\\:block.mb-\\[15px\\] {
                        margin-bottom: 15px !important;
                    }
                }
            `}} />
        </div>
    );
}
