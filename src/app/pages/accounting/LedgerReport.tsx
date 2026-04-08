"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import { format } from "date-fns";
import { Button } from "@/shared/components/ui/button";
import { DateRangePicker } from "@/shared/components/ui/date-range-picker";
import type { DateRange } from "react-day-picker";
import {
    useGetAccountingAccountsQuery,
    useGetLedgerReportQuery
} from "@/store/features/app/accounting/accoutntingApiService";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { toast } from "sonner";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Check, ChevronDown, CornerDownRight, ArrowUpRight, ArrowDownLeft, Calendar as CalendarIcon, Printer } from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/shared/components/ui/command";
import { cn } from "@/shared/utils/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
// Dummy Data removed

export default function LedgerReport() {
    const [searchParams] = useSearchParams();
    const initialAccountId = searchParams.get("accountId") || "";

    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [openAccount, setOpenAccount] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState<string>(initialAccountId);


    // State for API params
    const [queryParams, setQueryParams] = useState<{ id: string; from?: string; to?: string } | null>(null);

    const { data: accountsData } = useGetAccountingAccountsQuery({ limit: 1000 });
    const accounts = accountsData?.data || [];

    // Ledger Query
    const { data: reportResponse, isLoading: isReportLoading } = useGetLedgerReportQuery(
        queryParams!,
        { skip: !queryParams }
    );

    const reportData = reportResponse?.data;
    const transactions = reportData?.transactions || [];

    const selectedAccount = accounts.find(acc => acc._id === selectedAccountId);

    const handleGenerateReport = () => {
        if (!selectedAccountId) {
            toast.error("Please select an account first");
            return;
        }
        setQueryParams({
            id: selectedAccountId,
            from: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
            to: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
        });
    };

    // Auto-generate if accountId is in URL
    useEffect(() => {
        if (initialAccountId) {
            setSelectedAccountId(initialAccountId);
            setQueryParams({
                id: initialAccountId,
                from: undefined,
                to: undefined,
            });
        }
    }, [initialAccountId]);


    // Calculate totals
    const totalDebit = transactions.reduce((sum, tx) => sum + Number(tx.debit || 0), 0);
    const totalCredit = transactions.reduce((sum, tx) => sum + Number(tx.credit || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Ledger Report</h2>
                    <p className="text-muted-foreground">View detailed transaction history for a specific account.</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => window.print()}
                    className="flex items-center gap-2"
                >
                    <Printer className="h-4 w-4" />
                    Print
                </Button>
            </div>

            {/* Print Only Header */}
            <div className="hidden print:block text-center mb-[15px] pb-1">
                <h1 className="text-4xl font-extrabold uppercase tracking-tight">LEDGER REPORT</h1>
                <div className="mt-1 text-sm text-gray-700 font-semibold">
                    <div className="text-lg mb-1">{selectedAccount ? `ACCOUNT: ${selectedAccount.name} (${selectedAccount.code})` : "ACCOUNT: ALL"}</div>
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

            <Card className="print:hidden">
                <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-sm font-medium inline-block">Select Account</label>
                            <Popover open={openAccount} onOpenChange={setOpenAccount}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openAccount}
                                        className="w-full justify-between font-normal"
                                    >
                                        {selectedAccount ? selectedAccount.name : "Select account..."}
                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder="Search account..." className="h-9" />
                                        <CommandList className="max-h-[300px] overflow-y-auto">
                                            <CommandEmpty>No account found.</CommandEmpty>
                                            <CommandGroup>
                                                {accounts.map((acc) => {
                                                    const level = acc.level || 0;
                                                    return (
                                                        <CommandItem
                                                            key={acc._id}
                                                            value={`${acc.name}-${acc._id}`}
                                                            onSelect={() => {
                                                                setSelectedAccountId(acc._id);
                                                                setOpenAccount(false);
                                                            }}
                                                            className="flex items-center gap-2"
                                                            style={{ paddingLeft: `${level === 0 ? 12 : (level * 20) + 12}px` }}
                                                        >
                                                            <div className="flex items-center flex-1 gap-1">
                                                                {level > 0 && (
                                                                    <CornerDownRight className="h-3 w-3 text-muted-foreground stroke-[1.5]" />
                                                                )}
                                                                <div className="flex flex-col">
                                                                    <span className={cn(
                                                                        level === 0 ? "font-semibold text-foreground" : "text-muted-foreground"
                                                                    )}>
                                                                        {acc.name}
                                                                    </span>
                                                                    <span className="text-[10px] text-muted-foreground/70">{acc.code}</span>
                                                                </div>
                                                            </div>
                                                            <Check
                                                                className={cn(
                                                                    "ml-auto h-4 w-4",
                                                                    selectedAccountId === acc._id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                        </CommandItem>
                                                    );
                                                })}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium inline-block">Date Range</label>
                            <DateRangePicker
                                dateRange={dateRange}
                                onDateRangeChange={setDateRange}
                                placeholder="Pick a date range"
                                className="w-full"
                                numberOfMonths={2}
                            />
                        </div>
                        <Button
                            variant="success"
                            onClick={handleGenerateReport}
                            disabled={isReportLoading}
                        >
                            {isReportLoading ? "Generating..." : "Generate Report"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:hidden">
                {/* Opening Balance */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 p-6 shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] hover:translate-y-[-2px]">
                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-white/90 uppercase tracking-widest">Opening Balance</p>
                            <h3 className="mt-2 text-2xl font-bold text-white">
                                {isReportLoading ? <Skeleton className="h-8 w-24 bg-white/20" /> : `RM ${Number(reportData?.openingBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm">
                            <CalendarIcon className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                {/* Total Debit */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-400 p-6 shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02] hover:translate-y-[-2px]">
                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-white/90 uppercase tracking-widest">Total Debit</p>
                            <h3 className="mt-2 text-2xl font-bold text-white">
                                {isReportLoading ? <Skeleton className="h-8 w-24 bg-white/20" /> : `RM ${totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm">
                            <ArrowUpRight className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                {/* Total Credit */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600 to-rose-400 p-6 shadow-lg shadow-rose-500/20 transition-all duration-300 hover:scale-[1.02] hover:translate-y-[-2px]">
                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-white/90 uppercase tracking-widest">Total Credit</p>
                            <h3 className="mt-2 text-2xl font-bold text-white">
                                {isReportLoading ? <Skeleton className="h-8 w-24 bg-white/20" /> : `RM ${totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm">
                            <ArrowDownLeft className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                {/* Closing Balance */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-violet-400 p-6 shadow-lg shadow-violet-500/20 transition-all duration-300 hover:scale-[1.02] hover:translate-y-[-2px]">
                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-white/90 uppercase tracking-widest">Closing Balance</p>
                            <h3 className="mt-2 text-2xl font-bold text-white">
                                {isReportLoading ? <Skeleton className="h-8 w-24 bg-white/20" /> : `RM ${Number(reportData?.closingBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm">
                            <CornerDownRight className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            <Card className="py-6">
                <CardHeader>
                    <CardTitle>Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Particulars</TableHead>
                                <TableHead className="text-right text-emerald-600">Debit (RM)</TableHead>
                                <TableHead className="text-right text-red-600">Credit (RM)</TableHead>
                                <TableHead className="text-right font-bold">Balance (RM)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isReportLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic">
                                        {queryParams ? "No transactions found for the selected criteria." : "Select an account and click generate."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((row, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{row.date}</TableCell>
                                        <TableCell>{row.narration}</TableCell>
                                        <TableCell className="text-right">
                                            {Number(row.debit) > 0 ? Number(row.debit).toFixed(2) : "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {Number(row.credit) > 0 ? Number(row.credit).toFixed(2) : "-"}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {Number(row.balance).toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))
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
                    .text-4xl {
                        font-size: 18px !important;
                        margin-bottom: 4px !important;
                        line-height: 1 !important;
                    }
                    .text-4xl + div {
                        line-height: 1 !important;
                        margin-top: 2px !important;
                    }
                    .text-lg {
                        font-size: 14px !important;
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
                }
            `}} />
        </div>
    );
}
