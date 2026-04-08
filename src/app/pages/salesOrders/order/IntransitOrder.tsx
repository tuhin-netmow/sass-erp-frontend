/* eslint-disable @typescript-eslint/no-explicit-any */

import { DataTable } from "@/app/components/dashboard/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { ACTIONS, MODULES } from "@/app/config/permissions";
import { perm, usePermissions } from "@/shared/hooks/usePermissions";
import {
  useGetAllSalesOrdersQuery,
  useGetSalesOrdersStatsQuery,
} from "@/store/features/app/salesOrder/salesOrder";
import { useAppSelector } from "@/store/store";
import type { SalesOrder } from "@/shared/types/app/salesOrder.types";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle,
  ClipboardList,
  Clock,
  CreditCard,
  DollarSign,
  PlusCircle,
  Printer,
  ShoppingCart,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Link } from "react-router";
import UpdateDeliveryStatusModal from "../delivery/UpdateDeliveryStatusModal";
import { useGetSettingsInfoQuery } from "@/store/features/admin/settingsApiService";

export default function IntransitOrder() {
  const { data: settingsData } = useGetSettingsInfoQuery();
  const from = settingsData?.data;

  const [isUpdateDeliveryStatusModalOpen, setIsUpdateDeliveryStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1); // backend starts from 1
  const [limit] = useState(10);

  const { data, isLoading } = useGetAllSalesOrdersQuery({
    page,
    limit,
    search,
    status: "in_transit"
  });

  const orders = data?.data ?? [];

  const currency = useAppSelector((state) => state.currency.value);

  // --- Permissions ---
  const { hasPermission, isAdmin } = usePermissions();
  const canRecordPayment = isAdmin || hasPermission(perm(MODULES.SALES, ACTIONS.VIEW));
  const canUpdateDelivery = isAdmin || hasPermission(perm(MODULES.SALES, ACTIONS.UPDATE));

  const handleOpenUpdateDeliveryStatusModal = (order: any) => {
    setSelectedOrder(order);
    setIsUpdateDeliveryStatusModalOpen(true);
  };

  const handleCloseUpdateDeliveryStatusModal = () => {
    setIsUpdateDeliveryStatusModalOpen(false);
    setSelectedOrder(null);
  };

  const { data: fetchedOrdersStats } = useGetSalesOrdersStatsQuery(undefined);
  console.log("fetchedOrdersStats", fetchedOrdersStats);

  const totalOrdersCount = fetchedOrdersStats?.data?.total_orders || 0;
  const pendingOrdersCount = fetchedOrdersStats?.data?.pending_orders || 0;
  const deliveredOrdersCount = fetchedOrdersStats?.data?.delivered_orders || 0;
  const totalOrdersValue = fetchedOrdersStats?.data?.total_value || "RM 0";

  const orderStats = [
    {
      label: "Total Orders",
      value: totalOrdersCount,
      gradient: "from-blue-600 to-blue-400",
      shadow: "shadow-blue-500/30",
      icon: <ShoppingCart className="w-6 h-6 text-white" />,
    },
    {
      label: "Pending Orders",
      value: pendingOrdersCount,
      gradient: "from-amber-600 to-amber-400",
      shadow: "shadow-amber-500/30",
      icon: <Clock className="w-6 h-6 text-white" />,
    },
    {
      label: "Delivered Orders",
      value: deliveredOrdersCount,
      gradient: "from-emerald-600 to-emerald-400",
      shadow: "shadow-emerald-500/30",
      icon: <CheckCircle className="w-6 h-6 text-white" />,
    },
    {
      label: "Total Value",
      value: `${currency} ${totalOrdersValue}`,
      gradient: "from-violet-600 to-violet-400",
      shadow: "shadow-violet-500/30",
      icon: <DollarSign className="w-6 h-6 text-white" />,
    },
  ];

  const OrderColumns: ColumnDef<SalesOrder>[] = [
    {
      accessorKey: "orderNumber",
      header: "Order #",
      meta: { className: "md:sticky md:left-0 z-20 bg-background min-w-[120px]" } as any,
      cell: ({ row }) => (
        <span className="font-medium">{row.original.orderNumber}</span>
      ),
    },

    {
      accessorKey: "customer",
      header: "Customer",
      meta: { className: "md:sticky md:left-[120px] z-20 bg-background md:shadow-[4px_0px_5px_-2px_rgba(0,0,0,0.1)]" } as any,
      cell: ({ row }) => (
        <div className="font-semibold">{row.original.customer?.name}</div>
      ),
    },

    {
      accessorKey: "orderDate",
      header: "Date",
      cell: ({ row }) => format(new Date(row.original.orderDate), "dd/MM/yyyy"),
    },

    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) =>
        row.original.dueDate
          ? format(new Date(row.original.dueDate), "dd/MM/yyyy")
          : "-",
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;

        const color =
          status === "delivered"
            ? "bg-green-600"
            : status === "pending"
              ? "bg-yellow-600"
              : status === "confirmed"
                ? "bg-blue-600"
                : "bg-gray-500";

        return (
          <Badge className={`${color} text-white capitalize`}>{status}</Badge>
        );
      },
    },
    {
      id: "status_date",
      header: "Status Date",
      cell: ({ row }) => {
        const { status, deliveryDate, updatedAt } = row.original;
        let dateToDisplay = updatedAt;

        if (status === "delivered" && deliveryDate) {
          dateToDisplay = deliveryDate as string;
        }

        return (
          <div className="text-sm">
            {format(new Date(dateToDisplay), "dd/MM/yyyy")}
          </div>
        )
      }
    },

    {
      accessorKey: "totalAmount",
      header: () => <div className="text-right"><span className="print:hidden">Total </span>Price ({currency})</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {Number(row.original.totalAmount).toFixed(2)}
        </div>
      ),
    },

    {
      accessorKey: "discount_amount",
      header: () => (
        <div className="text-right"><span className="print:hidden">Total </span>Discount ({currency})</div>
      ),
      cell: ({ row }) => (
        <div className="text-right">
          {Number(row.original.discountAmount).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "tax_amount",
      header: () => <div className="text-right"><span className="print:hidden">Total </span>Tax ({currency})</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {Number(row.original.taxAmount).toFixed(2)}
        </div>
      ),
    },
    {
      id: "total_payable", // 👈 use a custom id, not accessorKey
      header: () => <div className="text-right"><span className="print:hidden">Total </span>Payable ({currency})</div>,
      cell: ({ row }) => {
        const totalAmount = Number(row.original.totalAmount) || 0;
        const discountAmount = Number(row.original.discountAmount) || 0;
        const taxAmount = Number(row.original.taxAmount) || 0;

        const totalPayable = totalAmount - discountAmount + taxAmount;

        return <div className="text-right font-semibold">{totalPayable.toFixed(2)}</div>;
      },
    },
    {
      accessorKey: "total_paid_amount",
      header: () => <div className="text-right"><span className="print:hidden">Total </span>Paid ({currency})</div>,
      cell: ({ row }) => {
        const totalPaid = Number(row.original.totalPaidAmount || 0);
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
      id: "total_due",
      header: () => <div className="text-right">Balance<span className="print:hidden"> Due ({currency})</span></div>,
      cell: ({ row }) => {
        const totalAmount = Number(row.original.totalAmount) || 0;
        const discountAmount = Number(row.original.discountAmount) || 0;
        const taxAmount = Number(row.original.taxAmount) || 0;
        const paidAmount = Number(row.original.totalPaidAmount) || 0;

        const totalPayable = totalAmount - discountAmount + taxAmount;
        const dueAmount = totalPayable - paidAmount;

        return <div className={`text-right font-bold ${dueAmount > 0.01 ? 'text-red-600' : 'text-gray-500'}`}>
          {dueAmount.toFixed(2)}
        </div>;
      },
    },
    // {
    //   accessorKey: "created_by",
    //   header: "Staff",
    //   cell: ({ row }) => `User #${row.original.created_by}`,
    // },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex gap-2">
            <Link to={`/dashboard/sales/orders/${item.publicId || (item as any)._id}`}>
              <Button size="sm" variant="outline-info">
                View
              </Button>
            </Link>
            {/* <Link to={`/dashboard/orders/${item.id}/edit`}>
              <Button size="sm" variant="outline">
                Edit
              </Button>
            </Link> */}
            {canUpdateDelivery && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpenUpdateDeliveryStatusModal(item)}
              >
                Change Status
              </Button>
            )}
          </div>
        );
      },
    },
  ];



  const orderStatusOptions = [
    { value: "in_transit", label: "In Transit" },
    { value: "delivered", label: "Delivered" },
    { value: "failed", label: "Failed" },
    { value: "returned", label: "Returned" },
    { value: "cancelled", label: "Cancelled" },
  ] as const;





  const pageRows = orders || [];
  const pageTotalPaid = pageRows.reduce((sum: number, row: any) => sum + Number(row.totalPaidAmount || 0), 0);
  const pageTotalPayable = pageRows.reduce((sum: number, row: any) => {
    const payable = Number(row.totalPayableAmount) || (Number(row.totalAmount) - Number(row.discountAmount) + Number(row.taxAmount));
    return sum + payable;
  }, 0);

  const pageTotalDue = pageRows.reduce((sum: number, row: any) => {
    if (['returned', 'cancelled', 'failed'].includes(row.status?.toLowerCase())) return sum;
    const payable = Number(row.totalPayableAmount) || (Number(row.totalAmount) - Number(row.discountAmount) + Number(row.taxAmount));
    return sum + (payable - Number(row.totalPaidAmount || 0));
  }, 0);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-5 mb-6 print:hidden">
        <h1 className="text-2xl font-bold tracking-tight">
          In-Transit Order List
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-slate-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-slate-500/40 active:translate-y-0 active:shadow-none"
          >
            <Printer size={18} />
            Print
          </button>
          <Link to="/dashboard/sales/invoices">
            <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-5 py-2.5 font-medium text-white shadow-lg shadow-amber-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-amber-500/40 active:translate-y-0 active:shadow-none">
              <ClipboardList size={18} />
              Invoices
            </button>
          </Link>

          {
            canRecordPayment && (<Link to="/dashboard/sales/payments">
              <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cyan-500/40 active:translate-y-0 active:shadow-none">
                <CreditCard size={18} />
                Payments
              </button>
            </Link>)
          }



          <Link to="/dashboard/sales/orders/create">
            <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-blue-500/40 active:translate-y-0 active:shadow-none">
              <PlusCircle size={18} />
              Create Order
            </button>
          </Link>
        </div>
      </div>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 print:hidden">
        {orderStats.map((item, idx) => (
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

      <div className="print:w-full print:m-0 print:p-0">
        {/* Print Only Header */}
        <div id="invoice" className="hidden print:block mb-4">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col gap-2 mt-2 details-text text-left">
              <h1 className="font-bold uppercase company-name">{from?.companyName || "F&Z Global Trade (M) Sdn Bhd"}</h1>
              <p className="leading-tight max-w-[400px]">
                {from?.address || "45, Jalan Industri USJ 1/10, TMN Perindustrian USJ 1, Subang Jaya"}
              </p>
              <p>T: {from?.phone || "0162759780"}{from?.email && `, E: ${from.email}`}</p>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="mb-1">
                {from?.logoUrl ? (
                  <img src={from.logoUrl} alt="Logo" className="h-14 object-contain" />
                ) : (
                  <div className="w-12 h-12 rounded-full border-2 border-[#4CAF50] flex items-center justify-center text-[#4CAF50] font-bold text-lg overflow-hidden">
                    F&Z
                  </div>
                )}
              </div>
              <h2 className="font-bold text-gray-800 mb-1 uppercase details-text">In-Transit Orders Report</h2>
              <div className="details-text space-y-1">
                <p><strong>Date:</strong> {format(new Date(), "dd/MM/yyyy")}</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="pt-6 pb-2 border-none shadow-none print:pt-0">
          <CardHeader className="print:hidden">
            <CardTitle>In-Transit Orders</CardTitle>
            <CardDescription>Manage your orders</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={OrderColumns}
              data={orders}
              pageIndex={page - 1} // DataTable expects 0-based
              pageSize={limit}
              totalCount={data?.pagination?.total ?? 0}
              onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
              onSearch={(value) => {
                setSearch(value);
                setPage(1);
              }}
              isFetching={isLoading}
            />
            {/* Page Summary - Hidden in Print */}
            <div className="mt-4 flex flex-col md:flex-row justify-end gap-4 md:gap-8 text-sm font-medium p-4 bg-muted/20 rounded-lg border border-border/50 animate-in slide-in-from-top-2 print:hidden">
              <div className="flex justify-between md:block w-full md:w-auto">
                <span className="text-muted-foreground mr-2">Page Total Payable:</span>
                <span>{currency} {pageTotalPayable.toFixed(2)}</span>
              </div>
              <div className="flex justify-between md:block w-full md:w-auto">
                <span className="text-muted-foreground mr-2">Page Total Paid:</span>
                <span className="text-green-600 font-bold">{currency} {pageTotalPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between md:block w-full md:w-auto">
                <span className="text-muted-foreground mr-2">Page Balance Due:</span>
                <span className={`font-bold ${pageTotalDue > 0.01 ? 'text-red-600' : 'text-green-600'}`}>{currency} {pageTotalDue.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <UpdateDeliveryStatusModal
        isOpen={isUpdateDeliveryStatusModalOpen}
        onClose={handleCloseUpdateDeliveryStatusModal}
        selectedOrder={selectedOrder}
        statusOptions={orderStatusOptions}
        defaultStatus="delivered"
      />

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            margin: 5mm;
            size: A4 landscape;
          }
          body {
            -webkit-print-color-adjust: exact;
            font-size: 11px !important;
            background: white !important;
            color: black !important;
          }
          * {
            box-sizing: border-box;
          }
          .no-print, 
          header, 
          nav, 
          aside, 
          button, 
          input,
          .max-w-sm,
          .print\\:hidden,
          .grid.grid-cols-1,
          .flex.flex-wrap.items-center.justify-between.py-4.gap-4 {
            display: none !important;
          }
          
          /* Full width container */
          .print\\:w-full {
            width: 100% !important;
            max-width: 100% !important;
          }
          .print\\:m-0 {
            margin: 0 !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          
          #invoice {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Typography */
          h1, h2, h3, h4, h5, h6 { 
            font-size: 11px !important; 
            margin: 0 !important;
          }
          .company-name {
            font-size: 14px !important;
            line-height: 1.2 !important;
            margin: 0 !important;
          }
          .details-text { 
            font-size: 11px !important; 
            line-height: 1.2 !important; 
          }
          
          /* Table styling */
          table { 
            font-size: 11px !important; 
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: auto !important;
            margin: 0 !important;
            margin-left: 0 !important;
            padding-left: 0 !important;
          }
          th, td { 
            border: 1px solid #ddd !important;
            padding: 4px !important; 
            font-size: 11px !important;
            line-height: 1.2 !important;
            vertical-align: middle !important;
          }
          th {
            background-color: #f3f4f6 !important;
            font-weight: 600 !important;
            text-align: left !important;
          }
          
          /* Remove all badge styling in print */
          .inline-flex.items-center,
          [class*="Badge"],
          [class*="badge"] {
            display: inline !important;
            background: none !important;
            border: none !important;
            padding: 0 !important;
            border-radius: 0 !important;
            color: black !important;
            font-size: 11px !important;
            font-weight: normal !important;
            text-transform: capitalize !important;
          }
          
          /* Ensure refund info displays in print */
          .text-red-500, .text-red-600 {
            color: #000 !important;
            font-size: 9px !important;
          }
          .text-green-600 {
            color: #000 !important;
          }
          
          /* Hide non-essential columns */
          th:nth-child(4), td:nth-child(4), /* Due Date */
          th:nth-child(5), td:nth-child(5), /* Status */
          th:nth-child(6), td:nth-child(6), /* Status Date */
          th:last-child, td:last-child { /* Actions */
            display: none !important;
          }

          /* Ensure table container matches header width */
          .Card, .CardContent, .rounded-xl, .border {
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          
          /* Remove sticky positioning */
          .md\\:sticky {
            position: static !important;
            background: white !important;
          }
          
          /* Spacing adjustments */
          .mb-6 { margin-bottom: 8px !important; }
          .mb-4 { margin-bottom: 4px !important; }
          .mb-1 { margin-bottom: 2px !important; }
          .mt-2 { margin-top: 2px !important; }
          .gap-2 { gap: 2px !important; }
        }
      `}</style>
    </div >
  );
}
