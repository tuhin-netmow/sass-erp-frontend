/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { DataTable } from "@/app/components/dashboard/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
    Card,
    CardContent,
} from "@/shared/components/ui/card";
import { useGetAllPurchaseReturnsQuery } from "@/store/features/app/purchaseOrder/purchaseReturnApiService";
import { useAppSelector } from "@/store/store";
import type { PurchaseReturn } from "@/shared/types/app/purchaseOrder.types";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, FileText, CheckCircle, Clock, XCircle, PlusCircle, Printer } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import UpdatePOStatusModal from "./UpdatePOStatusModal";
import { formatDateStandard } from "@/shared/utils/dateUtils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";


// Simple confirmation modal


/* COMPONENT */
export default function ReturnedPurchaseOrders({ status }: { status?: string }) {
    const [page, setPage] = useState<number>(1);
    const [search, setSearch] = useState<string>("");
    const [filterStatus, setFilterStatus] = useState<string>(status || "all");
    const limit = 10;

    // Fetch Purchase Returns
    const { data, isFetching } = useGetAllPurchaseReturnsQuery({
        page,
        limit,
        search,
        status: filterStatus === "all" ? undefined : filterStatus,
    });

    const purchaseOrdersData: PurchaseReturn[] = Array.isArray(data?.data)
        ? data.data
        : [];

    const pagination = data?.pagination ?? {
        total: 0,
        page: 1,
        limit: 10,
        totalPage: 1,
    };

    // For stats, we might want to still show general PO stats or specialized ones.
    // Using the same logic as PurchaseOrdersList for consistency, but we could specialize it.
    const { data: allPOData } = useGetAllPurchaseReturnsQuery({ limit: 1000 });
    const allPOs = (Array.isArray(allPOData?.data) ? allPOData?.data : []) as any[];

    const totalPOs = data?.pagination?.total || 0;
    const approvedPOs = allPOs.filter((po: any) => po.status === "approved" || po.status === "received").length;
    const pendingPOs = allPOs.filter((po: any) => po.status === "pending").length;
    const rejectedPOs = allPOs.filter((po: any) => po.status === "rejected").length;

    const stats = [
        {
            label: "Total Orders",
            value: totalPOs,
            gradient: "from-blue-600 to-blue-400",
            shadow: "shadow-blue-500/30",
            icon: <FileText className="w-6 h-6 text-white" />,
        },
        {
            label: "Approved/Received",
            value: approvedPOs,
            gradient: "from-emerald-600 to-emerald-400",
            shadow: "shadow-emerald-500/30",
            icon: <CheckCircle className="w-6 h-6 text-white" />,
        },
        {
            label: "Pending Orders",
            value: pendingPOs,
            gradient: "from-amber-600 to-amber-400",
            shadow: "shadow-amber-500/30",
            icon: <Clock className="w-6 h-6 text-white" />,
        },
        {
            label: "Rejected Orders",
            value: rejectedPOs,
            gradient: "from-rose-600 to-rose-400",
            shadow: "shadow-rose-500/30",
            icon: <XCircle className="w-6 h-6 text-white" />,
        },
    ];

    const currency = useAppSelector((state) => state.currency.value);



    const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
    const [selectedPO, setSelectedPO] = useState<any>(null);

    const handleOpenUpdateStatusModal = (po: any) => {
        setSelectedPO(po);
        setIsUpdateStatusModalOpen(true);
    };

    const handleCloseUpdateStatusModal = () => {
        setIsUpdateStatusModalOpen(false);
        setSelectedPO(null);
    };

    const poStatusOptions = [
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
    ];



    // const [updatePurchaseOrder] = useUpdatePurchaseOrderMutation();


    /* COLUMNS */
    const poColumns: ColumnDef<PurchaseReturn>[] = [
        {
            accessorFn: (row) => row.returnNumber || row.poNumber || `RET-${row.id}`,
            header: "Return Number",
            meta: { className: "md:sticky md:left-0 z-20 bg-background min-w-[120px]" } as any,
            cell: ({ row }) => (
                <Link
                    to={`/dashboard/purchase-returns/${row.original.publicId || row.original.id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                    {row.getValue("Return Number")}
                </Link>
            ),
        },
        {
            id: "po_number",
            accessorFn: (row: any) => row.purchaseOrder?.poNumber || row.poNumber || "N/A",
            header: "PO Number",
            meta: { className: "md:sticky md:left-[120px] z-20 bg-background min-w-[120px]" } as any,
        },
        {
            accessorKey: "supplier",
            header: "Supplier",
            meta: { className: "md:sticky md:left-[240px] z-20 bg-background md:shadow-[4px_0px_5px_-2px_rgba(0,0,0,0.1)]" } as any,
            cell: ({ row }) => `${row.original.supplier?.name || "N/A"}`,
        },
        {
            id: "return_date",
            accessorFn: (row: any) => row.returnDate || row.orderDate,
            header: "Return Date",
            cell: ({ row }) => {
                const dateC = (row.original as any).returnDate || row.original.orderDate;
                return formatDateStandard(dateC);
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;

                const color =
                    status === "pending"
                        ? "bg-yellow-500"
                        : status === "approved"
                            ? "bg-blue-600"
                            : status === "rejected"
                                ? "bg-red-600"
                                : status === "returned"
                                    ? "bg-orange-600"
                                    : "bg-green-600";

                return <Badge className={`${color} text-white capitalize`}>{status}</Badge>;
            },
        },
        {
            accessorKey: "totalAmount",
            header: () => <div className="text-right">Total Price ({currency})</div>,
            cell: ({ row }) => (
                <div className="text-right">{(row.original.totalAmount || 0).toFixed(2)}</div>
            ),
        },
        {
            accessorKey: "discountAmount",
            header: () => (
                <div className="text-right">Total Discount ({currency})</div>
            ),
            cell: ({ row }) => (
                <div className="text-right">
                    {(row.original.discountAmount || 0).toFixed(2)}
                </div>
            ),
        },
        {
            accessorKey: "taxAmount",
            header: () => <div className="text-right">Tax Amount ({currency})</div>,
            cell: ({ row }) => (
                <div className="text-right">{(Number(row.original.taxAmount || 0)).toFixed(2)}</div>
            ),
        },
        {
            id: "total_refundable",
            accessorFn: (row: any) => row.grandTotal || row.totalPayableAmount || 0,
            header: () => <div className="text-right">Total Refundable ({currency})</div>,
            cell: ({ row }) => (
                <div className="text-right">
                    {(Number((row.original as any).grandTotal || (row.original as any).totalPayableAmount || 0)).toFixed(2)}
                </div>
            ),
        },
        {
            id: "total_refunded",
            accessorKey: "totalRefundedAmount",
            header: () => <div className="text-right">Total Refunded ({currency})</div>,
            cell: ({ row }) => (
                <div className="text-right font-medium text-green-600">
                    {Number(row.original.totalRefundedAmount || 0).toFixed(2)}
                </div>
            ),
        },
        {
            id: "due_refund",
            accessorKey: "dueRefundAmount",
            header: () => <div className="text-right">Due Refund ({currency})</div>,
            cell: ({ row }) => {
                const due = Number(row.original.dueRefundAmount || 0);
                return (
                    <div className={`text-right font-bold ${due > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {due.toFixed(2)}
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const po = row.original;


                return (
                    <div className="flex gap-2">
                        <Link to={`/dashboard/purchase-returns/${po.publicId || po.id}`}>
                            <Button size="sm" className="h-8 bg-blue-50 text-blue-600 hover:bg-blue-100 border-none shadow-none">
                                <Eye className="w-4 h-4 mr-1" /> View
                            </Button>
                        </Link>
                        <Link to={`/dashboard/purchase-returns/${po.publicId || po.id}/print`}>
                            <Button size="sm" variant="outline" className="h-8 bg-gray-50 text-gray-600 hover:bg-gray-100 border-none shadow-none" title="Print Return">
                                <Printer className="w-4 h-4" />
                            </Button>
                        </Link>

                        {status && status !== "approved" && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenUpdateStatusModal(po)}
                            >
                                Change Status
                            </Button>
                        )}


                    </div>
                );
            },
        }
    ];

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight">
                    Returned Purchase Orders
                </h1>
                <Link to="/dashboard/purchase-orders/return/create">
                    <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-blue-500/40 active:translate-y-0 active:shadow-none">
                        <PlusCircle size={18} />
                        Create Purchase Return
                    </button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((item, idx) => (
                    <div
                        key={idx}
                        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${item.gradient} p-6 shadow-lg ${item.shadow} transition-all duration-300 hover:scale-[1.02] hover:translate-y-[-2px]`}
                    >
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
                    </div>
                ))}
            </div>

            <Card className="py-6">


                <CardContent>
                    <DataTable
                        columns={poColumns}
                        data={purchaseOrdersData}
                        pageIndex={page - 1}
                        pageSize={limit}
                        totalCount={pagination.total}
                        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
                        onSearch={(value) => {
                            setSearch(value);
                            setPage(1);
                        }}
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



            {/* Status Update Modal */}
            <UpdatePOStatusModal
                isOpen={isUpdateStatusModalOpen}
                onClose={handleCloseUpdateStatusModal}
                selectedPO={selectedPO}
                statusOptions={poStatusOptions}
            />
        </div>
    );
}
