/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGetSettingsInfoQuery } from "@/store/features/admin/settingsApiService";
import { useAppSelector } from "@/store/store";
import type { JournalEntry, JournalEntryDetail } from "@/store/features/app/accounting/accoutntingApiService";

interface Props {
    entry: JournalEntry | null;
}

export default function PrintableJournalEntry({ entry }: Props) {
    const { data: settingsData } = useGetSettingsInfoQuery();
    const settings = settingsData?.data;
    const currency = useAppSelector((state) => state.currency.value) || "RM";

    const handlePrint = () => {
        window.print();
    };

    const totalDebit = entry?.entries?.reduce((sum: number, e: JournalEntryDetail) => sum + Number(e.debit), 0) || 0;
    const totalCredit = entry?.entries?.reduce((sum: number, e: JournalEntryDetail) => sum + Number(e.credit), 0) || 0;

    if (!entry) return null;

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

            <div className="invoice-box print:border-0 print:p-0">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-2 mt-2 details-text text-left">
                        <h1 className="font-bold uppercase company-name text-left">{settings?.companyName || "BUSINESS NAME"}</h1>
                        <p className="leading-tight max-w-[400px] whitespace-pre-wrap text-left">
                            {settings?.address || "Company Address"}
                        </p>
                        <p className="text-left">T: {settings?.phone || "Phone Number"}{settings?.email && `, E: ${settings.email}`}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <div className="mb-1">
                            {settings?.logoUrl ? (
                                <img src={settings.logoUrl} alt="Logo" className="h-14 object-contain" />
                            ) : (
                                <div className="w-12 h-12 rounded-full border-2 border-[#4CAF50] flex items-center justify-center text-[#4CAF50] font-bold text-lg overflow-hidden">
                                    {settings?.companyName?.substring(0, 2).toUpperCase() || "ERP"}
                                </div>
                            )}
                        </div>
                        <h2 className="font-bold text-gray-800 mb-1 uppercase details-text">Journal Voucher</h2>
                        <div className="details-text space-y-1">
                            <p><strong>Date:</strong> {entry.date}</p>
                            <p><strong>Ref No.:</strong> {entry.publicId || `JV-${entry._id.toString().substring(0, 8).toUpperCase()}`}</p>
                        </div>
                    </div>
                </div>

                {/* Info Table */}
                <div className="w-full mb-4 border border-gray-300">
                    <div className="bg-gray-100 px-3 py-1 font-bold details-text border-b border-gray-300 uppercase text-left">General Information</div>
                    <div className="p-3 details-text grid grid-cols-2 gap-4 text-left">
                        <div>
                            <p><strong>Reference Type:</strong> {entry.referenceType || "General"}</p>
                            <p><strong>Reference ID:</strong> #{entry.referenceId || entry._id}</p>
                        </div>
                        <div>
                            <p><strong>Narration / Remarks:</strong></p>
                            <p className="italic text-gray-600">{entry.narration || "N/A"}</p>
                        </div>
                    </div>
                </div>

                {/* Transaction Details Table */}
                <div className="w-full mb-6 text-sm">
                    <table className="w-full border-collapse table-border">
                        <thead>
                            <tr className="bg-gray-100 font-bold uppercase table-text">
                                <th className="text-left">Code</th>
                                <th className="text-left">Account Name</th>
                                <th className="text-right w-32">Debit ({currency})</th>
                                <th className="text-right w-32">Credit ({currency})</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entry.entries?.map((item: JournalEntryDetail) => (
                                <tr key={item._id} className="table-text">
                                    <td className="text-left font-mono">{item.account?.code}</td>
                                    <td className="text-left font-bold">{item.account?.name}</td>
                                    <td className="text-right font-bold">
                                        {Number(item.debit) > 0 ? Number(item.debit).toFixed(2) : "-"}
                                    </td>
                                    <td className="text-right font-bold">
                                        {Number(item.credit) > 0 ? Number(item.credit).toFixed(2) : "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-50 font-bold table-text">
                                <td colSpan={2} className="text-right uppercase">Total</td>
                                <td className="text-right border-t-2 border-double border-gray-400">
                                    {totalDebit.toFixed(2)}
                                </td>
                                <td className="text-right border-t-2 border-double border-gray-400">
                                    {totalCredit.toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Signature Section */}
                <div className="mt-12 grid grid-cols-3 gap-8 details-text">
                    <div className="text-center text-left">
                        <div className="border-b border-gray-400 h-10 w-full mx-auto mb-1"></div>
                        <p className="font-bold">Prepared By</p>
                    </div>
                    <div className="text-center text-left">
                        <div className="border-b border-gray-400 h-10 w-full mx-auto mb-1"></div>
                        <p className="font-bold">Reviewed By</p>
                    </div>
                    <div className="text-center text-left">
                        <div className="border-b border-gray-400 h-10 w-full mx-auto mb-1"></div>
                        <p className="font-bold">Authorized By</p>
                    </div>
                </div>

                {/* Print Button Wrapper */}
                <div className="mt-12 flex justify-end print:hidden">
                    <button
                        onClick={handlePrint}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition-colors"
                    >
                        Download / Print Voucher
                    </button>
                </div>
            </div>
        </div>
    );
}
