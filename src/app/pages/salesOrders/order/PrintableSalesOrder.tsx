import { useAppSelector } from "@/store/store";
import { format } from "date-fns";
import type { Customer } from "@/shared/types/app/customers";
import type { SalesOrder } from "@/shared/types/app/salesOrder.types";
import type { Settings } from "@/shared/types/common/entities.types";

interface Props {
    order: SalesOrder | undefined;
    to: Customer | undefined;
    from: Settings | undefined; // Settings usually contains company info
}

export default function PrintableSalesOrder({ order, to, from }: Props) {
    const currency = useAppSelector((state) => state.currency.value) || "RM";
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-";
        try {
            return format(new Date(dateStr), "dd/MM/yyyy");
        } catch (e) {
            return dateStr?.split("T")[0] || "-";
        }
    };

    // Calculations
    const subtotal = Number(order?.totalAmount || 0);
    const discount = Number(order?.discountAmount || 0);
    const gstAmount = Number(order?.taxAmount || 0);
    // Total logic verification: if totalAmount is gross, we might need adjustments
    // Usually API provides total_payable_amount for final
    const total = order?.totalPayableAmount
        ? Number(order.totalPayableAmount).toFixed(2)
        : (subtotal - discount + gstAmount).toFixed(2);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-0 sm:p-6 print:p-0 font-sans text-[#333]">
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
          .text-sm { font-size: 11px !important; }
          .text-xs { font-size: 11px !important; }
          .details-text, .table-text { 
            font-size: 11px !important; 
            line-height: 1.2 !important; 
          }
          .company-name {
            font-size: 18px !important;
            line-height: 1.2 !important;
          }
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
      `}</style>

            <div id="invoice" className="invoice-box print:border-0 print:p-0">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-2 mt-2 text-[13px]">
                        <h1 className="font-bold uppercase company-name">{from?.companyName || "F&Z Global Trade (M) Sdn Bhd"}</h1>
                        <p className="leading-tight max-w-[300px]">
                            {from?.address || "45, Jalan Industri USJ 1/10, TMN Perindustrian USJ 1, Subang Jaya"}
                        </p>
                        <p>T: {from?.phone || "0162759780"}{from?.email && `, E: ${from.email}`}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <div className="mb-1">
                            {from?.logoUrl ? (
                                <img src={from.logoUrl} alt="Logo" className="h-14 object-contain" />
                            ) : (
                                <div className="w-12 h-12 rounded-full border-2 border-[#4CAF50] flex items-center justify-center text-[#4CAF50] font-bold text-lg overflow-hidden">
                                    F&Z
                                </div>
                            )}
                        </div>
                        <h2 className="font-bold text-gray-800 mb-1 uppercase details-text">Sales Order</h2>
                        <div className="details-text space-y-1">
                            <p><strong>Date:</strong> {formatDate(order?.orderDate || "")}</p>
                            <p><strong>Order No.:</strong> {order?.orderNumber}</p>
                            <p><strong>Status:</strong> <span className="uppercase">{order?.status}</span></p>
                        </div>
                    </div>
                </div>

                {/* Recipient Section */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="border border-gray-300">
                        <div className="bg-gray-100 px-3 py-1 font-bold details-text border-b border-gray-300">Bill To</div>
                        <div className="p-3 details-text min-h-[80px]">
                            <p className="font-bold">{to?.name}</p>
                            <p className="whitespace-pre-line">{to?.address}</p>
                            {to?.phone && <p>T: {to.phone}</p>}
                            {to?.email && <p>E: {to.email}</p>}
                        </div>
                    </div>
                    <div className="border border-gray-300">
                        <div className="bg-gray-100 px-3 py-1 font-bold details-text border-b border-gray-300">Ship To</div>
                        <div className="p-3 details-text min-h-[80px]">
                            <p className="font-bold">{to?.name}</p>
                            <p className="whitespace-pre-line">{to?.address}</p>
                            {to?.phone && <p>T: {to.phone}</p>}
                            {to?.email && <p>E: {to.email}</p>}
                        </div>
                    </div>
                </div>

                {/* Info Bar */}
                <div className="w-full mb-6 text-xs table-border border-collapse">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-center font-bold">
                                <th className="w-1/4 border border-gray-300 p-1">Sales Rep.</th>
                                <th className="w-1/4 border border-gray-300 p-1">Shipping Method</th>
                                <th className="w-1/4 border border-gray-300 p-1">Delivery Date</th>
                                <th className="w-1/4 border border-gray-300 p-1">Due Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="text-center">
                                <td className="border border-gray-300 p-1">{order?.creator?.name || "-"}</td>
                                <td className="border border-gray-300 p-1">-</td>
                                <td className="border border-gray-300 p-1">{order?.deliveryDate ? formatDate(String(order.deliveryDate)) : "-"}</td>
                                <td className="border border-gray-300 p-1">{formatDate((order?.dueDate || "")as string)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Main Items Table */}
                <div className="w-full mb-6">
                    <table className="w-full table-text border-collapse">
                        <thead className="bg-gray-100 font-bold">
                            <tr>
                                <th className="border border-gray-300 p-2 text-center w-10">No</th>
                                <th className="border border-gray-300 p-2 text-left w-20">Item Code</th>
                                <th className="border border-gray-300 p-2 text-left">Item Name & Specification</th>
                                <th className="border border-gray-300 p-2 text-right w-16">Rate</th>
                                <th className="border border-gray-300 p-2 text-center w-12">Qty</th>
                                <th className="border border-gray-300 p-2 text-right w-16">Disc</th>
                                <th className="border border-gray-300 p-2 text-right w-20">Pretax Amt.</th>
                                <th className="border border-gray-300 p-2 text-right w-16">Tax</th>
                                <th className="border border-gray-300 p-2 text-right w-20">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order?.items?.map((item, index) => {
                                // Ensure number types
                                const qty = Number(item.quantity || 0);
                                const unitPrice = Number(item.unitPrice || item.unit_price || 0);
                                const discount = Number(item.discount || 0);
                                const taxPercent = Number(item.salesTaxPercent || item.sales_tax_percent || item.salesTax || 0);
                                const pretax = (unitPrice * qty) - discount;
                                const tax = Number(item.taxAmount) || (pretax * (taxPercent / 100));
                                return (
                                    <tr key={item._id || item.id} className="align-top">
                                        <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                                        <td className="border border-gray-300 p-2">{item.product?.sku}</td>
                                        <td className="border border-gray-300 p-2">
                                            <div className="font-bold uppercase">{item.product?.name}</div>
                                            <div className="italic text-gray-500 mt-1">
                                                {item.specification || item.product?.specification || ""}
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 p-2 text-right">{unitPrice.toFixed(2)}</td>
                                        <td className="border border-gray-300 p-2 text-center">{qty.toFixed(2)}</td>
                                        <td className="border border-gray-300 p-2 text-right">{discount.toFixed(2)}</td>
                                        <td className="border border-gray-300 p-2 text-right">{pretax.toFixed(2)}</td>
                                        <td className="border border-gray-300 p-2 text-right">{tax.toFixed(2)}</td>
                                        <td className="border border-gray-300 p-2 text-right font-bold">{(pretax + tax).toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                            {/* Grand Total Row */}
                            <tr className="bg-gray-50 font-bold">
                                <td colSpan={8} className="border border-gray-300 p-2 text-center uppercase tracking-wider">Grand Total</td>
                                <td className="border border-gray-300 p-2 text-right">{total}</td>
                            </tr>
                            {/* Fill rows */}
                            {[...Array(Math.max(0, 5 - (order?.items?.length || 0)))].map((_, i) => (
                                <tr key={`empty-${i}`} className="h-8">
                                    <td className="border border-gray-300 p-2"></td>
                                    <td className="border border-gray-300 p-2"></td>
                                    <td className="border border-gray-300 p-2"></td>
                                    <td className="border border-gray-300 p-2"></td>
                                    <td className="border border-gray-300 p-2"></td>
                                    <td className="border border-gray-300 p-2"></td>
                                    <td className="border border-gray-300 p-2"></td>
                                    <td className="border border-gray-300 p-2"></td>
                                    <td className="border border-gray-300 p-2 text-right"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Summary Section */}
                <div className="flex justify-between items-start">
                    <div className="w-3/5 border border-gray-300 p-2 rounded-sm details-text">
                        <p className="font-bold mb-1">Note:</p>
                        <p className="mb-2 whitespace-pre-wrap">{order?.notes || "No notes."}</p>
                        <p>All Cheques should be crossed and made payable to</p>
                        <p className="font-bold uppercase">{from?.companyName || "F&Z GLOBAL TRADE (M) SDN BHD"}</p>
                        <p>Account Number: <span className="font-bold">564230815279</span> (Maybank Berhad)</p>
                    </div>

                    <div className="w-1/3">
                        <table className="w-full details-text font-bold border-collapse">
                            <tbody>
                                <tr className="border border-gray-300">
                                    <td className="p-1 px-4 text-left border-r border-gray-300">DISCOUNT</td>
                                    <td className="p-1 px-4 text-right">- {currency} {discount.toFixed(2)}</td>
                                </tr>
                                <tr className="border border-gray-300">
                                    <td className="p-1 px-4 text-left border-r border-gray-300">SUBTOTAL</td>
                                    <td className="p-1 px-4 text-right">{currency} {(subtotal - discount).toFixed(2)}</td>
                                </tr>
                                <tr className="border border-gray-300">
                                    <td className="p-1 px-4 text-left border-r border-gray-300">TAX</td>
                                    <td className="p-1 px-4 text-right">{currency} {gstAmount.toFixed(2)}</td>
                                </tr>
                                <tr className="border border-gray-300 bg-gray-50 text-sm">
                                    <td className="p-1 px-4 text-left border-r border-gray-300">TOTAL</td>
                                    <td className="p-1 px-4 text-right underline underline-offset-4 decoration-double">{currency} {total}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Print Button Wrapper */}
                <div className="mt-8 flex justify-end print:hidden">
                    <button
                        onClick={handlePrint}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition-colors"
                    >
                        Download / Print Order
                    </button>
                </div>
            </div>
        </div>
    );
}
