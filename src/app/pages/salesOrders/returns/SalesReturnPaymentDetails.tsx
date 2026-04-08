/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/shared/components/ui/button";
import { useGetSalesReturnPaymentByIdQuery } from "@/store/features/app/salesOrder/salesReturnApiService";
import { useAppSelector } from "@/store/store";
import { Link, useParams } from "react-router";
import { ArrowLeft, CreditCard, Calendar, Hash, ReceiptText, UserCircle } from "lucide-react";
import { formatDateStandard } from "@/shared/utils/dateUtils";

export default function SalesReturnPaymentDetails() {
    const currency = useAppSelector((state) => state.currency.value);
    const { id } = useParams();
    const { data, isLoading } = useGetSalesReturnPaymentByIdQuery(id as string);

    if (isLoading) return <div className="p-10 text-center text-muted-foreground">Loading...</div>;
    if (!data?.data) return <div className="p-10 text-center text-red-500 font-bold">Refund details not found.</div>;

    const payment = data.data;
    const salesReturn = (payment as any).sales_return;
    const invoice = payment.invoice;
    const customer = salesReturn?.customer;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in-50 duration-500 pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-left">
                    <Link to="/dashboard/sales/returns/payments" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-1">
                        <ArrowLeft className="w-4 h-4" /> Back to Refunds
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-blue-700">Refund #RRFD-{(payment.id || payment._id).toString().padStart(6, "0")}</h1>
                </div>
                <div className="flex gap-2">
                    {invoice && (
                        <Link to={`/dashboard/sales-return-invoices/${invoice.publicId || invoice.id}`}>
                            <Button variant="outline" className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200">View Return Invoice</Button>
                        </Link>
                    )}
                    <Link to={`/dashboard/sales/returns/payments/${payment.publicId || payment.id || payment._id}/print`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
                            Print Refund Voucher
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-xl border bg-white p-8 shadow-sm space-y-8 text-left">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 border-b pb-2 mb-6 flex items-center gap-2"><CreditCard className="w-5 h-5 text-blue-600" /> Refund Transaction Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                <div className="space-y-4">
                                    <div><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Refund Method</p><p className="font-semibold text-gray-900 capitalize">{payment.paymentMethod.replaceAll("_", " ")}</p></div>
                                    <div><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Reference Number</p><p className="font-semibold text-gray-900">{payment.referenceNumber || "-"}</p></div>
                                    <div><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Notes</p><p className="text-sm text-gray-600 italic">{payment.notes || "No notes provided."}</p></div>
                                </div>
                                <div className="space-y-4">
                                    <div><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Refund Date</p><p className="font-semibold text-gray-900 flex items-center gap-2"><Calendar className="w-4 h-4 opacity-50" /> {formatDateStandard(payment.paymentDate)}</p></div>
                                    <div><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Transaction Status</p><p className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${payment.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>{payment.status.toUpperCase()}</p></div>
                                    <div className="pt-2"><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Refund Amount</p><p className="text-3xl font-black text-blue-600 tracking-tighter">{currency} {Number(payment.amount).toFixed(2)}</p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 text-left">
                    <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
                        <h3 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-2"><UserCircle className="w-5 h-5 text-purple-600" /> Customer</h3>
                        <div className="space-y-1">
                            <p className="font-bold text-gray-900">{customer?.name || "N/A"}</p>
                            <p className="text-sm text-gray-500">{customer?.email || "N/A"}</p>
                            <p className="text-sm text-gray-500">{customer?.phone || "N/A"}</p>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
                        <h3 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-2"><ReceiptText className="w-5 h-5 text-orange-600" /> Linked Return</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center"><span className="text-muted-foreground">Return #</span><span className="font-bold text-blue-600 cursor-pointer">{salesReturn?.returnNumber || salesReturn?.return_number || "-"}</span></div>
                            <div className="flex justify-between items-center"><span className="text-muted-foreground">Total Refundable</span><span className="font-bold">{currency} {Number(salesReturn?.totalRefundableAmount || salesReturn?.total_refundable_amount || 0).toFixed(2)}</span></div>
                        </div>
                    </div>

                    {invoice && (
                        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
                            <h3 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-2"><Hash className="w-5 h-5 text-emerald-600" /> Return Invoice</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center"><span className="text-muted-foreground">Invoice #</span><span className="font-bold">{invoice.invoiceNumber || invoice.invoice_number}</span></div>
                                <div className="flex justify-between items-center"><span className="text-muted-foreground">Total Payable</span><span className="font-bold">{currency} {Number(invoice.totalPayableAmount || invoice.total_payable_amount || 0).toFixed(2)}</span></div>
                                <div className="flex justify-between items-center"><span className="text-muted-foreground">Due Date</span><span className="font-bold text-red-600">{formatDateStandard(invoice.dueDate)}</span></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
