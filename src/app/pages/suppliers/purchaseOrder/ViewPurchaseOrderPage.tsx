"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Link, useParams } from "react-router";
import { Separator } from "@/shared/components/ui/separator";
import {
  Check,
  Eye,
  FilePlus,
  ArrowLeft,
  Package,
  Calendar,
  Mail,
  Phone,
  Building2,
  AlertCircle,
  RefreshCcw
} from "lucide-react";
import {
  useAddPurchaseInvoiceMutation,
  useGetPurchaseOrderByIdQuery,
  useUpdatePurchaseOrderMutation,
  useReceivePurchaseOrderMutation,
} from "@/store/features/app/purchaseOrder/purchaseOrderApiService";
import { toast } from "sonner";
import type { POItem } from "@/shared/types/app/purchaseOrder.types";
import { useAppSelector } from "@/store/store";

export default function PurchaseOrderView() {
  const { purchaseId } = useParams();

  const currency = useAppSelector((state) => state.currency.value);

  const { data, isLoading } = useGetPurchaseOrderByIdQuery(purchaseId as string);

  const purchase = Array.isArray(data?.data) ? data?.data[0] : data?.data;

  const [updatePurchaseOrder, { isLoading: isUpdating }] =
    useUpdatePurchaseOrderMutation();

  const [addInvoice, { isLoading: isCreating }] =
    useAddPurchaseInvoiceMutation();

  const [receiveOrder, { isLoading: isReceiving }] =
    useReceivePurchaseOrderMutation();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-8">
        <p className="text-muted-foreground text-lg">Loading purchase order...</p>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-8">
        <p className="text-red-500 font-medium text-lg">No purchase order found</p>
      </div>
    );
  }

  /* ================= ACTIONS ================= */
  const handleApprove = async () => {
    try {
      const res = await updatePurchaseOrder({
        id: purchase.id,
        body: { status: "approved" },
      }).unwrap();

      if (res.status) {
        toast.success(res.message || "Purchase Order Approved");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Approval failed");
    }
  };

  const handleReceive = async () => {
    try {
      const res = await receiveOrder({
        id: purchase.id,
        body: { status: "completed", notes: "Received via view page" },
      }).unwrap();

      if (res.status) {
        toast.success(res.message || "Order Received & Stock Updated");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to receive order");
    }
  };

  const handleCreateInvoice = async () => {
    try {
      const res = await addInvoice({
        purchase_order_id: purchase.id,
        dueDate: new Date().toISOString().split("T")[0],
      }).unwrap();

      if (res.status) {
        toast.success(res.message || "Invoice created successfully");
      }
    } catch {
      toast.error("Failed to create invoice");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-600 hover:bg-green-700';
      case 'pending': return 'bg-yellow-500 hover:bg-yellow-600 text-black';
      case 'rejected': return 'bg-red-600 hover:bg-red-700';
      case 'received': return 'bg-blue-600 hover:bg-blue-700';
      case 'delivered': return 'bg-purple-600 hover:bg-purple-700';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in-50 duration-500 pb-10">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link to="/dashboard/purchase-orders" className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Purchase Orders
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Purchase Order #{purchase.poNumber}
            </h1>
            <Badge className={`${getStatusColor(purchase.status || 'pending')} text-white capitalize px-3 py-1 shadow-sm`}>
              {purchase.status || "pending"}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {purchase.status === "pending" && (
            <Button onClick={handleApprove} disabled={isUpdating} className="gap-2 shadow-sm bg-green-600 hover:bg-green-700">
              <Check className="h-4 w-4" />
              {isUpdating ? "Approving..." : "Approve Order"}
            </Button>
          )}

          {["pending", "approved"].includes(purchase.status || "") && (
            <Button onClick={handleReceive} disabled={isReceiving} variant="outline" className="gap-2 shadow-sm border-blue-600 text-blue-600 hover:bg-blue-50">
              <Package className="h-4 w-4" />
              {isReceiving ? "Receiving..." : "Receive Order"}
            </Button>
          )}

          {["approved", "received", "delivered"].includes(purchase.status || "") && (
            purchase.invoice ? (
              <Link to={`/dashboard/purchase-invoices/${purchase.invoice.id}`}>
                <Button variant="outline" className="gap-2 shadow-sm">
                  <Eye className="h-4 w-4" /> View Invoice
                </Button>
              </Link>
            ) : (
              <Button onClick={handleCreateInvoice} disabled={isCreating} className="gap-2 shadow-sm">
                <FilePlus className="h-4 w-4" />
                {isCreating ? "Creating..." : "Create Invoice"}
              </Button>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN (Details) */}
        <div className="lg:col-span-8 space-y-6">

          {/* 1. Supplier Details (Moved from Right) */}
          <Card className="shadow-sm border-border/60 py-6">
            <CardHeader className="gap-0">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Supplier Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{purchase.supplier.name}</p>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">Vendor</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground col-span-2">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">{purchase.supplier.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{purchase.supplier.phone || 'N/A'}</span>
                </div>
                {purchase.supplier.address && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground col-span-2">
                    <Building2 className="w-3.5 h-3.5 mt-1" />
                    <span>{purchase.supplier.address}, {purchase.supplier.city}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 2. Order Dates (Meta Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-sm border-border/60">
              <CardContent className="p-4 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase font-medium">Order Date</span>
                <span className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 opacity-50" /> {purchase.orderDate?.split("T")[0] || "-"}
                </span>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-border/60">
              <CardContent className="p-4 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase font-medium">Expected Delivery</span>
                <span className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 opacity-50" /> {purchase.expectedDeliveryDate?.split("T")[0] || "-"}
                </span>
              </CardContent>
            </Card>
          </div>

          {/* 3. Items Table */}
          <Card className="shadow-sm border-border/60 overflow-hidden">
            <CardHeader className="bg-muted/30 border-b-1 gap-0 py-4">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Package className="w-4 h-4" /> Purchase Items
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b">
                  <tr className="text-left text-muted-foreground text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">Product</th>
                    <th className="px-6 py-4 font-medium text-center">Qty</th>
                    <th className="px-6 py-4 font-medium text-right">Unit Cost</th>
                    <th className="px-6 py-4 font-medium text-right">Total Price</th>
                    <th className="px-6 py-4 font-medium text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {purchase.items && purchase.items.length > 0 ? (
                    purchase.items.map((item: POItem) => (
                      <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                          <p>{item.product.name}</p>
                          <span className="text-xs text-muted-foreground">SKU: {item.product.sku}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant="outline" className="font-mono text-xs">{item.quantity}</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">{currency} {Number(item.unitCost).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right text-muted-foreground">{currency} {Number(item.totalPrice).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-gray-100">{currency} {Number(item.lineTotal).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        No items specificied in this purchase order.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* 4. Notes */}
          {purchase.notes && (
            <Card className="shadow-sm border-border/60 py-4 md:py-6">
              <CardHeader className="gap-0">
                <CardTitle className="text-sm font-medium uppercase md:text-base tracking-wider text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic bg-muted/30 p-4 rounded-lg border border-border/50">
                  "{purchase.notes}"
                </p>
              </CardContent>
            </Card>
          )}

          {/* 5. Stock Movements */}
          {purchase.stock_movements && purchase.stock_movements.length > 0 && (
            <Card className="shadow-sm border-border/60 overflow-hidden">
              <CardHeader className="bg-muted/30 border-b-1 gap-0 py-4">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <RefreshCcw className="w-4 h-4" /> Stock Movements
                </CardTitle>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b">
                    <tr className="text-left text-muted-foreground text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-medium">Product</th>
                      <th className="px-6 py-4 font-medium text-center">Type</th>
                      <th className="px-6 py-4 font-medium text-center">Qty</th>
                      <th className="px-6 py-4 font-medium">Notes</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {purchase.stock_movements.map((move: any) => (
                      <tr key={move.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                          {move.product?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant="secondary" className="capitalize">{move.movementType}</Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={move.quantity > 0 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                            {move.quantity > 0 ? `+${move.quantity}` : move.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground italic">
                          {move.notes || '-'}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(move.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN (Summary) */}
        <div className="lg:col-span-4 space-y-6">

          {/* SUMMARY */}
          <Card className="shadow-md border-border/60 bg-slate-50 dark:bg-slate-900 overflow-hidden pb-6">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <CardHeader className="gap-0">
              <CardTitle className="text-lg">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{currency} {Number(purchase.totalAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Discount</span>
                  <span className="text-red-500">- {currency} {Number(purchase.discountAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm items-center text-muted-foreground border-t pt-2 mt-2">
                  <span>Net Amount</span>
                  <span>{currency} {Number(purchase.netAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Tax</span>
                  <span>+ {currency} {Number(purchase.taxAmount).toFixed(2)}</span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between items-center font-bold text-lg text-gray-900 dark:text-gray-100">
                  <span>Grand Total</span>
                  <span>{currency} {Number(purchase.totalPayableAmount).toFixed(2)}</span>
                </div>

                <div className="pt-4 space-y-2 border-t mt-4">
                  <div className="flex justify-between items-center text-emerald-600 font-medium">
                    <span>Total Paid</span>
                    <span>{currency} {Number(purchase.totalPaidAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-rose-600 font-bold text-lg p-2 bg-rose-50 rounded-lg">
                    <span>Balance Due</span>
                    <span>{currency} {Number(purchase.totalDueAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
