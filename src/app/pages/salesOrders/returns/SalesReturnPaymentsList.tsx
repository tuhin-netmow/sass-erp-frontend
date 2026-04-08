/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { DataTable } from "@/app/components/dashboard/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { useGetAllSalesReturnPaymentsQuery } from "@/store/features/app/salesOrder/salesReturnApiService";
import type { Payment } from "@/shared/types";
import type { ColumnDef } from "@tanstack/react-table";
import { PlusCircle, Banknote, CheckCircle, Clock, XCircle, Eye, Printer } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { useAppSelector } from "@/store/store";
import { formatDateStandard } from "@/shared/utils/dateUtils";
import RecordSalesReturnRefundModal from "./RecordSalesReturnRefundModal";

export default function SalesReturnPaymentsList() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const limit = 10;
    const [open, setOpen] = useState(false);
    const currency = useAppSelector((state) => state.currency.value);

    // Fetch all for main table
    const { data: paymentData, isFetching } = useGetAllSalesReturnPaymentsQuery({
        page,
        limit,
        search,
    });



    // Fetch all for stats
    const { data: allPaymentsData } = useGetAllSalesReturnPaymentsQuery({ limit: 1000 });
    const allPayments = (Array.isArray(allPaymentsData?.data) ? allPaymentsData?.data : []) as any[];

    const totalPayments = paymentData?.pagination?.total ?? 0;
    const completedPayments = allPayments.filter((p) => p.status === "completed").length;
    const pendingPayments = allPayments.filter((p) => p.status === "pending").length;
    const failedPayments = allPayments.filter((p) => p.status === "failed" || p.status === "refunded").length;

    const stats = [
        {
            label: "Total Refunds",
            value: totalPayments,
            gradient: "from-blue-600 to-blue-400",
            shadow: "shadow-blue-500/30",
            icon: <Banknote className="w-6 h-6 text-white" />,
        },
        {
            label: "Completed",
            value: completedPayments,
            gradient: "from-emerald-600 to-emerald-400",
            shadow: "shadow-emerald-500/30",
            icon: <CheckCircle className="w-6 h-6 text-white" />,
        },
        {
            label: "Pending",
            value: pendingPayments,
            gradient: "from-amber-600 to-amber-400",
            shadow: "shadow-amber-500/30",
            icon: <Clock className="w-6 h-6 text-white" />,
        },
        {
            label: "Failed/Refunded",
            value: failedPayments,
            gradient: "from-rose-600 to-rose-400",
            shadow: "shadow-rose-500/30",
            icon: <XCircle className="w-6 h-6 text-white" />,
        },
    ];

    const columns: ColumnDef<Payment>[] = [
        {
            header: "Refund #",
            meta: { className: "md:sticky md:left-0 z-20 bg-background min-w-[100px]" } as any,
            cell: ({ row }) => <span className="font-medium">{((row.original as any)._id || "")}</span>,
        },
        {
            header: "Return Number",
            meta: { className: "md:sticky md:left-[100px] z-20 bg-background md:shadow-[4px_0px_5px_-2px_rgba(0,0,0,0.1)]" } as any,
            cell: ({ row }) => {
                const item = row.original as any;
                return (item.salesReturn?.returnNumber || item.sales_return?.return_number || "-");
            },
        },
        {
            id: "customer",
            header: "Customer",
            cell: ({ row }) => {
                const item = row.original as any;
                return (item.salesReturn?.customer?.name || item.sales_return?.customer?.name || "-");
            },
        },
        {
            id: "invoice_number",
            header: "Invoice #",
            cell: ({ row }) => {
                const item = row.original as any;
                return (item.invoice?.invoiceNumber || item.invoice?.invoice_number || "-");
            },
        },
        {
            id: "paymentDate",
            header: "Refund Date",
            cell: ({ row }) => formatDateStandard(row.original.paymentDate || (row.original as any).payment_date),
        },
        {
            id: "paymentMethod",
            header: "Method",
            cell: ({ row }) => {
                const method = row.original.paymentMethod || (row.original as any).payment_method;
                const color = method === "cash" ? "bg-yellow-500" : method === "bank_transfer" ? "bg-blue-500" : "bg-purple-500";
                return <Badge className={`${color} text-white`}>{method}</Badge>;
            },
        },
        {
            accessorKey: "amount",
            header: () => <div className="text-right">Amount ({currency})</div>,
            cell: ({ row }) => <div className="text-right font-medium">{Number(row.original.amount || 0).toFixed(2)}</div>,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                const color = status === "completed" ? "bg-green-600" : status === "pending" ? "bg-yellow-500" : "bg-red-600";
                return <Badge className={`${color} text-white`}>{status}</Badge>;
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Link to={`/dashboard/sales/returns/payments/${(row.original as any).publicId || (row.original as any)._id}`}>
                        <Button size="sm" variant="outline"><Eye className="w-4 h-4 mr-1" /> View</Button>
                    </Link>
                    <Link to={`/dashboard/sales/returns/payments/${(row.original as any).publicId || (row.original as any)._id}/print`}>
                        <Button
                            size="sm"
                            variant="outline"
                            className="bg-gray-50 text-gray-600 hover:bg-gray-100"
                            title="Print Refund"
                        >
                            <Printer className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            ),
        }
    ];

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight text-blue-700">Sales Return Refunds</h1>
                <button
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-blue-500/40 active:translate-y-0 active:shadow-none"
                >
                    <PlusCircle size={18} />
                    Record Refund
                </button>
                <RecordSalesReturnRefundModal open={open} onOpenChange={setOpen} />
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

            <DataTable
                columns={columns}
                data={(paymentData?.data ?? []) as any[]}
                pageIndex={page - 1}
                pageSize={limit}
                totalCount={paymentData?.pagination?.total ?? 0}
                onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
                onSearch={(value) => { setSearch(value); setPage(1); }}
                isFetching={isFetching}
            />
        </div>
    );
}
