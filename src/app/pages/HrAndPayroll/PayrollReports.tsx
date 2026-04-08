/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { useGetAllPayrollRunsQuery } from "@/store/features/app/payroll/payrollApiService";
import {
    Loader2,
    Download,
    TrendingUp,
    DollarSign,
    Users,
    Building2,
    PieChart as PieIcon,
    Calendar
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { DataTable } from "@/app/components/dashboard/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/components/ui/badge";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { toast } from "sonner";

export default function PayrollReports() {
    const [month, setMonth] = useState("January");
    const [year, setYear] = useState("2026");
    const [departmentFilter, setDepartmentFilter] = useState("all");
    const [search, setSearch] = useState("");

    // Fetch Payroll Run for the selected month
    const monthIndex = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].indexOf(month) + 1;
    const monthString = `${year}-${monthIndex.toString().padStart(2, '0')}`;

    const { data: payrollRunData, isLoading } = useGetAllPayrollRunsQuery({
        month: monthString
    });

    const payrollRun = payrollRunData?.data?.[0]; // Assuming one run per month
    const payrollItems = payrollRun?.items || [];

    // -------------------------
    //  AGGREGATION LOGIC
    // -------------------------
    const reportData = useMemo(() => {
        let totalBasic = 0;
        let totalAllowances = 0;
        let totalDeductions = 0;
        let totalNet = 0;
        let totalPaid = 0;
        let totalDue = 0;

        // Filter Data
        const filteredItems = payrollItems.filter(() => {
            // const matchesDept = departmentFilter === "all" || item.staff?.department?.name === departmentFilter; // If staff dept available in item
            // For now, assume simple search filter
            //const searchTerm = search.toLowerCase();
            // Ideally back-populate staff details into item
            //const fullName = `Staff #${item.staffId}`; // Placeholder if staff not joined
            // In real app, include Staff model in PayrollItem

            return true; // Simplified for now as we might lack deep staff inclusions in this specific endpoint without update
        });

        // Compute Stats
        filteredItems.forEach((item: any) => {
            const basic = Number(item.basic_salary) || 0;
            const allow = Number(item.total_allowances) || 0;
            const deduc = Number(item.total_deductions) || 0;
            const net = Number(item.net_pay) || 0;
            const paid = Number(item.paidAmount) || 0;

            totalBasic += basic;
            totalAllowances += allow;
            totalDeductions += deduc;
            totalNet += net;
            totalPaid += paid;
            totalDue += (net - paid);

            // Dept logic needs staff join. Skipping dept aggregation for this step unless available.
        });

        return {
            totalBasic,
            totalAllowances,
            totalDeductions,
            totalNet,
            totalPaid,
            totalDue,
            count: filteredItems.length,
            deptWise: [], // Placeholder
            filteredData: filteredItems
        };
    }, [payrollItems, search]);

    // Chart Data Config
    // const compositionData = [
    //     { name: 'Basic Salary', value: reportData.totalBasic },
    //     { name: 'Allowances', value: reportData.totalAllowances },
    //     { name: 'Deductions', value: reportData.totalDeductions }, // Deductions technically reduce cost, but for visualization of components
    // ];

    // const COLORS = ['#3b82f6', '#10b981', '#ef4444'];

    // Export CSV
    const handleExport = () => {
        const headers = ["Employee", "Basic Salary", "Allowances", "Deductions", "Net Pay", "Paid", "Due"];
        const rows = reportData.filteredData.map((item: any) => {
            const basic = Number(item.basic_salary) || 0;
            const allow = Number(item.total_allowances) || 0;
            const deduc = Number(item.total_deductions) || 0;
            const net = Number(item.net_pay) || 0;
            const paid = Number(item.paidAmount) || 0;

            // Should fetch staff name properly if possible
            const staffName = `Staff #${item.staffId}`;

            return [
                `"${staffName}"`,
                basic,
                allow,
                deduc,
                net,
                paid,
                (net - paid)
            ].join(",");
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `payroll_report_${month}_${year}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Report downloaded successfully");
    };

    // Table Columns
    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "staff_id",
            header: "Staff ID",
            cell: ({ row }) => <span className="font-mono text-xs text-gray-500">#{row.getValue("staff_id")}</span>
        },
        // In a real scenario, we'd want joined staff data. For now, we only have ID
        // {
        //     accessorKey: "first_name",
        //     header: "Employee",
        //     cell: ({ row }) => (
        //         <div>
        //             <div className="font-medium text-gray-900">{row.original.first_name}</div>
        //         </div>
        //     )
        // },
        {
            header: "Salary Breakdown",
            cell: ({ row }) => {
                const basic = Number(row.original.basic_salary) || 0;
                const allow = Number(row.original.total_allowances) || 0;
                const deduc = Number(row.original.total_deductions) || 0;
                return (
                    <div className="text-xs space-y-1">
                        <div className="flex justify-between w-[160px]">
                            <span className="text-gray-500">Basic:</span>
                            <span>{basic.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between w-[160px] text-green-600">
                            <span>Allowances:</span>
                            <span>+{allow.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between w-[160px] text-red-600">
                            <span>Deductions:</span>
                            <span>-{deduc.toLocaleString()}</span>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "net_pay",
            header: "Final Payable",
            cell: ({ row }) => <span className="font-bold text-gray-800">{Number(row.original.net_pay).toLocaleString()}</span>
        },
        {
            accessorKey: "paid_amount",
            header: "Paid",
            cell: ({ row }) => <span className="font-medium text-emerald-600">{Number(row.original.paidAmount).toLocaleString()}</span>
        },
        {
            id: "details",
            header: "Due",
            cell: ({ row }) => {
                const net = Number(row.original.net_pay) || 0;
                const paid = Number(row.original.paidAmount) || 0;
                const due = net - paid;
                return <span className={`font-medium ${due > 0 ? "text-rose-600" : "text-gray-400"}`}>{due.toLocaleString()}</span>
            }
        },
        {
            accessorKey: "payment_status",
            header: "Status",
            cell: ({ row }) => <Badge variant={row.original.payment_status === 'paid' ? 'default' : 'secondary'}>{row.original.payment_status}</Badge>
        }
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[500px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="w-full space-y-8">
            {/* Heading & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Payroll Analytics</h1>
                    <p className="text-gray-500 mt-1">Projected financial insights for {month} {year}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger className="w-[150px] bg-white">
                            <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Depts</SelectItem>
                            <SelectItem value="Management">Management</SelectItem>
                            <SelectItem value="Sales">Sales</SelectItem>
                            <SelectItem value="Technical">Technical</SelectItem>
                            <SelectItem value="HR">HR</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={month} onValueChange={setMonth}>
                        <SelectTrigger className="w-[130px] bg-white">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                                <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={year} onValueChange={setYear}>
                        <SelectTrigger className="w-[100px] bg-white">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2026">2026</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" onClick={handleExport} className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-none shadow-lg bg-gradient-to-br from-blue-600 to-blue-500 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8" />
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <DollarSign className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-blue-100 font-medium">Total Net Payable</span>
                        </div>
                        <h3 className="text-3xl font-bold">{reportData.totalNet.toLocaleString()}</h3>
                        <p className="text-sm text-blue-100 mt-2 opacity-80">Estimated Payroll Cost</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <Users className="w-5 h-5 text-emerald-600" />
                            </div>
                            <span className="text-gray-500 font-medium">Total Paid</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{reportData.totalPaid.toLocaleString()}</h3>
                        <p className="text-sm text-emerald-600 mt-2 font-medium">
                            {reportData.totalNet > 0 ? ((reportData.totalPaid / reportData.totalNet) * 100).toFixed(1) : 0}% of Total
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-orange-600" />
                            </div>
                            <span className="text-gray-500 font-medium">Pending Due</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">
                            {reportData.totalDue.toLocaleString()}
                        </h3>
                        <p className="text-sm text-gray-400 mt-2">Unpaid Balances</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Users className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="text-gray-500 font-medium">Staff Count</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{reportData.count}</h3>
                        <p className="text-sm text-gray-400 mt-2">Processed Employees</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Department Distribution */}
                <Card className="shadow-md border-gray-100 py-6">
                    <CardHeader >
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            Component Distribution
                        </CardTitle>
                        <CardDescription>Salary Structure Breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Basic', value: reportData.totalBasic },
                                { name: 'Allowances', value: reportData.totalAllowances },
                                { name: 'Deductions', value: reportData.totalDeductions },
                            ]} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    formatter={(value: number | string) => typeof value === 'number' ? value.toLocaleString() : value}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Payroll Composition */}
                <Card className="shadow-md border-gray-100 py-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieIcon className="w-5 h-5 text-emerald-600" />
                            Payment Status
                        </CardTitle>
                        <CardDescription>Paid vs Due Amount</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Paid Amount', value: reportData.totalPaid },
                                        { name: 'Pending Due', value: reportData.totalDue },
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell key="cell-paid" fill="#10b981" />
                                    <Cell key="cell-due" fill="#ef4444" />
                                </Pie>
                                <Tooltip formatter={(value: number | string) => typeof value === 'number' ? value.toLocaleString() : value} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Table */}
            <Card className="shadow-md border-gray-100 pt-6 pb-2">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Detailed Payroll Register</CardTitle>
                        <CardDescription>Employee-wise breakdown of current structure</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={reportData.filteredData}
                        isFetching={isLoading}
                        totalCount={reportData.filteredData.length}
                        pageSize={reportData.filteredData.length > 0 ? reportData.filteredData.length : 10}
                        pageIndex={0}
                        onSearch={setSearch}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
