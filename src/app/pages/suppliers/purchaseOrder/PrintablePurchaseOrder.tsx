/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppSelector } from "@/store/store";
import type { RootState } from "@/store/store";
import type { PurchaseOrder } from "@/shared/types/app/purchaseOrder.types";
import type { Settings } from "@/shared/types";

interface Props {
    purchase: PurchaseOrder;
    settings: Settings | undefined;
}

export default function PrintablePurchaseOrder({ purchase, settings }: Props) {
    const currency = useAppSelector((state: RootState) => state.currency.value) || "RM";
    const formatDate = (dateStr: string) => dateStr?.split("T")[0];

    // Calculations
    const subtotal = Number(purchase.totalAmount || 0);
    const discount = Number(purchase.discountAmount || 0);
    const taxAmount = Number(purchase.taxAmount || 0);
    const total = Number(purchase.totalPayableAmount).toFixed(2);

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
      `}</style>

            <div id="invoice" className="invoice-box print:border-0 print:p-0">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-2 mt-2 details-text">
                        <h1 className="font-bold uppercase company-name">{settings?.companyName || "F&Z Global Trade (M) Sdn Bhd"}</h1>
                        <p className="leading-tight max-w-[400px]">
                            {settings?.address || "45, Jalan Industri USJ 1/10, TMN Perindustrian USJ 1, Subang Jaya"}
                        </p>
                        <p>T: {settings?.phone || "0162759780"}{settings?.email && `, E: ${settings.email}`}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <div className="mb-1">
                            {settings?.logoUrl ? (
                                <img src={settings.logoUrl} alt="Logo" className="h-14 object-contain" />
                            ) : (
                                <div className="w-12 h-12 rounded-full border-2 border-[#4CAF50] flex items-center justify-center text-[#4CAF50] font-bold text-lg overflow-hidden">
                                    F&Z
                                </div>
                            )}
                        </div>
                        <h2 className="font-bold text-gray-800 mb-1 uppercase details-text">Purchase Order</h2>
                        <div className="details-text space-y-1">
                            <p><strong>Date:</strong> {formatDate(purchase.orderDate)}</p>
                            <p><strong>PO No.:</strong> {purchase.poNumber}</p>
                            <p><strong>Status:</strong> <span className="uppercase">{purchase.status}</span></p>
                        </div>
                    </div>
                </div>

                {/* Recipient Section */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {/* Vendor (Supplier) - Bill To for PO? No, for PO we are buying FROM vendor. */}
                    {/* PrintablePurchaseInvoice had "Bill From" as Supplier and "Ship To" as Us. 
                 For a PO, we are sending it TO a Vendor. 
                 So "Vendor" / "To" is Supplier.
                 "From" is Us. */}

                    <div className="border border-gray-300">
                        <div className="bg-gray-100 px-3 py-1 font-bold details-text border-b border-gray-300">Vendor</div>
                        <div className="p-3 details-text min-h-[80px]">
                            <p className="font-bold">{purchase.supplier.name}</p>
                            {purchase.supplier.address && <p className="whitespace-pre-line">{purchase.supplier.address}</p>}
                            {purchase.supplier.phone && <p>T: {purchase.supplier.phone}</p>}
                            {purchase.supplier.email && <p>E: {purchase.supplier.email}</p>}
                        </div>
                    </div>
                    <div className="border border-gray-300">
                        <div className="bg-gray-100 px-3 py-1 font-bold details-text border-b border-gray-300">Ship To</div>
                        <div className="p-3 details-text min-h-[80px]">
                            <p className="font-bold">{settings?.companyName}</p>
                            <p className="whitespace-pre-line">{settings?.address}</p>
                            {settings?.phone && <p>T: {settings.phone}</p>}
                            {settings?.email && <p>E: {settings.email}</p>}
                        </div>
                    </div>
                </div>

                {/* Info Bar */}
                <div className="w-full mb-6 text-xs table-border border-collapse">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-center font-bold">
                                <th className="w-1/4 border border-gray-300 p-1">Purchaser</th>
                                <th className="w-1/4 border border-gray-300 p-1">Ship Mode</th>
                                <th className="w-1/4 border border-gray-300 p-1">Delivery Date</th>
                                <th className="w-1/4 border border-gray-300 p-1">Payment Terms</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="text-center">
                                <td className="border border-gray-300 p-1">{purchase.creator?.name || "-"}</td>
                                <td className="border border-gray-300 p-1">-</td>
                                <td className="border border-gray-300 p-1">{purchase.expectedDeliveryDate ? formatDate(purchase.expectedDeliveryDate) : "-"}</td>
                                <td className="border border-gray-300 p-1">-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Main Items Table */}
                <div className="w-full mb-6">
                    <table className="w-full table-text border-collapse">
                        <thead className="bg-gray-100 font-bold">
                            <tr>
                                <th className="border border-gray-300 p-2 text-left w-24">SKU</th>
                                <th className="border border-gray-300 p-2 text-left">Item Name & Specification</th>
                                <th className="border border-gray-300 p-2 text-right w-20">Price</th>
                                <th className="border border-gray-300 p-2 text-center w-16">Qty</th>
                                <th className="border border-gray-300 p-2 text-right w-20">Discount</th>
                                <th className="border border-gray-300 p-2 text-right w-24">Pretax Amt</th>
                                <th className="border border-gray-300 p-2 text-right w-20">Tax</th>
                                <th className="border border-gray-300 p-2 text-right w-24">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                           
                            {purchase.items?.map((item: any) => {
                                const price = Number(item.unitCost || 0);
                                const qty = Number(item.quantity || 0);
                                const discount = Number(item.discount || 0);
                                // In purchase order item logic: line_total usually is result
                                // But let's recalculate based on standard invoice display logic
                                const pretaxAmt = (price * qty) - discount;
                                const tax = Number(item.taxAmount || 0);
                                const itemTotal = pretaxAmt + tax;

                                return (
                                    <tr key={item.id} className="align-top">
                                        <td className="border border-gray-300 p-2">{item.product?.sku}</td>
                                        <td className="border border-gray-300 p-2">
                                            <div className="font-bold">{item.product?.name}</div>
                                            {item.product?.specification && (
                                                <div className="text-xs text-gray-600 mt-0.5">{item.product.specification}</div>
                                            )}
                                            {item.product?.description && (
                                                <div className="text-xs text-gray-500 mt-0.5 italic">{item.product.description}</div>
                                            )}
                                        </td>
                                        <td className="border border-gray-300 p-2 text-right">{price.toFixed(2)}</td>
                                        <td className="border border-gray-300 p-2 text-center">{qty}</td>
                                        <td className="border border-gray-300 p-2 text-right">{discount.toFixed(2)}</td>
                                        <td className="border border-gray-300 p-2 text-right">{pretaxAmt.toFixed(2)}</td>
                                        <td className="border border-gray-300 p-2 text-right">{tax.toFixed(2)}</td>
                                        <td className="border border-gray-300 p-2 text-right font-bold">{itemTotal.toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                            {/* Grand Total Row inside Table */}
                            <tr className="bg-gray-50 font-bold">
                                <td colSpan={7} className="border border-gray-300 p-2 text-center uppercase tracking-wider">Grand Total</td>
                                <td className="border border-gray-300 p-2 text-right">{total}</td>
                            </tr>
                            {/* Fill remaining space if needed to match PDF height (optional) */}
                            {[...Array(Math.max(0, 5 - (purchase.items?.length || 0)))].map((_, i) => (
                                <tr key={`empty-${i}`} className="h-8">
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
                    {purchase.notes ? (
                        <div className="w-3/5 border border-gray-300 p-2 rounded-sm details-text">
                            <p className="font-bold mb-1">Notes:</p>
                            <p>{purchase.notes}</p>
                        </div>
                    ) : (
                        <div className="w-3/5"></div>
                    )}

                    <div className="w-1/3">
                        <table className="w-full details-text font-bold border-collapse">
                            <tbody>
                                <tr className="border border-gray-300">
                                    <td className="p-1 px-4 text-left border-r border-gray-300">SUBTOTAL</td>
                                    <td className="p-1 px-4 text-right">{currency} {subtotal.toFixed(2)}</td>
                                </tr>
                                <tr className="border border-gray-300">
                                    <td className="p-1 px-4 text-left border-r border-gray-300">DISCOUNT</td>
                                    <td className="p-1 px-4 text-right">- {currency} {discount.toFixed(2)}</td>
                                </tr>
                                <tr className="border border-gray-300">
                                    <td className="p-1 px-4 text-left border-r border-gray-300">TAX</td>
                                    <td className="p-1 px-4 text-right">{currency} {taxAmount.toFixed(2)}</td>
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
