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
import { useGetBalanceSheetQuery } from "@/store/features/app/accounting/accoutntingApiService";

export default function BalanceSheet() {
    const [asOfDate, setAsOfDate] = useState<Date>(new Date());

    const { data: reportData, isLoading } = useGetBalanceSheetQuery(
        {
            date: asOfDate ? format(asOfDate, "yyyy-MM-dd") : undefined
        }
    );

    const assets = reportData?.data?.assets || [];
    const liabilities = reportData?.data?.liabilities || [];
    const equity = reportData?.data?.equity || [];

    const totalAssets = reportData?.data?.totalAssets || 0;
    const totalLiabilities = reportData?.data?.totalLiabilities || 0;
    const totalEquity = reportData?.data?.totalEquity || 0;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 print:m-0 print:p-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print print:hidden">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Balance Sheet</h2>
                    <p className="text-muted-foreground">Statement of Financial Position as of {format(asOfDate, "PP")}.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[200px] justify-start text-left font-normal",
                                    !asOfDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {asOfDate ? format(asOfDate, "PP") : <span>As of Date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={asOfDate}
                                onSelect={(d) => d && setAsOfDate(d)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                </div>
            </div>

            {/* Print Only Header */}
            <div className="hidden print:block text-center mb-[15px] pb-1">
                <h1 className="text-4xl font-extrabold uppercase tracking-tight">BALANCE SHEET</h1>
                <div className="mt-1 text-sm text-gray-700 font-semibold">
                    <span>As of: {format(asOfDate, 'd MMMM yyyy')}</span>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* ASSETS COLUMN */}
                <Card className="border-blue-200 bg-blue-50/10 py-6 h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-blue-700">Assets</CardTitle>
                        <CardDescription>What the company owns</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow">
                        {isLoading ? (
                            <div className="space-y-2">
                                <div className="h-4 w-3/4 bg-blue-100 animate-pulse rounded" />
                                <div className="h-4 w-1/2 bg-blue-100 animate-pulse rounded" />
                            </div>
                        ) : assets.length > 0 ? (
                            assets.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                    <span>{item.name} <span className="text-muted-foreground text-xs">({item.code})</span></span>
                                    <span className="font-medium">{item.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-muted-foreground italic text-center py-4">No assets recorded.</div>
                        )}
                    </CardContent>
                    <div className="px-6 pt-0 mt-auto">
                        <Separator className="bg-blue-200 mb-4" />
                        <div className="flex justify-between items-center text-lg font-bold text-blue-800">
                            <span>Total Assets</span>
                            <span>{totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </Card>

                {/* LIABILITIES COLUMN */}
                <Card className="border-amber-200 bg-amber-50/10 py-6 h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-amber-700">Liabilities</CardTitle>
                        <CardDescription>What the company owes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow">
                        {isLoading ? (
                            <div className="space-y-2">
                                <div className="h-4 w-3/4 bg-amber-100 animate-pulse rounded" />
                                <div className="h-4 w-1/2 bg-amber-100 animate-pulse rounded" />
                            </div>
                        ) : liabilities.length > 0 ? (
                            liabilities.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                    <span>{item.name} <span className="text-muted-foreground text-xs">({item.code})</span></span>
                                    <span className="font-medium">{item.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-muted-foreground italic text-center py-4">No liabilities recorded.</div>
                        )}
                    </CardContent>
                    <div className="px-6 pt-0 mt-auto">
                        <Separator className="bg-amber-200 mb-4" />
                        <div className="flex justify-between items-center text-lg font-bold text-amber-800">
                            <span>Total Liabilities</span>
                            <span>{totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </Card>

                {/* EQUITY COLUMN */}
                <Card className="border-emerald-200 bg-emerald-50/10 py-6 h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-emerald-700">Equity</CardTitle>
                        <CardDescription>Owner's interest in the company</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow">
                        {isLoading ? (
                            <div className="space-y-2">
                                <div className="h-4 w-3/4 bg-emerald-100 animate-pulse rounded" />
                                <div className="h-4 w-1/2 bg-emerald-100 animate-pulse rounded" />
                            </div>
                        ) : equity.length > 0 ? (
                            equity.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                    <span>{item.name} {item.code !== 'RE' && <span className="text-muted-foreground text-xs">({item.code})</span>}</span>
                                    <span className="font-medium">{item.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-muted-foreground italic text-center py-4">No equity recorded.</div>
                        )}
                    </CardContent>
                    <div className="px-6 pt-0 mt-auto">
                        <Separator className="bg-emerald-200 mb-4" />
                        <div className="flex justify-between items-center text-lg font-bold text-emerald-800">
                            <span>Total Equity</span>
                            <span>{totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* BALANCE SUMMARY */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
                <Card className="border-2 border-blue-600 bg-blue-50">
                    <CardContent className="p-8 text-center space-y-2">
                        <h3 className="text-lg font-medium text-blue-800 uppercase tracking-widest">Total Assets</h3>
                        <div className="text-5xl font-extrabold text-blue-600">
                            {isLoading ? "..." : totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </CardContent>
                </Card>

                <Card className={cn("border-2", Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1 ? "border-emerald-600 bg-emerald-50" : "border-red-600 bg-red-50")}>
                    <CardContent className="p-8 text-center space-y-2">
                        <h3 className="text-lg font-medium text-muted-foreground uppercase tracking-widest">Total Liabilities & Equity</h3>
                        <div className={cn("text-5xl font-extrabold", Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1 ? "text-emerald-600" : "text-red-600")}>
                            {isLoading ? "..." : (totalLiabilities + totalEquity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {!isLoading && Math.abs(totalAssets - (totalLiabilities + totalEquity)) >= 1 && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center font-bold" role="alert">
                    Warning: Balance Sheet is not balanced! Difference: {(totalAssets - (totalLiabilities + totalEquity)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
            )}

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
                    /* Grid adjustments for print */
                    .grid.lg\\:grid-cols-3 {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr 1fr !important;
                        gap: 10px !important;
                    }
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
                    .text-xs {
                        font-size: 7px !important;
                    }
                    /* Aggressively remove unnecessary gaps */
                    .mb-8, .mb-6, .mt-8, .mb-4 {
                        margin-bottom: 5px !important;
                        margin-top: 5px !important;
                    }
                    /* Ensure heading section has exactly 15px margin */
                    .hidden.print\\:block.mb-\\[15px\\] {
                        margin-bottom: 15px !important;
                    }
                    .px-6 {
                        padding-left: 10px !important;
                        padding-right: 10px !important;
                    }
                }
            `}} />
        </div>
    );
}
