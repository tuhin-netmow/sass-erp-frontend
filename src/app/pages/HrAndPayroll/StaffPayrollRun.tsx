import { useParams, useNavigate } from "react-router";
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import {
    useGetStaffByIdQuery,
} from "@/store/features/app/staffs/staffApiService";
import { useGetStaffAttendanceByIdQuery } from "@/store/features/app/attendence/attendenceApiService";
import { useGetAllPayrollRunsQuery } from "@/store/features/app/payroll/payrollApiService";
import { toast } from "sonner";
import {
    Wallet,
    Clock,
    ArrowLeft,
    Building2
} from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import type { Staff } from "@/shared/types/common/entities.types";

// Types for payroll and attendance data
type PayrollItem = {
    staffId: string;
    netPay: number;
    payments?: Array<{ paymentDate: string; paymentMethod: string; amount: number; reference?: string }>;
    createdAt: string;
};

type LocalPayrollRun = {
    items?: PayrollItem[];
    [key: string]: unknown;
};

type AttendanceRecord = {
    date: string;
    status: string;
    checkIn?: string;
    checkOut?: string;
    workingHours?: string;
};

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export default function StaffPayrollRun() {

    const { staffId } = useParams();
    const navigate = useNavigate();
    const { token } = useSelector((state: RootState) => state.auth);

    // Set default month to current month and year
    const currentDate = new Date();
    const currentMonthName = MONTH_NAMES[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear().toString();

    const [attendanceMonth, setAttendanceMonth] = useState(currentMonthName);
    const [attendanceYear, setAttendanceYear] = useState(currentYear);
    const [customPayrollAmount, setCustomPayrollAmount] = useState("");
    const [isProcessingPayroll, setIsProcessingPayroll] = useState(false);

    // Fetch Staff Data
    const { data: staffResponse, isLoading: isLoadingStaff } = useGetStaffByIdQuery(staffId as string);
    const viewingAttendanceStaff = staffResponse?.data;

    // Fetch Attendance Data
    const monthString = useMemo(() => {
        const monthNumber = (MONTH_NAMES.indexOf(attendanceMonth) + 1).toString().padStart(2, '0');
        return `${attendanceYear}-${monthNumber}`;
    }, [attendanceMonth, attendanceYear]);

    const { data: attendanceData, isLoading: isLoadingAttendance } = useGetStaffAttendanceByIdQuery(
        {
            staffId: staffId as string,
            limit: 31,
            page: 1,
            month: monthString
        },
        { skip: !staffId }
    );

    const { data: payrollRunsResponse } = useGetAllPayrollRunsQuery({
        month: monthString
    });

    const attendanceRecords = useMemo(() => attendanceData?.data || [], [attendanceData?.data]);

    const existingPayrollItem = useMemo(() => {
        if (!payrollRunsResponse?.data || !viewingAttendanceStaff) return null;
        for (const run of (payrollRunsResponse.data as unknown as LocalPayrollRun[])) {
            const item = run.items?.find((i: PayrollItem) => i.staffId === viewingAttendanceStaff._id);
            if (item) return item;
        }
        return null;
    }, [payrollRunsResponse, viewingAttendanceStaff]);

    useEffect(() => {
        if (existingPayrollItem) {
            setCustomPayrollAmount(String(existingPayrollItem.netPay || ""));
        } else {
            setCustomPayrollAmount("");
        }
    }, [existingPayrollItem]);

    const attendanceStats = useMemo(() => {
        let present = 0;
        let absent = 0;
        let late = 0;
        let leaves = 0;

        attendanceRecords.forEach((record: AttendanceRecord) => {
            const status = record.status?.toLowerCase() || "";
            if (status === "present") present++;
            else if (status === "absent") absent++;
            else if (status === "late") late++;
            else if (status.includes("leave")) leaves++;
        });

        return { present, absent, late, leaves };
    }, [attendanceRecords]);

    const handleProcessPayroll = async () => {
        if (!viewingAttendanceStaff) return;

        setIsProcessingPayroll(true);
        try {
            const monthNumber = (MONTH_NAMES.indexOf(attendanceMonth) + 1).toString().padStart(2, '0');
            const mString = `${attendanceYear}-${monthNumber}`;

            const response = await fetch('http://localhost:5000/api/payroll/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    month: mString,
                    staff_ids: [Number(viewingAttendanceStaff._id)],
                    custom_amounts: customPayrollAmount ? { [viewingAttendanceStaff._id]: Number(customPayrollAmount) } : undefined
                })
            });

            const data = await response.json();

            if (data.status) {
                toast.success(`Payroll processed successfully for ${attendanceMonth} ${attendanceYear}!`);
            } else {
                console.error("Payroll Process Error:", data);
                if (data.message && data.message.includes("Received:")) {
                    toast.error(`Error: ${data.message}`);
                } else {
                    toast.error(data.message || 'Failed to process payroll');
                }
            }
        } catch (error) {
            console.error('Error processing payroll:', error);
            toast.error('An error occurred while processing payroll');
        } finally {
            setIsProcessingPayroll(false);
        }
    };

    const handleViewPayslip = () => {
        if (!viewingAttendanceStaff) return;
        const monthNumber = (MONTH_NAMES.indexOf(attendanceMonth) + 1).toString().padStart(2, '0');
        const mString = `${attendanceYear}-${monthNumber}`;
        navigate(`/dashboard/payroll/payslips?month=${mString}&staffId=${viewingAttendanceStaff._id}`);
    };

    if (isLoadingStaff) return <div className="p-8 text-center text-gray-500">Loading staff data...</div>;
    if (!viewingAttendanceStaff) return <div className="p-8 text-center text-rose-500">Employee not found.</div>;

    // Handle payroll structure - it may be included in API response but not in Staff type
    type StaffWithPayroll = Staff & { payrollStructure?: { basicSalary?: number; salary?: number; allowances?: Array<{ name?: string; amount: number }>; deductions?: Array<{ name?: string; amount: number }> } };
    const staffWithPayroll = viewingAttendanceStaff as StaffWithPayroll;
    const payrollStructure = staffWithPayroll.payrollStructure;
    const basicSalary = Number(payrollStructure?.basicSalary || payrollStructure?.salary || viewingAttendanceStaff.salary) || 0;
    const allowances: Array<{ name?: string; amount: number }> = payrollStructure?.allowances || [];
    const deductions: Array<{ name?: string; amount: number }> = payrollStructure?.deductions || [];
    const totalAllowances = allowances.reduce((sum: number, i) => sum + Number(i.amount), 0);
    const totalDeductions = deductions.reduce((sum: number, i) => sum + Number(i.amount), 0);
    const grossSalary = basicSalary + totalAllowances;
    const netSalary = grossSalary - totalDeductions;

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Payroll Run: {viewingAttendanceStaff.firstName} {viewingAttendanceStaff.lastName}</h1>

                        <p className="text-slate-500 text-sm">Employee ID: {viewingAttendanceStaff.employeeId || `#${viewingAttendanceStaff._id}`} | Department: {typeof viewingAttendanceStaff.department === 'object' ? viewingAttendanceStaff.department?.name : (viewingAttendanceStaff.department || 'N/A')}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Select value={attendanceMonth} onValueChange={setAttendanceMonth}>
                        <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {MONTH_NAMES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select value={attendanceYear} onValueChange={setAttendanceYear}>
                        <SelectTrigger className="w-[110px] bg-slate-50 border-slate-200">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 5 }, (_, i) => (currentDate.getFullYear() - 2 + i).toString()).map(y => (
                                <SelectItem key={y} value={y}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Attendance Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Attendance Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="bg-emerald-50 border-emerald-100 shadow-sm border-b-4 border-b-emerald-500">
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <span className="text-3xl font-bold text-emerald-700">{attendanceStats.present}</span>
                                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mt-1">Present</span>
                            </CardContent>
                        </Card>
                        <Card className="bg-rose-50 border-rose-100 shadow-sm border-b-4 border-b-rose-500">
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <span className="text-3xl font-bold text-rose-700">{attendanceStats.absent}</span>
                                <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider mt-1">Absent</span>
                            </CardContent>
                        </Card>
                        <Card className="bg-amber-50 border-amber-100 shadow-sm border-b-4 border-b-amber-500">
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <span className="text-3xl font-bold text-amber-700">{attendanceStats.late}</span>
                                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider mt-1">Late</span>
                            </CardContent>
                        </Card>
                        <Card className="bg-sky-50 border-sky-100 shadow-sm border-b-4 border-b-sky-500">
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <span className="text-3xl font-bold text-sky-700">{attendanceStats.leaves}</span>
                                <span className="text-xs font-semibold text-sky-600 uppercase tracking-wider mt-1">Leaves</span>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payroll Activity Logs Table */}
                    <Card className="border-slate-200 overflow-hidden mb-6">
                        <CardHeader className="bg-slate-50/50 border-b-1 border-slate-100 py-3 gap-0">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-emerald-500" />
                                Payroll History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-white border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-slate-600">Date</th>
                                            <th className="px-6 py-4 font-semibold text-slate-600">Activity</th>
                                            <th className="px-6 py-4 font-semibold text-slate-600">Amount</th>
                                            <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                                            <th className="px-6 py-4 font-semibold text-slate-600">Reference</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {existingPayrollItem ? (
                                            <>
                                                {/* Payments */}
                                                {existingPayrollItem.payments?.map((pay, idx: number) => (
                                                    <tr key={`pay-${idx}`} className="hover:bg-slate-50/50">
                                                        <td className="px-6 py-4 font-medium text-slate-700">
                                                            {new Date(pay.paymentDate).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-slate-700">Payment</span>
                                                                <span className="text-xs text-slate-400">{pay.paymentMethod}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 font-bold text-emerald-600">
                                                            RM {Number(pay.amount).toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge className="bg-emerald-100 text-emerald-700">Paid</Badge>
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-500 text-xs">
                                                            {pay.reference || '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {/* Payslip Creation */}
                                                <tr className="hover:bg-slate-50/50 bg-slate-50/30">
                                                    <td className="px-6 py-4 font-medium text-slate-700">
                                                        {new Date(existingPayrollItem.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-semibold text-slate-700">Payslip Generated</span>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-indigo-600">
                                                        RM {Number(existingPayrollItem.netPay || 0).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge className="bg-blue-100 text-blue-700">Generated</Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500 text-xs">
                                                        System
                                                    </td>
                                                </tr>
                                            </>
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="text-center py-8 text-slate-400 italic">
                                                    No payroll activity for this month yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Attendance Logs Table */}
                    <Card className="border-slate-200 overflow-hidden gap-4">
                        <CardHeader className="bg-slate-50/50 border-b-1 border-slate-100 py-3 gap-0">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-500" />
                                Attendance Logs
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoadingAttendance ? (
                                <div className="text-center py-20 text-slate-400">Fetching records...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-white border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold text-slate-600">Date</th>
                                                <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                                                <th className="px-6 py-4 font-semibold text-slate-600">Check In</th>
                                                <th className="px-6 py-4 font-semibold text-slate-600">Check Out</th>
                                                <th className="px-6 py-4 font-semibold text-slate-600">Work Hours</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {attendanceRecords.length > 0 ? (
                                                attendanceRecords.map((record: AttendanceRecord, idx: number) => (
                                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-medium">{new Date(record.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                                        <td className="px-6 py-4">
                                                            <Badge className={`
                                                                ${record.status === 'Present' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : ''}
                                                                ${record.status === 'Absent' ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : ''}
                                                                ${record.status === 'Late' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : ''}
                                                                ${record.status?.includes('Leave') ? 'bg-sky-100 text-sky-700 hover:bg-sky-200' : ''}
                                                            `}>
                                                                {record.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-600">{record.checkIn || "---"}</td>
                                                        <td className="px-6 py-4 text-slate-600">{record.checkOut || "---"}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded font-mono text-xs">
                                                                {record.workingHours || "0h 0m"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="text-center py-12 text-slate-400 italic">No attendance records found for this period.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Payroll Context */}
                <div className="space-y-6">
                    {/* Salary Structure Reference */}
                    <Card className="bg-white border-slate-200 shadow-sm overflow-hidden gap-2">
                        <CardHeader className="py-4 px-5 border-b-1 border-slate-100 bg-slate-50/50 gap-0">
                            <CardTitle className="font-semibold text-slate-700 flex items-center gap-2 text-sm">
                                <Building2 className="w-4 h-4 text-indigo-500" />
                                Salary Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                            <div className="space-y-5">
                                <div>
                                    <h5 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                        Allowances
                                    </h5>
                                    <ul className="space-y-2">
                                        <li className="flex justify-between text-sm">
                                            <span className="text-slate-500">Basic Salary</span>
                                            <span className="font-semibold text-slate-800">RM {basicSalary.toLocaleString()}</span>
                                        </li>
                                        {allowances.map((item, idx: number) => (
                                            <li key={idx} className="flex justify-between text-sm">
                                                <span className="text-slate-500">{item.name || "Allowance"}</span>
                                                <span className="font-semibold text-slate-800">RM {Number(item.amount).toLocaleString()}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="pt-2">
                                    <h5 className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                                        Deductions
                                    </h5>
                                    <ul className="space-y-2">
                                        {deductions.map((item, idx: number) => (
                                            <li key={idx} className="flex justify-between text-sm">
                                                <span className="text-slate-500">{item.name || "Deduction"}</span>
                                                <span className="font-semibold text-slate-800 text-rose-600">- RM {Number(item.amount).toLocaleString()}</span>
                                            </li>
                                        ))}
                                        {deductions.length === 0 && (
                                            <li className="text-xs text-slate-400 italic">No deductions active</li>
                                        )}
                                    </ul>
                                </div>

                                <div className="pt-4 border-t border-slate-100 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Gross Amount</span>
                                        <span className="font-bold text-slate-700">RM {grossSalary.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-base">
                                        <span className="font-bold text-slate-800">Net Basic</span>
                                        <span className="font-black text-indigo-600">RM {netSalary.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payable for Selected Month Card */}
                    <Card className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600 text-white shadow-xl border-none">
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium mb-1">
                                        Estimated Payable for {attendanceMonth} {attendanceYear}
                                    </p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-lg opacity-70">RM</span>
                                        <h3 className="text-4xl font-extrabold tracking-tight">
                                            {netSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3">
                                        <Badge className={`border-none ${existingPayrollItem ? 'bg-emerald-500/30 text-emerald-50' : 'bg-white/20 text-white'}`}>
                                            Status: {existingPayrollItem ? 'Processed' : 'Pending'}
                                        </Badge>
                                        <span className="text-[10px] text-white/60 uppercase font-bold tracking-tighter">
                                            (Auto-calculated)
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] text-white/70 font-bold uppercase tracking-widest pl-1 block">
                                        Override Net Amount
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-indigo-900 font-bold text-sm">RM</span>
                                        <Input
                                            type="number"
                                            placeholder={existingPayrollItem ? "" : "0.00"}
                                            className="pl-10 h-10 bg-white/100 border-none text-indigo-900 font-bold placeholder:text-indigo-200 focus-visible:ring-indigo-300 disabled:bg-white/50 disabled:opacity-70 disabled:cursor-not-allowed"
                                            value={customPayrollAmount}
                                            onChange={(e) => setCustomPayrollAmount(e.target.value)}
                                            disabled={!!existingPayrollItem}
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 space-y-2">
                                    <Button
                                        className={`w-full h-11 font-bold rounded-xl transition-all ${existingPayrollItem ? 'bg-emerald-500 hover:bg-emerald-500' : 'bg-white text-indigo-700 hover:bg-slate-100 shadow-lg shadow-indigo-900/20'}`}
                                        onClick={handleProcessPayroll}
                                        disabled={isProcessingPayroll || !!existingPayrollItem}
                                    >
                                        {isProcessingPayroll ? (
                                            <span className="flex items-center gap-2 italic ring-offset-2">Processing...</span>
                                        ) : existingPayrollItem ? (
                                            <span className="flex items-center gap-2">Run Finalized</span>
                                        ) : (
                                            <span className="flex items-center gap-2"><Wallet className="w-4 h-4" /> Process Payroll</span>
                                        )}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full h-11 border-white/30 text-white hover:bg-white/10 bg-transparent font-medium rounded-xl"
                                        onClick={handleViewPayslip}
                                    >
                                        View Digital Slip
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
