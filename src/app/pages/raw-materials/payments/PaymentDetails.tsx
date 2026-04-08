import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Link, useParams } from "react-router";
import { useAppSelector } from "@/store/store";
import {
    useGetRawMaterialPaymentByIdQuery,
  
} from "@/store/features/admin/rawMaterialApiService";
import {
    ChevronLeft,
    CreditCard,
    FileText,
    ShoppingBag,
    Building2,
    Mail,
    Phone,
    Calendar,
    Receipt,
    CheckCircle2,
    Hash,
   
    Printer
} from "lucide-react";
import type { RawMaterialPayment } from "@/shared";

export default function PaymentDetails() {
    const { id } = useParams();
    const currency = useAppSelector((state) => state.currency.value);

    const { data, isLoading } = useGetRawMaterialPaymentByIdQuery(
        id as string,
        {
            skip: !id,
        }
    );

    if (isLoading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <p className="text-muted-foreground text-lg">Loading payment details...</p>
            </div>
        );
    }

    if (!data?.data) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <p className="text-muted-foreground text-lg">Payment not found</p>
            </div>
        );
    }

    const payment: RawMaterialPayment = data.data;
    const invoice = payment.invoice;
    const purchaseOrder = payment.purchaseOrder;
    const supplier = purchaseOrder?.supplier;

    // Format payment method
    const formatPaymentMethod = (method: string) => {
        return method
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Get payment method icon
    const getPaymentMethodIcon = (method: string) => {
        switch (method?.toLowerCase()) {
            case 'cash': return '💵';
            case 'bank_transfer': return '🏦';
            case 'credit_card': return '💳';
            case 'cheque': return '📝';
            case 'online': return '🌐';
            default: return '💰';
        }
    };

    // Get payment method color
    const getPaymentMethodColor = (method: string) => {
        switch (method?.toLowerCase()) {
            case 'cash': return 'bg-green-600 hover:bg-green-700';
            case 'bank_transfer': return 'bg-blue-600 hover:bg-blue-700';
            case 'credit_card': return 'bg-purple-600 hover:bg-purple-700';
            case 'cheque': return 'bg-orange-600 hover:bg-orange-700';
            case 'online': return 'bg-cyan-600 hover:bg-cyan-700';
            default: return 'bg-gray-600 hover:bg-gray-700';
        }
    };

    const paymentDate = new Date(payment.paymentDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const recordedDate = payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }) : null;

    return (
        <>
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in-50 duration-500 pb-10">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Link to="/dashboard/raw-materials/payments" className="hover:text-primary transition-colors flex items-center gap-1">
                            <ChevronLeft className="w-4 h-4" /> Back to Payments
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                            Payment #{payment.id}
                        </h1>
                        <Badge className="bg-green-600 hover:bg-green-700 text-white capitalize px-3 py-1 shadow-sm flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Completed
                        </Badge>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        onClick={() => window.print()}
                        className="gap-2 shadow-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                        <Printer className="h-4 w-4" /> Print Receipt
                    </Button>
                    {invoice && (
                        <Link to={`/dashboard/raw-materials/invoices/${invoice.id}`}>
                            <Button variant="outline" className="gap-2 shadow-sm">
                                <FileText className="h-4 w-4" /> View Invoice
                            </Button>
                        </Link>
                    )}
                    {purchaseOrder && (
                        <Link to={`/dashboard/raw-materials/purchase-orders/${purchaseOrder.id}`}>
                            <Button variant="outline" className="gap-2 shadow-sm">
                                <ShoppingBag className="h-4 w-4" /> View PO
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* INFO CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Amount Card */}
                <Card className="shadow-md border-border/60 overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-600"></div>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Amount Paid</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {currency} {Number(payment.amount).toFixed(2)}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <CreditCard className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Method Card */}
                <Card className="shadow-md border-border/60 overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Payment Method</p>
                                <Badge className={`${getPaymentMethodColor(payment.paymentMethod)} text-white px-2.5 py-1 mt-0.5`}>
                                    <span className="mr-1.5">{getPaymentMethodIcon(payment.paymentMethod)}</span>
                                    {formatPaymentMethod(payment.paymentMethod)}
                                </Badge>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Receipt className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Date Card */}
                <Card className="shadow-md border-border/60 overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-purple-500 to-pink-600"></div>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Payment Date</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {paymentDate}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Reference Card */}
                <Card className="shadow-md border-border/60 overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-orange-500 to-amber-600"></div>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Reference</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                                    {payment.referenceNumber || 'N/A'}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center ml-3">
                                <Hash className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Payment Information */}
                    <Card className="shadow-sm border-border/60">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 pb-4 border-b">
                            <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                                Payment Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                            <Hash className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Payment ID</p>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">#{payment.id}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                                            <Calendar className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Payment Date</p>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">{paymentDate}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                            <Receipt className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Payment Method</p>
                                            <Badge className={`${getPaymentMethodColor(payment.paymentMethod)} text-white mt-1`}>
                                                <span className="mr-1">{getPaymentMethodIcon(payment.paymentMethod)}</span>
                                                {formatPaymentMethod(payment.paymentMethod)}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Amount Paid</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {currency} {Number(payment.amount).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {payment.referenceNumber && (
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                                                <Hash className="h-5 w-5 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Reference Number</p>
                                                <p className="font-semibold text-gray-900 dark:text-gray-100">{payment.referenceNumber}</p>
                                            </div>
                                        </div>
                                    )}

                                    {recordedDate && (
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center flex-shrink-0">
                                                <Calendar className="h-5 w-5 text-cyan-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Recorded On</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{recordedDate}</p>
                                            </div>
                                        </div>
                                    )}

                                    {payment.notes && (
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center flex-shrink-0">
                                                <FileText className="h-5 w-5 text-pink-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Notes</p>
                                                <p className="text-sm italic text-gray-700 dark:text-gray-300 bg-muted/30 p-3 rounded-lg border border-border/50 mt-1">
                                                    "{payment.notes}"
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Related Documents */}
                    <Card className="shadow-sm border-border/60">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 pb-4 border-b">
                            <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                <FileText className="w-5 h-5 text-purple-600" />
                                Related Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {/* Invoice */}
                            {invoice && (
                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Invoice</p>
                                            <p className="font-bold text-lg text-gray-900 dark:text-gray-100">{invoice.invoiceNumber}</p>
                                        </div>
                                    </div>
                                    <Link to={`/dashboard/raw-materials/invoices/${invoice.id}`}>
                                        <Button variant="outline" className="gap-2 shadow-sm">
                                            View Invoice
                                        </Button>
                                    </Link>
                                </div>
                            )}

                            {/* Purchase Order */}
                            {purchaseOrder && (
                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200 dark:border-green-800 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-sm">
                                            <ShoppingBag className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Purchase Order</p>
                                            <p className="font-bold text-lg text-gray-900 dark:text-gray-100">{purchaseOrder.poNumber}</p>
                                        </div>
                                    </div>
                                    <Link to={`/dashboard/raw-materials/purchase-orders/${purchaseOrder.id}`}>
                                        <Button variant="outline" className="gap-2 shadow-sm">
                                            View PO
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Supplier Snapshot */}
                    {supplier && (
                        <Card className="shadow-sm border-border/60">
                            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 pb-4 border-b">
                                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-orange-600" />
                                    Supplier Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 p-5">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                        <Building2 className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-base text-gray-900 dark:text-gray-100">{supplier.name}</p>
                                        <span className="text-xs text-muted-foreground">Vendor</span>
                                    </div>
                                </div>
                                <div className="space-y-2 pt-2 border-t">
                                    {supplier.email && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail className="w-3.5 h-3.5" />
                                            <span className="truncate">{supplier.email}</span>
                                        </div>
                                    )}
                                    {supplier.phone && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Phone className="w-3.5 h-3.5" />
                                            <span>{supplier.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Payment Summary */}
                    <Card className="shadow-md border-border/60 bg-slate-50 dark:bg-slate-900 overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-600"></div>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Payment Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Payment ID</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">#{payment.id}</span>
                                </div>

                                <Separator className="my-2" />

                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Method</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                        {formatPaymentMethod(payment.paymentMethod)}
                                    </span>
                                </div>

                                <Separator className="my-2" />

                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Date</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">{paymentDate}</span>
                                </div>

                                <Separator className="my-3" />

                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-base text-gray-900 dark:text-gray-100">Amount Paid</span>
                                    <span className="text-xl font-bold text-green-600">
                                        {currency} {Number(payment.amount).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoice Summary */}
                    {invoice && (
                        <Card className="shadow-sm border-border/60 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    Invoice Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Invoice #</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                        {invoice.invoiceNumber}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Total Amount</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                        {currency} {Number(invoice.totalPayableAmount || 0).toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Paid Amount</span>
                                    <span className="font-semibold text-green-600">
                                        {currency} {Number(invoice.paidAmount || 0).toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-sm border-t pt-3">
                                    <span className="font-medium text-gray-900 dark:text-gray-100">Due Date</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                        {invoice.dueDate}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                </div>
            </div>
        </div>

        {/* Print Styles */}
        <style>{`
            @media print {
                /* Hide navigation and non-printable elements */
                a[href^="/dashboard"] {
                    display: none !important;
                }

                /* Hide the "Back to Payments" link */
                .no-print {
                    display: none !important;
                }

                /* Ensure colors print correctly */
                * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }

                /* Remove shadows and backgrounds for cleaner print */
                .shadow-md, .shadow-sm, .shadow-xl {
                    box-shadow: none !important;
                }

                /* Ensure cards print with borders */
                .border-border\\/60 {
                    border: 1px solid #e5e7eb !important;
                }

                /* Hide gradient backgrounds in print */
                .bg-gradient-to-r, .dark\\:bg-gradient-to-r {
                    background: none !important;
                    background-color: #f9fafb !important;
                }

                /* Ensure text is readable in print */
                .text-gray-900, .dark\\:text-gray-100 {
                    color: #111827 !important;
                }

                .text-muted-foreground {
                    color: #6b7280 !important;
                }

                /* Add print-specific styling */
                body {
                    background: white !important;
                }

                /* Page break avoid for cards */
                .shadow-md, .shadow-sm, .shadow-xl, .card {
                    page-break-inside: avoid;
                }
            }
        `}</style>
        </>
    );
}
