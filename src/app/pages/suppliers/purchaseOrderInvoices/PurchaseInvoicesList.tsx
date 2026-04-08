/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { DataTable } from "@/app/components/dashboard/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
} from "@/shared/components/ui/card";
import { useGetAllPurchaseInvoicesQuery } from "@/store/features/app/purchaseOrder/purchaseOrderApiService";
import { useAppSelector } from "@/store/store";
import type { PurchaseInvoice } from "@/shared/types/app/PurchaseInvoice.types";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, FileText, CheckCircle, AlertTriangle, XCircle, Printer } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export default function PurchaseInvoicesList() {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<string>("all");
  const limit = 10;

  const { data, isFetching } = useGetAllPurchaseInvoicesQuery({
    page,
    limit,
    search,
    status: status === "all" ? undefined : status,
  });

  const invoicesData: PurchaseInvoice[] = Array.isArray(data?.data)
    ? data.data
    : [];
  const pagination = data?.pagination ?? {
    total: 0,
    page: 1,
    limit: 10,
    totalPage: 1,
  };

  // Fetch all for stats (simplified frontend calculation)
  const { data: allInvoicesData } = useGetAllPurchaseInvoicesQuery({ limit: 1000 });
  const allInvoices = (Array.isArray(allInvoicesData?.data) ? allInvoicesData?.data : []) as any[];

  const totalInvoices = pagination.total || 0;
  const paidInvoices = allInvoices.filter((inv) => inv.status === "paid").length;
  const partialInvoices = allInvoices.filter((inv) => inv.status === "partial").length;
  const unpaidInvoices = allInvoices.filter((inv) => inv.status === "unpaid" || inv.status === "draft").length;

  const stats = [
    {
      label: "Total Invoices",
      value: totalInvoices,
      gradient: "from-blue-600 to-blue-400",
      shadow: "shadow-blue-500/30",
      icon: <FileText className="w-6 h-6 text-white" />,
    },
    {
      label: "Paid Invoices",
      value: paidInvoices,
      gradient: "from-emerald-600 to-emerald-400",
      shadow: "shadow-emerald-500/30",
      icon: <CheckCircle className="w-6 h-6 text-white" />,
    },
    {
      label: "Partially Paid",
      value: partialInvoices,
      gradient: "from-amber-600 to-amber-400",
      shadow: "shadow-amber-500/30",
      icon: <AlertTriangle className="w-6 h-6 text-white" />,
    },
    {
      label: "Unpaid/Draft",
      value: unpaidInvoices,
      gradient: "from-rose-600 to-rose-400",
      shadow: "shadow-rose-500/30",
      icon: <XCircle className="w-6 h-6 text-white" />,
    },
  ];

  const currency = useAppSelector((state) => state.currency.value);

  // Table Columns
  const invoiceColumns: ColumnDef<PurchaseInvoice>[] = [
    {
      accessorKey: "invoice_number",
      header: "Invoice #",
      meta: { className: "md:sticky md:left-0 z-20 bg-background min-w-[120px]" } as any
    },
    {
      accessorKey: "purchase_order",
      header: "PO Number",
      meta: { className: "md:sticky md:left-[120px] z-20 bg-background md:shadow-[4px_0px_5px_-2px_rgba(0,0,0,0.1)]" } as any,
      cell: ({ row }) => `PO #${row.original.purchaseOrder?.poNumber}`,
    },
    // Only include supplier if you have supplier_id in the invoice or via PO relation
    // {
    //   accessorKey: "supplier_id",
    //   header: "Supplier",
    //   cell: ({ row }) => `Supplier #${row.original.supplierId}`,
    // },
    {
      accessorKey: "purchase_order?.supplier?.name",
      header: "Supplier",
      cell: ({ row }) => `${row.original.purchaseOrder?.supplier?.name}`,
    },
    {
      accessorKey: "total_payable_amount",
      header: () => (
        <div className="text-right">Total Payable Amount ({currency})</div>
      ),
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.totalPayableAmount.toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "paid_amount",
      header: () => <div className="text-right">Paid Amount ({currency})</div>,
      cell: ({ row }) => (
        <div className="text-right">{row.original.paidAmount.toFixed(2)}</div>
      ),
    },
    {
      accessorKey: "due_amount",
      header: () => <div className="text-right">Due Amount ({currency})</div>,
      cell: ({ row }) => (
        <div className="text-right">{row.original.dueAmount.toFixed(2)}</div>
      ),
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const color =
          status === "draft"
            ? "bg-yellow-500"
            : status === "paid"
              ? "bg-green-600"
              : status === "overdue"
                ? "bg-red-600"
                : "bg-gray-400";

        return (
          <Badge className={`${color} text-white capitalize`}>{status}</Badge>
        );
      },
    },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const invoice = row.original;

        return (
          <div className="flex gap-2">
            <Link to={`/dashboard/purchase-invoices/${invoice.publicId || invoice.id}`}>
              <Button size="sm" variant="outline">
                <Eye className="w-4 h-4 mr-1" /> View
              </Button>
            </Link>
            <Link to={`/dashboard/purchase-invoices/${invoice.publicId || invoice.id}/preview`}>
              <Button size="sm" variant="outline">
                <Printer className="w-4 h-4 mr-1" /> Print
              </Button>
            </Link>
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Purchase Invoices</h1>
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
            columns={invoiceColumns}
            data={invoicesData}
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
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
