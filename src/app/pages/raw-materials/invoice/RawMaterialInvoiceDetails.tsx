/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Link, useParams } from "react-router";
import { useAppSelector } from "@/store/store";
import {
  useGetRawMaterialPurchaseInvoiceByIdQuery,
  useUpdateRawMaterialPurchaseInvoiceMutation,
} from "@/store/features/admin/rawMaterialApiService";
import type { RawMaterialInvoice } from "@/shared/types/admin";
import { useGetSettingsInfoQuery } from "@/store/features/admin/settingsApiService";
import { toast } from "sonner";
import {
  ArrowLeft,
  Printer,
  DollarSign,
  Calendar,
  FileText,
  Building2,
  User,
  Package,
  CreditCard,
  Check,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import RecordRawMaterialPaymentModal from "./RecordRawMaterialPaymentModal";

export default function RawMaterialInvoiceDetails() {
  const { id } = useParams();
  const currency = useAppSelector((state) => state.currency.value);
  const [markPaid, { isLoading: isMarkingPaid }] =
    useUpdateRawMaterialPurchaseInvoiceMutation();
  const { data: fetchedSettingsInfo } = useGetSettingsInfoQuery();
  const to = fetchedSettingsInfo?.data;
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { data, isLoading } = useGetRawMaterialPurchaseInvoiceByIdQuery(
    id as string
  );

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-muted-foreground text-lg">Loading...</p>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-muted-foreground text-lg">Invoice not found</p>
      </div>
    );
  }

  const invoice: RawMaterialInvoice = data.data;
  const po = invoice?.purchaseOrder;
  const supplier = po?.supplier;

  // Invoice Calculations
  const subtotal = Number(po?.totalAmount || 0);
  const tax = Number(po?.taxAmount || 0);
  const discount = Number(po?.discountAmount || 0);
  const netAmount = subtotal - discount;
  const totalPayable = netAmount + tax;
  const paid = Number(invoice?.paidAmount || 0);
  const balance = totalPayable - paid;
  const isFullyPaid = balance <= 0;
  const showMarkAsPaidButton = isFullyPaid && invoice?.status !== "paid";

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-emerald-600 hover:bg-emerald-700';
      case 'pending': return 'bg-amber-500 hover:bg-amber-600';
      case 'draft': return 'bg-blue-500 hover:bg-blue-600';
      case 'overdue': return 'bg-red-600 hover:bg-red-700';
      default: return 'bg-gray-500';
    }
  };

  const handleMarkAsPaid = async () => {
    if (!isFullyPaid || invoice?.status === "paid") return;
    try {
      const res = await markPaid({
        id: Number(invoice?.id),
        body: {
          status: "paid",
        },
      }).unwrap();
      if (res) {
        toast.success(res.message || "Invoice marked as paid successfully");
      }
    } catch (error) {
      console.error("Failed to mark invoice as paid", error);
      toast.error("Failed to mark invoice as paid");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in-50 duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                {invoice?.invoiceNumber}
              </h1>
              <p className="text-sm text-muted-foreground">Raw Material Purchase Invoice</p>
            </div>
          </div>
          <Badge className={`${getStatusColor(invoice?.status || 'pending')} text-white capitalize px-4 py-1.5 shadow-sm`}>
            {invoice?.status}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/dashboard/raw-materials/invoices">
            <Button variant="outline" className="gap-2 shadow-sm">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>

          {id && (
            <Link to={`/dashboard/raw-materials/invoices/print/${id}`}>
              <Button variant="outline" className="gap-2 shadow-sm">
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </Link>
          )}

          {po?.id && invoice?.status !== "paid" && (
            <Button
              className="gap-2 shadow-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={() => setIsPaymentModalOpen(true)}
            >
              <CreditCard className="h-4 w-4" />
              Record Payment
            </Button>
          )}

          {showMarkAsPaidButton && (
            <Button
              className="gap-2 shadow-sm bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
              onClick={handleMarkAsPaid}
              disabled={isMarkingPaid}
            >
              <Check className="h-4 w-4" />
              {isMarkingPaid ? "Marking..." : "Mark as Paid"}
            </Button>
          )}
        </div>
      </div>

      {/* Top Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-lg border-l-4 border-l-indigo-500 hover:shadow-xl transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Amount</p>
                <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-gray-100">
                  {currency} {totalPayable.toFixed(2)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-l-emerald-500 hover:shadow-xl transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Paid Amount</p>
                <p className="text-2xl font-bold mt-1 text-emerald-600">
                  {currency} {paid.toFixed(2)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-l-amber-500 hover:shadow-xl transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Balance Due</p>
                <p className="text-2xl font-bold mt-1 text-amber-600">
                  {currency} {balance.toFixed(2)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-l-blue-500 hover:shadow-xl transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Due Date</p>
                <p className="text-lg font-bold mt-1 text-gray-900 dark:text-gray-100">
                  {invoice?.dueDate}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Details */}
          <Card className="shadow-xl border-border/60 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Invoice Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Supplier & Company Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Supplier Card */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Supplier</p>
                      <p className="font-semibold text-sm">{supplier?.name}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <span className="text-xs">Email:</span> {supplier?.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-xs">Phone:</span> {supplier?.phone}
                    </p>
                  </div>
                </div>

                {/* Company Card */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Billed To</p>
                      <p className="font-semibold text-sm">{to?.companyName}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <span className="text-xs">Email:</span> {to?.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-xs">Phone:</span> {to?.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Invoice Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Invoice #</p>
                  <p className="font-semibold text-sm">{invoice?.invoiceNumber}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">PO Number</p>
                  <p className="font-semibold text-sm">{po?.poNumber}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Invoice Date</p>
                  <p className="font-semibold text-sm">
                    {new Date(invoice?.invoiceDate).toISOString().split("T")[0]}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Created By</p>
                  <p className="font-semibold text-sm">{invoice?.creator?.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card className="shadow-xl border-border/60 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 pb-4 border-b">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-600" />
                Raw Materials
              </CardTitle>
            </CardHeader>
            <div className="p-0">
              {!po?.items || po?.items.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No items in this invoice</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border-b">
                      <tr className="text-left">
                        <th className="p-4 font-semibold text-muted-foreground">Raw Material</th>
                        <th className="p-4 text-center font-semibold text-muted-foreground">Quantity</th>
                        <th className="p-4 text-right font-semibold text-muted-foreground">Unit Cost</th>
                        <th className="p-4 text-right font-semibold text-muted-foreground">Total Price</th>
                        <th className="p-4 text-right font-semibold text-muted-foreground">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {po?.items.map((item: any) => {
                        const unitCost = Number(item?.unitCost || 0);
                        const quantity = Number(item?.quantity || 0);
                        const totalPrice = unitCost * quantity;

                        return (
                          <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                            <td className="p-4">
                              <p className="font-medium text-gray-900 dark:text-gray-100">{item.product.name}</p>
                            </td>
                            <td className="p-4 text-center">
                              <Badge variant="outline" className="font-mono">
                                {quantity}
                              </Badge>
                            </td>
                            <td className="p-4 text-right text-muted-foreground">
                              {currency} {unitCost.toFixed(2)}
                            </td>
                            <td className="p-4 text-right text-muted-foreground">
                              {currency} {totalPrice.toFixed(2)}
                            </td>
                            <td className="p-4 text-right font-bold text-indigo-600 dark:text-indigo-400">
                              {currency} {(quantity * unitCost).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>

          {/* Payments Table */}
          <Card className="shadow-xl border-border/60 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 pb-4 border-b">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                Payment History
              </CardTitle>
            </CardHeader>
            <div className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border-b">
                    <tr className="text-left">
                      <th className="p-4 font-semibold text-muted-foreground">Date</th>
                      <th className="p-4 font-semibold text-muted-foreground">Method</th>
                      <th className="p-4 text-right font-semibold text-muted-foreground">Amount</th>
                      <th className="p-4 font-semibold text-muted-foreground">Reference</th>
                      <th className="p-4 font-semibold text-muted-foreground">Recorded By</th>
                      <th className="p-4 text-center font-semibold text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoice?.payments && invoice?.payments.length > 0 ? (
                      invoice?.payments?.map((payment: any, idx: number) => (
                        <tr key={idx} className="hover:bg-muted/20 transition-colors">
                          <td className="p-4">
                            {payment?.paymentDate
                              ? new Date(payment.paymentDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )
                              : "-"}
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="capitalize">
                              {payment?.paymentMethod || "-"}
                            </Badge>
                          </td>
                          <td className="p-4 text-right font-semibold text-emerald-600">
                            {currency} {Number(payment?.amount || 0).toFixed(2)}
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {payment?.referenceNumber || "-"}
                          </td>
                          <td className="p-4 flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                              <User className="h-3 w-3 text-slate-500" />
                            </div>
                            {payment?.creator?.name || "-"}
                          </td>
                          <td className="p-4 text-center">
                            <Link to={`/dashboard/raw-materials/payments/${payment.id}`}>
                              <Button variant="outline" size="sm" className="gap-1.5 shadow-sm">
                                <Printer className="h-3.5 w-3.5" />
                                Print
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>No payments recorded yet</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="shadow-xl border-border/60 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <CardHeader className="pb-4">
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">{currency} {subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-semibold text-red-600">
                        - {currency} {discount.toFixed(2)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Net Amount</span>
                      <span className="font-semibold">{currency} {netAmount.toFixed(2)}</span>
                    </div>
                  </>
                )}

                {tax > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-semibold">+ {currency} {tax.toFixed(2)}</span>
                  </div>
                )}

                <Separator className="my-2" />

                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="font-bold text-xl text-indigo-600">
                    {currency} {totalPayable.toFixed(2)}
                  </span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-semibold text-emerald-600">
                    {currency} {paid.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-800">
                  <span className="font-bold">Balance Due</span>
                  <span className="font-bold text-xl text-amber-600">
                    {currency} {balance.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Order Info */}
          <Card className="shadow-xl border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Purchase Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                  <span className="text-muted-foreground">PO Number</span>
                  <span className="font-semibold">{po?.poNumber}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                  <span className="text-muted-foreground">Order Date</span>
                  <span className="font-semibold">
                    {po?.orderDate
                      ? new Date(po.orderDate).toISOString().split("T")[0]
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                  <span className="text-muted-foreground">Expected Delivery</span>
                  <span className="font-semibold">
                    {po?.expectedDeliveryDate
                      ? new Date(po.expectedDeliveryDate)
                          .toISOString()
                          .split("T")[0]
                      : "-"}
                  </span>
                </div>
                {po?.notes && (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <p className="text-xs font-medium text-muted-foreground mb-1">NOTES</p>
                    <p className="text-sm italic">{po.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {invoice?.status !== "paid" && (
            <Card className="shadow-lg border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-indigo-600" />
                  Payment Pending
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This invoice has an outstanding balance of {currency} {balance.toFixed(2)}.
                </p>
                <Button
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  onClick={() => setIsPaymentModalOpen(true)}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Record Payment Now
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <RecordRawMaterialPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        invoice={invoice}
      />
    </div>
  );
}
