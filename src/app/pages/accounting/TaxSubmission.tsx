"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Search, X, Plus, FileText, Download, CheckCircle, AlertCircle, Scale, Printer } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";

import {
    useGetTaxSubmissionsQuery,
    useAddTaxSubmissionMutation
} from "@/store/features/app/accounting/accoutntingApiService";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { toast } from "sonner";
import type { CreateTaxSubmissionInput } from "@/shared/types/app/accounting.types";

export default function TaxSubmission() {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<string>("ALL");

    const { data: taxData, isLoading } = useGetTaxSubmissionsQuery({
        limit: 50, // Increase limit for dashboard view or implement infinite scroll/better pagination
        taxType: filterType === "ALL" ? undefined : filterType,
    });

    const taxSubmissions = taxData?.data || [];
    const stats = taxData?.stats || { totalTax: 0, totalPaid: 0, totalDue: 0 };
    const [addTaxSubmission, { isLoading: isAdding }] = useAddTaxSubmissionMutation();

    const { control, handleSubmit, reset, watch } = useForm<CreateTaxSubmissionInput>({
        defaultValues: {
            taxType: "VAT",
            amount: 0,
            submissionDate: format(new Date(), "yyyy-MM-dd"),
            periodStart: format(new Date(), "yyyy-MM-01"),
            periodEnd: format(new Date(), "yyyy-MM-dd"),
            status: "SUBMITTED",
            notes: "",
            paymentMode: "BANK",
        },
    });

    const watchedAmount = watch("amount") || 0;
    const watchedPaymentMode = watch("paymentMode");
    const watchedTaxType = watch("taxType");
    const watchedPeriodStart = watch("periodStart");
    const watchedPeriodEnd = watch("periodEnd") || format(new Date(), "yyyy-MM-dd");
    const watchedRef = watch("referenceNumber") || "N/A";

    const onSubmit = async (data: CreateTaxSubmissionInput) => {
        try {
            await addTaxSubmission(data).unwrap();
            toast.success("Tax submission recorded successfully");
            setIsOpen(false);
            reset();
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to record tax submission");
            console.error(error);
        }
    };

    const clearFilters = () => {
        setSearchQuery("");
        setFilterType("ALL");
    };

    return (
        <div className="space-y-6 p-6 pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Tax Submissions</h2>
                    <p className="text-muted-foreground">Monitor and record your tax filings and payments.</p>
                </div>
                <div className="flex items-center gap-2 print:hidden">
                    <Button
                        variant="outline"
                        onClick={() => window.print()}
                        className="flex items-center gap-2"
                    >
                        <Printer className="h-4 w-4" />
                        Print
                    </Button>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                <Plus className="mr-2 h-4 w-4" /> New Submission
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Record Tax Submission</DialogTitle>
                                <DialogDescription>
                                    Fill in the details of your tax filing. This will auto-post to accounting.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Tax Type <span className="text-red-500">*</span></Label>
                                            <Controller
                                                name="taxType"
                                                control={control}
                                                rules={{ required: "Tax type is required" }}
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select tax type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="VAT">VAT</SelectItem>
                                                            <SelectItem value="GST">GST</SelectItem>
                                                            <SelectItem value="Income Tax">Income Tax</SelectItem>
                                                            <SelectItem value="Corporation Tax">Corporation Tax</SelectItem>
                                                            <SelectItem value="Other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Tax Period <span className="text-red-500">*</span></Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Controller
                                                    name="periodStart"
                                                    control={control}
                                                    rules={{ required: true }}
                                                    render={({ field }) => (
                                                        <Input {...field} type="date" />
                                                    )}
                                                />
                                                <Controller
                                                    name="periodEnd"
                                                    control={control}
                                                    rules={{ required: true }}
                                                    render={({ field }) => (
                                                        <Input {...field} type="date" />
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Tax Amount <span className="text-red-500">*</span></Label>
                                            <Controller
                                                name="amount"
                                                control={control}
                                                rules={{ required: "Amount is required", min: 0 }}
                                                render={({ field }) => (
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">RM</span>
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            step="0.01"
                                                            className="pl-10 font-mono"
                                                            placeholder="0.00"
                                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                        />
                                                    </div>
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Payment Mode <span className="text-red-500">*</span></Label>
                                            <Controller
                                                name="paymentMode"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select payment mode" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="BANK">Bank Transfer (Always recommended)</SelectItem>
                                                            <SelectItem value="CASH">Cash Payment</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Submission Date <span className="text-red-500">*</span></Label>
                                            <Controller
                                                name="submissionDate"
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <Input {...field} type="date" />
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Reference Number</Label>
                                            <Controller
                                                name="referenceNumber"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} placeholder="e.g. VAT/2026/01" />
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-indigo-600 font-bold uppercase text-xs tracking-wider">Accounting Preview</Label>
                                        <Card className="bg-slate-50 border-dashed border-2 shadow-none overflow-hidden">
                                            <CardHeader className="py-3 px-4 bg-white border-b">
                                                <div className="text-[10px] text-muted-foreground uppercase font-bold">Transaction Preview</div>
                                                <div className="text-xs font-medium">Tax Submission: {watchedTaxType} for period {watchedPeriodStart} to {watchedPeriodEnd}. Ref: {watchedRef}</div>
                                            </CardHeader>
                                            <CardContent className="p-0">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-slate-100/50 hover:bg-slate-100/50 h-8">
                                                            <TableHead className="text-[10px] font-bold py-0 h-8">Account Name</TableHead>
                                                            <TableHead className="text-[10px] font-bold py-0 h-8 text-right">Debit (RM)</TableHead>
                                                            <TableHead className="text-[10px] font-bold py-0 h-8 text-right">Credit (RM)</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        <TableRow className="h-10 hover:bg-transparent">
                                                            <TableCell className="py-2">
                                                                <div className="text-xs font-semibold">Tax Payable</div>
                                                                <div className="text-[9px] text-muted-foreground">Code: 2100</div>
                                                            </TableCell>
                                                            <TableCell className="py-2 text-right text-xs font-mono">{watchedAmount > 0 ? watchedAmount.toFixed(2) : "-"}</TableCell>
                                                            <TableCell className="py-2 text-right text-xs font-mono">-</TableCell>
                                                        </TableRow>
                                                        <TableRow className="h-10 hover:bg-transparent">
                                                            <TableCell className="py-2">
                                                                <div className="text-xs font-semibold">{watchedPaymentMode === "BANK" ? "Bank" : "Cash"}</div>
                                                                <div className="text-[9px] text-muted-foreground">Code: {watchedPaymentMode === "BANK" ? "1100" : "1000"}</div>
                                                            </TableCell>
                                                            <TableCell className="py-2 text-right text-xs font-mono">-</TableCell>
                                                            <TableCell className="py-2 text-right text-xs font-mono">{watchedAmount > 0 ? watchedAmount.toFixed(2) : "-"}</TableCell>
                                                        </TableRow>
                                                        <TableRow className="bg-white hover:bg-white h-8 border-t-2 font-bold">
                                                            <TableCell className="py-1 text-[10px] uppercase">Total</TableCell>
                                                            <TableCell className="py-1 text-right text-[10px] font-mono">{watchedAmount > 0 ? watchedAmount.toFixed(2) : "0.00"}</TableCell>
                                                            <TableCell className="py-1 text-right text-[10px] font-mono">{watchedAmount > 0 ? watchedAmount.toFixed(2) : "0.00"}</TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                                <div className="p-3 bg-indigo-50/50 border-t">
                                                    <p className="text-[10px] text-indigo-700 leading-relaxed italic">
                                                        * This entry will automatically reduce your Tax Payable liability and credit your {watchedPaymentMode === "BANK" ? "Bank" : "Cash"} account.
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <div className="space-y-2 pt-2">
                                            <Label>Memo / Notes</Label>
                                            <Controller
                                                name="notes"
                                                control={control}
                                                render={({ field }) => (
                                                    <Textarea {...field} className="min-h-[100px]" placeholder="Any additional information..." />
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter className="border-t pt-6">
                                    <Button variant="outline" onClick={() => setIsOpen(false)} type="button" className="px-6">Cancel</Button>
                                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 shadow-lg px-8" disabled={isAdding}>
                                        {isAdding ? "Processing..." : "Submit Tax Filing"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-indigo-600 to-indigo-400 text-white shadow-lg">
                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-black/10 blur-2xl" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-white/90">Total Tax Liability</CardTitle>
                        <Scale className="h-5 w-5 text-white/80 print:hidden" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold">
                            RM {stats.totalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-white/70 mt-1">Sum of all recorded tax filings</p>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-600 to-emerald-400 text-white shadow-lg">
                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-black/10 blur-2xl" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-white/90">Total Tax Paid</CardTitle>
                        <CheckCircle className="h-5 w-5 text-white/80 print:hidden" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold">
                            RM {stats.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-white/70 mt-1">Successfully processed tax payments</p>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-orange-600 to-orange-400 text-white shadow-lg">
                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-black/10 blur-2xl" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-white/90">Total Tax Due</CardTitle>
                        <AlertCircle className="h-5 w-5 text-white/80 print:hidden" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold">
                            RM {stats.totalDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-white/70 mt-1">Pending or unpaid tax filings</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="all" className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card p-3 rounded-lg border shadow-sm px-4 gap-4">
                    <TabsList className="bg-muted h-10">
                        <TabsTrigger value="all" className="px-6 h-8">All Submissions</TabsTrigger>
                        <TabsTrigger value="paid" className="px-6 h-8 text-emerald-600 data-[state=active]:text-emerald-700">Tax Paid List</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64 min-w-[200px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search reference..."
                                className="pl-8 h-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-[160px] h-10">
                                <SelectValue placeholder="Tax Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Tax Types</SelectItem>
                                <SelectItem value="VAT">VAT</SelectItem>
                                <SelectItem value="GST">GST</SelectItem>
                                <SelectItem value="Income Tax">Income Tax</SelectItem>
                                <SelectItem value="Corporation Tax">Corporation Tax</SelectItem>
                            </SelectContent>
                        </Select>
                        {(searchQuery || filterType !== "ALL") && (
                            <Button variant="ghost" size="icon" onClick={clearFilters} className="h-10 w-10 text-muted-foreground hover:text-red-500">
                                <X className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </div>

                <TabsContent value="all" className="mt-0">
                    <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
                        <TableBase
                            submissions={taxSubmissions.filter(s => s.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery)}
                            isLoading={isLoading}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="paid" className="mt-0">
                    <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
                        <TableBase
                            submissions={taxSubmissions.filter(sub => (sub.status === 'PAID' || sub.status === 'SUBMITTED') && (sub.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery))}
                            isLoading={isLoading}
                        />
                    </div>
                </TabsContent>
            </Tabs>

            {/* Print Only Header */}
            <div className="hidden print:block text-center mb-[15px] pb-1">
                <h1 className="text-4xl font-extrabold uppercase tracking-tight">TAX SUBMISSIONS REPORT</h1>
                <div className="mt-1 text-sm text-gray-700 font-semibold italic flex justify-center gap-6">
                    <span>Total Tax liability: RM {stats.totalTax.toLocaleString()}</span>
                    <span>Total Paid: RM {stats.totalPaid.toLocaleString()}</span>
                    <span>Total Due: RM {stats.totalDue.toLocaleString()}</span>
                </div>
                <div className="mt-2 text-[10px] text-gray-500">
                    Report Generated On: {format(new Date(), 'd MMMM yyyy HH:mm')}
                </div>
            </div>

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .print\\:hidden, 
                    header, 
                    nav, 
                    aside, 
                    button,
                    .no-print,
                    .flex.flex-col.md\\:flex-row.justify-between.bg-card {
                        display: none !important;
                    }
                    html, body {
                        background: white !important;
                        overflow: visible !important;
                        height: auto !important;
                    }
                    .text-4xl {
                        font-size: 18px !important;
                        margin-bottom: 4px !important;
                        line-height: 1 !important;
                    }
                    .text-4xl + div {
                        line-height: 1 !important;
                        margin-top: 2px !important;
                    }
                    .border {
                        border: none !important;
                    }
                    .shadow-sm, .shadow-md, .shadow-lg {
                        box-shadow: none !important;
                    }
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }
                    th, td {
                        border-bottom: 1px solid #eee !important;
                        padding: 3px 6px !important;
                        font-size: 9px !important;
                    }
                    th {
                        line-height: 1 !important;
                        padding: 4px 6px !important;
                        text-transform: uppercase !important;
                        background-color: #f8fafc !important;
                    }
                    .grid.gap-6.md\\:grid-cols-3 {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr 1fr !important;
                        gap: 10px !important;
                        margin-bottom: 15px !important;
                    }
                    .py-4 {
                        padding-top: 5px !important;
                        padding-bottom: 5px !important;
                    }
                    .text-3xl {
                        font-size: 14px !important;
                    }
                    /* Ensure heading section has exactly 15px margin */
                    .hidden.print\\:block.mb-\\[15px\\] {
                        margin-bottom: 15px !important;
                    }
                }
            `}} />
        </div>
    );
}

function TableBase({ submissions, isLoading }: { submissions: any[], isLoading: boolean }) {
    const getStatusVariant = (status: string) => {
        switch (status) {
            case "PAID": return "default";
            case "SUBMITTED": return "secondary";
            case "PENDING": return "outline";
            default: return "outline";
        }
    };

    return (
        <Table>
            <TableHeader className="bg-muted/50">
                <TableRow>
                    <TableHead className="font-semibold">Submission Date</TableHead>
                    <TableHead className="font-semibold">Tax Type</TableHead>
                    <TableHead className="font-semibold">Period</TableHead>
                    <TableHead className="font-semibold">Reference</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Amount (RM)</TableHead>
                    <TableHead className="text-center font-semibold">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={7}><Skeleton className="h-12 w-full" /></TableCell>
                        </TableRow>
                    ))
                ) : submissions.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="h-40 text-center">
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <FileText className="h-10 w-10 mb-2 opacity-20" />
                                <p>No tax submissions found matching your criteria.</p>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : (
                    submissions.map((sub) => (
                        <TableRow key={sub._id} className="hover:bg-muted/30 transition-colors group">
                            <TableCell className="font-medium">{sub.submissionDate}</TableCell>
                            <TableCell>
                                <div className="flex items-center">
                                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100">
                                        {sub.taxType}
                                    </Badge>
                                </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                {sub.periodStart} → {sub.periodEnd}
                            </TableCell>
                            <TableCell className="font-mono text-xs">{sub.referenceNumber || "—"}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(sub.status)} className="capitalize">
                                    {sub.status.toLowerCase()}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-bold text-indigo-600">
                                {Number(sub.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-center">
                                <Button variant="ghost" size="icon" title="Download Receipt" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Download className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
}
