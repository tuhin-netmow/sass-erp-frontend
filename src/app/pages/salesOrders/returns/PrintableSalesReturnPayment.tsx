/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppSelector } from "@/store/store";
import type { RootState } from "@/store/store";
import type { Settings } from "@/shared/types";

interface Props {
    payment: any | undefined;
    to: Settings | undefined;
}

export default function PrintableSalesReturnPayment({ payment, to }: Props) {
    const currency = useAppSelector((state: RootState) => state.currency.value) || "RM";
    const formatDate = (dateStr: string) => dateStr?.split("T")[0];

    const handlePrint = () => {
        window.print();
    };

    const customer = payment?.sales_return?.customer;

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

            <div id="payment-receipt" className="invoice-box print:border-0 print:p-0">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-2 mt-2 details-text">
                        <h1 className="font-bold uppercase company-name">{to?.companyName || ""}</h1>
                        <p className="leading-tight max-w-[400px]">
                            {to?.address || ""}
                        </p>
                        <p>T: {to?.phone || ""}{to?.email && `, E: ${to.email}`}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <div className="mb-1">
                            {to?.logoUrl ? (
                                <img src={to.logoUrl} alt="Logo" className="h-14 object-contain" />
                            ) : (
                                <div className="w-12 h-12 rounded-full border-2 border-[#4CAF50] flex items-center justify-center text-[#4CAF50] font-bold text-lg overflow-hidden">
                                    {to?.companyName?.substring(0, 3).toUpperCase() || "ERP"}
                                </div>
                            )}
                        </div>
                        <h2 className="font-bold text-gray-800 mb-1 uppercase details-text">Refund Voucher</h2>
                        <div className="details-text space-y-1">
                            <p><strong>Date:</strong> {formatDate(payment?.paymentDate || "")}</p>
                            <p><strong>Ref No.:</strong> RRFD-{payment?.id?.toString().padStart(6, "0")}</p>
                        </div>
                    </div>
                </div>

                {/* Recipient Section */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="border border-gray-300">
                        <div className="bg-gray-100 px-3 py-1 font-bold details-text border-b border-gray-300">Refund From (Company)</div>
                        <div className="p-3 details-text min-h-[80px]">
                            <p className="font-bold">{to?.companyName}</p>
                            <p className="whitespace-pre-line">{to?.address}</p>
                            {to?.phone && <p>T: {to.phone}</p>}
                            {to?.email && <p>E: {to.email}</p>}
                        </div>
                    </div>
                    <div className="border border-gray-300">
                        <div className="bg-gray-100 px-3 py-1 font-bold details-text border-b border-gray-300">Refund To (Customer)</div>
                        <div className="p-3 details-text min-h-[80px]">
                            <p className="font-bold">{customer?.name}</p>
                            <p className="whitespace-pre-line">{(customer as any)?.address}</p>
                            {customer?.phone && <p>T: {customer.phone}</p>}
                            {customer?.email && <p>E: {customer.email}</p>}
                        </div>
                    </div>
                </div>

                {/* Info Table */}
                <div className="w-full mb-6 text-sm">
                    <table className="w-full border-collapse table-border">
                        <thead>
                            <tr className="bg-gray-100 font-bold">
                                <th className="text-left">Description</th>
                                <th className="text-right w-32">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <div className="font-bold">Refund for Sales Return #{payment?.sales_return?.return_number || payment?.sales_return?.id}</div>
                                    {payment?.invoice && (
                                        <div className="text-xs text-gray-600 mt-1">Invoice Reference: {payment.invoice.invoice_number}</div>
                                    )}
                                    <div className="text-xs text-gray-600 mt-1">Payment Method: {payment?.paymentMethod?.replaceAll("_", " ").toUpperCase()}</div>
                                    {payment?.referenceNumber && (
                                        <div className="text-xs text-gray-600">Reference: {payment.referenceNumber}</div>
                                    )}
                                </td>
                                <td className="text-right font-bold">{currency} {Number(payment?.amount || 0).toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Amount in words / Summary */}
                <div className="flex justify-end items-start">
                    <div className="w-1/3">
                        <table className="w-full details-text font-bold border-collapse">
                            <tbody>
                                <tr className="border border-gray-300 bg-gray-50 text-sm">
                                    <td className="p-1 px-4 text-left border-r border-gray-300 uppercase">Total Refunded</td>
                                    <td className="p-1 px-4 text-right underline underline-offset-4 decoration-double">{currency} {Number(payment?.amount || 0).toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="mt-12 grid grid-cols-2 gap-8 details-text">
                    <div className="text-center">
                        <div className="border-b border-gray-400 h-10 w-48 mx-auto mb-1"></div>
                        <p>Company Authorization</p>
                    </div>
                    <div className="text-center">
                        <div className="border-b border-gray-400 h-10 w-48 mx-auto mb-1"></div>
                        <p>Customer Acknowledgement</p>
                    </div>
                </div>

                {/* Print Button Wrapper */}
                <div className="mt-12 flex justify-end print:hidden">
                    <button
                        onClick={handlePrint}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition-colors"
                    >
                        Download / Print Receipt
                    </button>
                </div>
            </div>
        </div>
    );
}
