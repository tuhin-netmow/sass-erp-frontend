"use client";

import { useState } from "react";
import { Star, Search as SearchIcon, FileText, Calendar, Filter, Printer } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { DateRangePicker } from "@/shared/components/ui/date-range-picker";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { useGetProductProfitLossQuery } from "@/store/features/app/accounting/accoutntingApiService";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { toast } from "sonner";

export default function DailyProfitStatus() {
    const [searchQuery, setSearchQuery] = useState("");
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(),
        to: new Date()
    });

    // API Query Params
    const queryParams: { from?: string; to?: string } = {
        from: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        to: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    };

    const { data: reportResponse, isLoading, isError } = useGetProductProfitLossQuery(queryParams);

    if (isError) {
        toast.error("Failed to fetch profit status data.");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profitData: any[] = reportResponse?.data || [];

    const filteredData = profitData.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-[#f0f2f5] min-h-screen p-4 sm:p-8 font-sans text-[#333]">
            <div className="max-w-[1400px] mx-auto space-y-6">

                {/* Main Report Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden transition-all">

                    {/* Integrated Header & Action Bar */}
                    <div className="p-6 sm:p-8 bg-gradient-to-b from-white to-gray-50/30 border-b border-gray-100">
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-8">

                            {/* Title & Metadata */}
                            <div className="text-center lg:text-left space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                    <Star className="w-3 h-3 fill-blue-600 print:hidden" />
                                    Daily Profit Status
                                </div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Profit Status by Item</h1>
                                <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <span className="flex items-center gap-1.5">
                                        <FileText className="w-3.5 h-3.5 print:hidden" />
                                        F & Z Global Trade (M) Sdn Bhd
                                    </span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-200 print:hidden"></span>
                                    <span className="flex items-center gap-1.5 text-blue-600">
                                        <Calendar className="w-3.5 h-3.5 print:hidden" />
                                        {dateRange?.from ? format(dateRange.from, "dd MMM yyyy") : ""}
                                        {dateRange?.to ? ` — ${format(dateRange.to, "dd MMM yyyy")}` : ""}
                                    </span>
                                </div>
                            </div>

                            {/* Integrated Filters */}
                            <div className="flex flex-wrap justify-center items-center gap-3 w-full lg:w-auto bg-white p-2 rounded-xl shadow-inner border border-gray-100 print:hidden">
                                <Button
                                    variant="outline"
                                    onClick={() => window.print()}
                                    className="flex items-center gap-2 h-10 border-none shadow-none text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    Print
                                </Button>
                                <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>
                                <div className="relative group">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    <DateRangePicker
                                        dateRange={dateRange}
                                        onDateRangeChange={setDateRange}
                                        className="bg-transparent border-none shadow-none focus-visible:ring-0 h-10 pl-9 text-[11px] font-bold text-gray-700 w-[240px]"
                                    />
                                </div>
                                <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>
                                <div className="relative flex-grow sm:flex-grow-0 group">
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    <Input
                                        placeholder="Fast search by name or sku..."
                                        className="w-full sm:w-72 h-10 pl-10 text-xs border-transparent rounded-lg focus-visible:ring-0 bg-gray-50/50 hover:bg-gray-100 transition-all font-medium placeholder:text-gray-400"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Print Only Header */}
                    <div className="hidden print:block text-center mb-[15px] pb-1">
                        <h1 className="text-4xl font-extrabold uppercase tracking-tight">DAILY PROFIT STATUS</h1>
                        <div className="mt-1 text-sm text-gray-700 font-semibold">
                            {dateRange?.from ? (
                                <>
                                    <span>Period: {format(dateRange.from, 'd MMMM yyyy')}</span>
                                    {dateRange.to && <span> - {format(dateRange.to, 'd MMMM yyyy')}</span>}
                                </>
                            ) : (
                                <span>Report Generated On: {format(new Date(), 'd MMMM yyyy')}</span>
                            )}
                            <p className="text-[10px] mt-1 text-slate-500">F & Z Global Trade (M) Sdn Bhd</p>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#f8fafc] text-[10px] uppercase font-black tracking-widest text-gray-500 border-b border-gray-200">
                                    <th rowSpan={2} className="border-r border-gray-100 p-4 text-center w-[120px]">Item Code</th>
                                    <th rowSpan={2} className="border-r border-gray-100 p-4 text-left">Item Name [Spec]</th>
                                    <th colSpan={3} className="border-r border-gray-100 p-2 text-center bg-blue-50/30 text-blue-800">Sales Analytics</th>
                                    <th colSpan={2} className="border-r border-gray-100 p-2 text-center bg-orange-50/30 text-orange-800">Cost Value</th>
                                    <th colSpan={2} className="border-r border-gray-100 p-2 text-center bg-emerald-50/30 text-emerald-800">Net Profit</th>
                                    <th rowSpan={2} className="p-4 w-[100px] text-center">Performance</th>
                                </tr>
                                <tr className="bg-[#f8fafc] text-[9px] font-black uppercase text-gray-400 border-b border-gray-100">
                                    <th className="border-r border-gray-50 p-2 text-center w-[60px]">Qty</th>
                                    <th className="border-r border-gray-50 p-2 text-center w-[90px]">Price</th>
                                    <th className="border-r border-gray-50 p-2 text-center w-[110px]">Total</th>
                                    <th className="border-r border-gray-50 p-2 text-center w-[90px]">Price</th>
                                    <th className="border-r border-gray-50 p-2 text-center w-[110px]">Total</th>
                                    <th className="border-r border-gray-50 p-2 text-center w-[90px]">Price</th>
                                    <th className="border-r border-gray-50 p-2 text-center w-[110px]">Total</th>
                                </tr>
                            </thead>
                            <tbody className="text-[12px]">
                                {isLoading ? (
                                    Array.from({ length: 12 }).map((_, i) => (
                                        <tr key={i} className="border-b border-gray-50">
                                            <td colSpan={10} className="p-4">
                                                <Skeleton className="h-6 w-full bg-gray-50 rounded" />
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredData.length > 0 ? (
                                    filteredData.map((item, index) => (
                                        <tr key={index} className="border-b border-gray-50 hover:bg-blue-50/30 transition-all group">
                                            <td className="p-4 text-center font-mono text-gray-400 group-hover:text-blue-600 transition-colors border-r border-gray-50 whitespace-nowrap">{item.sku}</td>
                                            <td className="p-4 text-left font-bold text-gray-800 leading-tight border-r border-gray-50">
                                                <div className="flex flex-col">
                                                    <span>{item.name}</span>
                                                    {item.specification && (
                                                        <span className="text-[10px] font-medium text-gray-400 italic mt-0.5">
                                                            {item.specification}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right font-medium border-r border-gray-50 text-gray-600 whitespace-nowrap">{Number(item.qty).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="p-4 text-right text-blue-600 font-bold border-r border-gray-50 whitespace-nowrap">{Number(item.salesPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="p-4 text-right font-black text-gray-900 border-r border-gray-50 bg-blue-50/5 group-hover:bg-transparent whitespace-nowrap">{Number(item.salesAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="p-4 text-right text-orange-600 font-bold border-r border-gray-50 whitespace-nowrap">{Number(item.costPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="p-4 text-right font-medium text-gray-500 border-r border-gray-50 whitespace-nowrap">{Number(item.costAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="p-4 text-right text-emerald-600 font-bold border-r border-gray-50 whitespace-nowrap">{Number(item.profitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="p-4 text-right font-black text-gray-900 border-r border-gray-50 bg-emerald-50/5 group-hover:bg-transparent whitespace-nowrap">{Number(item.profitAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="p-4 text-right whitespace-nowrap">
                                                <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black shadow-sm ${parseFloat(item.profitRatio) > 20 ? 'bg-emerald-500 text-white' :
                                                    parseFloat(item.profitRatio) > 0 ? 'bg-blue-500 text-white' : 'bg-rose-500 text-white'
                                                    }`}>
                                                    {item.profitRatio}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={10} className="p-32 text-center bg-gray-50/50">
                                            <div className="flex flex-col items-center gap-4 opacity-20">
                                                <SearchIcon className="w-16 h-16" />
                                                <div className="space-y-1">
                                                    <p className="text-lg font-black tracking-tight">Data Not Found</p>
                                                    <p className="text-xs font-bold uppercase tracking-widest">Adjust your filters and try again</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Summary */}
                    <div className="p-6 bg-[#fcfdfe] border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-400 gap-6">
                        <div className="flex items-center gap-3">
                            <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500 print:hidden"></span>
                            <span className="font-bold uppercase tracking-tighter">Automated Profitability Analysis Engine</span>
                        </div>
                        <div className="flex items-center gap-10">
                            <div className="flex flex-col items-end">
                                <span className="uppercase font-black text-[9px] tracking-[0.2em] mb-1">Items Scanned</span>
                                <span className="text-2xl font-black text-gray-900 tabular-nums leading-none">{filteredData.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page {
                        size: landscape;
                        margin: 10mm;
                    }
                    .print\\:hidden, 
                    header, 
                    nav, 
                    aside, 
                    button,
                    .no-print {
                        display: none !important;
                    }
                    html, body {
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        overflow: visible !important;
                        height: auto !important;
                    }
                    .min-h-screen {
                        min-height: auto !important;
                    }
                    .max-w-\\[1400px\\] {
                        max-width: 100% !important;
                        width: 100% !important;
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
                    .rounded-2xl {
                        border-radius: 4px !important;
                    }
                    .shadow-xl, .shadow-inner {
                        box-shadow: none !important;
                    }
                    .border {
                        border: none !important;
                    }
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }
                    th, td {
                        padding: 2px 4px !important;
                        font-size: 8px !important;
                        border: 0.5px solid #eee !important;
                    }
                    th {
                        line-height: 1.1 !important;
                        text-transform: uppercase !important;
                        background-color: #f8fafc !important;
                    }
                    .p-6, .p-8 {
                        padding: 0 !important;
                    }
                    .bg-blue-500, .bg-emerald-500, .bg-rose-500 {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    .bg-blue-50\\/30, .bg-orange-50\\/30, .bg-emerald-50\\/30 {
                        background-color: #f1f5f9 !important;
                        print-color-adjust: exact;
                    }
                    /* Ensure totals are visible */
                    .flex-col.items-end {
                        align-items: center !important;
                    }
                    .text-2xl {
                        font-size: 14px !important;
                    }
                }
            `}} />
        </div>
    );
}
