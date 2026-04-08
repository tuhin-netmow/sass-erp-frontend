"use client";

import { useState } from "react";
import { DataTable } from "@/app/components/dashboard/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
} from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
} from "@/shared/components/ui/dialog";
import {
  useDeleteSupplierMutation,
  useGetAllSuppliersQuery,
  useGetSupplierStatsQuery,
} from "@/store/features/app/suppliers/supplierApiService";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, PlusCircle, Trash2, Users as UsersIcon, ShoppingCart, User,  AlertCircle, UserCheck, DollarSign, Printer } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Link } from "react-router";
import { toast } from "sonner";
import type { Supplier } from "@/shared/types/app/supplier.types";
import { useAppSelector } from "@/store/store";
import { ACTIONS, MODULES } from "@/app/config/permissions";
import { perm, usePermissions } from "@/shared/hooks/usePermissions";
import { useGetSettingsInfoQuery } from "@/store/features/admin/settingsApiService";
import { format } from "date-fns";

type ColumnMeta = {
  className?: string;
};

type StatItem = {
  label: string;
  value: number | string;
};



// Simple confirmation modal
function ConfirmModal({
  open,
  onClose,
  onConfirm,
  message,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-xl w-96">
        <h3 className="text-lg font-semibold mb-4">Confirm Action</h3>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SuppliersList() {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<string>("newest");
  const [limit, setLimit] = useState(10);

  const { data: settingsData } = useGetSettingsInfoQuery();
  const from = settingsData?.data;

  const currency = useAppSelector((state) => state.currency.value);

  // --- Permissions ---
  const { hasPermission, isAdmin } = usePermissions();
  // const canViewSupplier = isAdmin || hasPermission(perm(MODULES.SUPPLIERS, ACTIONS.VIEW));
  // const canCreateSupplier = isAdmin || hasPermission(perm(MODULES.SUPPLIERS, ACTIONS.CREATE));
  // const canEditSupplier = isAdmin || hasPermission(perm(MODULES.SUPPLIERS, ACTIONS.UPDATE));
  const canDeleteSupplier = isAdmin || hasPermission(perm(MODULES.SUPPLIERS, ACTIONS.DELETE));

  const { data: suppliersData, isLoading } = useGetAllSuppliersQuery({
    search,
    page,
    limit,
    sort: sort !== 'newest' ? sort : undefined
  });
  const [deleteSupplier, { isLoading: isDeleting }] = useDeleteSupplierMutation();

  const { data: supplierStats } = useGetSupplierStatsQuery(undefined);

  const activeSuppliers = supplierStats?.data?.find((c: StatItem) => c.label === "All Active Suppliers")?.value || 0;
  const totalSuppliersStat = supplierStats?.data?.find((c: StatItem) => c.label === "Total Suppliers")?.value || 0;
  const totalPurchase = supplierStats?.data?.find((c: StatItem) => c.label === "Total Purchase Amount")?.value || 0;
  const totalPaid = supplierStats?.data?.find((c: StatItem) => c.label === "Total Paid")?.value || 0;
  const totalDue = supplierStats?.data?.find((c: StatItem) => c.label === "Total Due")?.value || 0;

  const stats = [
    {
      label: "Active Suppliers",
      value: activeSuppliers,
      gradient: "from-emerald-600 to-emerald-400",
      shadow: "shadow-emerald-500/30",
      icon: <UserCheck className="w-6 h-6 text-white" />,
    },
    {
      label: "Total Suppliers",
      value: totalSuppliersStat,
      gradient: "from-blue-600 to-blue-400",
      shadow: "shadow-blue-500/30",
      icon: <UsersIcon className="w-6 h-6 text-white" />,
    },
    {
      label: "Total Purchase Amount",
      value: `${currency} ${Number(totalPurchase).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      gradient: "from-indigo-600 to-indigo-400",
      shadow: "shadow-indigo-500/30",
      icon: <ShoppingCart className="w-6 h-6 text-white" />,
    },
    {
      label: "Total Paid",
      value: `${currency} ${Number(totalPaid).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      gradient: "from-emerald-600 to-emerald-400",
      shadow: "shadow-emerald-500/30",
      icon: <DollarSign className="w-6 h-6 text-white" />,
    },
    {
      label: "Total Due",
      value: `${currency} ${Number(totalDue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      gradient: "from-rose-600 to-rose-400",
      shadow: "shadow-rose-500/30",
      icon: <AlertCircle className="w-6 h-6 text-white" />,
    },
  ];

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | number | null>(null);
  const [previewData, setPreviewData] = useState<{
    images: string[];
    index: number;
  } | null>(null);

  const handleDeleteClick = (id: string | number) => {
    setSelectedSupplierId(id);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSupplierId) return;

    try {
      await deleteSupplier(selectedSupplierId).unwrap();
      toast.success("Supplier deleted successfully");
    } catch (error) {
      toast.error("Failed to delete supplier");
      console.error(error);
    } finally {
      setModalOpen(false);
      setSelectedSupplierId(null);
    }
  };

  const supplierColumns: ColumnDef<Supplier>[] = [
    {
      accessorKey: "id",
      header: "ID",
      meta: { className: "md:sticky md:left-0 z-20 bg-background min-w-[60px]" } as ColumnMeta
    },
    {
      accessorKey: "name",
      header: "Name",
      meta: { className: "md:sticky md:left-[60px] z-20 bg-background md:shadow-[4px_0px_5px_-2px_rgba(0,0,0,0.1)]" } as ColumnMeta,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-sm">
            {row.original.name}
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            {row.original.contactPerson || "—"}
          </span>
        </div>
      )
    },
    {
      accessorKey: "thumbUrl",
      header: "Image",
      meta: { className: "min-w-[110px]" } as ColumnMeta,
      cell: ({ row }) => {
        const thumbUrl = row.original.thumbUrl;
        return thumbUrl ? (
          <img
            src={thumbUrl}
            alt={row.original.name}
            className="w-20 h-20 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity shrink-0"
            onClick={() =>
              setPreviewData({
                images: [thumbUrl].filter(Boolean) as string[],
                index: 0,
              })
            }
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-gray-500" />
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "city",
      header: "City",
    },
    {
      accessorKey: "totalPurchaseAmount",
      header: () => <div className="text-right">Total Purchase Amount ({currency})</div>,
      cell: ({ row }) => {
        const amount = row.getValue("totalPurchaseAmount");
        return (
          <div className="text-right font-medium">
            {amount ? Number(amount).toFixed(2) : "0.00"}
          </div>
        );
      },
    },
    {
      accessorKey: "totalPaidAmount",
      header: () => <div className="text-right">Total Paid ({currency})</div>,
      cell: ({ row }) => {
        const amount = row.getValue("totalPaidAmount");
        return (
          <div className="text-right text-emerald-600 font-medium">
            {amount ? Number(amount).toFixed(2) : "0.00"}
          </div>
        );
      },
    },
    {
      accessorKey: "totalDueAmount",
      header: () => <div className="text-right">Total Due ({currency})</div>,
      cell: ({ row }) => {
        const amount = row.getValue("totalDueAmount");
        return (
          <div className="text-right text-rose-600 font-bold">
            {amount ? Number(amount).toFixed(2) : "0.00"}
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("isActive") as boolean;
        const color = status ? "bg-green-600" : "bg-red-600";
        return <Badge className={`${color} text-white`}>{status ? "Active" : "Inactive"}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const supplier = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <Link to={`/dashboard/purchase-orders/create?supplierId=${supplier.publicId || supplier.id}`}>
              <Button size="sm" className="h-8 bg-cyan-50 text-cyan-600 hover:bg-cyan-100 border-none shadow-none" title="Create Purchase Order">
                <ShoppingCart className="h-4 w-4" />
                Order
              </Button>
            </Link>
            <Link to={`/dashboard/suppliers/${supplier.publicId}/edit`}>
              <Button size="sm" className="h-8 bg-blue-50 text-blue-600 hover:bg-blue-100 border-none shadow-none">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            {canDeleteSupplier && (
              <Button
                size="sm"
                className="h-8 bg-rose-50 text-rose-600 hover:bg-rose-100 border-none shadow-none"
                onClick={() => handleDeleteClick(supplier._id)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 print:hidden">
        <h1 className="text-2xl font-bold tracking-tight">Supplier Management</h1>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white print:hidden"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>

          <Link to="/dashboard/suppliers/create">
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white print:hidden">
              <PlusCircle className="h-4 w-4" />
              Add Supplier
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="flex flex-wrap gap-6 mb-6 print:hidden">
        {stats.map((item, idx) => (
          <div
            key={idx}
            className={`relative flex-1 min-w-60 overflow-hidden rounded-2xl bg-linear-to-br ${item.gradient} p-6 shadow-lg ${item.shadow} transition-all duration-300 hover:scale-[1.02] hover:translate-y-[-2px]`}
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
              <h2 className="font-bold text-gray-800 mb-1 uppercase details-text">Supplier List</h2>
              <div className="details-text space-y-1">
                <p><strong>Date:</strong> {format(new Date(), "dd/MM/yyyy")}</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="pt-6 pb-2 border-none shadow-none print:pt-0">

          <CardContent className="print:p-0">
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              // Data Table
              <div className="max-w-full overflow-hidden text-black">
                <DataTable
                  columns={supplierColumns}
                  data={suppliersData?.data || []}
                  totalCount={suppliersData?.pagination?.total || 0}
                  pageIndex={page - 1}
                  pageSize={limit}
                  onPageChange={(idx) => setPage(idx + 1)}
                  onSearch={(val) => {
                    setSearch(val);
                    setPage(1);
                  }}
                  onPageSizeChange={(newSize) => {
                    setLimit(newSize);
                    setPage(1);
                  }}
                  isFetching={isLoading}
                  filters={
                    <Select
                      value={sort}
                      onValueChange={(value) => {
                        setSort(value);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="top_purchase">Top Purchase</SelectItem>
                        <SelectItem value="low_purchase">Low Purchase</SelectItem>
                      </SelectContent>
                    </Select>
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this supplier? This action cannot be undone."
      />

      <Dialog
        open={!!previewData}
        onOpenChange={(open) => !open && setPreviewData(null)}
      >
        <DialogContent className="max-w-3xl p-5 overflow-hidden bg-white">
          <div className="relative flex items-center justify-center">
            {previewData && (
              <>
                <img
                  src={previewData.images[previewData.index]}
                  alt="Supplier Preview"
                  className="max-w-full max-h-[70vh] rounded-lg object-contain"
                />
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
          #invoice {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          h1 { font-size: 11px !important; }
          h2 { font-size: 11px !important; }
          table { 
            font-size: 11px !important; 
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: auto !important;
          }
          th, td { 
            border: 1px solid #ddd !important;
            padding: 4px !important; 
            font-size: 11px !important;
          }
          .details-text, .table-text { 
            font-size: 11px !important; 
            line-height: 1.2 !important; 
          }
          .company-name {
            font-size: 18px !important;
            line-height: 1.2 !important;
          }
          .text-sm, .text-xs, .text-base, .text-lg, .text-xl, .font-bold, .font-semibold, span, p, div { 
            font-size: 11px !important; 
          }
          .mb-6 { margin-bottom: 8px !important; }
          .mb-4 { margin-bottom: 4px !important; }
          
          /* Hide non-essential columns for supplier list print */
          th:nth-child(3), td:nth-child(3), /* Image */
          th:nth-child(10), td:nth-child(10), /* Status */
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
        }
        /* Standardizing screen sizes */
        .company-name { font-size: 18px !important; line-height: 1.2; }
        .details-text { font-size: 12px !important; line-height: 1.4; }
        .table-text { font-size: 12px !important; }
      `}</style>
    </div>
  );
}
