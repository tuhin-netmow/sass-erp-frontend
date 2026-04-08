"use client";

import { Badge } from "@/shared/components/ui/badge";
import { formatDateStandard } from "@/shared/utils/dateUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Link, useNavigate, useParams } from "react-router";
import { Separator } from "@/shared/components/ui/separator";
import {
    Eye,
    FilePlus,
    ArrowLeft,
    Package,
    Calendar,
    Mail,
    Phone,
    Building2,
    AlertCircle,
    CheckCircle
} from "lucide-react";
import {
    useGetPurchaseReturnByIdQuery,
    useAddPurchaseReturnInvoiceMutation,
    useUpdatePurchaseReturnStatusMutation,
} from "@/store/features/app/purchaseOrder/purchaseReturnApiService";
import { toast } from "sonner";
import { useAppSelector } from "@/store/store";

export default function ViewPurchaseReturnPage() {
    const { returnId } = useParams();
    const navigate = useNavigate();

    const currency = useAppSelector((state) => state.currency.value);

    const { data, isLoading } = useGetPurchaseReturnByIdQuery(returnId as string);

    const purchaseReturn = Array.isArray(data?.data) ? data?.data[0] : data?.data;

    const [addInvoice, { isLoading: isCreating }] =
        useAddPurchaseReturnInvoiceMutation();

    const [updateStatus, { isLoading: isUpdatingStatus }] =
        useUpdatePurchaseReturnStatusMutation();

    if (isLoading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-8">
                <p className="text-muted-foreground text-lg">Loading purchase return...</p>
            </div>
        );
    }

    if (!purchaseReturn) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-8">
                <p className="text-red-500 font-medium text-lg">No purchase return found</p>
            </div>
        );
    }

    /* ================= ACTIONS ================= */
    const handleApprove = async () => {
        try {
            const res = await updateStatus({
                id: purchaseReturn.id,
                status: "approved"
            }).unwrap();
            if (res.status) {
                toast.success(res.message || "Purchase return approved successfully");
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to approve purchase return");
        }
    };

    const handleCreateInvoice = async () => {
        try {
            const res = await addInvoice({
                purchase_return_id: purchaseReturn.id,
                dueDate: new Date().toISOString().split("T")[0],
            }).unwrap();

            if (res.status && res.data?.id) {
                toast.success(res.message || "Return Invoice created successfully");
                navigate(`/dashboard/purchase-return-invoices/${res.data.publicId || res.data.id}`);
            } else if (res.status) {
                toast.success(res.message || "Return Invoice created successfully");
            }
        } catch {
            toast.error("Failed to create return invoice");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'bg-green-600 hover:bg-green-700';
            case 'pending': return 'bg-yellow-500 hover:bg-yellow-600 text-black';
            case 'rejected': return 'bg-red-600 hover:bg-red-700';
            case 'returned': return 'bg-orange-600 hover:bg-orange-700';
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
                            Purchase Return #{purchaseReturn.returnNumber || purchaseReturn.poNumber || purchaseReturn.id}
                        </h1>
                        <Badge className={`${getStatusColor(purchaseReturn.status || 'returned')} text-white capitalize px-3 py-1 shadow-sm`}>
                            {purchaseReturn.status || "returned"}
                        </Badge>
                    </div>
                    {purchaseReturn.poNumber && (
                        <p className="text-sm text-muted-foreground mt-1">
                            Based on Purchase Order: <span className="font-semibold text-primary">#{purchaseReturn.poNumber}</span>
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {purchaseReturn.status === 'pending' && (
                        <Button onClick={handleApprove} disabled={isUpdatingStatus} className="gap-2 shadow-sm bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4" />
                            {isUpdatingStatus ? "Approving..." : "Approve Return"}
                        </Button>
                    )}

                    {(purchaseReturn.status === 'approved' || purchaseReturn.status === 'returned') && (
                        <>
                            {purchaseReturn.invoice ? (
                                <Link to={`/dashboard/purchase-return-invoices/${purchaseReturn.invoice.publicId || purchaseReturn.invoice.id}`}>
                                    <Button variant="outline" className="gap-2 shadow-sm bg-blue-50 text-blue-700 border-blue-200">
                                        <Eye className="h-4 w-4" /> View Return Invoice
                                    </Button>
                                </Link>
                            ) : (
                                <Button onClick={handleCreateInvoice} disabled={isCreating} className="gap-2 shadow-sm bg-orange-600 hover:bg-orange-700">
                                    <FilePlus className="h-4 w-4" />
                                    {isCreating ? "Creating..." : "Create Return Invoice"}
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN (Details) */}
                <div className="lg:col-span-8 space-y-6">

                    {/* 1. Supplier Details */}
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
                                    <p className="font-semibold text-sm">{purchaseReturn.supplier?.name || "N/A"}</p>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">Vendor</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="w-3.5 h-3.5" />
                                    <span className="truncate">{purchaseReturn.supplier?.email || "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>{purchaseReturn.supplier?.phone || 'N/A'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Order Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="shadow-sm border-border/60">
                            <CardContent className="p-4 flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground uppercase font-medium">Return Date</span>
                                <span className="text-sm font-semibold flex items-center gap-2">
                                    <Calendar className="w-4 h-4 opacity-50" /> {formatDateStandard(purchaseReturn?.returnDate || purchaseReturn?.orderDate)}
                                </span>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border-border/60">
                            <CardContent className="p-4 flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground uppercase font-medium">Original Order Ref.</span>
                                <span className="text-sm font-semibold flex items-center gap-2">
                                    <Package className="w-4 h-4 opacity-50" /> {(purchaseReturn as any)?.purchase_order?.poNumber || purchaseReturn.poNumber || "N/A"}
                                </span>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 3. Items Table */}
                    <Card className="shadow-sm border-border/60 overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b-1 gap-0 py-4">
                            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Package className="w-4 h-4" /> Returned Items
                            </CardTitle>
                        </CardHeader>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b">
                                    <tr className="text-left text-muted-foreground text-xs uppercase tracking-wider">
                                        <th className="px-6 py-4 font-medium">Product</th>
                                        <th className="px-6 py-4 font-medium text-center">Qty</th>
                                        <th className="px-6 py-4 font-medium text-right">Unit Cost</th>
                                        <th className="px-6 py-4 font-medium text-right">Discount</th>
                                        <th className="px-6 py-4 font-medium text-right">Tax Amount</th>
                                        <th className="px-6 py-4 font-medium text-right">Line Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {purchaseReturn.items && purchaseReturn.items.length > 0 ? (
                                        purchaseReturn.items.map((item: any) => {
                                            const itemTaxAmount = Number(item.taxAmount || 0);
                                            const itemTotal = Number(item.lineTotal || 0) + itemTaxAmount;

                                            return (
                                                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                                                        <p>{item.product?.name || "N/A"}</p>
                                                        <span className="text-xs text-muted-foreground">SKU: {item.product?.sku || "N/A"}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <Badge variant="outline" className="font-mono text-xs">{item.quantity}</Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">{currency} {Number(item.unitCost || 0).toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-right text-muted-foreground">{currency} {Number(item.discount || 0).toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-right text-muted-foreground">{currency} {itemTaxAmount.toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-gray-100">{currency} {itemTotal.toFixed(2)}</td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                                No items specified in this return.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* 4. Notes */}
                    {purchaseReturn.notes && (
                        <Card className="shadow-sm border-border/60 py-4 md:py-6">
                            <CardHeader className="gap-0">
                                <CardTitle className="text-sm font-medium uppercase md:text-base tracking-wider text-muted-foreground flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> Notes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-700 dark:text-gray-300 italic bg-muted/30 p-4 rounded-lg border border-border/50">
                                    "{purchaseReturn.notes}"
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* RIGHT COLUMN (Summary) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* SUMMARY */}
                    <Card className="shadow-md border-border/60 bg-slate-50 dark:bg-slate-900 overflow-hidden pb-6">
                        <div className="h-2 bg-gradient-to-r from-orange-500 to-red-600"></div>
                        <CardHeader className="gap-0">
                            <CardTitle className="text-lg">Financial Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>{currency} {Number(purchaseReturn.totalAmount || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Discount</span>
                                    <span className="text-red-500">- {currency} {Number(purchaseReturn.discountAmount || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Tax</span>
                                    <span>+ {currency} {Number(purchaseReturn.taxAmount || 0).toFixed(2)}</span>
                                </div>

                                <Separator className="my-2" />

                                {(() => {
                                    const totalVal = Number(purchaseReturn?.grandTotal || purchaseReturn?.totalPayableAmount || (Number(purchaseReturn?.totalAmount || 0) + Number(purchaseReturn?.taxAmount || 0) - Number(purchaseReturn?.discountAmount || 0)));

                                    const payments = purchaseReturn?.payments || [];
                                    const calculatedTotalPaid = payments.reduce((acc: number, p: any) => acc + Number(p.amount || 0), 0);

                                    const paidVal = Number(purchaseReturn?.totalRefundedAmount || calculatedTotalPaid || 0);
                                    const balanceVal = Number(purchaseReturn?.dueRefundAmount ?? (totalVal - paidVal));

                                    return (
                                        <>
                                            <div className="flex justify-between items-center font-bold text-lg text-blue-600 dark:text-blue-400">
                                                <span>Total Refundable</span>
                                                <span>{currency} {totalVal.toFixed(2)}</span>
                                            </div>

                                            <div className="flex justify-between items-center text-sm font-medium text-green-600 pt-2">
                                                <span>Total Refunded (Paid)</span>
                                                <span>{currency} {paidVal.toFixed(2)}</span>
                                            </div>

                                            <div className="bg-white dark:bg-black/20 p-4 rounded-xl border border-border/50 shadow-inner mt-4">
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Due Refund Amount</p>
                                                        <p className={`text-2xl font-black tracking-tight ${balanceVal > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                            {currency} {balanceVal.toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
