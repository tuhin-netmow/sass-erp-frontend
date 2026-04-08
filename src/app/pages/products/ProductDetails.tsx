import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle} from "@/shared/components/ui/card";
import { Link, useParams } from "react-router";
import {
  useGetAllStockMovementsQuery,
  useGetProductByIdQuery,
  useGetOrdersByProductIdQuery,
} from "@/store/features/admin/productsApiService";
import type { Product, StockMovement } from "@/shared/types";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/app/components/dashboard/DataTable";
import { useAppSelector } from "@/store/store";
import { BackButton } from "@/shared/components/common/BackButton";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import {
  MoveLeft,
  MoveRight,
  Edit,
  Package,
  Tag,
  BarChart3,
  Layers,
  History,
  ShoppingCart,
  Receipt,
  AlertTriangle,
  Info
} from "lucide-react";


import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ACTIONS, MODULES } from "@/app/config/permissions";
import { perm, usePermissions } from "@/shared/hooks/usePermissions";


export default function ProductDetailsPage() {
  const { hasPermission, isAdmin } = usePermissions();
  // const canViewProduct = isAdmin || hasPermission(perm(MODULES.PRODUCTS, ACTIONS.VIEW));
  // const canCreateProduct = isAdmin || hasPermission(perm(MODULES.PRODUCTS, ACTIONS.CREATE));
  const canEditProduct = isAdmin || hasPermission(perm(MODULES.PRODUCTS, ACTIONS.UPDATE));
  // const canDeleteProduct = isAdmin || hasPermission(perm(MODULES.PRODUCTS, ACTIONS.DELETE));

  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [previewData, setPreviewData] = useState<{
    images: string[];
    index: number;
  } | null>(null);
  const limit = 10;
  const productId = useParams().productId;

  const { data: fetchedProduct, isLoading: isProductLoading } = useGetProductByIdQuery(productId!, {
    skip: !productId,
  });

  const product: Product | undefined = fetchedProduct?.data;
  const currency = useAppSelector((state) => state.currency.value);

  const {
    data: fetchedStockMovements,
    isFetching,
  } = useGetAllStockMovementsQuery(
    { id: productId!, page, limit, search },
    {
      skip: !productId,
    }
  );

  /* ---------------- STOCK MOVEMENT COLUMNS ---------------- */
  const columns: ColumnDef<StockMovement>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ getValue }) => {
        const dateStr = getValue<string>();
        const date = new Date(dateStr);
        return <span className="text-gray-600 space-x-2">
          <span className="font-semibold">{format(date, "yyyy-MM-dd")}</span>
          <span className="text-xs text-muted-foreground">{format(date, "hh:mm a")}</span>
        </span>;
      },
    },
    {
      accessorKey: "movementType",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.movementType;
        const isPositive = ['in', 'adjustmentAdd', 'return'].includes(type.toLowerCase());
        return <Badge variant="outline" className={isPositive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
          {type.replace('_', ' ').toUpperCase()}
        </Badge>
      }
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) => {
        const qty = Number(row.original.quantity);
        return <span className={`font-mono font-bold ${qty > 0 ? "text-emerald-600" : "text-rose-600"}`}>
          {qty > 0 ? "+" : ""}{qty}
        </span>
      },
    },
    {
      accessorKey: "referenceType",
      header: "Reference",
      cell: ({ row }) => <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{row.original.referenceType}</span>,
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => <span className="text-sm text-gray-500 italic truncate max-w-[200px] block" title={row.original.notes || ""}>{row.original.notes || "-"}</span>,
    },
  ];

  /* ---------------- PRODUCT ORDERS LOGIC ---------------- */
  const [ordersPage, setOrdersPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateRange] = useState<DateRange | undefined>();

  const {
    data: fetchedOrders,
    isFetching: isOrdersFetching
  } = useGetOrdersByProductIdQuery({
    id: productId!,
    page: ordersPage,
    limit,
    status: statusFilter || undefined,
    startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
  }, {
    skip: !productId
  });

  const orderColumns: ColumnDef<any>[] = [
    {
      accessorKey: "orderNumber",
      header: "Order #",
      cell: ({ row }) => (
        <Link to={`/dashboard/sales/orders/${row.original.publicId || row.original.id}`} className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-1">
          <Receipt className="w-3 h-3" />
          {row.original.orderNumber}
        </Link>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="outline" className={`capitalize px-2 py-0.5 shadow-sm border-0 ${row.original.status === 'delivered' ? 'bg-green-100 text-green-800' :
          row.original.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            row.original.status === 'pending' ? 'bg-amber-100 text-amber-800' :
              'bg-slate-100 text-slate-800'
          }`}>
          {row.original.status}
        </Badge>
      )
    },
    {
      accessorKey: "orderDate",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-gray-600 text-sm">{row.original.orderDate ? format(new Date(row.original.orderDate), "MMM dd, yyyy") : "N/A"}</span>
      )
    },
    {
      accessorKey: "customer.name",
      header: "Customer",
      cell: ({ row }) => <div className="flex flex-col">
        <span className="font-medium text-gray-900">{row.original.customer?.name}</span>
        <span className="text-xs text-muted-foreground">{row.original.customer?.phone}</span>
      </div>
    }
  ];

  if (isProductLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      <p className="text-muted-foreground animate-pulse">Loading product details...</p>
    </div>
  );

  if (!product) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="bg-slate-100 p-6 rounded-full text-slate-400">
        <Package className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
      <BackButton />
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto pb-10 space-y-8 animate-in fade-in-50 duration-500">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex items-start gap-4">
          <div onClick={() => setPreviewData({ images: [product.thumbUrl || ""], index: 0 })}
            className="w-16 h-16 rounded-lg bg-slate-50 border flex items-center justify-center cursor-pointer overflow-hidden hover:opacity-80 transition-opacity">
            {product.thumbUrl ? (
              <img src={product.thumbUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-8 h-8 text-slate-300" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900 leading-none">{product.name}</h1>
              <Badge variant={product.isActive ? "default" : "destructive"} className="uppercase text-[10px] tracking-wider">
                {product.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                <Tag className="w-3 h-3" /> {product.sku}
              </span>
              <span>
                {product.category?.name || "No Category"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <BackButton />
          {canEditProduct && (
            <Link to={`/dashboard/products/${product?.publicId || product?._id}/edit`}>
              <Button className="gap-2 shadow-sm">
                <Edit className="w-4 h-4" /> Edit Product
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN - Main Info */}
        <div className="lg:col-span-2 space-y-8">

          {/* Gallery and Key Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Image Gallery */}
            <Card className="overflow-hidden border-none shadow-md">
              <div className="aspect-video bg-slate-50 relative group cursor-pointer" onClick={() => setPreviewData({ images: [product.thumbUrl || ""], index: 0 })}>
                {product.thumbUrl ? (
                  <img src={product.thumbUrl} alt={product.name} className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Package className="w-16 h-16" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-end">
                  <span className="text-white text-xs font-medium">Click to expand</span>
                </div>
              </div>
              {product.galleryItems && product.galleryItems.length > 0 && (
                <div className="p-4 bg-white border-t flex gap-2 overflow-x-auto">
                  {product.galleryItems.map((url, i) => (
                    <div key={i} className="w-16 h-16 flex-shrink-0 rounded border bg-slate-50 cursor-pointer hover:border-blue-500 transition-colors"
                      onClick={() => setPreviewData({ images: product.galleryItems || [], index: i })}>
                      <img src={url} className="w-full h-full object-cover" alt="" />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Pricing & Stock Card */}
            <Card className="flex flex-col border-none shadow-md h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" /> Pricing & Inventory
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b pb-2 border-dashed">
                    <span className="text-sm font-medium text-gray-600">Selling Price</span>
                    <span className="text-2xl font-bold text-gray-900">{currency} {product.price?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-end border-b pb-2 border-dashed">
                    <span className="text-sm font-medium text-gray-600">Cost Price</span>
                    <span className="text-lg font-semibold text-gray-700">{currency} {product.cost?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-end border-b pb-2 border-dashed">
                    <span className="text-sm font-medium text-gray-600">Margin</span>
                    <Badge variant="secondary" className="font-mono">
                      {product.price && product.cost
                        ? `${(((product.price - product.cost) / product.price) * 100).toFixed(1)}%`
                        : "0%"}
                    </Badge>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Available Stock</span>
                    <Badge variant={
                      (product.stockQuantity || 0) <= (product.minStockLevel || 0) ? "destructive" : "secondary"
                    } className="text-sm px-2">
                      {product?.stockQuantity} {product?.unit?.name}
                    </Badge>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-2 overflow-hidden">
                    <div className={`h-2 rounded-full ${(product.stockQuantity || 0) <= (product.minStockLevel || 0) ? "bg-red-500" : "bg-emerald-500"
                      }`} style={{ width: `${Math.min(100, Math.max(5, ((product.stockQuantity || 0) / (product.maxStockLevel || 100)) * 100))}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Min: {product.minStockLevel}</span>
                    <span>Max: {product.maxStockLevel}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for History */}
          <Tabs defaultValue="movements" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-4">
              <TabsTrigger value="movements">Stock History</TabsTrigger>
              <TabsTrigger value="orders">Recent Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="movements">
              <Card className="border-none shadow-md">
                <CardHeader className="px-6 py-4 border-b bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <History className="w-4 h-4 text-gray-500" /> Stock Movements
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <DataTable
                    columns={columns}
                    data={fetchedStockMovements?.data}
                    pageIndex={page - 1}
                    pageSize={limit}
                    totalCount={fetchedStockMovements?.pagination?.total ?? 0}
                    search={search}
                    onSearch={(val) => {
                      setSearch(val);
                      setPage(1);
                    }}
                    isFetching={isFetching}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card className="border-none shadow-md">
                <CardHeader className="px-6 py-4 border-b bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-gray-500" /> Associated Orders
                  </CardTitle>
                  <div className="flex gap-2">
                    <select
                      className="h-8 rounded md:w-32 text-xs border bg-background px-2"
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setOrdersPage(1);
                      }}
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <DataTable
                    columns={orderColumns}
                    data={fetchedOrders?.data}
                    pageIndex={ordersPage - 1}
                    pageSize={limit}
                    totalCount={fetchedOrders?.pagination?.total ?? 0}
                    onPageChange={(p) => setOrdersPage(p + 1)}
                    isFetching={isOrdersFetching}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT COLUMN - Meta Info */}
        <div className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base">Details & Specifications</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                <div className="p-4 flex justify-between items-center group hover:bg-slate-50">
                  <span className="text-sm text-gray-600 font-medium">Initial Stock</span>
                  <span className="text-sm font-semibold">{product.initialStock} {product.unit?.name}</span>
                </div>
                <div className="p-4 flex justify-between items-center group hover:bg-slate-50">
                  <span className="text-sm text-gray-600 font-medium">Alert Quantity</span>
                  <span className="text-sm font-semibold flex items-center gap-1 text-amber-600">
                    <AlertTriangle className="w-3 h-3" /> {product.minStockLevel}
                  </span>
                </div>
                {product.maxStockLevel && (
                  <div className="p-4 flex justify-between items-center group hover:bg-slate-50">
                    <span className="text-sm text-gray-600 font-medium">Max Stock</span>
                    <span className="text-sm font-semibold">{product.maxStockLevel}</span>
                  </div>
                )}
                {(product.weight || 0) > 0 && (
                  <div className="p-4 flex justify-between items-center group hover:bg-slate-50">
                    <span className="text-sm text-gray-600 font-medium">Weight</span>
                    <span className="text-sm font-semibold">{product.weight} kg</span>
                  </div>
                )}
                {((product.length || 0) > 0 || (product.width || 0) > 0 || (product.height || 0) > 0) && (
                  <div className="p-4 flex justify-between items-center group hover:bg-slate-50">
                    <span className="text-sm text-gray-600 font-medium">Dimensions (L×W×H)</span>
                    <span className="text-sm font-semibold">
                      {product.length || 0} × {product.width || 0} × {product.height || 0} cm
                    </span>
                  </div>
                )}
                <div className="p-4 flex justify-between items-center group hover:bg-slate-50">
                  <span className="text-sm text-gray-600 font-medium">Tax Details</span>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="text-[10px] py-0">Purchase: {product.purchaseTax || 0}%</Badge>
                    <Badge variant="outline" className="text-[10px] py-0">Sales: {product.salesTax || 0}%</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {product.description && (
            <Card className="border-none shadow-md">
              <CardHeader className="pb-3 border-b bg-amber-50/30">
                <CardTitle className="text-base flex items-center gap-2 text-amber-800">
                  <Info className="w-4 h-4" /> Description
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          )}

          {product.specification && (
            <Card className="border-none shadow-md">
              <CardHeader className="pb-3 border-b bg-primary/5">
                <CardTitle className="text-base flex items-center gap-2 text-primary">
                  <Layers className="w-4 h-4" /> Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-mono bg-slate-50 p-3 rounded-lg border">
                  {product.specification}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Supplier or Other Meta info placeholders could go here */}
        </div>
      </div>

      {/* Lightbox Modal */}
      <Dialog
        open={!!previewData}
        onOpenChange={(open) => !open && setPreviewData(null)}
      >
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-none shadow-2xl text-white">
          <DialogTitle className="sr-only">Product Image Preview</DialogTitle>
          <DialogDescription className="sr-only">
            Viewing image {previewData ? previewData.index + 1 : 0} of {previewData?.images.length || 0}
          </DialogDescription>
          <div className="relative flex items-center justify-center min-h-[70vh] w-full">
            {previewData && (
              <>
                <img
                  src={previewData.images[previewData.index]}
                  alt="Product Preview"
                  className="max-w-full max-h-[85vh] object-contain"
                />

                {/* Left Arrow (Previous) */}
                {previewData.images.length > 1 && (
                  <button
                    onClick={() =>
                      setPreviewData((prev) =>
                        prev
                          ? {
                            ...prev,
                            index:
                              prev.index === 0
                                ? prev.images.length - 1
                                : prev.index - 1,
                          }
                          : null
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full transition-all"
                  >
                    <MoveLeft className="w-6 h-6" />
                  </button>
                )}

                {/* Right Arrow (Next) */}
                {previewData.images.length > 1 && (
                  <button
                    onClick={() =>
                      setPreviewData((prev) =>
                        prev
                          ? {
                            ...prev,
                            index:
                              prev.index === prev.images.length - 1
                                ? 0
                                : prev.index + 1,
                          }
                          : null
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full transition-all"
                  >
                    <MoveRight className="w-6 h-6" />
                  </button>
                )}

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur px-4 py-2 rounded-full text-sm font-medium">
                  {previewData.index + 1} / {previewData.images.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
