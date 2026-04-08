/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { DataTable } from "@/app/components/dashboard/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
} from "@/shared/components/ui/card";
import { useGetAllPurchasesQuery } from "@/store/features/app/purchaseOrder/purchaseOrderApiService";
import { useAppSelector } from "@/store/store";
import type { PurchaseOrder } from "@/shared/types/app/purchaseOrder.types";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, FileText, CheckCircle, Clock, XCircle, PlusCircle, RefreshCcw, Printer } from "lucide-react";
import UpdatePOStatusModal from "./UpdatePOStatusModal";
import { useState } from "react";
import { Link } from "react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";


/* COMPONENT */
export default function PurchaseOrdersList({ initialStatus = "all" }: { initialStatus?: string }) {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<string>(initialStatus);
  const [limit, setLimit] = useState<number>(10);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const { data, isFetching } = useGetAllPurchasesQuery({
    page,
    limit,
    search,
    status: status === "all" ? undefined : status,
  });
  const purchaseOrdersData: PurchaseOrder[] = Array.isArray(data?.data)
    ? data.data
    : [];
  const pagination = data?.pagination ?? {
    total: 0,
    page: 1,
    limit: 10,
    totalPage: 1,
  };

  const { data: allPOData } = useGetAllPurchasesQuery({ limit: 1000 });
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









  /* COLUMNS */
  const poColumns: ColumnDef<PurchaseOrder>[] = [
    {
      accessorKey: "poNumber",
      header: "PO Number",
      meta: { className: "md:sticky md:left-0 z-20 bg-background min-w-[120px]" } as any
    },
    {
      accessorKey: "supplier",
      header: "Supplier",
      meta: { className: "md:sticky md:left-[120px] z-20 bg-background md:shadow-[4px_0px_5px_-2px_rgba(0,0,0,0.1)]" } as any,
      cell: ({ row }) => `${row.original.supplier?.name || "N/A"}`,
    },
    {
      accessorKey: "orderDate",
      header: "Order Date",
      cell: ({ row }) => new Date(row.original.orderDate as string).toLocaleDateString(),
    },
    {
      accessorKey: "expectedDeliveryDate",
      header: "Delivery Date",
      cell: ({ row }) => new Date(row.original.expectedDeliveryDate as string).toLocaleDateString(),
    },
    {
      accessorKey: "totalAmount",
      header: () => <div className="text-right">Total Price ({currency})</div>,
      cell: ({ row }) => (
        <div className="text-right">{row.original.totalAmount.toFixed(2)}</div>
      ),
    },
    {
      accessorKey: "discountAmount",
      header: () => (
        <div className="text-right">Total Discount ({currency})</div>
      ),
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.discountAmount.toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "taxAmount",
      header: () => <div className="text-right">Tax Amount ({currency})</div>,
      cell: ({ row }) => (
        <div className="text-right">{row.original.taxAmount.toFixed(2)}</div>
      ),
    },
    {
      accessorKey: "totalPayableAmount",
      header: () => <div className="text-right">Total Payable ({currency})</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.totalPayableAmount.toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "totalPaidAmount",
      header: () => <div className="text-right">Paid ({currency})</div>,
      cell: ({ row }) => (
        <div className="text-right text-emerald-600 font-medium">
          {row.original.totalPaidAmount.toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "totalDueAmount",
      header: () => <div className="text-right">Due ({currency})</div>,
      cell: ({ row }) => (
        <div className="text-right text-rose-600 font-medium">
          {row.original.totalDueAmount.toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: any }) => {
        const po = row.original;
        const status = po.status;

        const color =
          status === "pending"
            ? "bg-amber-100 text-amber-700 border-amber-200"
            : (status as any) === "approved" || (status as any) === "received"
              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
              : (status as any) === "rejected" || (status as any) === "cancelled"
                ? "bg-rose-100 text-rose-700 border-rose-200"
                : "bg-blue-100 text-blue-700 border-blue-200";

        return <Badge variant="outline" className={`${color} capitalize font-semibold shadow-none`}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const po = row.original;
        return (
          <div className="flex items-center gap-1.5 ">
            <Link to={`/dashboard/purchase-orders/${po.publicId || po.id}`}>
              <Button size="sm" className="h-8 bg-blue-50 text-blue-600 hover:bg-blue-100 border-none shadow-none">
                <Eye className="h-4 w-4" />
                View
              </Button>
            </Link>
            <Link to={`/dashboard/purchase-orders/${po.publicId || po.id}/print`}>
              <Button
                size="sm"
                variant="outline"
                className="h-8 bg-gray-50 text-gray-600 hover:bg-gray-100 border-none shadow-none"
                title="Print Order"
              >
                <Printer className="h-4 w-4" />
              </Button>
            </Link>
            {initialStatus === "pending" && po.status === "pending" && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 bg-amber-50 text-amber-600 hover:bg-amber-100 border-none shadow-none"
                onClick={() => {
                  setSelectedPO(po);
                  setIsStatusModalOpen(true);
                }}
              >
                <RefreshCcw className="h-4 w-4" />
                Status
              </Button>
            )}
            {po.invoice && (
              <Link to={`/dashboard/purchase-invoices/${po.invoice.id}/preview`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 bg-gray-50 text-gray-600 hover:bg-gray-100 border-none shadow-none"
                  title="Print Invoice"
                >
                  <Printer className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        );
      },
    },
  ];







  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Purchase Orders
        </h1>
        <div className="flex items-center gap-2">
          <Link to={`/dashboard/purchase-orders/print-preview?status=${status}&search=${search}`}>
            <Button variant="outline" className="flex items-center gap-2 rounded-xl shadow-sm transition-all duration-200">
              <Printer className="h-4 w-4" />
              Print List
            </Button>
          </Link>
          <Link to="/dashboard/purchase-orders/create">
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0">
              <PlusCircle className="h-4 w-4" />
              Add Purchase Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            onPageSizeChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            isFetching={isFetching}
            filters={
              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value);
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
            }
          />
        </CardContent>
      </Card>

      <UpdatePOStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelectedPO(null);
        }}
        selectedPO={selectedPO}
        statusOptions={[
          { value: "approved", label: "Approved" },
          { value: "rejected", label: "Rejected" },
        ]}
      />
    </div>
  );
}
