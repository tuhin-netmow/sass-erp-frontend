/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { DataTable } from "@/app/components/dashboard/DataTable";
import { format } from "date-fns";
import { PlusCircle, FileText, CheckCircle, Clock, AlertTriangle, Printer } from "lucide-react";
import { Link } from "react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/shared/components/ui/checkbox";


import { useGetSalesInvoicesQuery } from "@/store/features/app/salesOrder/salesOrder";
import type { SalesInvoice } from "@/shared/types/app/salesInvoice.types";
import { useAppSelector } from "@/store/store";

export default function Invoices() {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [rowSelection, setRowSelection] = useState({});

  const [limit, setLimit] = useState<number>(10);

  // Fetch invoices with pagination & search
  const { data: fetchedInvoices, isFetching } = useGetSalesInvoicesQuery({
    page,
    limit,
    search,
  });

  const invoices: SalesInvoice[] = fetchedInvoices?.data || [];
  const pagination = fetchedInvoices?.pagination ?? {
    total: 0,
    page: 1,
    limit,
    totalPage: 1,
  };

  const currency = useAppSelector((state) => state.currency.value);

  // Stats calculation
  const totalInvoices = pagination.total;
  // Note: This is an estimation based on current page if fetch all isn't available, 
  // but ideally we'd fetch stats from API. Using fetchedInvoices for now or fetch all.

  // Fetching all for accurate stats - optional optimization: create specific stats endpoint
  const { data: allInvoicesData } = useGetSalesInvoicesQuery({ limit: 1000 });
  const allInvoices = allInvoicesData?.data || [];

  const paidInvoices = allInvoices.filter(i => i.status === 'paid').length;
  const pendingInvoices = allInvoices.filter(i => i.status === 'pending' || i.status === 'partial').length;
  const overdueInvoices = allInvoices.filter(i => i.status === 'overdue').length;

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
      label: "Pending/Partial",
      value: pendingInvoices,
      gradient: "from-amber-600 to-amber-400",
      shadow: "shadow-amber-500/30",
      icon: <Clock className="w-6 h-6 text-white" />,
    },
    {
      label: "Overdue Invoices",
      value: overdueInvoices,
      gradient: "from-rose-600 to-rose-400",
      shadow: "shadow-rose-500/30",
      icon: <AlertTriangle className="w-6 h-6 text-white" />,
    },
  ];

  const invoiceColumns: ColumnDef<SalesInvoice>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "invoice_number",
      header: "Invoice #",
      meta: { className: "md:sticky md:left-0 z-20 bg-background min-w-[120px]" } as any,
      cell: ({ row }) => <span className="font-medium">{row.getValue("invoice_number")}</span>,
    },
    {
      accessorKey: "order.customer.name",
      header: "Customer",
      meta: { className: "md:sticky md:left-[120px] z-20 bg-background md:shadow-[4px_0px_5px_-2px_rgba(0,0,0,0.1)]" } as any,
      cell: ({ row }) => row.original?.order?.customer.name,
    },
    {
      accessorKey: "order.orderNumber",
      header: "Order #",
      cell: ({ row }) => row.original?.order?.orderNumber,
    },
    {
      id: "order_status",
      header: "Order Status",
      cell: ({ row }) => {
        const orderStatus = row.original?.order?.status;
        if (!orderStatus) return <span className="text-gray-400">-</span>;

        let color = "bg-gray-500";
        switch (orderStatus.toLowerCase()) {
          case 'confirmed': color = "bg-blue-500 hover:bg-blue-600"; break;
          case 'completed': color = "bg-green-600 hover:bg-green-700"; break;
          case 'delivered': color = "bg-green-500 hover:bg-green-600"; break;
          case 'shipped': color = "bg-cyan-500 hover:bg-cyan-600"; break;
          case 'in_transit': color = "bg-purple-500 hover:bg-purple-600"; break;
          case 'pending': color = "bg-amber-500 hover:bg-amber-600"; break;
          case 'cancelled': color = "bg-red-500 hover:bg-red-600"; break;
          case 'returned': color = "bg-rose-500 hover:bg-rose-600"; break;
        }
        return <Badge className={`${color} capitalize shadow-none`}>{orderStatus.replace('_', ' ')}</Badge>;
      }
    },
    {
      accessorKey: "invoice_date",
      header: "Invoice Date",
      cell: ({ row }) => format(new Date(row.getValue("invoice_date")), "dd/MM/yyyy"),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => format(new Date(row.getValue("dueDate")), "dd/MM/yyyy"),
    },
    {
      accessorKey: "totalAmount",
      header: () => (
        <div className="text-right">
          <span className="print:hidden">Total Amount ({currency})</span>
          <span className="hidden print:inline">TOTAL ({currency})</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right">
          {parseFloat(row.getValue("totalAmount")).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "total_payable",
      header: () => (
        <div className="text-right">
          <span className="print:hidden">Total Payable ({currency})</span>
          <span className="hidden print:inline">PAYABLE ({currency})</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right">
          {parseFloat(row.getValue("total_payable")).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "paid_amount",
      header: () => (
        <div className="text-right">
          <span className="print:hidden">Paid Amount ({currency})</span>
          <span className="hidden print:inline">PAID ({currency})</span>
        </div>
      ),
      cell: ({ row }) => {
        const totalPaid = Number(row.original.paidAmount || 0);
        const grossPaid = Number((row.original as any).gross_paid_amount ?? totalPaid);
        const refunded = Number((row.original as any).refunded_amount || 0);

        if (refunded > 0) {
          return (
            <div className="text-right flex flex-col items-end">
              <span className="text-green-600 font-medium">{grossPaid.toFixed(2)}</span>
              <span className="text-red-500 text-[10px] font-semibold flex items-center">
                <span className="mr-1">REFUND:</span> -{Math.abs(refunded).toFixed(2)}
              </span>
            </div>
          );
        }

        return (
          <div className="text-right text-green-600 font-medium">
            {totalPaid.toFixed(2)}
          </div>
        );
      },
    },
    {
      accessorKey: "remaining_balance",
      header: () => (
        <div className="text-right">
          <span className="print:hidden">Due Amount ({currency})</span>
          <span className="hidden print:inline">DUE ({currency})</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right">
          {parseFloat(row.getValue("remaining_balance")).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;

        let color = "bg-gray-500";
        let label = status;

        switch (status) {
          case "paid":
            color = "bg-emerald-500 hover:bg-emerald-600";
            label = "Paid";
            break;
          case "partial":
            color = "bg-amber-500 hover:bg-amber-600";
            label = "Partial Paid";
            break;
          case "pending":
          case "overdue":
            color = "bg-red-500 hover:bg-red-600";
            label = "Unpaid";
            break;
          default:
            // Handle draft or unknown as Unpaid or keep original status if needed
            // For now mapping default/draft to Unpaid/Red as well if it falls through, or gray if unknown
            if (status === 'draft') {
              color = "bg-gray-500 hover:bg-gray-600";
              label = "Draft";
            } else {
              color = "bg-red-500 hover:bg-red-600";
              label = "Unpaid";
            }
            break;
        }

        return <Badge className={color}>{label}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <div className="flex items-center gap-2">
            <Link to={`/dashboard/sales/invoices/${invoice.publicId || invoice.id}`}>
              <Button size="sm" variant="outline-info">View</Button>
            </Link>
          </div>
        );
      },
    },
  ];



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-2xl font-bold">Sales Invoices</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-slate-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-slate-500/40 active:translate-y-0 active:shadow-none"
          >
            <Printer size={18} />
            Print
          </button>
          <Link to="/dashboard/sales/orders/create">
            <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-blue-500/40 active:translate-y-0 active:shadow-none">
              <PlusCircle size={18} />
              Create Order
            </button>
          </Link>
        </div>
      </div>

      {/* Print Only Header */}
      <div className="hidden print:block text-center mb-[15px] pb-1">
        <h1 className="text-4xl font-extrabold uppercase tracking-tight">SALES INVOICES REPORT</h1>
        <div className="mt-1 text-sm text-gray-700 font-semibold">
          <span>Report Generated On: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:hidden">
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

      {/* DataTable */}
      <DataTable
        columns={invoiceColumns}
        data={invoices}
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
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            @page {
              size: landscape;
              margin: 10mm;
            }
            .print\:hidden,
            header,
            nav,
            aside,
            button,
            .no-print {
              display: none !important;
            }
            html, body {
              background: white !important;
              overflow: visible !important;
              height: auto !important;
            }
            .md\:sticky {
              position: static !important;
            }
            table {
              width: 100% !important;
              border-collapse: collapse !important;
              page-break-inside: auto !important;
            }
            thead {
              display: table-header-group !important;
            }
            tr {
              page-break-inside: avoid !important;
              page-break-after: auto !important;
            }
            th, td {
              border: 1px solid #ddd !important;
              padding: 6px 8px !important;
              font-size: 9px !important;
              vertical-align: middle !important;
            }
            th *, td * {
              font-size: 9px !important;
            }
            th {
              background-color: #f3f4f6 !important;
              font-weight: 600 !important;
              text-align: left !important;
              line-height: 1.2 !important;
              text-transform: uppercase !important;
            }
            th:nth-child(11), td:nth-child(11) {
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
            .hidden.print\:block.mb-\[15px\] {
              margin-bottom: 15px !important;
            }
            .border {
              border: none !important;
            }
            .shadow-sm, .shadow-md, .shadow-lg {
              box-shadow: none !important;
            }
            [role="navigation"],
            input,
            input[type="search"],
            input[type="text"],
            .flex.items-center.justify-between {
              display: none !important;
            }
          }
        `
      }} />
    </div>
  );
}
