import { forwardRef } from 'react';
import { Badge } from "@/shared/components/ui/badge";

export interface PayslipData {
    id: number;
    companyName: string;
    companyAddress: string;
    employeeName: string;
    employeeId: string;
    designation: string;
    department: string;
    month: string;
    paymentState: string;
    basicSalary: number;
    allowances: { name: string; amount: number }[];
    deductions: { name: string; amount: number }[];
    grossSalary: number;
    netPay: number;
    paidAmount: number;
    bankDetails: {
        bankName: string;
        accountNumber: string;
    };
    dateGenerated: string;
}

export const PayslipDocument = forwardRef<HTMLDivElement, { data: PayslipData }>(({ data }, ref) => {
    return (
        <div ref={ref} className="p-8 max-w-[210mm] mx-auto bg-white text-slate-800 print:p-0 print:max-w-none">
            {/* Header */}
            <div className="border-b-2 border-slate-800 pb-6 mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-wide">{data.companyName}</h1>
                    <p className="text-sm text-slate-500 mt-1 whitespace-pre-line">{data.companyAddress}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-semibold text-slate-700">PAYSLIP</h2>
                    <p className="text-slate-500 font-medium mt-1">{data.month}</p>
                    <Badge className="mt-2 text-md px-3 py-1 bg-slate-100 text-slate-800 border-slate-300">
                        {data.paymentState}
                    </Badge>
                </div>
            </div>

            {/* Employee Details */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Employee Details</p>
                    <h3 className="text-lg font-bold">{data.employeeName}</h3>
                    <p className="text-sm text-slate-600">ID: <span className="font-mono font-medium">{data.employeeId}</span></p>
                    <p className="text-sm text-slate-600">{data.designation}</p>
                    <p className="text-sm text-slate-600">{data.department}</p>
                </div>
                <div className="space-y-1 text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bank Details</p>
                    <p className="text-sm text-slate-600">{data.bankDetails.bankName || 'N/A'}</p>
                    <p className="text-sm font-mono text-slate-600">{data.bankDetails.accountNumber || '---'}</p>
                    <div className="pt-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Generated On</p>
                        <p className="text-sm text-slate-600">{data.dateGenerated}</p>
                    </div>
                </div>
            </div>

            {/* Earnings & Deductions Table */}
            <div className="mb-8 border border-slate-200 rounded-sm overflow-hidden">
                <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-200">
                    <div className="p-3 font-bold text-center border-r border-slate-200 text-slate-700">EARNINGS</div>
                    <div className="p-3 font-bold text-center text-slate-700">DEDUCTIONS</div>
                </div>
                <div className="grid grid-cols-2">
                    {/* Left: Earnings */}
                    <div className="border-r border-slate-200 p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Basic Salary</span>
                            <span className="font-semibold">RM {data.basicSalary.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                        {data.allowances.map((c, i) => (
                            <div key={i} className="flex justify-between text-sm">
                                <span className="text-slate-600">{c.name}</span>
                                <span className="font-semibold">RM {c.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                        ))}
                    </div>

                    {/* Right: Deductions */}
                    <div className="p-4 space-y-2">
                        {data.deductions.map((d, i) => (
                            <div key={i} className="flex justify-between text-sm">
                                <span className="text-slate-600">{d.name}</span>
                                <span className="font-semibold text-rose-600">RM {d.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                        ))}
                        {data.deductions.length === 0 && <p className="text-sm text-slate-400 italic text-center py-2">No Deductions</p>}
                    </div>
                </div>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mb-12">
                <div className="w-1/2 bg-slate-50 p-6 rounded-sm border border-slate-200 space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600 font-medium">Gross Earnings</span>
                        <span className="font-bold">RM {data.grossSalary.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm border-b border-slate-200 pb-4">
                        <span className="text-slate-600 font-medium">Total Deductions</span>
                        <span className="font-bold text-rose-600">- RM {data.deductions.reduce((s, i) => s + i.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-xl items-center pt-2">
                        <span className="font-bold text-slate-800">NET PAYABLE</span>
                        <span className="font-black text-indigo-700">
                            RM {data.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500 pt-2">
                        <span>Paid to Date</span>
                        <span>RM {data.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-slate-400 pt-8 border-t border-slate-100">
                <p>This is a computer-generated document. No signature is required.</p>
                <p className="mt-1">{data.companyName} Confidential</p>
            </div>
        </div>
    );
});

PayslipDocument.displayName = 'PayslipDocument';
