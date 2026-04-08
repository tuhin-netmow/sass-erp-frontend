/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { DataTable } from "@/app/components/dashboard/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
    Card,
    CardContent,
} from "@/shared/components/ui/card";
import { useGetAllSalesReturnsQuery, useGetSalesReturnSummaryQuery } from "@/store/features/app/salesOrder/salesReturnApiService";
import { useAppSelector } from "@/store/store";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, FileText, PlusCircle, Printer, IndianRupee, CreditCard, Wallet } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { formatDateStandard } from "@/shared/utils/dateUtils";


import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";

import UpdateSalesReturnStatusModal from "./UpdateSalesReturnStatusModal";

export default function SalesReturnsList({ status }: { status?: string }) {
    const [page, setPage] = useState<number>(1);
    const [search, setSearch] = useState<string>("");
    const [filterStatus, setFilterStatus] = useState<string>(status || "all");
    const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState<any>(null);
    const limit = 10;

    const { data, isFetching } = useGetAllSalesReturnsQuery({
        page,
        limit,
        search,
        status: filterStatus === "all" ? undefined : filterStatus,
    });

    const { data: summaryData } = useGetSalesReturnSummaryQuery();
    const summary = summaryData?.data || {};

    const salesReturns = Array.isArray(data?.data) ? data.data : [];
    const pagination = data?.pagination ?? { total: 0, page: 1, limit: 10, totalPage: 1 };

    const currency = useAppSelector((state) => state.currency.value);

    const handleOpenUpdateStatusModal = (salesReturn: any) => {
        setSelectedReturn(salesReturn);
        setIsUpdateStatusModalOpen(true);
    };

    const stats = [
        {
            label: "Total Returns",
            value: summary.totalCount || summary.total_count || 0,
            gradient: "from-blue-600 to-blue-400",
            shadow: "shadow-blue-500/30",
            icon: <FileText className="w-6 h-6 text-white" />,
        },
        {
            label: `Total Returned (${currency})`,
            value: (Number(summary.totalGrandTotal || summary.total_grand_total || 0)).toFixed(2),
            gradient: "from-amber-600 to-amber-400",
            shadow: "shadow-amber-500/30",
            icon: <IndianRupee className="w-6 h-6 text-white" />,
        },
        {
            label: `Total Refunded (${currency})`,
            value: (Number(summary.totalRefunded || summary.total_refunded || 0)).toFixed(2),
            gradient: "from-emerald-600 to-emerald-400",
            shadow: "shadow-emerald-500/30",
            icon: <Wallet className="w-6 h-6 text-white" />,
        },
        {
            label: `Balance Due (${currency})`,
            value: (Number(summary.totalBalance || summary.total_balance || 0)).toFixed(2),
            gradient: "from-rose-600 to-rose-400",
            shadow: "shadow-rose-500/30",
            icon: <CreditCard className="w-6 h-6 text-white" />,
        },
    ];

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "returnNumber",
            header: "Return #",
            meta: { className: "md:sticky md:left-0 z-20 bg-background min-w-[120px]" } as any,
            cell: ({ row }) => <span className="font-medium text-blue-700">{row.original.returnNumber || row.original.return_number}</span>,
        },
        {
            id: "order",
            header: "Sales Order #",
            cell: ({ row }) => row.original.order?.orderNumber || "-",
        },
        {
            id: "customer",
            header: "Customer",
            cell: ({ row }) => row.original.customer?.name || row.original.customerName || "-",
        },
        {
            accessorKey: "returnDate",
            header: "Return Date",
            cell: ({ row }) => formatDateStandard(row.original.returnDate || row.original.return_date),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                const color = status === "pending" ? "bg-amber-500" : status === "approved" || status === "completed" ? "bg-emerald-600" : "bg-rose-600";
                return <Badge className={`${color} text-white capitalize`}>{status}</Badge>;
            },
        },
        {
            accessorKey: "totalAmount",
            header: () => <div className="text-right">Total ({currency})</div>,
            cell: ({ row }) => <div className="text-right">{(Number(row.original.totalAmount || 0)).toFixed(2)}</div>,
        },
        {
            accessorKey: "discountAmount",
            header: () => <div className="text-right">Discount ({currency})</div>,
            cell: ({ row }) => <div className="text-right">{(Number(row.original.discountAmount || row.original.discount_amount || 0)).toFixed(2)}</div>,
        },
        {
            accessorKey: "taxAmount",
            header: () => <div className="text-right">Tax ({currency})</div>,
            cell: ({ row }) => <div className="text-right">{(Number(row.original.taxAmount || row.original.tax_amount || 0)).toFixed(2)}</div>,
        },
        {
            id: "total_payable",
            header: () => <div className="text-right">Refundable ({currency})</div>,
            cell: ({ row }) => <div className="text-right font-medium">{(Number(row.original.grandTotal || row.original.grand_total || row.original.totalPayableAmount || 0)).toFixed(2)}</div>,
        },
        {
            id: "total_refunded",
            header: () => <div className="text-right">Refunded ({currency})</div>,
            cell: ({ row }) => <div className="text-right text-green-600 font-medium">{(Number(row.original.totalRefundedAmount || row.original.total_refunded_amount || 0)).toFixed(2)}</div>,
        },
        {
            id: "balance",
            header: () => <div className="text-right">Balance ({currency})</div>,
            cell: ({ row }) => {
                const total = Number(row.original.grandTotal || row.original.grand_total || row.original.totalPayableAmount || 0);
                const refunded = Number(row.original.totalRefundedAmount || row.original.total_refunded_amount || 0);
                const balance = total - refunded;
                return <div className={`text-right font-bold ${balance > 0.01 ? 'text-red-500' : 'text-green-600'}`}>{balance.toFixed(2)}</div>;
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Link to={`/dashboard/sales/returns/${row.original.publicId || row.original.id || row.original._id}`}>
                        <Button size="sm" className="h-8 bg-blue-50 text-blue-600 hover:bg-blue-100 border-none shadow-none">
                            <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                    </Link>
                    <Link to={`/dashboard/sales/returns/${row.original.publicId || row.original.id || row.original._id}/print`}>
                        <Button size="sm" variant="outline" className="h-8 bg-gray-50 text-gray-600 hover:bg-gray-100 border-none shadow-none" title="Print Return">
                            <Printer className="w-4 h-4" />
                        </Button>
                    </Link>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-dashed border-gray-300"
                        onClick={() => handleOpenUpdateStatusModal(row.original)}
                    >
                        Change Status
                    </Button>
                </div>
            ),
        }
    ];

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight text-blue-700">Sales Returns</h1>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => window.print()}
                    >
                        <Printer className="h-4 w-4" />
                        Print All
                    </Button>
                    <Link to="/dashboard/sales/returns/create">
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                            <PlusCircle className="h-4 w-4" />
                            Record Return
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((item, idx) => (
                    <div key={idx} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${item.gradient} p-6 shadow-lg ${item.shadow} transition-all duration-300 hover:scale-[1.02] hover:translate-y-[-2px]`}>
                        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-black/10 blur-2xl" />
                        <div className="relative flex items-start justify-between">
                            <div><p className="text-sm font-medium text-white/90">{item.label}</p><h3 className="mt-2 text-3xl font-bold text-white">{item.value}</h3></div>
                            <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm">{item.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            <Card className="py-6 border bg-white/50 pb-2">

                <CardContent>
                    <DataTable
                        columns={columns}
                        data={salesReturns}
                        pageIndex={page - 1}
                        pageSize={limit}
                        totalCount={pagination.total}
                        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
                        onSearch={(value) => { setSearch(value); setPage(1); }}
                        isFetching={isFetching}
                        filters={
                            !status && (
                                <Select
                                    value={filterStatus}
                                    onValueChange={(val) => {
                                        setFilterStatus(val);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            )
                        }
                    />
                </CardContent>
            </Card>

            <UpdateSalesReturnStatusModal
                open={isUpdateStatusModalOpen}
                onOpenChange={setIsUpdateStatusModalOpen}
                salesReturn={selectedReturn}
            />
        </div>
    );
}
