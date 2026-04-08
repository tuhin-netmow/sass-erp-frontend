"use client";

import { useState } from "react";
import { Link } from "react-router";
import { useGetSalesInvoicesQuery, useGenerateEInvoiceMutation, useSubmitEInvoiceMutation } from "@/store/features/app/salesOrder/salesOrder";
import { DataTable } from "@/app/components/dashboard/DataTable";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, AlertCircle, UploadCloud, FileText, QrCode, Printer } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export default function EInvoiceList() {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState("");

    const { data, isFetching } = useGetSalesInvoicesQuery({ page, limit, search }); // Fetch all invoices for now
    const [generateEInvoice, { isLoading: isGenerating }] = useGenerateEInvoiceMutation();
    const [submitEInvoice, { isLoading: isSubmitting }] = useSubmitEInvoiceMutation();

    const handleGenerate = async (id: number) => {
        try {
            await generateEInvoice(id).unwrap();
            toast.success("E-Invoice generated successfully");
        } catch (error: any) {
            toast.error(error?.data?.message || "Generation failed");
        }
    };

    const handleSubmit = async (id: number) => {
        try {
            await submitEInvoice(id).unwrap();
            toast.success("E-Invoice submitted to LHDN successfully");
        } catch (error: any) {
            toast.error(error?.data?.message || "Submission failed");
        }
    };

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "invoice_number",
            header: "Invoice #",
            cell: ({ row }) => (
                <Link to={`/dashboard/sales/invoices/${row.original.id}`} className="font-medium text-blue-600 hover:underline">
                    {row.original.invoice_number}
                </Link>
            )
        },
        {
            accessorKey: "invoice_date",
            header: "Date",
            cell: ({ row }) => row.original.invoiceDate ? format(new Date(row.original.invoiceDate), "dd MMM yyyy") : "-"
        },
        {
            accessorKey: "order.customer.name",
            header: "Customer",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.order?.customer?.name || "-"}</span>
                    <span className="text-[10px] text-muted-foreground">{row.original.order?.customer?.company || ""}</span>
                </div>
            )
        },
        {
            accessorKey: "totalAmount",
            header: "Amount",
            cell: ({ row }) => (
                <div className="font-medium tracking-tight">RM {Number(row.original.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            )
        },
        {
            accessorKey: "remaining_balance",
            header: "Balance",
            cell: ({ row }) => (
                <div className={row.original.remaining_balance > 0 ? "text-amber-600 font-medium" : "text-emerald-600 font-medium"}>
                    RM {Number(row.original.remaining_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
            )
        },
        {
            accessorKey: "status",
            header: "Invoice Status",
            cell: ({ row }) => {
                const status = row.original.status || "draft";
                let color = "bg-gray-100 text-gray-700";
                if (status === "paid") color = "bg-emerald-100 text-emerald-700";
                if (status === "sent") color = "bg-blue-100 text-blue-700";
                if (status === "cancelled") color = "bg-red-100 text-red-700";

                return <Badge className={`${color} capitalize`} variant="outline">{status}</Badge>;
            }
        },
        {
            accessorKey: "e_invoice_status",
            header: "E-Invoice Status",
            cell: ({ row }) => {
                const status = row.original.e_invoice_status || "PENDING";
                let color = "bg-gray-100 text-gray-700";
                if (status === "GENERATED") color = "bg-indigo-100 text-indigo-700 border-indigo-200";
                if (status === "SUBMITTED") color = "bg-amber-100 text-amber-700 border-amber-200";
                if (status === "VALID") color = "bg-emerald-100 text-emerald-700 border-emerald-200";
                if (status === "INVALID") color = "bg-red-100 text-red-700 border-red-200";

                return (
                    <Badge className={`${color} font-bold shadow-sm`} variant="secondary">
                        {status === "VALID" && <CheckCircle className="w-3 h-3 mr-1" />}
                        {status === "INVALID" && <AlertCircle className="w-3 h-3 mr-1" />}
                        {status}
                    </Badge>
                );
            }
        },
        {
            accessorKey: "submission_date",
            header: "LHDN Submission",
            cell: ({ row }) => row.original.submission_date ? (
                <div className="text-xs">
                    {format(new Date(row.original.submission_date), "dd MMM yyyy")}<br />
                    <span className="text-muted-foreground">{format(new Date(row.original.submission_date), "HH:mm")}</span>
                </div>
            ) : "-"
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const status = row.original.e_invoice_status || "PENDING";
                return (
                    <div className="flex gap-2">
                        {status === "PENDING" && (
                            <Button size="sm" variant="outline" onClick={() => handleGenerate(row.original.id)} disabled={isGenerating}>
                                <FileText className="w-4 h-4 mr-1" /> Generate
                            </Button>
                        )}
                        {status === "GENERATED" && (
                            <Button size="sm" onClick={() => handleSubmit(row.original.id)} disabled={isSubmitting}>
                                <UploadCloud className="w-4 h-4 mr-1" /> Send to LHDN
                            </Button>
                        )}
                        {(status === "VALID" || status === "SUBMITTED") && (
                            <Button size="sm" variant="outline">
                                <QrCode className="w-4 h-4 mr-1" /> View QR
                            </Button>
                        )}
                    </div>
                );
            }
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between print:hidden">
                <h2 className="text-3xl font-bold tracking-tight">E-Invoices</h2>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-slate-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-slate-500/40 active:translate-y-0 active:shadow-none"
                >
                    <Printer size={18} />
                    Print
                </button>
            </div>

            {/* Print Only Header */}
            <div className="hidden print:block text-center mb-[15px] pb-1">
                <h1 className="text-4xl font-extrabold uppercase tracking-tight">E-INVOICES REPORT</h1>
                <div className="mt-1 text-sm text-gray-700 font-semibold">
                    <span>Report Generated On: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            <Card className="pt-6 pb-2">
                <CardHeader className="print:hidden">
                    <CardTitle>Invoice List</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={data?.data || []}
                        pageIndex={page - 1}
                        pageSize={limit}
                        totalCount={data?.pagination?.total || 0}
                        onPageChange={(p) => setPage(p + 1)}
                        onSearch={setSearch}
                        isFetching={isFetching}
                    />
                </CardContent>
            </Card>

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    @media print {
                        @page {
                            size: landscape;
                            margin: 10mm;
                        }
                        .print\:hidden,
                        header,
                        nav,
                        aside,
                        button,
                        .no-print {
                            display: none !important;
                        }
                        html, body {
                            background: white !important;
                            overflow: visible !important;
                            height: auto !important;
                        }
                        table {
                            width: 100% !important;
                            border-collapse: collapse !important;
                            page-break-inside: auto !important;
                        }
                        thead {
                            display: table-header-group !important;
                        }
                        tr {
                            page-break-inside: avoid !important;
                            page-break-after: auto !important;
                        }
                        th, td {
                            border: 1px solid #ddd !important;
                            padding: 6px 8px !important;
                            font-size: 9px !important;
                            vertical-align: middle !important;
                        }
                        th *, td * {
                            font-size: 9px !important;
                        }
                        th {
                            background-color: #f3f4f6 !important;
                            font-weight: 600 !important;
                            text-align: left !important;
                            line-height: 1.2 !important;
                            text-transform: uppercase !important;
                        }
                        th:nth-child(9), td:nth-child(9) {
                            display: none !important;
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
                        .hidden.print\:block.mb-\[15px\] {
                            margin-bottom: 15px !important;
                        }
                        .border {
                            border: none !important;
                        }
                        .shadow-sm, .shadow-md, .shadow-lg {
                            box-shadow: none !important;
                        }
                        [role="navigation"],
                        input,
                        input[type="search"],
                        input[type="text"],
                        .flex.items-center.justify-between {
                            display: none !important;
                        }
                    }
                `
            }} />
        </div>
    );
}
