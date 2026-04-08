/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSearchParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useLazyGetInvoiceByIdQuery, useLazyGetOrdersItemsQuery } from "@/store/features/app/salesOrder/salesOrder";
import { Loader2, Printer, ArrowLeft, FileText, Calendar, User } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { SalesInvoice } from "@/shared/types/app/salesInvoice.types";
import { useAppSelector } from "@/store/store";
import { format } from "date-fns";

export default function InvoiceSummaryDetails() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const idsParam = searchParams.get("ids");
    const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
    const [loading, setLoading] = useState(true);

    const [triggerGetInvoice] = useLazyGetInvoiceByIdQuery();
    const [triggerGetOrdersItems] = useLazyGetOrdersItemsQuery();
    const currency = useAppSelector((state) => state.currency.value) || "RM";

    useEffect(() => {
        async function fetchInvoices() {
            if (!idsParam) {
                setLoading(false);
                return;
            }

            const ids = idsParam.split(",");
            try {
                const results = await Promise.all(
                    ids.map(id => triggerGetInvoice(id).unwrap())
                );

                const fetchedInvoices = results
                    .map(res => res.data)
                    .filter((inv): inv is SalesInvoice => !!inv);

                // Fetch Items details for all orders in batch
                const orderIds = fetchedInvoices.map(inv => inv.orderId).filter(Boolean).join(",");
                if (orderIds) {
                    try {
                        const itemsResponse = await triggerGetOrdersItems(orderIds).unwrap();
                        if (itemsResponse.status && Array.isArray(itemsResponse.data)) {
                            // Merge items into invoices
                            const mergedInvoices = fetchedInvoices.map(inv => {
                                const orderData = itemsResponse.data.find((d: any) => d.id === inv.orderId);
                                if (orderData && orderData.items) {
                                    return {
                                        ...inv,
                                        order: {
                                            ...inv.order,
                                            items: orderData.items
                                        }
                                    };
                                }
                                return inv;
                            });
                            setInvoices(mergedInvoices);
                        } else {
                            setInvoices(fetchedInvoices);
                        }
                    } catch (err) {
                        console.error("Error fetching batch items:", err);
                        setInvoices(fetchedInvoices);
                    }
                } else {
                    setInvoices(fetchedInvoices);
                }
            } catch (error) {
                console.error("Error fetching invoices for summary:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchInvoices();
    }, [idsParam, triggerGetInvoice, triggerGetOrdersItems]);

    const handlePrintPreview = () => {
        navigate(`/dashboard/sales/invoices/summary?ids=${idsParam}&full=true`);
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (invoices.length === 0) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center gap-4 text-gray-500 font-medium">
                <p>No invoices found for the provided IDs.</p>
                <Button onClick={() => navigate(-1)} variant="outline" className="rounded-xl">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }

    const totalPayable = invoices.reduce((sum, inv) => sum + parseFloat(inv.totalPayable || "0"), 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    const totalDue = invoices.reduce((sum, inv) => sum + (inv.remainingBalance || 0), 0);

    return (
        <div className="max-w-7xl mx-auto md:px-0">
            {/* Sticky Header Actions */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8 sticky top-0 bg-background/80 backdrop-blur-md z-30 py-4 -mx-4 px-4 border-b z-[1]">
                <div className="flex flex-wrap items-center gap-4">
                    <Button onClick={() => navigate(-1)} variant="ghost" size="icon" className="rounded-full bg-gray-100 hover:bg-gray-200">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">Invoices Summary Details</h1>
                        <p className="text-sm text-gray-500 mt-0.5 font-medium flex items-center gap-1.5">
                            <FileText size={14} /> {invoices.length} Invoices Selected
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handlePrintPreview}
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/20 px-8 rounded-xl h-12 font-bold transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                    <Printer className="mr-2 h-5 w-5" />
                    Print / Preview Report
                </Button>
            </div>

            <div className="space-y-10 pb-12">
                {/* Overall Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center transition-all hover:shadow-md">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Total Combined Payable</span>
                        <span className="text-2xl md:text-3xl font-black text-gray-900">{currency} {totalPayable.toFixed(2)}</span>
                    </div>
                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center border-l-4 border-l-emerald-500 transition-all hover:shadow-md">
                        <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider mb-2">Total Combined Paid</span>
                        <span className="text-2xl md:text-3xl font-black text-emerald-600">{currency} {totalPaid.toFixed(2)}</span>
                    </div>
                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center border-l-4 border-l-rose-500 transition-all hover:shadow-md sm:col-span-2 lg:col-span-1">
                        <span className="text-[10px] uppercase font-bold text-rose-600 tracking-wider mb-2">Total Combined Due</span>
                        <span className="text-2xl md:text-3xl font-black text-rose-600">{currency} {totalDue.toFixed(2)}</span>
                    </div>
                </div>

                {/* Detailed Invoice Cards (Matching Printable Layout Style) */}
                <div className="space-y-12">
                    {invoices.map((inv, idx) => (
                        <div key={inv.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group transition-all hover:shadow-md hover:border-gray-200">
                            {/* Card Header */}
                            <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold text-sm">
                                        #{idx + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{inv.invoiceNumber}</h3>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 font-medium">
                                            <span className="flex items-center gap-1.5"><User size={14} className="text-blue-500" /> {inv.order?.customer?.name}</span>
                                            <span className="flex items-center gap-1.5"><Calendar size={14} className="text-amber-500" /> {format(new Date(inv.invoiceDate), 'dd/MM/yyyy')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:items-end">
                                    <span className="text-xs uppercase font-bold text-gray-400 mb-1">Due Date</span>
                                    <span className="text-sm font-bold text-gray-700 bg-white px-3 py-1 rounded-lg border border-gray-100">{format(new Date(inv.dueDate), 'dd/MM/yyyy')}</span>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="p-0 overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-white border-b text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 text-center w-12">No</th>
                                            <th className="px-6 py-4 text-left w-24">Item Code</th>
                                            <th className="px-6 py-4 text-left">Product Name & Specification</th>
                                            <th className="px-6 py-4 text-right w-24">Rate</th>
                                            <th className="px-6 py-4 text-center w-20">Qty</th>
                                            <th className="px-6 py-4 text-right w-24">Disc</th>
                                            <th className="px-6 py-4 text-right w-24">Pretax Amt.</th>
                                            <th className="px-6 py-4 text-right w-24 text-blue-600">GST</th>
                                            <th className="px-6 py-4 text-right w-28 text-emerald-600">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {inv.order?.items?.map((item, itemIdx) => {
                                            const qty = Number(item.quantity || 0);
                                            const unitPrice = Number(item.unitPrice || 0);
                                            const discount = Number(item.discount || 0);
                                            const taxRate = Number(item.salesTaxPercent || item.salesTax || 0);

                                            const totalPrice = unitPrice * qty;
                                            const pretaxAmount = totalPrice - discount;
                                            const taxAmount = Number(item.taxAmount) || (pretaxAmount * (taxRate / 100));
                                            const rowTotal = pretaxAmount + taxAmount;

                                            return (
                                                <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                                                    <td className="px-6 py-4 text-center text-gray-400 font-mono">{itemIdx + 1}</td>
                                                    <td className="px-6 py-4 font-mono text-gray-600 whitespace-nowrap">{item.product?.sku}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="font-bold text-gray-900 uppercase">{item.product?.name}</div>
                                                        <div className="text-gray-500 italic text-[11px] mt-1">
                                                            {item.specification || item.product?.specification || ""}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-medium text-gray-600 whitespace-nowrap">{currency} {unitPrice.toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-blue-600 whitespace-nowrap">{qty.toFixed(0)}</td>
                                                    <td className="px-6 py-4 text-right font-medium text-rose-500 whitespace-nowrap">{currency} {discount.toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-gray-800 whitespace-nowrap">{currency} {pretaxAmount.toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-right font-medium text-blue-600 whitespace-nowrap">{currency} {taxAmount.toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-right font-black text-emerald-700 bg-emerald-50/30 whitespace-nowrap">{currency} {rowTotal.toFixed(2)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Card Footer Summary */}
                            <div className="bg-gray-50/30 p-4 md:p-6 flex flex-wrap justify-end items-end gap-4 md:gap-6 border-t border-gray-100">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">Invoice Payable</span>
                                    <span className="text-base md:text-lg font-black text-gray-900">{currency} {parseFloat(inv.totalPayable).toFixed(2)}</span>
                                </div>
                                <div className="flex flex-col items-end border-l-0 md:border-l pl-0 md:pl-6 border-gray-200">
                                    <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-tighter">Amount Paid</span>
                                    <span className="text-base md:text-lg font-black text-emerald-600">{currency} {inv.paidAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex flex-col items-end border-l-0 md:border-l pl-0 md:pl-6 border-gray-200">
                                    <span className="text-[10px] uppercase font-bold text-rose-600 tracking-tighter">Remaining Due</span>
                                    <span className="text-lg md:text-xl font-black text-rose-600 underline decoration-double decoration-rose-500/30 underline-offset-4">{currency} {inv.remainingBalance.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Final Bottom Total (Floating style) */}
            <div className="fixed bottom-8 right-8 z-40 hidden lg:block">
                <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-widest">Grand Combined Due</p>
                    <h2 className="text-3xl font-black text-white">{currency} {totalDue.toFixed(2)}</h2>
                </div>
            </div>
        </div>
    );
}
