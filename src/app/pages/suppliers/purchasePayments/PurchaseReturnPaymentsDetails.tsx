import { Button } from "@/shared/components/ui/button";
import { useGetPurchaseReturnPaymentByIdQuery } from "@/store/features/app/purchaseOrder/purchaseReturnApiService";
import { useAppSelector } from "@/store/store";
import { Link, useParams } from "react-router";
import {
    ArrowLeft,
    Calendar,
    CreditCard,
    FileText,
    User,
    Building2,
    Hash,
    Phone,
    Mail,
    Banknote
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { formatDateStandard } from "@/shared/utils/dateUtils";

export default function PurchaseReturnPaymentsDetails() {
    const currency = useAppSelector((state) => state.currency.value);

    const { id } = useParams();
    const { data, isLoading, error } = useGetPurchaseReturnPaymentByIdQuery(id as string);

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground animate-pulse">Loading refund details...</p>
            </div>
        </div>
    );

    if (error || !data?.data) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
            <div className="bg-red-100 p-4 rounded-full text-red-600">
                <FileText className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Refund Not Found</h2>
            <p className="text-gray-500 max-w-md">
                The refund record you are looking for does not exist or has been removed.
            </p>
            <Link to="/dashboard/purchase-returns/payments">
                <Button>Back to Refund List</Button>
            </Link>
        </div>
    );

    const payment = data.data;

    // --------------------------
    // Payment Core Info
    // --------------------------
    const formattedPayment = {
        number: `RRFD-${payment._id.toString().padStart(6, "0")}`,
        date: formatDateStandard(payment.paymentDate),
        method: payment.paymentMethod?.replaceAll("_", " ") || "-",
        reference: payment.referenceNumber || "-",
        amount: Number(payment.amount),
        recordedBy: payment.createdBy,
        status: payment.status || "completed",
        notes: payment.notes || "No additional notes provided."
    };

    // --------------------------
    // Purchase Return Info
    // --------------------------
    const purchaseReturn = (payment as any).purchaseReturn;
    const po = purchaseReturn
        ? {
            number: purchaseReturn.returnNumber || purchaseReturn.poNumber || `RET-${purchaseReturn._id}`,
            total: purchaseReturn.totalAmount,
            totalPayableAmount: purchaseReturn.totalPayableAmount,
            supplier: purchaseReturn.supplier,
        }
        : null;

    // --------------------------
    // Invoice Info
    // --------------------------
    const invoice = payment.invoice
        ? {
            id: payment.invoice._id,
            publicId: payment.invoice._id,
            invoice_id: payment.invoiceId,
            number: payment.invoice.invoiceNumber,
            total: payment.invoice.totalAmount,
            totalPayableAmount: payment.invoice.totalPayableAmount,
            dueDate: formatDateStandard(payment.invoice.dueDate),
        }
        : null;

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-emerald-600';
            case 'pending': return 'bg-amber-500';
            case 'cancelled': return 'bg-rose-600';
            default: return 'bg-slate-500';
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in-50 duration-500 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="text-left">
                    <Link
                        to="/dashboard/purchase-returns/payments"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Refunds
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Refund {formattedPayment.number}</h1>
                        <Badge className={`${getStatusColor(formattedPayment.status)} text-white capitalize px-3 py-1 shadow-sm border-0`}>
                            {formattedPayment.status}
                        </Badge>
                    </div>
                </div>

                <div className="flex gap-3">
                    {invoice && (
                        <Link to={`/dashboard/purchase-return-invoices/${invoice.publicId || invoice.id}`}>
                            <Button variant="outline" className="shadow-sm border-primary/20 hover:bg-primary/5 text-primary gap-2">
                                <FileText className="w-4 h-4" />
                                View Invoice
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-sm border-border/60 overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 p-6 border-b border-orange-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-orange-800 uppercase tracking-wider mb-1">Total Refund Amount</p>
                                    <h2 className="text-4xl font-bold text-orange-700 font-mono tracking-tight">
                                        {currency} {formattedPayment.amount.toFixed(2)}
                                    </h2>
                                </div>
                                <div className="bg-white p-3 rounded-full shadow-sm text-orange-600">
                                    <Banknote className="w-8 h-8" />
                                </div>
                            </div>
                        </div>

                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-b">
                                <div className="p-6 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 bg-blue-50 p-2 rounded-lg text-blue-600">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Payment Date</p>
                                            <p className="font-semibold text-gray-900 mt-0.5">{formattedPayment.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 bg-purple-50 p-2 rounded-lg text-purple-600">
                                            <CreditCard className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                                            <p className="font-semibold text-gray-900 mt-0.5 capitalize">{formattedPayment.method}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 bg-slate-50 p-2 rounded-lg text-slate-600">
                                            <Hash className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Reference Number</p>
                                            <p className="font-semibold text-gray-900 mt-0.5 font-mono">{formattedPayment.reference}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 bg-emerald-50 p-2 rounded-lg text-emerald-600">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Recorded By</p>
                                            <p className="font-semibold text-gray-900 mt-0.5">{formattedPayment.recordedBy || "Unknown"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50/50">
                                <p className="text-sm font-semibold text-gray-900 mb-2">Notes</p>
                                <p className="text-sm text-gray-600 leading-relaxed bg-white p-4 rounded-lg border border-slate-200">
                                    {formattedPayment.notes}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Related Info */}
                <div className="space-y-6">
                    {/* Supplier Info */}
                    {po?.supplier && (
                        <Card className="shadow-sm border-border/60">
                            <CardHeader className="bg-slate-50/50 py-4 border-b">
                                <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-700">
                                    <Building2 className="w-4 h-4 text-blue-500" />
                                    Supplier Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div>
                                    <p className="font-bold text-lg text-gray-900">{po.supplier.name}</p>
                                    <p className="text-sm text-muted-foreground">{po.supplier.company}</p>
                                </div>
                                <Separator />
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-700">{po.supplier.contactPerson || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-700">{po.supplier.email || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-700">{po.supplier.phone || 'N/A'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Related Documents */}
                    <Card className="shadow-sm border-border/60">
                        <CardHeader className="bg-slate-50/50 py-4 border-b">
                            <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-700">
                                <FileText className="w-4 h-4 text-orange-500" />
                                Related Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {po && (
                                    <div className="p-4 hover:bg-slate-50 transition-colors">
                                        <p className="text-xs text-muted-foreground font-medium uppercase mb-1">Purchase Return</p>
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-gray-900">{po.number}</span>
                                            <span className="text-sm font-medium text-gray-600">{currency} {Number(po.totalPayableAmount || 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                                {invoice && (
                                    <div className="p-4 hover:bg-slate-50 transition-colors">
                                        <p className="text-xs text-muted-foreground font-medium uppercase mb-1">Return Invoice</p>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold text-gray-900">{invoice.number}</span>
                                            <span className="text-sm font-medium text-gray-600">{currency} {Number(invoice.totalPayableAmount || 0).toFixed(2)}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Due: {invoice.dueDate}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
