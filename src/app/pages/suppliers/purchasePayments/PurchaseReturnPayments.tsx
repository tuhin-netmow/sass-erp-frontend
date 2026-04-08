/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataTable } from "@/app/components/dashboard/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { useGetAllPurchaseReturnPaymentsQuery } from "@/store/features/app/purchaseOrder/purchaseReturnApiService";
import type { PurchasePayment } from "@/shared/types/app/purchasePayment.types";
import type { ColumnDef } from "@tanstack/react-table";
import {  Banknote, CheckCircle, Clock, XCircle, Eye, Printer } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { useAppSelector } from "@/store/store";

export default function PurchaseReturnPayments() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [limit] = useState(10);

    const { data: paymentData, isFetching } = useGetAllPurchaseReturnPaymentsQuery({
        page,
        limit,
        search,
    });

    const currency = useAppSelector((state) => state.currency.value);

    // Fetch all for stats (simplified frontend calculation)
    const { data: allPaymentsData } = useGetAllPurchaseReturnPaymentsQuery({ limit: 1000 });
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

    const payments = paymentData?.data;

    const columns: ColumnDef<PurchasePayment>[] = [
        {
            accessorKey: "id",
            header: "Refund #",
            meta: { className: "md:sticky md:left-0 z-20 bg-background min-w-[120px]" } as any,
            cell: ({ row }) => <span className="font-medium">{row.original.id}</span>,
        },
        {
            accessorKey: "purchase_return.return_number",
            header: "Return Number",
            meta: { className: "md:sticky md:left-[120px] z-20 bg-background md:shadow-[4px_0px_5px_-2px_rgba(0,0,0,0.1)]" } as any,
            cell: ({ row }) => {
                const ret = (row.original as any).purchaseReturn;
                return ret?.returnNumber || "-";
            },
        },
        {
            accessorKey: "supplier",
            header: "Supplier",
            cell: ({ row }) => {
                const supplier = (row.original as any).purchaseReturn?.supplier;
                if (!supplier) return "-";

                return (
                    <div className="font-semibold">{supplier.name}</div>
                );
            },
        },
        {
            accessorKey: "invoice.invoice_number",
            header: "Invoice #",
            cell: ({ row }) => row.original.invoice?.invoiceNumber || "-",
        },
        {
            accessorKey: "payment_date",
            header: "Refund Date",
            cell: ({ row }) => new Date(row.original.paymentDate).toLocaleString(),
        },
        {
            accessorKey: "payment_method",
            header: "Method",
            cell: ({ row }) => {
                const method = row.original.paymentMethod;

                const color =
                    method === "cash"
                        ? "bg-yellow-500"
                        : method === "bank_transfer"
                            ? "bg-blue-500"
                            : method === "card"
                                ? "bg-purple-500"
                                : "bg-gray-600";

                return <Badge className={color}>{method}</Badge>;
            },
        },
        {
            accessorKey: "amount",
            header: () => (
                <div className="text-right">Amount ({currency})</div>
            ),
            cell: ({ row }) => (
                <div className="text-right">{Number(row.original.amount || 0).toFixed(2)}</div>
            ),
        },
        {
            accessorKey: "reference_number",
            header: "Reference",
            cell: ({ row }) => row.original.referenceNumber ?? "-",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                const color =
                    status === "completed"
                        ? "bg-green-600"
                        : status === "pending"
                            ? "bg-yellow-500"
                            : "bg-red-600";

                return <Badge className={color}>{status}</Badge>;
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const payment = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <Link to={`/dashboard/purchase-returns/payments/${payment._id}`}>
                            <Button size="sm" className="h-8 bg-blue-50 text-blue-600 hover:bg-blue-100 border-none shadow-none">
                                <Eye className="w-4 h-4 mr-1" /> View
                            </Button>
                        </Link>
                        <Link to={`/dashboard/purchase-returns/payments/${payment._id}/print`}>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 bg-gray-50 text-gray-600 hover:bg-gray-100 border-none shadow-none"
                                title="Print Receipt"
                            >
                                <Printer className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="w-full">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Purchase Return Refunds</h1>

                {/* Record Refund Button Removed */}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
                columns={columns}
                data={payments ?? []}
                pageIndex={page - 1}
                pageSize={limit}
                totalCount={paymentData?.pagination?.total ?? 0}
                onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
                onSearch={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                isFetching={isFetching}
            />
        </div>
    );
}
