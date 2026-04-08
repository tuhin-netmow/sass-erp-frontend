/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useMemo, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { PayslipDocument } from "@/app/components/payroll/PayslipDocument";
import { useSearchParams } from "react-router";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";

import { DataTable } from "@/app/components/dashboard/DataTable";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/components/ui/select";
import { useGetAllPayrollRunsQuery } from "@/store/features/app/payroll/payrollApiService";
import { useGetAllStaffsQuery } from "@/store/features/app/staffs/staffApiService";
import { useAppSelector } from "@/store/store";
import type { PayrollRun, PayrollItem } from "@/shared/types";

interface Deduction {
    name: string;
    amount: number;
}

interface PayslipRow {
    id: number;
    empCode: string;
    employee: string;
    basic: number;
    allowances: number;
    deductions: number;
    manualDeductions: number;
    gross: number;
    net: number;
    paid: number;
    status: string;
    email?: string;
    runId: number;
    staffId: number;
}

interface PrintData {
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
    bankDetails: { bankName: string; accountNumber: string };
    dateGenerated: string;
}

export default function Payslips() {
    const [searchParams] = useSearchParams();
    const monthParam = searchParams.get("month");
    const staffIdParam = searchParams.get("staffId");

    const [selectedRunId, setSelectedRunId] = useState<number | null>(null);

    const { data: payrollRunsData, isLoading: isPayrollLoading, refetch } = useGetAllPayrollRunsQuery();
    const { data: staffData } = useGetAllStaffsQuery({ limit: 1000 }); // Fetch all staff
    const currency = useAppSelector((state) => state.currency.value);

    const payrollRuns = useMemo(() => payrollRunsData?.data || [], [payrollRunsData?.data]);
    const staffs = useMemo(() => staffData?.data || [], [staffData?.data]);

    // --- Compute Available Payroll Runs (Months) ---
    const payrollRunOptions = useMemo(() => {
        return payrollRuns.map((run: PayrollRun) => ({
            value: run.id,
            label: `${new Date(run.month + "-01").toLocaleString("default", { month: "long", year: "numeric" })} - ${run.status.toUpperCase()}`,
            month: run.month,
        }));
    }, [payrollRuns]);

    // Set default selected run or select based on URL parameter
    useEffect(() => {
        if (payrollRunOptions.length === 0) return;

        // If month parameter exists, find and select that run
        if (monthParam) {
            const matchingRun = payrollRunOptions.find((run: any) => run.month === monthParam);
            if (matchingRun) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setSelectedRunId(matchingRun.value);
                return;
            }
        }

        // Otherwise, select the first run if none is selected
        if (selectedRunId === null) {
            setSelectedRunId(payrollRunOptions[0].value);
        }
    }, [payrollRunOptions, selectedRunId, monthParam]);

    // --- Prepare Payslip Data ---
    const payslipData = useMemo(() => {
        if (selectedRunId === null) return [];

        const selectedRun = payrollRuns.find((run: PayrollRun) => run.id === selectedRunId);
        if (!selectedRun || !selectedRun.items) return [];

        let items = selectedRun.items;

        // Filter by staffId if provided in URL params
        if (staffIdParam) {
            items = items.filter((item: PayrollItem) => Number(item.staffId) === Number(staffIdParam));
        }

        return items.map((item: PayrollItem) => {
            const staff = staffs.find((s) => Number(s.id) === Number(item.staffId));

            // Parse JSON fields safely (handle both array and stringified JSON)
            let deductions: Deduction[] = [];
            try {
                deductions = Array.isArray(item.deductions)
                    ? item.deductions
                    : typeof item.deductions === 'string'
                        ? JSON.parse(item.deductions)
                        : [];
            } catch (e) {
                console.error("Error parsing payroll item json", e);
            }

            // Calculate Specific Deductions
            // "Standard" deductions are those NOT labeled "Manual Adjustment"
            const standardDeductionsVal = deductions
                .filter((d: Deduction) => !d.name?.includes("Manual Adjustment"))
                .reduce((sum: number, d: Deduction) => sum + Number(d.amount || 0), 0);

            // "Manual/Leave" deductions are those labeled "Manual Adjustment"
            const manualDeductionsVal = deductions
                .filter((d: Deduction) => d.name?.includes("Manual Adjustment"))
                .reduce((sum: number, d: Deduction) => sum + Number(d.amount || 0), 0);

            return {
                id: item.id,
                empCode: staff?.publicId || item.staff?.publicId || `ID-${item.staffId}`,
                employee: staff ? `${staff.firstName} ${staff.lastName}` : "Unknown Staff",
                basic: Number(item.basicSalary || 0),
                allowances: Number(item.totalAllowances || 0),
                deductions: standardDeductionsVal,
                manualDeductions: manualDeductionsVal,
                gross: Number(item.grossSalary || item.grossPay || 0),
                net: Number(item.netPay || 0),
                paid: Number(item.paidAmount || 0),
                status: item.paymentStatus || selectedRun.status,
                email: staff?.email,
                runId: selectedRun.id,
                staffId: item.staffId,
            };
        });
    }, [payrollRuns, staffs, selectedRunId, staffIdParam]);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // --- PDF State ---
    const [payslipToPrint, setPayslipToPrint] = useState<PrintData | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef, // Use contentRef instead of content for newer versions
        documentTitle: `Payslip-${payslipToPrint?.employeeId || 'Unknown'}`,
    });

    // Trigger print when payslipToPrint updates
    useEffect(() => {
        if (payslipToPrint && printRef.current) {
            handlePrint();
        }
    }, [payslipToPrint]); // Removed handlePrint from dep array to avoid infinite loop if reference unstable

    const handlePDFClick = (row: PayslipRow) => {
        // Map row data to print format
        const printData = {
            id: row.staffId,
            companyName: "Consultant Company",
            companyAddress: "123 Business Rd, Tech City, KL",
            employeeName: row.employee,
            employeeId: row.empCode,
            designation: "Employee",
            department: "General",
            month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
            paymentState: row.status,
            basicSalary: row.basic,
            allowances: [{ name: "Allowances", amount: row.allowances }],
            deductions: [
                { name: "Standard Deductions", amount: row.deductions },
                { name: "Attendance/Other Deductions", amount: row.manualDeductions }
            ].filter(d => d.amount > 0),
            grossSalary: row.gross,
            netPay: row.net,
            paidAmount: row.paid,
            bankDetails: { bankName: "Maybank", accountNumber: "1234567890" },
            dateGenerated: new Date().toLocaleDateString()
        };
        setPayslipToPrint(printData);
    };

    // --- Payment Modal State ---
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedPayslip, setSelectedPayslip] = useState<PayslipRow | null>(null);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");

    const handlePayClick = (row: PayslipRow) => {
        setSelectedPayslip(row);
        setPaymentAmount((row.net - row.paid).toString()); // Default to remaining
        setPaymentModalOpen(true);
    };

    const { token } = useAppSelector((state) => state.auth);

    const handleConfirmPayment = async () => {
        if (!selectedPayslip || !paymentAmount) return;

        console.log("Using Token:", token); // Debug

        try {
            const res = await fetch(`http://localhost:5000/api/payroll/items/${selectedPayslip.id}/pay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: Number(paymentAmount),
                    payment_date: paymentDate,
                    payment_method: paymentMethod,
                    reference: 'Manual Pay',
                    remarks: 'Paid via Dashboard'
                })
            });
            const data = await res.json();
            if (data.status) {
                // Ideally refetch or update locally
                setPaymentModalOpen(false);
                // window.location.reload(); // Removed
                refetch();
            } else {
                alert(data.message || 'Payment failed');
            }
        } catch (e) {
            console.error(e);
            alert('Payment error');
        }
    };

    const columns = [
        { accessorKey: "empCode", header: "Emp Code" },
        { accessorKey: "employee", header: "Employee" },
        {
            accessorKey: "basic",
            header: "Basic Salary",
            cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => formatCurrency(Number(row.getValue("basic"))),
        },
        {
            accessorKey: "allowances",
            header: "Allowances",
            cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => formatCurrency(Number(row.getValue("allowances"))),
        },
        {
            accessorKey: "deductions",
            header: "Deductions",
            cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => formatCurrency(Number(row.getValue("deductions"))),
        },
        {
            accessorKey: "gross",
            header: "Gross Salary",
            cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => formatCurrency(Number(row.getValue("gross"))),
        },
        {
            accessorKey: "manualDeductions",
            header: "Leave/Adhoc Deduction",
            cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => (
                <span className="text-rose-600 font-medium">{formatCurrency(Number(row.getValue("manualDeductions")))}</span>
            ),
        },
        {
            accessorKey: "net",
            header: `Payable (${currency})`,
            cell: ({ row }: { row: { getValue: (key: string) => unknown; original: PayslipRow } }) => {
                const net = Number(row.getValue("net"));
                const paid = row.original.paid;
                return (
                    <div className="flex flex-col">
                        <span className="font-bold text-emerald-600">{formatCurrency(net)}</span>
                        {paid > 0 && (
                            <span className="text-xs text-gray-500">Paid: {formatCurrency(paid)}</span>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => {
                const value = String(row.getValue("status"));
                let color = "bg-gray-100 text-gray-700";
                if (value === "paid") color = "bg-green-100 text-green-700";
                if (value === "partial") color = "bg-blue-100 text-blue-700";
                if (value === "pending" || value === "unpaid") color = "bg-yellow-100 text-yellow-700";

                return (
                    <span className={`px-2 py-1 text-xs rounded-full uppercase ${color}`}>{value}</span>
                );
            },
        },
        {
            accessorKey: "payslip",
            header: "Actions",
            cell: ({ row }: { row: { original: PayslipRow } }) => (
                <div className="flex gap-2 items-center">
                    {(row.original.status !== 'paid') && (
                        <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs"
                            onClick={() => handlePayClick(row.original)}
                        >
                            Pay Now
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => handlePDFClick(row.original)}
                    >
                        PDF
                    </Button>
                    {/* Email Button */}
                </div>
            ),
        }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 py-6">
            {/* Hidden Printable Component */}
            <div style={{ display: "none" }}>
                <PayslipDocument ref={printRef} data={payslipToPrint || {
                    id: 0,
                    companyName: '',
                    companyAddress: '',
                    employeeName: '',
                    employeeId: '',
                    designation: '',
                    department: '',
                    month: '',
                    paymentState: '',
                    basicSalary: 0,
                    allowances: [],
                    deductions: [],
                    grossSalary: 0,
                    netPay: 0,
                    paidAmount: 0,
                    bankDetails: { bankName: '', accountNumber: '' },
                    dateGenerated: ''
                }} />
            </div>

            <Card className="rounded-sm border border-gray-300 dark:border-gray-700 shadow-sm">
                <CardHeader className="flex justify-between items-center border-b-1 dark:border-gray-700 py-3 gap-0">
                    <CardTitle className="text-lg font-semibold">Payslips</CardTitle>
                    <Button className="bg-gray-800 hover:bg-gray-900 text-white rounded-sm">
                        Bulk Download PDF
                    </Button>
                </CardHeader>

                <CardContent className="pt-4 pb-6 space-y-4">
                    {/* Selectors and Filters (Existing Code) */}
                    <div className="max-w-xs">
                        <Select value={selectedRunId?.toString() || ""} onValueChange={(val) => setSelectedRunId(Number(val))} disabled={payrollRunOptions.length === 0}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={payrollRunOptions.length === 0 ? "No Payroll Data" : "Select Payroll Run"} />
                            </SelectTrigger>
                            <SelectContent>
                                {payrollRunOptions.map((run: any) => (
                                    <SelectItem key={run.value} value={run.value.toString()}>
                                        {run.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Filter Indicators (Existing Code) */}
                    {staffIdParam && payslipData.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                            {/* ... */}
                        </div>
                    )}

                    {/* Table */}
                    {(!staffIdParam || payslipData.length > 0) && (
                        <DataTable columns={columns} data={payslipData} pageSize={10} isFetching={isPayrollLoading} />
                    )}

                    <p className="text-xs text-gray-400 mt-2">
                        Payslips are generated from payroll records.
                    </p>
                </CardContent>
            </Card>

            {/* Payment Modal */}
            {paymentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4 text-slate-800">Record Payment</h3>

                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3 mb-6">
                            <div className="flex justify-between text-sm items-center border-b border-slate-200 pb-2">
                                <span className="text-slate-500 font-medium">Employee</span>
                                <span className="font-semibold text-slate-800">{selectedPayslip?.employee}</span>
                            </div>
                            <div className="flex justify-between text-sm items-center">
                                <span className="text-slate-500">Net Payable</span>
                                <span className="font-bold text-slate-900">RM {formatCurrency(selectedPayslip?.net || 0)}</span>
                            </div>
                            <div className="flex justify-between text-sm items-center">
                                <span className="text-slate-500">Already Paid</span>
                                <span className="font-bold text-emerald-600">RM {formatCurrency(selectedPayslip?.paid || 0)}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Amount</label>
                                <input
                                    type="number"
                                    className="w-full border rounded p-2"
                                    value={paymentAmount}
                                    onChange={e => setPaymentAmount(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date</label>
                                <input
                                    type="date"
                                    className="w-full border rounded p-2"
                                    value={paymentDate}
                                    onChange={e => setPaymentDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Method</label>
                                <select
                                    className="w-full border rounded p-2"
                                    value={paymentMethod}
                                    onChange={e => setPaymentMethod(e.target.value)}
                                >
                                    <option>Bank Transfer</option>
                                    <option>Cash</option>
                                    <option>Cheque</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleConfirmPayment} className="bg-green-600 hover:bg-green-700 text-white">Confirm Payment</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
