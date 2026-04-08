/* eslint-disable @typescript-eslint/no-explicit-any */
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
    AlertCircle,
    CheckCircle,
    User
} from "lucide-react";
import {
    useGetSalesReturnByIdQuery,
    useAddSalesReturnInvoiceMutation,
    useUpdateSalesReturnStatusMutation,
} from "@/store/features/app/salesOrder/salesReturnApiService";
import { toast } from "sonner";
import { useAppSelector } from "@/store/store";

export default function ViewSalesReturn() {
    const { returnId } = useParams();
    const navigate = useNavigate();

    const currency = useAppSelector((state) => state.currency.value);

    const { data, isLoading } = useGetSalesReturnByIdQuery(returnId!);

    const salesReturn = Array.isArray(data?.data) ? data?.data[0] : data?.data;

    const [addInvoice, { isLoading: isCreating }] = useAddSalesReturnInvoiceMutation();
    const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateSalesReturnStatusMutation();

    if (isLoading) {
        return <div className="min-h-[70vh] flex items-center justify-center p-8"><p className="text-muted-foreground text-lg">Loading sales return...</p></div>;
    }

    if (!salesReturn) {
        return <div className="min-h-[70vh] flex items-center justify-center p-8"><p className="text-red-500 font-medium text-lg">No sales return found</p></div>;
    }

    const handleApprove = async () => {
        try {
            const res = await updateStatus({ id: salesReturn.id || salesReturn._id, status: "approved" }).unwrap();
            if (res.status) {
                toast.success(res.message || "Sales return approved successfully");
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to approve sales return");
        }
    };

    const handleCreateInvoice = async () => {
        try {
            const res = await addInvoice({ salesReturnId: salesReturn.id || salesReturn._id, dueDate: new Date().toISOString().split("T")[0] }).unwrap();
            if (res.status && (res.data?.id || res.data?._id)) {
                toast.success(res.message || "Return Invoice created successfully");
                navigate(`/dashboard/sales-return-invoices/${res.data.id || res.data._id}`);
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
            case 'completed': return 'bg-blue-600 hover:bg-blue-700';
            case 'returned': return 'bg-orange-600 hover:bg-orange-700';
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
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                            Sales Return #{salesReturn.returnNumber || salesReturn.return_number || salesReturn.id || salesReturn._id}
                        </h1>
                        <Badge className={`${getStatusColor(salesReturn.status || 'returned')} text-white capitalize px-3 py-1 shadow-sm`}>
                            {salesReturn.status || "returned"}
                        </Badge>
                    </div>
                    {(salesReturn.salesOrder || salesReturn.sales_order) && (
                        <p className="text-sm text-muted-foreground mt-1">
                            Based on Sales Order: <span className="font-semibold text-primary">#{(salesReturn.salesOrder || salesReturn.sales_order).orderNumber || (salesReturn.salesOrder || salesReturn.sales_order).order_number}</span>
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {salesReturn.status === 'pending' && (
                        <Button onClick={handleApprove} disabled={isUpdatingStatus} className="gap-2 shadow-sm bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4" /> {isUpdatingStatus ? "Approving..." : "Approve Return"}
                        </Button>
                    )}
                    {(salesReturn.status === 'approved' || salesReturn.status === 'returned' || salesReturn.status === 'completed') && (
                        <>
                            {salesReturn.invoice ? (
                                <Link to={`/dashboard/sales-return-invoices/${salesReturn.invoice.publicId || salesReturn.invoice.id || salesReturn.invoice._id}`}>
                                    <Button variant="outline" className="gap-2 shadow-sm bg-blue-50 text-blue-700 border-blue-200">
                                        <Eye className="h-4 w-4" /> View Return Invoice
                                    </Button>
                                </Link>
                            ) : (
                                <Button onClick={handleCreateInvoice} disabled={isCreating} className="gap-2 shadow-sm bg-orange-600 hover:bg-orange-700">
                                    <FilePlus className="h-4 w-4" /> {isCreating ? "Creating..." : "Create Return Invoice"}
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    <Card className="shadow-sm border-border/60 py-6">
                        <CardHeader className="gap-0 text-left">
                            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <User className="w-4 h-4" /> Customer Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500"><User className="w-5 h-5" /></div>
                                <div className="text-left">
                                    <p className="font-semibold text-sm">{salesReturn.customer?.name || "N/A"}</p>
                                    <span className="text-xs text-muted-foreground">Customer</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="w-3.5 h-3.5" /> <span className="truncate">{salesReturn.customer?.email || "N/A"}</span></div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="w-3.5 h-3.5" /> <span>{salesReturn.customer?.phone || 'N/A'}</span></div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="shadow-sm border-border/60"><CardContent className="p-4 flex flex-col gap-1 text-left"><span className="text-xs text-muted-foreground uppercase font-medium text-left">Return Date</span><span className="text-sm font-semibold flex items-center gap-2"><Calendar className="w-4 h-4 opacity-50" /> {formatDateStandard(salesReturn.returnDate || salesReturn.return_date)}</span></CardContent></Card>
                        <Card className="shadow-sm border-border/60"><CardContent className="p-4 flex flex-col gap-1 text-left"><span className="text-xs text-muted-foreground uppercase font-medium text-left">Original Order Ref.</span><span className="text-sm font-semibold flex items-center gap-2"><Package className="w-4 h-4 opacity-50" /> {(salesReturn.salesOrder || salesReturn.sales_order || salesReturn.order)?.orderNumber || (salesReturn.salesOrder || salesReturn.sales_order || salesReturn.order)?.order_number || "N/A"}</span></CardContent></Card>
                    </div>

                    <Card className="shadow-sm border-border/60 overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b-1 gap-0 py-4 text-left">
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
                                        <th className="px-6 py-4 font-medium text-right">Price</th>
                                        <th className="px-6 py-4 font-medium text-right">Discount</th>
                                        <th className="px-6 py-4 font-medium text-right">Tax</th>
                                        <th className="px-6 py-4 font-medium text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {salesReturn.items?.map((item: any) => (
                                        <tr key={item.id || item._id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100 text-left">
                                                <p>{item.product?.name || "N/A"}</p>
                                                <span className="text-xs text-muted-foreground">SKU: {item.product?.sku || "N/A"}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center"><Badge variant="outline" className="font-mono text-xs">{item.quantity}</Badge></td>
                                            <td className="px-6 py-4 text-right">{currency} {Number(item.unitPrice || item.unit_price || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right text-muted-foreground">{currency} {Number(item.discount || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right text-muted-foreground">{currency} {Number(item.taxAmount || item.tax_amount || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right font-bold">{currency} {(Number(item.lineTotal || item.line_total || 0) + Number(item.taxAmount || item.tax_amount || 0)).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {salesReturn.notes && (
                        <Card className="shadow-sm border-border/60 py-4 md:py-6">
                            <CardHeader className="gap-0 text-left"><CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Notes</CardTitle></CardHeader>
                            <CardContent><p className="text-sm text-gray-700 dark:text-gray-300 italic bg-muted/30 p-4 rounded-lg border border-border/50 text-left">"{salesReturn.notes}"</p></CardContent>
                        </Card>
                    )}
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <Card className="shadow-md border-border/60 bg-slate-50 dark:bg-slate-900 overflow-hidden pb-6">
                        <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                        <CardHeader className="gap-0 text-left"><CardTitle className="text-lg">Financial Summary</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center text-muted-foreground"><span>Subtotal</span><span>{currency} {Number(salesReturn.totalAmount || salesReturn.total_amount || 0).toFixed(2)}</span></div>
                                <div className="flex justify-between items-center text-muted-foreground"><span>Discount</span><span className="text-red-500">- {currency} {Number(salesReturn.discountAmount || salesReturn.discount_amount || 0).toFixed(2)}</span></div>
                                <div className="flex justify-between items-center text-muted-foreground"><span>Tax</span><span>+ {currency} {Number(salesReturn.taxAmount || salesReturn.tax_amount || 0).toFixed(2)}</span></div>
                                <Separator className="my-2" />
                                {(() => {
                                    const totalVal = Number(salesReturn.grandTotal || salesReturn.grand_total || salesReturn.total_payable_amount || 0);
                                    const payments = salesReturn.payments || [];
                                    const paidVal = Number(salesReturn.totalRefundedAmount || salesReturn.total_refunded_amount || payments.reduce((acc: number, p: any) => acc + Number(p.amount || p.paid_amount || 0), 0) || 0);
                                    const balanceVal = Number(salesReturn.dueRefundAmount ?? salesReturn.due_refund_amount ?? (totalVal - paidVal));
                                    return (
                                        <>
                                            <div className="flex justify-between items-center font-bold text-lg text-blue-600"><span>Total Refundable</span><span>{currency} {totalVal.toFixed(2)}</span></div>
                                            <div className="flex justify-between items-center text-sm font-medium text-green-600 pt-2"><span>Total Refunded</span><span>{currency} {paidVal.toFixed(2)}</span></div>
                                            <div className="bg-white p-4 rounded-xl border border-border/50 shadow-inner mt-4 text-left">
                                                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Due Refund Amount</p>
                                                <p className={`text-2xl font-black ${balanceVal > 0 ? 'text-red-600' : 'text-green-600'}`}>{currency} {balanceVal.toFixed(2)}</p>
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
