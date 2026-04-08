
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
  Eye,
  PlusCircle,
  Printer,
  ShoppingCart,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Link } from "react-router";
import UpdateDeliveryStatusModal from "../delivery/UpdateDeliveryStatusModal";
import { useGetSettingsInfoQuery } from "@/store/features/admin/settingsApiService";

export default function PendingOrders() {
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
    status: "pending",
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

  const totalOrdersCount = fetchedOrdersStats?.data?.totalOrders || fetchedOrdersStats?.data?.total_orders || 0;
  const pendingOrdersCount = fetchedOrdersStats?.data?.pendingOrders || fetchedOrdersStats?.data?.pending_orders || 0;
  const deliveredOrdersCount = fetchedOrdersStats?.data?.deliveredOrders || fetchedOrdersStats?.data?.delivered_orders || 0;
  const totalOrdersValue = fetchedOrdersStats?.data?.totalValue || fetchedOrdersStats?.data?.total_value || "RM 0";

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
        const delivery_date = (row.original as any).delivery_date;
        const updated_at = (row.original as any).updated_at || updatedAt;
        let dateToDisplay = updated_at;

        if (status === "delivered" && (deliveryDate || delivery_date)) {
          dateToDisplay = (deliveryDate || delivery_date) as string;
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
      cell: ({ row }) => (
        <div className="text-right text-green-600 font-medium">
          {Number(row.original.totalPaidAmount || 0).toFixed(2)}
        </div>
      ),
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
              <Button size="sm" className="h-8 bg-blue-50 text-blue-600 hover:bg-blue-100 border-none shadow-none">
                <Eye className="w-4 h-4 mr-1" /> View
              </Button>
            </Link>
            <Link to={`/dashboard/sales/orders/${item.publicId || (item as any)._id}/print`}>
              <Button size="sm" variant="outline" className="h-8 bg-gray-50 text-gray-600 hover:bg-gray-100 border-none shadow-none" title="Print Order">
                <Printer className="w-4 h-4" />
              </Button>
            </Link>
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



  const pendingStatusOptions = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "failed", label: "Failed" },
    { value: "cancelled", label: "Cancelled" },
  ] as const;








  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-5 mb-6 print:hidden">
        <h1 className="text-2xl font-bold tracking-tight">
          Pending Order List
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
              <h2 className="font-bold text-gray-800 mb-1 uppercase details-text">Pending Orders Report</h2>
              <div className="details-text space-y-1">
                <p><strong>Date:</strong> {format(new Date(), "dd/MM/yyyy")}</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="pt-6 pb-2 border-none shadow-none print:pt-0">
          <CardHeader className="print:hidden">
            <CardTitle>Pending Orders</CardTitle>
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
          </CardContent>
        </Card>
      </div>

      <UpdateDeliveryStatusModal
        isOpen={isUpdateDeliveryStatusModalOpen}
        onClose={handleCloseUpdateDeliveryStatusModal}
        selectedOrder={selectedOrder}
        statusOptions={pendingStatusOptions}
        defaultStatus="confirmed"
      />

      {/* Print Styles */}
      <style>{`
          @media print {
            @page {
              margin: 5mm;
              size: A4 landscape;
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
              overflow: visible !important;
              height: auto !important;
            }
            .md\\:sticky {
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
              padding: 4px !important;
              font-size: 11px !important;
              line-height: 1.2 !important;
              vertical-align: middle !important;
            }
            th {
              background-color: #f3f4f6 !important;
              font-weight: 600 !important;
              text-align: left !important;
              line-height: 1.2 !important;
              text-transform: uppercase !important;
            }
            th:nth-child(1), td:nth-child(1) {
              width: 10% !important;
              font-weight: 600 !important;
            }
            th:nth-child(2), td:nth-child(2) {
              width: 20% !important;
              font-weight: 600 !important;
            }
            th:nth-child(3), td:nth-child(3) {
              width: 12% !important;
            }
            th:nth-child(4), td:nth-child(4) {
              display: none !important;
            }
            th:nth-child(5), td:nth-child(5) {
              display: none !important;
            }
            th:nth-child(6), td:nth-child(6) {
              display: none !important;
            }
            th:nth-child(7), td:nth-child(7) {
              width: 14% !important;
              text-align: right !important;
            }
            th:nth-child(8), td:nth-child(8) {
              width: 12% !important;
              text-align: right !important;
            }
            th:nth-child(9), td:nth-child(9) {
              width: 12% !important;
              text-align: right !important;
            }
            th:nth-child(10), td:nth-child(10) {
              width: 14% !important;
              text-align: right !important;
              font-weight: 600 !important;
            }
            th:nth-child(11), td:nth-child(11) {
              width: 14% !important;
              text-align: right !important;
            }
            th:nth-child(12), td:nth-child(12) {
              width: 14% !important;
              text-align: right !important;
            }
            th:nth-child(13), td:nth-child(13) {
              display: none !important;
            }
            .company-name {
              font-size: 12px !important;
              line-height: 1.2 !important;
              margin: 0 !important;
            }
            .details-text { 
              font-size: 10px !important; 
              line-height: 1.2 !important; 
            }
            h1, h2, h3 {
              font-size: 10px !important;
              margin: 0 !important;
            }
            .hidden.print\\:block.mb-\\[15px\\] {
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
      `}</style>
    </div>
  );
}
