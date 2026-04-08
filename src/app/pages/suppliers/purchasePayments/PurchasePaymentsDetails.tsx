import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { useGetPurchasePaymentByIdQuery } from "@/store/features/app/purchaseOrder/purchaseOrderApiService";
import { useAppSelector } from "@/store/store";
import { Link, useParams } from "react-router";
import {
  Printer,
  ArrowLeft,
  CreditCard,
  Calendar,
  User,
  Building2,
  Hash,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Mail,
  Phone,
  Contact
} from "lucide-react";

export default function PurchasePaymentsDetails() {
  const currency = useAppSelector((state) => state.currency.value);
  const { id } = useParams();
  const { data, isLoading, error } = useGetPurchasePaymentByIdQuery(id as string);

  if (isLoading) return (
    <div className="min-h-[70vh] flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-muted-foreground text-lg">Loading payment details...</p>
      </div>
    </div>
  );

  if (error || !data?.data) return (
    <div className="min-h-[70vh] flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <XCircle className="h-12 w-12 text-destructive mx-auto" />
        <p className="text-destructive font-medium text-lg">Payment not found.</p>
        <Link to="/dashboard/purchase-payments">
          <Button variant="outline" className="mt-4">Back to Payments</Button>
        </Link>
      </div>
    </div>
  );

  const payment = data.data;

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-3.5 h-3.5" /> };
      case 'pending': return { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock className="w-3.5 h-3.5" /> };
      case 'failed': return { color: 'bg-rose-100 text-rose-700 border-rose-200', icon: <XCircle className="w-3.5 h-3.5" /> };
      default: return { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: null };
    }
  };

  const statusConfig = getStatusConfig(payment.status);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in-50 duration-500 pb-10 px-4 md:px-0">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link to="/dashboard/purchase-payments" className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Payments
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 italic">
              Payment #PPAY-{payment._id.toString().padStart(6, "0")}
            </h1>
            <Badge className={`${statusConfig.color} capitalize px-3 py-1 flex items-center gap-1.5 shadow-none border`}>
              {statusConfig.icon}
              {payment.status}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {payment.invoice && (
            <Link to={`/dashboard/purchase-invoices/${payment.invoiceId}`}>
              <Button variant="outline" className="bg-white hover:bg-slate-50 border-slate-200 gap-2">
                <FileText className="w-4 h-4" /> View Invoice {payment.invoice.invoiceNumber}
              </Button>
            </Link>
          )}

          <Link to={`/dashboard/purchase-payments/${payment.id}/preview`}>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-md">
              <Printer className="w-4 h-4" /> Print / Preview
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN - Payment & Details */}
        <div className="lg:col-span-8 space-y-6">

          <Card className="shadow-sm border-border/60 overflow-hidden">
            <CardHeader className="bg-muted/30 border-b gap-0 py-4">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <DetailItem
                    icon={<Hash className="w-4 h-4 text-blue-500" />}
                    label="Transaction ID"
                    value={`PPAY-${payment._id.toString().padStart(6, "0")}`}
                  />
                  <DetailItem
                    icon={<CreditCard className="w-4 h-4 text-violet-500" />}
                    label="Payment Method"
                    value={payment.paymentMethod.replaceAll("_", " ").toUpperCase()}
                    isBadge
                  />
                  <DetailItem
                    icon={<FileText className="w-4 h-4 text-emerald-500" />}
                    label="Reference Number"
                    value={payment.referenceNumber || "N/A"}
                  />
                </div>
                <div className="space-y-6">
                  <DetailItem
                    icon={<Calendar className="w-4 h-4 text-amber-500" />}
                    label="Date Recorded"
                    value={new Date(payment.paymentDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                  />
                  <DetailItem
                    icon={<User className="w-4 h-4 text-indigo-500" />}
                    label="Recorded By"
                    value={payment.creator?.name || "System"}
                  />
                  <div className="flex flex-col gap-1 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30 relative overflow-hidden group">
                    <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
                      <CreditCard className="h-16 w-16" />
                    </div>
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 uppercase font-bold tracking-widest relative z-10">Amount Paid</span>
                    <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight relative z-10">
                      {currency} {Number(payment.amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes if any */}
          {payment.notes && (
            <Card className="shadow-sm border-border/60">
              <CardHeader className="py-3 px-6">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Internal Notes</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <p className="text-sm bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 italic">
                  "{payment.notes}"
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN - Links & Summary */}
        <div className="lg:col-span-4 space-y-6">

          {/* Supplier Snapshot */}
          {payment.purchaseOrder?.supplier && (
            <Card className="shadow-sm border-border/60 overflow-hidden">
              <CardHeader className="py-4 bg-muted/30 border-b">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Supplier
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{payment.purchaseOrder?.supplier.name}</p>
                    <p className="text-xs text-muted-foreground">Vendor</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="truncate">{payment.purchaseOrder?.supplier.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 shrink-0" />
                    <span>{payment.purchaseOrder?.supplier.phone}</span>
                  </div>
                  {payment.purchaseOrder?.supplier.contactPerson && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground group/link">
                      <Contact className="w-4 h-4 shrink-0 group-hover/link:text-indigo-500 transition-colors" />
                      <span className="group-hover/link:text-foreground transition-colors">{payment.purchaseOrder?.supplier.contactPerson}</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button variant="outline" size="sm" className="h-8 text-xs font-semibold hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all" asChild>
                    <a href={`mailto:${payment.purchaseOrder?.supplier.email}`}>
                      <Mail className="w-3 h-3 mr-1.5" /> Email
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs font-semibold hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all" asChild>
                    <a href={`tel:${payment.purchaseOrder?.supplier.phone}`}>
                      <Phone className="w-3 h-3 mr-1.5" /> Call
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Financial context */}
          <Card className="shadow-lg border-indigo-100 dark:border-indigo-900/30 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-emerald-500"></div>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Related Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm p-3 bg-slate-50 dark:bg-slate-900 rounded-lg group">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-medium">Purchase Order</span>
                    <span className="font-bold">#{payment.purchaseOrder?.poNumber}</span>
                  </div>
                  <Link to={`/dashboard/purchase-orders/${payment.purchaseOrderId}`}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Button>
                  </Link>
                </div>

                {payment.invoice && (
                  <div className="flex justify-between items-center text-sm p-3 bg-slate-50 dark:bg-slate-900 rounded-lg group">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground font-medium">Invoice Number</span>
                      <span className="font-bold">#{payment.invoice?.invoiceNumber}</span>
                    </div>
                    <Link to={`/dashboard/purchase-invoices/${payment.invoiceId}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowLeft className="h-4 w-4 rotate-180" />
                      </Button>
                    </Link>
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

function DetailItem({ icon, label, value, isBadge = false }: { icon: React.ReactNode, label: string, value: string, isBadge?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 p-1.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shrink-0">
        {icon}
      </div>
      <div className="space-y-0.5">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        {isBadge ? (
          <Badge variant="secondary" className="font-semibold text-xs py-0 px-2 h-5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-none border-none">
            {value}
          </Badge>
        ) : (
          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{value}</p>
        )}
      </div>
    </div>
  );
}

