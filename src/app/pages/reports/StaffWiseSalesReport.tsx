"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { DataTable } from "@/app/components/dashboard/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { Users, Calendar, Search } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { useGetStaffWiseSalesQuery } from "@/store/features/app/reports/reportApiService";
import { useGetAllStaffsQuery } from "@/store/features/app/staffs/staffApiService";
import { useAppSelector } from "@/store/store";
import { useState } from "react";
import { toast } from "sonner";

function getStartOfCurrentMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .slice(0, 10);
}

function getEndOfCurrentMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .slice(0, 10);
}

export default function StaffWiseSalesReport() {
    const [startDate, setStartDate] = useState(getStartOfCurrentMonth());
    const [endDate, setEndDate] = useState(getEndOfCurrentMonth());
    const [tempStartDate, setTempStartDate] = useState(startDate);
    const [tempEndDate, setTempEndDate] = useState(endDate);

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [limit, setLimit] = useState(10);
    const [staffId, setStaffId] = useState<string>("all");

    const currency = useAppSelector((state) => state.currency.value);

    const { data: staffListResponse } = useGetAllStaffsQuery({ status: "active", limit: 100 });
    const staffList = staffListResponse?.data || [];

    const { data: staffSalesData, isFetching: staffSalesIsFetching } =
        useGetStaffWiseSalesQuery({
            startDate: startDate,
            endDate: endDate,
            page,
            limit,
            search,
            staffId: staffId === "all" ? undefined : staffId,
        });

    const staffSales = staffSalesData?.data || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const staffSalesColumns: ColumnDef<any>[] = [
        {
            accessorKey: "staff_name",
            header: "Staff Name",
            cell: (info) => <div className="font-medium text-slate-900">{info.getValue() as string}</div>,
        },
        {
            accessorKey: "order_count",
            header: "Total Orders",
            cell: (info) => (
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {(info.getValue() as number).toLocaleString()}
                </div>
            ),
        },
        {
            accessorKey: "totalSales",
            header: () => <div className="text-right">Total Sales ({currency})</div>,
            cell: (info) => (
                <div className="text-right font-mono font-bold text-emerald-600">
                    {(info.getValue() as number).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-400 bg-clip-text text-transparent">
                        Staff Wise Sales Report
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">Monitor sales performance by individual staff members</p>
                </div>
                <div className="flex flex-wrap gap-3 items-end bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 ml-1">Staff Member</label>
                        <Select value={staffId} onValueChange={setStaffId}>
                            <SelectTrigger className="w-[180px] h-10 rounded-xl border-slate-200 focus:ring-indigo-500 transition-all">
                                <SelectValue placeholder="All Staff" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Staff</SelectItem>
                                {staffList.map((staff) => (
                                    <SelectItem key={staff.id} value={staff._id.toString()}>
                                        {staff.firstName} {staff.lastName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 ml-1">From</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                type="date"
                                className="w-40 pl-9 h-10 rounded-xl border-slate-200 focus:ring-indigo-500 transition-all"
                                value={tempStartDate}
                                onChange={(e) => setTempStartDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 ml-1">To</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                type="date"
                                className="w-40 pl-9 h-10 rounded-xl border-slate-200 focus:ring-indigo-500 transition-all"
                                value={tempEndDate}
                                onChange={(e) => setTempEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (!tempStartDate || !tempEndDate) return;
                            if (tempStartDate > tempEndDate) {
                                toast.error("From date cannot be after To date");
                                return;
                            }
                            setStartDate(tempStartDate);
                            setEndDate(tempEndDate);
                            setPage(1);
                        }}
                        className="h-10 rounded-xl bg-indigo-600 px-6 font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0"
                    >
                        Apply Filter
                    </button>
                </div>
            </div>

            {/* Stats Overview (Optional) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-gradient-to-br from-white to-slate-50 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <Users className="w-16 h-16 text-indigo-600" />
                    </div>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Users className="w-5 h-5 text-indigo-600" />
                            </div>
                            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Top Performer</span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-slate-900">
                                {staffSales[0]?.staff_name || "N/A"}
                            </h3>
                            <p className="text-sm text-slate-500">
                                Highest sales contributor this period
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-gradient-to-br from-white to-slate-50 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <Calendar className="w-16 h-16 text-emerald-600" />
                    </div>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <Calendar className="w-5 h-5 text-emerald-600" />
                            </div>
                            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Report Period</span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-slate-900 truncate">
                                {new Date(startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </h3>
                            <p className="text-sm text-slate-500">
                                Active filter range
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-gradient-to-br from-white to-slate-50 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <Search className="w-16 h-16 text-amber-600" />
                    </div>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <Search className="w-5 h-5 text-amber-600" />
                            </div>
                            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Total Staff Tracked</span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-slate-900">
                                {staffSalesData?.pagination?.total || 0}
                            </h3>
                            <p className="text-sm text-slate-500">
                                Staff members with sales data
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Table */}
            <Card className="shadow-lg shadow-slate-200/50 overflow-hidden rounded-3xl pb-2">
                <CardHeader className="border-b-1 border-slate-50 bg-white/50 backdrop-blur-sm py-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-800">Sales Performance by Staff</CardTitle>
                                <p className="text-xs text-slate-500 mt-0.5 font-medium italic">Breakdown of orders and revenue per person</p>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="">
                    <DataTable
                        data={staffSales}
                        columns={staffSalesColumns}
                        pageIndex={page - 1}
                        pageSize={limit}
                        totalCount={staffSalesData?.pagination?.total || 0}
                        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
                        onPageSizeChange={(newLimit) => {
                            setLimit(newLimit);
                            setPage(1);
                        }}
                        onSearch={(value) => {
                            setSearch(value);
                            setPage(1);
                        }}
                        isFetching={staffSalesIsFetching}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
