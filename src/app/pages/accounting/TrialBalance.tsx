"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, CheckCircle2, AlertCircle, Printer } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { useGetTrialBalanceQuery } from "@/store/features/app/accounting/accoutntingApiService";

export default function TrialBalance() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const formattedDate = date ? format(date, "yyyy-MM-dd") : undefined;

    const { data: reportData, isLoading } = useGetTrialBalanceQuery(
        { date: formattedDate },
        { skip: !formattedDate }
    );

    const trialBalanceData = reportData?.data?.trialBalance || [];
    const totalDebit = reportData?.data?.totalDebit || 0;
    const totalCredit = reportData?.data?.totalCredit || 0;
    const status = reportData?.data?.status || "UNBALANCED";
    const isBalanced = status === "BALANCED";

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Trial Balance</h2>
                    <p className="text-muted-foreground">Summary of all ledger account balances.</p>
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
                        <span className="text-sm font-medium">As of:</span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[240px] justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>

            {/* Print Only Header */}
            <div className="hidden print:block text-center mb-[15px] pb-1">
                <h1 className="text-4xl font-extrabold uppercase tracking-tight">TRIAL BALANCE</h1>
                <div className="mt-1 text-sm text-gray-700 font-semibold">
                    {date ? (
                        <span>As of: {format(date, 'd MMMM yyyy')}</span>
                    ) : (
                        <span>Report Generated On: {format(new Date(), 'd MMMM yyyy')}</span>
                    )}
                </div>
            </div>

            <Card className="py-6">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Account Balances</CardTitle>
                    {isLoading ? (
                        <div className="h-6 w-24 bg-gray-200 animate-pulse rounded" />
                    ) : isBalanced ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700">
                            <CheckCircle2 className="w-3 h-3 mr-1 print:hidden" /> BALANCED
                        </Badge>
                    ) : (
                        <Badge variant="destructive">
                            <AlertCircle className="w-3 h-3 mr-1 print:hidden" /> UNBALANCED
                        </Badge>
                    )}
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Code</TableHead>
                                <TableHead>Account Name</TableHead>
                                <TableHead className="text-xs text-muted-foreground">Type</TableHead>
                                <TableHead className="text-right">Debit Balance</TableHead>
                                <TableHead className="text-right">Credit Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><div className="h-4 w-12 bg-gray-100 animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-32 bg-gray-100 animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-16 bg-gray-100 animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-full bg-gray-100 animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-full bg-gray-100 animate-pulse rounded" /></TableCell>
                                    </TableRow>
                                ))
                            ) : trialBalanceData.length > 0 ? (
                                trialBalanceData.map((row, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell className="font-mono text-xs text-muted-foreground">{row.code}</TableCell>
                                        <TableCell className="font-medium">{row.account}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    "border px-2.5 py-0.5 rounded-full font-semibold transition-colors",
                                                    (() => {
                                                        const t = (row.type || "").toUpperCase();
                                                        switch (t) {
                                                            case "ASSET": return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 shadow-xs shadow-blue-100";
                                                            case "LIABILITY": return "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200 shadow-xs shadow-orange-100";
                                                            case "EQUITY": return "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 shadow-xs shadow-purple-100";
                                                            case "INCOME": return "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200 shadow-xs shadow-emerald-100";
                                                            case "EXPENSE": return "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200 shadow-xs shadow-rose-100";
                                                            default: return "bg-gray-100 text-gray-800 border-gray-200";
                                                        }
                                                    })()
                                                )}
                                            >
                                                {row.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm">
                                            {row.debit > 0 ? row.debit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm">
                                            {row.credit > 0 ? row.credit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No data available for this date.
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && trialBalanceData.length > 0 && (
                                <TableRow className="bg-muted/50 font-bold text-base">
                                    <TableCell colSpan={3} className="text-right">Totals</TableCell>
                                    <TableCell className="text-right text-emerald-600 border-t-2 border-emerald-600">
                                        {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-right text-emerald-600 border-t-2 border-emerald-600">
                                        {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
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
                    html, body {
                        background: white !important;
                        overflow: visible !important;
                        height: auto !important;
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
                    /* Ensure table container has no top padding */
                    div:has(> table), .rounded-md.border {
                        margin-top: 0 !important;
                        padding-top: 0 !important;
                        border: none !important;
                    }
                    /* Footer styling for check */
                    .font-bold.text-base {
                        font-size: 10px !important;
                    }
                    .text-emerald-600 {
                        color: #059669 !important;
                    }
                }
            `}} />
        </div>
    );
}
