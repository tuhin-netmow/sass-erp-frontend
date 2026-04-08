/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppSelector } from "@/store/store";
import type { RootState } from "@/store/store";
import type { PurchaseInvoice } from "@/shared/types/app/PurchaseInvoice.types";
import type { PurchaseReturn } from "@/shared/types/app/purchaseOrder.types";
import type { Supplier } from "@/shared/types/app/supplier.types";

import { formatDateStandard } from "@/shared/utils/dateUtils";
import type { Settings } from "@/shared";

interface Props {
    invoice: (PurchaseInvoice & { purchaseReturn?: PurchaseReturn }) | undefined;
    from: Supplier | undefined;
    to: Settings | undefined;
}

export default function PrintablePurchaseReturnInvoice({ invoice, from, to }: Props) {
    const currency = useAppSelector((state: RootState) => state.currency.value) || "RM";

    const purchaseReturn = invoice?.purchaseReturn;

    // Calculations
    const subtotal = Number(purchaseReturn?.totalAmount || 0);
    const discount = Number(purchaseReturn?.discountAmount || 0);
    const taxAmount = Number(purchaseReturn?.taxAmount || 0);
    const totalVal = Number(purchaseReturn?.totalPayableAmount || (subtotal - discount + taxAmount));
    const total = totalVal.toFixed(2);

    const payments = invoice?.payments || [];
    const calculatedTotalPaid = payments.reduce((acc: number, p: { amount?: number }) => acc + Number(p.amount || 0), 0);

    const paid = Number(purchaseReturn?.totalRefundedAmount || calculatedTotalPaid || 0);
    const balance = Number(purchaseReturn?.dueRefundAmount ?? (totalVal - paid));

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="sm:p-6 print:p-0 font-sans text-[#333]">
            <style>{`
        @media print {
          @page {
            margin: 5mm;
            size: A4;
          }
          body {
            -webkit-print-color-adjust: exact;
            font-size: 11px !important;
          }
          .invoice-box {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          h1 { font-size: 11px !important; }
          h2 { font-size: 11px !important; }
          table { font-size: 11px !important; }
          .details-text, .table-text { 
            font-size: 11px !important; 
            line-height: 1.2 !important; 
          }
          .company-name {
            font-size: 18px !important;
            line-height: 1.2 !important;
          }
          .p-3 { padding: 4px !important; }
          .p-2 { padding: 3px !important; }
          .mb-6 { margin-bottom: 8px !important; }
          .mb-4 { margin-bottom: 4px !important; }
        }
        .invoice-box {
          max-width: 850px;
          margin: auto;
          background: white;
        }
        
        /* Standardizing screen sizes */
        .company-name { font-size: 18px !important; line-height: 1.2; }
        .details-text { font-size: 12px !important; line-height: 1.4; }
        .table-text { font-size: 12px !important; }
        
        .table-border th, .table-border td {
          border: 1px solid #ddd;
          padding: 8px;
        }
        .bg-grey {
          background-color: #f2f2f2 !important;
        }
        .invoice-box { max-width: 850px; margin: auto; background: white; }
        .table-border th, .table-border td { border: 1px solid #ddd; padding: 8px; }
      `}</style>

            <div id="invoice" className="invoice-box print:border-0 print:p-0">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-2 mt-2 details-text text-left">
                        <h1 className="font-bold uppercase company-name">{to?.companyName || "F&Z Global Trade (M) Sdn Bhd"}</h1>
                        <p className="leading-tight max-w-[400px]">
                            {to?.address || "45, Jalan Industri USJ 1/10, TMN Perindustrian USJ 1, Subang Jaya"}
                        </p>
                        <p>T: {to?.phone || "0162759780"}{to?.email && `, E: ${to.email}`}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <div className="mb-1">
                            {to?.logoUrl ? (
                                <img src={to.logoUrl} alt="Logo" className="h-14 object-contain" />
                            ) : (
                                <div className="w-12 h-12 rounded-full border-2 border-orange-500 flex items-center justify-center text-orange-500 font-bold text-lg overflow-hidden">
                                    F&Z
                                </div>
                            )}
                        </div>
                        <h2 className="font-bold text-gray-800 mb-1 uppercase details-text">Purchase Return Invoice</h2>
                        <div className="details-text space-y-1">
                            <p><strong>Date:</strong> {invoice?.invoiceDate ? formatDateStandard(invoice.invoiceDate) : "-"}</p>
                            <p><strong>Invoice No.:</strong> {invoice?.invoiceNumber}</p>
                        </div>
                    </div>
                </div>

                {/* Recipient Section */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="border border-gray-300">
                        <div className="bg-gray-100 px-3 py-1 font-bold details-text border-b border-gray-300 text-orange-700">Bill From (Supplier)</div>
                        <div className="p-3 details-text min-h-[80px]">
                            <p className="font-bold">{from?.name}</p>
                            <p className="whitespace-pre-line">{from?.address}</p>
                            {from?.phone && <p>T: {from.phone}</p>}
                            {from?.email && <p>E: {from.email}</p>}
                        </div>
                    </div>
                    <div className="border border-gray-300">
                        <div className="bg-gray-100 px-3 py-1 font-bold details-text border-b border-gray-300">Bill To</div>
                        <div className="p-3 details-text min-h-[80px]">
                            <p className="font-bold">{to?.companyName}</p>
                            <p className="whitespace-pre-line">{to?.address}</p>
                            {to?.phone && <p>T: {to.phone}</p>}
                            {to?.email && <p>E: {to.email}</p>}
                        </div>
                    </div>
                </div>

                {/* Info Bar */}
                <div className="w-full mb-6">
                    <table className="w-full table-text border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-center font-bold">
                                <th className="w-1/4 border border-gray-300 p-1">Created By</th>
                                <th className="w-1/4 border border-gray-300 p-1">Return Ref.</th>
                                <th className="w-1/4 border border-gray-300 p-1">Original Date</th>
                                <th className="w-1/4 border border-gray-300 p-1">Due Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="text-center">
                                <td className="border border-gray-300 p-1">{invoice?.creator?.name || "-"}</td>
                                <td className="border border-gray-300 p-1">{(purchaseReturn as any)?.purchaseOrder?.poNumber || purchaseReturn?.poNumber || "-"}</td>
                                <td className="border border-gray-300 p-1">{purchaseReturn?.returnDate ? formatDateStandard(purchaseReturn.returnDate) : purchaseReturn?.orderDate ? formatDateStandard(purchaseReturn.orderDate) : "-"}</td>
                                <td className="border border-gray-300 p-1">{invoice?.dueDate ? formatDateStandard(invoice.dueDate) : "-"}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Main Items Table */}
                <div className="w-full mb-6">
                    <table className="w-full table-text border-collapse">
                        <thead className="bg-orange-50 font-bold">
                            <tr>
                                <th className="border border-gray-300 p-2 text-center w-12 text-orange-800">No</th>
                                <th className="border border-gray-300 p-2 text-left w-24 text-orange-800">Item Code</th>
                                <th className="border border-gray-300 p-2 text-left text-orange-800">Item Name</th>
                                <th className="border border-gray-300 p-2 text-center w-16 text-orange-800">Qty</th>
                                <th className="border border-gray-300 p-2 text-right w-20 text-orange-800">Price</th>
                                <th className="border border-gray-300 p-2 text-right w-24 text-orange-800">Discount</th>
                                <th className="border border-gray-300 p-2 text-right w-20 text-orange-800">Tax</th>
                                <th className="border border-gray-300 p-2 text-right w-24 text-orange-800">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchaseReturn?.items?.map((item: any, index: number) => {
                                const itemTaxAmount = Number(item.taxAmount || 0);
                                const itemTotal = Number(item.lineTotal || 0) + itemTaxAmount;

                                return (
                                    <tr key={item._id} className="align-top">
                                        <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                                        <td className="border border-gray-300 p-2">{item.product?.sku}</td>
                                        <td className="border border-gray-300 p-2">
                                            <div className="font-bold uppercase">{item.product?.name}</div>
                                            {(item.specification || item.product?.specification) && (
                                                <div className="text-[10px] text-gray-500 italic mt-1">
                                                    {item.specification || item.product?.specification}
                                                </div>
                                            )}
                                        </td>
                                        <td className="border border-gray-300 p-2 text-center">{Number(item.quantity).toFixed(2)}</td>
                                        <td className="border border-gray-300 p-2 text-right">{Number(item.unitCost).toFixed(2)}</td>
                                        <td className="border border-gray-300 p-2 text-right">{Number(item.discount || 0).toFixed(2)}</td>
                                        <td className="border border-gray-300 p-2 text-right text-gray-600 font-medium">{itemTaxAmount.toFixed(2)}</td>
                                        <td className="border border-gray-300 p-2 text-right font-bold">{itemTotal.toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                            <tr className="bg-blue-50 font-bold">
                                <td colSpan={7} className="border border-gray-300 p-1 sm:p-2 text-center uppercase tracking-wider text-blue-800">Total Refundable</td>
                                <td className="border border-gray-300 p-1 sm:p-2 text-right text-blue-800">{currency} {total}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Refund History Table - Only if payments exist */}
                {payments && payments.length > 0 && (
                    <div className="w-full mb-6 avoid-break">
                        <div className="font-bold text-gray-800 mb-2 uppercase details-text border-b border-gray-200 pb-1">Refund History</div>
                        <table className="w-full table-text border-collapse">
                            <thead className="bg-gray-100 font-bold">
                                <tr>
                                    <th className="border border-gray-300 p-2 text-center w-24">Date</th>
                                    <th className="border border-gray-300 p-2 text-left w-32">Reference No.</th>
                                    <th className="border border-gray-300 p-2 text-center w-32">Method</th>
                                    <th className="border border-gray-300 p-2 text-left">Notes</th>
                                    <th className="border border-gray-300 p-2 text-right w-32">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment: { paymentDate?: string; referenceNumber?: string; paymentMethod?: string; notes?: string; amount?: number }, index: number) => (
                                    <tr key={index}>
                                        <td className="border border-gray-300 p-2 text-center">
                                            {payment.paymentDate ? formatDateStandard(payment.paymentDate) : "-"}
                                        </td>
                                        <td className="border border-gray-300 p-2">{payment.referenceNumber || "-"}</td>
                                        <td className="border border-gray-300 p-2 text-center capitalize">
                                            {payment.paymentMethod?.replace(/_/g, " ")}
                                        </td>
                                        <td className="border border-gray-300 p-2 italic text-gray-600">
                                            {payment.notes || "-"}
                                        </td>
                                        <td className="border border-gray-300 p-2 text-right font-semibold">
                                            {currency} {Number(payment.amount || 0).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-green-50 font-bold">
                                    <td colSpan={4} className="border border-gray-300 p-2 text-center uppercase text-green-800">Total Refunded</td>
                                    <td className="border border-gray-300 p-2 text-right text-green-700">{currency} {paid.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start gap-2">
                        <div className="w-3/5 border border-gray-300 p-2 rounded-sm details-text">
                            <p className="font-bold mb-1">Return Note:</p>
                            <p className="text-gray-600 italic">This is an acknowledgement of goods returned to the supplier.</p>
                        </div>

                        <div className="w-2/5 font-bold details-text uppercase">
                            <table className="w-full border-collapse">
                                <tbody>
                                    <tr className="border border-gray-300 text-red-600">
                                        <td className="p-1 px-4 text-left border-r border-gray-300">DISCOUNT</td>
                                        <td className="p-1 px-4 text-right">- {currency} {discount.toFixed(2)}</td>
                                    </tr>
                                    <tr className="border border-gray-300">
                                        <td className="p-1 px-4 text-left border-r border-gray-300">SUBTOTAL</td>
                                        <td className="p-1 px-4 text-right">{currency} {subtotal.toFixed(2)}</td>
                                    </tr>
                                    <tr className="border border-gray-300">
                                        <td className="p-1 px-4 text-left border-r border-gray-300">TAX</td>
                                        <td className="p-1 px-4 text-right">{currency} {taxAmount.toFixed(2)}</td>
                                    </tr>
                                    <tr className="border border-gray-300 bg-orange-50 text-sm text-orange-800">
                                        <td className="p-1 px-4 text-left border-r border-gray-300 uppercase">Total Refundable</td>
                                        <td className="p-1 px-4 text-right underline underline-offset-4 decoration-double">{currency} {total}</td>
                                    </tr>
                                    <tr className="border border-gray-300">
                                        <td className="p-1 px-4 text-left border-r border-gray-300 uppercase">Total Refunded</td>
                                        <td className="p-1 px-4 text-right text-green-600">{currency} {paid.toFixed(2)}</td>
                                    </tr>
                                    <tr className={`border border-gray-300 ${balance > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                        <td className="p-1 px-4 text-left border-r border-gray-300 uppercase font-black">Balance Due</td>
                                        <td className="p-1 px-4 text-right font-black">{currency} {balance.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="mt-6 sm:mt-8 flex justify-center sm:justify-end print:hidden">
                    <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 sm:px-6 rounded shadow transition-colors text-sm sm:text-base w-full sm:w-auto">Download / Print Return Invoice</button>
                </div>
            </div>
        </div>
    );
}
