/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Link, useParams } from "react-router";
import {
    useGetSalesReturnInvoiceByIdQuery,
} from "@/store/features/app/salesOrder/salesReturnApiService";
import {
    ArrowLeft,
    Printer,
    User,
    Calendar,
    FileText,
    Hash,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    ShoppingBag
} from "lucide-react";
import { useGetSettingsInfoQuery } from "@/store/features/admin/settingsApiService";
import { useAppSelector } from "@/store/store";
import { formatDateStandard } from "@/shared/utils/dateUtils";
import type { SalesInvoice } from "@/shared/types/app/salesInvoice.types";
import type { SalesReturn } from "@/shared/types/app/salesReturn.types";
import { useState } from "react";
import RecordSalesReturnRefundModal from "./RecordSalesReturnRefundModal";

export default function SalesReturnInvoiceDetails() {
    const { id } = useParams();
    const currency = useAppSelector((state) => state.currency.value);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const { data, isLoading } = useGetSalesReturnInvoiceByIdQuery(id as string);

    const { data: fetchedSettingsInfo } = useGetSettingsInfoQuery();
    const settingsInfo = fetchedSettingsInfo?.data;

    if (isLoading) return <div className="min-h-[70vh] flex items-center justify-center p-8"><p className="text-muted-foreground text-lg">Loading return invoice details...</p></div>;
    if (!data?.data) return <div className="min-h-[70vh] flex items-center justify-center p-8"><p className="text-red-500 font-medium text-lg">Return Invoice not found</p></div>;

    const invoice: SalesInvoice = data?.data;
    const salesReturn = (invoice as SalesInvoice & { salesReturn?: SalesReturn }).salesReturn || (invoice as any).sales_return;
    const customer = salesReturn?.customer;

    // Invoice Calculations
    const subtotal = salesReturn?.totalAmount || salesReturn?.total_amount || 0;
    const tax = salesReturn?.taxAmount || salesReturn?.tax_amount || 0;
    const discount = salesReturn?.discountAmount || salesReturn?.discount_amount || 0;
    const payments = invoice?.payments || [];
    const calculatedTotalPaid = payments.reduce((acc: number, p: any) => acc + Number(p.amount || p.paid_amount || 0), 0);

    const totalRefundable = Number(salesReturn?.grandTotal || salesReturn?.totalPayableAmount || salesReturn?.total_payable_amount || 0);
    const totalRefunded = Number(salesReturn?.totalRefundedAmount || salesReturn?.total_refunded_amount || calculatedTotalPaid || 0);
    const balance = Number((salesReturn?.dueRefundAmount || salesReturn?.due_refund_amount) ?? (totalRefundable - totalRefunded));

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'bg-green-600';
            case 'partial': return 'bg-yellow-500 text-black';
            case 'unpaid': return 'bg-red-600';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in-50 duration-500 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="text-left">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Link to="/dashboard/sales/returns" className="hover:text-primary transition-colors flex items-center gap-1">
                            <ArrowLeft className="w-4 h-4" /> Back to Sales Returns
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Return Invoice #{invoice?.invoiceNumber || (invoice as any).invoice_number}</h1>
                        <Badge className={`${getStatusColor(invoice?.status)} text-white capitalize px-3 py-1 shadow-sm`}>{invoice?.status || 'Unknown'}</Badge>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {balance > 0 && (
                        <Button className="gap-2 shadow-sm bg-blue-600 hover:bg-blue-700" onClick={() => setShowRefundModal(true)}>
                            <CreditCard className="w-4 h-4" /> Record Refund
                        </Button>
                    )}
                    <Link to={`/dashboard/sales-return-invoices/${id}/preview`}>
                        <Button variant="outline" className="gap-2 shadow-sm text-blue-700 border-blue-200">
                            <Printer className="w-4 h-4" /> Print / Preview
                        </Button>
                    </Link>
                </div>
            </div>

            <RecordSalesReturnRefundModal
                open={showRefundModal}
                onOpenChange={setShowRefundModal}
                defaultReturnId={salesReturn?.id || salesReturn?._id}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    <Card className="shadow-sm border-border/60 pb-6">
                        <CardHeader className="bg-muted/30 gap-0 py-4 border-b-1 text-left"><CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Invoice Information</CardTitle></CardHeader>
                        <CardContent className="grid gap-6 sm:grid-cols-2 pt-6">
                            <div className="space-y-4 text-left">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><ShoppingBag className="w-5 h-5" /></div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-bold">Bill From</p>
                                        <p className="font-semibold text-gray-900">{settingsInfo?.companyName}</p>
                                        <div className="text-sm text-gray-500 space-y-1 mt-1">
                                            <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 shrink-0" /> {settingsInfo?.address}</p>
                                            <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {settingsInfo?.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4 text-left">
                                <div className="flex items-center gap-3">
                                    <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><User className="w-5 h-5" /></div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-bold">Bill To (Customer)</p>
                                        <p className="font-semibold text-gray-900">{customer?.name || 'N/A'}</p>
                                        <div className="text-sm text-gray-500 space-y-1 mt-1">
                                            <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {customer?.email || 'N/A'}</p>
                                            <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {customer?.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="shadow-sm border-border/60"><CardContent className="p-4 flex flex-col gap-1 text-left"><span className="text-xs text-muted-foreground uppercase font-medium">Return Ref.</span><span className="text-sm font-semibold flex items-center gap-2"><Hash className="w-4 h-4 opacity-50" /> {salesReturn?.returnNumber || salesReturn?.return_number || '-'}</span></CardContent></Card>
                        <Card className="shadow-sm border-border/60"><CardContent className="p-4 flex flex-col gap-1 text-left"><span className="text-xs text-muted-foreground uppercase font-medium">Invoice Date</span><span className="text-sm font-semibold flex items-center gap-2"><Calendar className="w-4 h-4 opacity-50" /> {formatDateStandard(invoice?.invoiceDate || (invoice as any).invoice_date)}</span></CardContent></Card>
                        <Card className="shadow-sm border-border/60"><CardContent className="p-4 flex flex-col gap-1 text-left"><span className="text-xs text-muted-foreground uppercase font-medium font-bold text-red-600">Due Date</span><span className="text-sm font-semibold text-red-600 flex items-center gap-2"><Calendar className="w-4 h-4 opacity-50" /> {formatDateStandard(invoice?.dueDate || (invoice as any).due_date)}</span></CardContent></Card>
                        <Card className="shadow-sm border-border/60"><CardContent className="p-4 flex flex-col gap-1 text-left"><span className="text-xs text-muted-foreground uppercase font-medium">Created By</span><span className="text-sm font-semibold flex items-center gap-2"><User className="w-4 h-4 opacity-50" /> {invoice?.creator?.name || (invoice as any).created_by?.name || '-'}</span></CardContent></Card>
                    </div>

                    <Card className="shadow-sm border-border/60 overflow-hidden">
                        <CardHeader className="bg-muted/30 py-4 border-b-1 text-left"><CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2"><FileText className="w-4 h-4" /> Returned Items</CardTitle></CardHeader>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr className="text-left text-muted-foreground text-xs uppercase tracking-wider">
                                        <th className="px-6 py-4 font-medium">Product Details</th>
                                        <th className="px-6 py-4 font-medium text-right">Price</th>
                                        <th className="px-6 py-4 font-medium text-center">Qty</th>
                                        <th className="px-6 py-4 font-medium text-right">Discount</th>
                                        <th className="px-6 py-4 font-medium text-right">Tax</th>
                                        <th className="px-6 py-4 font-medium text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {salesReturn?.items?.map((item: any) => (
                                        <tr key={item.id || item._id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-6 py-4 text-left">
                                                <p className="font-semibold text-gray-900">{item.product?.name || 'N/A'}</p>
                                                <p className="text-xs text-muted-foreground">SKU: {item.product?.sku || 'N/A'}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium">{currency} {Number(item.unitPrice || item.unit_price || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-center"><Badge variant="outline" className="font-mono text-xs">{item.quantity}</Badge></td>
                                            <td className="px-6 py-4 text-right text-green-600">{Number(item.discount || 0) > 0 ? `- ${currency} ${Number(item.discount).toFixed(2)}` : '-'}</td>
                                            <td className="px-6 py-4 text-right text-muted-foreground">{currency} {Number(item.taxAmount || item.tax_amount || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-900">{currency} {(Number(item.lineTotal || item.line_total || 0) + Number(item.taxAmount || item.tax_amount || 0)).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {payments.length > 0 && (
                        <Card className="shadow-sm border-border/60 overflow-hidden">
                            <CardHeader className="bg-muted/30 py-4 border-b-1 text-left"><CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2"><CreditCard className="w-4 h-4" /> Refunded Records</CardTitle></CardHeader>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b">
                                        <tr className="text-left text-muted-foreground text-xs uppercase tracking-wider">
                                            <th className="px-6 py-4 font-medium">Payment Date</th>
                                            <th className="px-6 py-4 font-medium">Reference</th>
                                            <th className="px-6 py-4 font-medium">Method</th>
                                            <th className="px-6 py-4 font-medium text-right">Amount</th>
                                            <th className="px-6 py-4 font-medium text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {payments.map((payment: any) => (
                                            <tr key={payment.id || payment._id} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-6 py-4 text-left font-medium text-gray-900">{formatDateStandard(payment.paymentDate || payment.payment_date)}</td>
                                                <td className="px-6 py-4 text-left text-muted-foreground">{payment.reference || '-'}</td>
                                                <td className="px-6 py-4 text-left"><Badge variant="outline" className="capitalize">{(payment.paymentMethod || payment.payment_method)?.replace('_', ' ') || '-'}</Badge></td>
                                                <td className="px-6 py-4 text-right font-bold text-green-600">{currency} {Number(payment.amount || payment.paid_amount || 0).toFixed(2)}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <Link to={`/dashboard/sales/returns/payments/${payment.publicId || payment.id || payment._id}`}>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="View/Print Receipt">
                                                            <Printer className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <Card className="shadow-md border-border/60 bg-slate-50 overflow-hidden gap-6">
                        <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                        <CardHeader className="gap-0 text-left"><CardTitle className="text-lg">Financial Summary</CardTitle></CardHeader>
                        <CardContent className="space-y-4 pb-6">
                            <div className="space-y-2 text-sm text-left">
                                <div className="flex justify-between items-center text-muted-foreground"><span>Subtotal</span><span>{currency} {Number(subtotal)?.toFixed(2)}</span></div>
                                <div className="flex justify-between items-center text-muted-foreground"><span>Discount</span><span className="text-green-500">- {currency} {Number(discount)?.toFixed(2)}</span></div>
                                <div className="flex justify-between items-center text-muted-foreground"><span>Tax</span><span>+ {currency} {Number(tax)?.toFixed(2)}</span></div>
                                <Separator className="my-2" />
                                <div className="flex justify-between items-center font-bold text-lg text-blue-600"><span>Total Refundable</span><span>{currency} {totalRefundable.toFixed(2)}</span></div>
                                <div className="flex justify-between items-center text-sm font-medium text-green-600 pt-2"><span>Total Paid</span><span>{currency} {totalRefunded.toFixed(2)}</span></div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-border/50 shadow-inner text-left">
                                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Balance Due</p>
                                <div className="flex justify-between items-end">
                                    <p className={`text-2xl font-black tracking-tight ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>{currency} {balance.toFixed(2)}</p>
                                    <Badge className={balance <= 0 ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" : "bg-red-100 text-red-700 hover:bg-red-100 border-red-200"}>{balance <= 0 ? "Fully Paid" : "Outstanding"}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
