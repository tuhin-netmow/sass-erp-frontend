"use client";

import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";
import { Link, useParams } from "react-router";
import {
    useGetPurchaseReturnInvoiceByIdQuery,
} from "@/store/features/app/purchaseOrder/purchaseReturnApiService";
import {
    ArrowLeft,
    Printer,
    Building2,
    User,
    Calendar,
    FileText,
    Hash,
    Mail,
    Phone,
    MapPin,
    CreditCard,
} from "lucide-react";
import { useGetSettingsInfoQuery } from "@/store/features/admin/settingsApiService";
import { useAppSelector } from "@/store/store";
import { formatDateStandard } from "@/shared/utils/dateUtils";
import type { PurchaseInvoice } from "@/shared/types/app/PurchaseInvoice.types";

import { useState } from "react";
import RecordPurchaseReturnRefundModal from "./RecordPurchaseReturnRefundModal";

export default function PurchaseReturnInvoiceDetails() {
    const { id } = useParams();
    const currency = useAppSelector((state) => state.currency.value);
    const { data, isLoading, refetch } = useGetPurchaseReturnInvoiceByIdQuery(id as string);
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

    const { data: fetchedSettingsInfo } = useGetSettingsInfoQuery();
    const settingsInfo = fetchedSettingsInfo?.data;

    if (isLoading) return (
        <div className="min-h-[70vh] flex items-center justify-center p-8">
            <p className="text-muted-foreground text-lg">Loading return invoice details...</p>
        </div>
    );

    if (!data?.data) return (
        <div className="min-h-[70vh] flex items-center justify-center p-8">
            <p className="text-red-500 font-medium text-lg">Return Invoice not found</p>
        </div>
    );

    const invoice: PurchaseInvoice = data?.data;
    const purchaseReturn = (invoice as any)?.purchase_return;
    const supplier = purchaseReturn?.supplier;

    // Invoice Calculations
    const subtotal = purchaseReturn?.totalAmount || 0;
    const tax = purchaseReturn?.taxAmount ?? 0;
    const discount = purchaseReturn?.discountAmount ?? 0;
    const payments = invoice?.payments || [];
    const calculatedTotalPaid = payments.reduce((acc: number, p: any) => acc + Number(p.amount || 0), 0);

    const totalRefundable = Number(purchaseReturn?.grandTotal || purchaseReturn?.totalPayableAmount || 0);
    const totalRefunded = Number(purchaseReturn?.totalRefundedAmount || calculatedTotalPaid || 0);
    const balance = Number(purchaseReturn?.due_refund_amount ?? (totalRefundable - totalRefunded));


    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'bg-green-600 hover:bg-green-700';
            case 'partial': return 'bg-yellow-500 hover:bg-yellow-600 text-black';
            case 'unpaid': return 'bg-red-600 hover:bg-red-700';
            case 'overdue': return 'bg-red-700 hover:bg-red-800';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in-50 duration-500 pb-10">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Link to="/dashboard/purchase-orders/returned" className="hover:text-primary transition-colors flex items-center gap-1">
                            <ArrowLeft className="w-4 h-4" /> Back to Returned Orders
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                            Return Invoice #{invoice?.invoiceNumber}
                        </h1>
                        <Badge className={`${getStatusColor(invoice?.status)} text-white capitalize px-3 py-1 shadow-sm`}>
                            {invoice?.status || 'Unknown'}
                        </Badge>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {balance > 0 && (
                        <Button
                            onClick={() => setIsRefundModalOpen(true)}
                            className="gap-2 shadow-sm bg-orange-600 hover:bg-orange-700"
                        >
                            <CreditCard className="w-4 h-4" /> Record Refund
                        </Button>
                    )}
                    <Link to={`/dashboard/purchase-return-invoices/${invoice?.publicId || invoice?.id}/preview`}>
                        <Button variant="outline" className="gap-2 shadow-sm text-orange-700 border-orange-200">
                            <Printer className="w-4 h-4" /> Print / Preview
                        </Button>
                    </Link>
                </div>
            </div>

            <RecordPurchaseReturnRefundModal
                open={isRefundModalOpen}
                onOpenChange={setIsRefundModalOpen}
                defaultReturnId={purchaseReturn?.id}
                onSuccess={() => refetch()}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN - Main Details */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Invoice Info Cards */}
                    <Card className="shadow-sm border-border/60 pb-6">
                        <CardHeader className="bg-muted/30 gap-0 py-4 border-b-1">
                            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Invoice Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-bold">Bill From (Supplier)</p>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{supplier?.name || 'N/A'}</p>
                                        <div className="text-sm text-gray-500 space-y-0.5 mt-1">
                                            <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {supplier?.email || 'N/A'}</p>
                                            <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {supplier?.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-bold">Bill To</p>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{settingsInfo?.companyName}</p>
                                        <div className="text-sm text-gray-500 space-y-0.5 mt-1">
                                            <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {settingsInfo?.address}</p>
                                            <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {settingsInfo?.email}</p>
                                            <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {settingsInfo?.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Key Dates & Meta */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="shadow-sm border-border/60">
                            <CardContent className="p-4 flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground uppercase font-medium">Return Ref.</span>
                                <span className="text-sm font-semibold flex items-center gap-2">
                                    <Hash className="w-4 h-4 opacity-50" /> {(purchaseReturn as any)?.purchase_order?.poNumber || purchaseReturn?.poNumber || '-'}
                                </span>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border-border/60">
                            <CardContent className="p-4 flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground uppercase font-medium">Invoice Date</span>
                                <span className="text-sm font-semibold flex items-center gap-2">
                                    <Calendar className="w-4 h-4 opacity-50" /> {formatDateStandard(invoice?.invoiceDate)}
                                </span>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border-border/60">
                            <CardContent className="p-4 flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground uppercase font-medium">Due Date</span>
                                <span className="text-sm font-semibold text-red-600 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 opacity-50" /> {formatDateStandard(invoice?.dueDate)}
                                </span>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border-border/60">
                            <CardContent className="p-4 flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground uppercase font-medium">Created By</span>
                                <span className="text-sm font-semibold flex items-center gap-2">
                                    <User className="w-4 h-4 opacity-50" /> {invoice?.creator?.name || '-'}
                                </span>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Line Items */}
                    <Card className="shadow-sm border-border/60 overflow-hidden">
                        <CardHeader className="bg-muted/30 py-4 border-b-1 gap-0">
                            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Returned Items
                            </CardTitle>
                        </CardHeader>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b">
                                    <tr className="text-left text-muted-foreground text-xs uppercase tracking-wider">
                                        <th className="px-6 py-4 font-medium">Product Details</th>
                                        <th className="px-6 py-4 font-medium text-right">Unit Cost</th>
                                        <th className="px-6 py-4 font-medium text-center">Qty</th>
                                        <th className="px-6 py-4 font-medium text-right">Discount</th>
                                        <th className="px-6 py-4 font-medium text-right">Tax Amount</th>
                                        <th className="px-6 py-4 font-medium text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {purchaseReturn?.items?.length > 0 ? (
                                        purchaseReturn.items.map((item: any) => {
                                            const itemTaxAmount = Number(item.taxAmount || 0);
                                            const itemTotal = Number(item.lineTotal || 0) + itemTaxAmount;

                                            return (
                                                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div>
                                                                <p className="font-semibold text-gray-900 dark:text-gray-100">{item.product?.name || 'N/A'}</p>
                                                                <p className="text-xs text-muted-foreground">SKU: {item.product?.sku || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-medium">
                                                        {currency} {Number(item.unitCost || 0).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <Badge variant="outline" className="font-mono text-xs">{item.quantity}</Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-muted-foreground">
                                                        {Number(item.discount || 0) > 0 ? `- ${currency} ${Number(item.discount).toFixed(2)}` : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-muted-foreground">
                                                        {currency} {itemTaxAmount.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-gray-100">
                                                        {currency} {itemTotal.toFixed(2)}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                                No items found on this return invoice.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Refund History */}
                    {payments && payments.length > 0 && (
                        <Card className="shadow-sm border-border/60 overflow-hidden">
                            <CardHeader className="bg-muted/30 py-4 border-b-1 gap-0">
                                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" /> Refund History
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="pl-6">Amount</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Method</TableHead>
                                            <TableHead>Reference</TableHead>
                                            <TableHead className="text-right pr-6">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payments.map((payment: any, index: number) => (
                                            <TableRow key={payment.id || index}>
                                                <TableCell className="pl-6 font-bold text-slate-800">
                                                    {currency} {Number(payment.amount || 0).toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {formatDateStandard(payment.paymentDate)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs capitalize shadow-none ${payment.paymentMethod === 'cash'
                                                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                            : payment.paymentMethod === 'bank_transfer'
                                                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                                : 'bg-purple-50 text-purple-700 border-purple-200'
                                                            }`}
                                                    >
                                                        {payment.paymentMethod?.replace(/_/g, " ")}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {payment.referenceNumber || "-"}
                                                    {payment.notes && <div className="text-[10px] italic truncate max-w-[150px]">{payment.notes}</div>}
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <Link to={`/dashboard/purchase-returns/payments/${payment.publicId || payment.id}/print`}>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <Printer className="w-4 h-4" />
                                                            <span className="sr-only">Print Refund</span>
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}

                </div>

                {/* RIGHT COLUMN - Summary & Stats */}
                <div className="lg:col-span-4 space-y-6">

                    <Card className="shadow-md border-border/60 bg-slate-50 dark:bg-slate-900 overflow-hidden gap-0">
                        <div className="h-2 bg-gradient-to-r from-orange-500 to-red-600"></div>
                        <CardHeader className="py-4 gap-0">
                            <CardTitle className="text-lg">Financial Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pb-6">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>{currency} {Number(subtotal)?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Discount</span>
                                    <span className="text-green-500">- {currency} {Number(discount)?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Tax</span>
                                    <span>+ {currency} {Number(tax)?.toFixed(2)}</span>
                                </div>

                                <Separator className="my-2" />

                                <div className="flex justify-between items-center font-bold text-lg text-blue-600 dark:text-blue-400">
                                    <span>Total Refundable</span>
                                    <span>{currency} {totalRefundable.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between items-center text-sm font-medium text-green-600 pt-2">
                                    <span>Total Refunded</span>
                                    <span>{currency} {totalRefunded.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-black/20 p-4 rounded-xl border border-border/50 shadow-inner">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Balance Due</p>
                                        <p className={`text-2xl font-black tracking-tight ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {currency} {balance.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        {balance <= 0 ? (
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 px-3 py-1">Fully Paid</Badge>
                                        ) : (
                                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 px-3 py-1">Outstanding</Badge>
                                        )}
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
