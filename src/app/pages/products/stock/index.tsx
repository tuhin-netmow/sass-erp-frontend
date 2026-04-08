/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { DataTable } from "@/app/components/dashboard/DataTable";
import { Eye, Trash2, Printer } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DamageWastageForm from "@/app/components/products/DamageWastageForm";
import type { Product } from "@/shared/types";
import { useGetAllProductsQuery, useGetProductStatsQuery } from "@/store/features/admin/productsApiService";
import { Link } from "react-router";
import { useAppSelector } from "@/store/store";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useGetSettingsInfoQuery } from "@/store/features/admin/settingsApiService";
import { format } from "date-fns";
import { Card, CardContent } from "@/shared/components/ui/card";
// import { ACTIONS, MODULES } from "@/app/config/permissions";
// import { perm, usePermissions } from "@/shared/hooks/usePermissions";

export default function StockManagement() {
  // --- Permissions (uncomment to activate) ---
  // const { hasPermission, isAdmin } = usePermissions();
  // const canViewProduct = isAdmin || hasPermission(perm(MODULES.PRODUCTS, ACTIONS.VIEW));
  // const canCreateProduct = isAdmin || hasPermission(perm(MODULES.PRODUCTS, ACTIONS.CREATE));
  // const canEditProduct = isAdmin || hasPermission(perm(MODULES.PRODUCTS, ACTIONS.UPDATE));
  // const canDeleteProduct = isAdmin || hasPermission(perm(MODULES.PRODUCTS, ACTIONS.DELETE));

  const [openDamageForm, setOpenDamageForm] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [stockStatus, setStockStatus] = useState<string>("all");
  const [limit, setLimit] = useState<number>(10);

  const { data: settingsData } = useGetSettingsInfoQuery();
  const from = settingsData?.data;

  const {
    data: fetchedProducts,
    isFetching,
  } = useGetAllProductsQuery({
    page,
    limit,
    search,
    stockStatus: stockStatus === "all" ? undefined : stockStatus
  });

  const products: Product[] = fetchedProducts?.data || [];

  const pagination = fetchedProducts?.pagination ?? {
    total: 0,
    page: 1,
    limit: 10,
    totalPage: 1,
  };

  const currency = useAppSelector((state) => state.currency.value);

  const productColumns: ColumnDef<Product>[] = [
    {
      accessorKey: "sku",
      header: "SKU",
      meta: { className: "md:sticky md:left-0 z-20 bg-background min-w-[60px]" } as any
    },
    {
      accessorKey: "name",
      header: "Product Name",
      meta: { className: "md:sticky md:left-[60px] z-20 bg-background md:shadow-[4px_0px_5px_-2px_rgba(0,0,0,0.1)]" } as any
    },
    {
      accessorKey: "thumb_url",
      header: "Image",
      cell: ({ row }) => (
        <img
          src={row.original.thumbUrl}
          alt={row.original.name}
          className="w-10 h-10 rounded-full"
        />
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => row?.original?.category?.name,
    },
    {
      accessorKey: "cost",
      header: () => (
        <div className="text-right">Cost Price ({currency})</div>
      ),
      cell: ({ row }) => (
        <div className="text-right">{Number(row.original.cost).toFixed(2)}</div>
      ),
    },
    {
      accessorKey: "price",
      header: () => (
        <div className="text-right">Selling Price ({currency})</div>
      ),
      cell: ({ row }) => (
        <div className="text-right">{Number(row.original.price).toFixed(2)}</div>
      ),
    },
    {
      accessorKey: "stock_quantity",
      header: () => <div className="text-right">Stock</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">{row.original.stockQuantity}</div>
      ),
    },
    {
      id: "stock_status",
      header: "Stock wise status",
      cell: ({ row }) => {
        const stock = row.original.stockQuantity || 0;
        const isAvailable = stock > 0;
        return (
          <span
            className={`py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wider ${isAvailable
              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
              : "bg-rose-100 text-rose-700 border border-rose-200"
              }`}
          >
            {isAvailable ? "Available" : "Out of Stock"}
          </span>
        );
      },
    },
    {
      id: "total_cost",
      header: () => <div className="text-right">Total Cost Price ({currency})</div>,
      cell: ({ row }) => {
        const totalCost = (row.original.stockQuantity || 0) * (row.original.cost || 0);
        return <div className="text-right text-blue-600">{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>;
      },
    },
    {
      id: "total_sell",
      header: () => <div className="text-right">Total Sell Price ({currency})</div>,
      cell: ({ row }) => {
        const totalSell = (row.original.stockQuantity || 0) * (row.original.price || 0);
        return <div className="text-right text-emerald-600">{totalSell.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>;
      },
    },
    {
      id: "profit",
      header: () => <div className="text-right">Total Profitable ({currency})</div>,
      cell: ({ row }) => {
        const profit = ((row.original.price || 0) - (row.original.cost || 0)) * (row.original.stockQuantity || 0);
        return (
          <div className={`text-right font-bold ${profit >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
            {profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.isActive;
        const bgColor = status ? "bg-green-500" : "bg-red-500";
        return (
          <span
            className={`py-1 px-2 rounded-full text-xs text-white font-medium ${bgColor}`}
          >
            {status ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const product = row.original;

        return (
          <div className="flex items-center gap-2">
            <Link to={`/dashboard/products/${product.publicId}`}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
              >
                <Eye className="h-4 w-4" />
                View
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={() => {
                setSelectedProductId(product._id);
                setOpenDamageForm(true);
              }}
              disabled={Number(product.stockQuantity) <= 0}
              className={cn(
                "h-8 flex items-center gap-1.5",
                Number(product.stockQuantity) <= 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-rose-600 hover:bg-rose-700 text-white"
              )}
            >
              <Trash2 className="h-4 w-4" />
              Damage
            </Button>
          </div>
        );
      },
    },
  ];

  // Fetch stats from API
  const { data: statsData } = useGetProductStatsQuery(undefined);
  const stats = statsData?.data || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-start gap-4 print:hidden">
        <div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Stock Management
          </h1>
          <p className="text-muted-foreground mt-2">Monitor and manage product inventory</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white print:hidden"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 print:hidden">
        {stats.map((item: any, idx: number) => {
          // Dynamic colors based on label or index if color not provided
          const baseColor = item.color || (
            item.label.includes('Purchase') ? 'bg-blue-600' :
              item.label.includes('Salable') ? 'bg-emerald-600' :
                item.label.includes('Profit') ? 'bg-indigo-600' : 'bg-slate-600'
          );

          return (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-2xl ${baseColor} p-5 shadow-lg shadow-black/10 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1`}
            >
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10 blur-xl" />

              <div className="relative space-y-2">
                <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">{item.label}</p>
                <h3 className="text-2xl font-extrabold text-white truncate">
                  {item.isCurrency ? `${currency} ` : ''}
                  {item.isCurrency ? Number(item.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : item.value}
                </h3>
              </div>

              <div className="mt-4 h-1 w-full rounded-full bg-black/10">
                <div className="h-full w-1/3 rounded-full bg-white/30" />
              </div>
            </div>
          );
        })}
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
              <h2 className="font-bold text-gray-800 mb-1 uppercase details-text">Stock Report</h2>
              <div className="details-text space-y-1">
                <p><strong>Date:</strong> {format(new Date(), "dd/MM/yyyy")}</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="pt-6 pb-2 border-none shadow-none print:pt-0">
          <CardContent className="print:p-0">
            <DataTable
              columns={productColumns}
              data={products}
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
                <div className="w-[140px]">
                  <Select value={stockStatus} onValueChange={(val) => { setStockStatus(val); setPage(1); }}>
                    <SelectTrigger className="w-full bg-white dark:bg-slate-950 border-gray-200 dark:border-gray-800">
                      <SelectValue placeholder="Stock Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border-gray-100 shadow-xl">
                      <SelectItem value="all">All Stock Status</SelectItem>
                      <SelectItem value="available" className="text-emerald-600 font-medium">Available</SelectItem>
                      <SelectItem value="low_stock" className="text-orange-600 font-medium">Low Stock</SelectItem>
                      <SelectItem value="out_of_stock" className="text-rose-600 font-medium">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              }
            />
          </CardContent>
        </Card>
      </div>

      <DamageWastageForm
        open={openDamageForm}
        setOpen={setOpenDamageForm}
        products={products}
        initialProductId={selectedProductId}
        refetchProducts={async () => { }}
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
          
          /* Hide non-essential columns for stock list print */
          th:nth-child(3), td:nth-child(3), /* Image */
          th:nth-child(8), td:nth-child(8), /* Stock Status Label */
          th:nth-child(12), td:nth-child(12), /* Status */
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
