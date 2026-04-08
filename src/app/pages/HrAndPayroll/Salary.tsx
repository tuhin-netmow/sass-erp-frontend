import { useParams, useNavigate } from "react-router";
import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card } from "@/shared/components/ui/card";
import { ArrowLeft, Wallet, Users, Trash, PlusCircle, Building2 } from "lucide-react";
import {
    useGetStaffByIdQuery,
    useUpdatePayrollStructureMutation,
    useGetPayrollStructureQuery,
} from "@/store/features/app/staffs/staffApiService";
import { toast } from "sonner";

export default function Salary() {
    const { staffId } = useParams();
    const navigate = useNavigate();

    // Fetch staff details
    const { data: staffDetails, isLoading: isLoadingStaff } = useGetStaffByIdQuery(staffId as string, {
        skip: !staffId,
    });

    // Fetch payroll structure
    const { data: payrollData } = useGetPayrollStructureQuery(staffId as string, {
        skip: !staffId,
    });

    const [updatePayrollStructure, { isLoading: isUpdating }] = useUpdatePayrollStructureMutation();

    // Track if form has been initialized
    const isInitialized = useRef(false);

    // Salary Form State
    const [salaryForm, setSalaryForm] = useState({
        basicSalary: 0,
        bankName: "",
        accountName: "",
        accountNumber: "",
        allowances: [] as { name: string; amount: number }[],
        deductions: [] as { name: string; amount: number }[],
    });

    // Derive initial form values from API data
    const initialFormData = useMemo(() => {
        if (payrollData?.data) {
            const payroll = payrollData.data;
            return {
                basicSalary: Number(payroll.basic_salary) || 0,
                bankName: payroll.bank_details?.bankName || "",
                accountName: payroll.bank_details?.accountName || "",
                accountNumber: payroll.bank_details?.accountNumber || "",
                allowances: payroll.allowances || [],
                deductions: payroll.deductions || [],
            };
        } else if (staffDetails?.data) {
            const staff = staffDetails.data;
            return {
                basicSalary: staff.basicSalary || staff.salary || 0,
                bankName: staff.bankDetails?.bankName || "",
                accountName: staff.bankDetails?.accountName || "",
                accountNumber: staff.bankDetails?.accountNumber || "",
                allowances: staff.allowances || [],
                deductions: staff.deductions || [],
            };
        }
        return null;
    }, [staffDetails, payrollData]);

    // Sync form with initial data when it changes (only once or when data source changes)
    useEffect(() => {
        if (initialFormData && !isInitialized.current) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSalaryForm(initialFormData);
            isInitialized.current = true;
        }
        // Reset initialized flag when staffId changes
        if (staffId) {
            isInitialized.current = false;
        }
    }, [initialFormData, staffId]);

    const addAllowance = () => {
        setSalaryForm(prev => ({
            ...prev,
            allowances: [...prev.allowances, { name: "", amount: 0 }]
        }));
    };

    const removeAllowance = (index: number) => {
        setSalaryForm(prev => ({
            ...prev,
            allowances: prev.allowances.filter((_, i) => i !== index)
        }));
    };

    const updateAllowance = (index: number, field: "name" | "amount", value: string | number) => {
        setSalaryForm(prev => {
            const newAllowances = [...prev.allowances];
            newAllowances[index] = { ...newAllowances[index], [field]: value };
            return { ...prev, allowances: newAllowances };
        });
    };

    const addDeduction = () => {
        setSalaryForm(prev => ({
            ...prev,
            deductions: [...prev.deductions, { name: "", amount: 0 }]
        }));
    };

    const removeDeduction = (index: number) => {
        setSalaryForm(prev => ({
            ...prev,
            deductions: prev.deductions.filter((_, i) => i !== index)
        }));
    };

    const updateDeduction = (index: number, field: "name" | "amount", value: string | number) => {
        setSalaryForm(prev => {
            const newDeductions = [...prev.deductions];
            newDeductions[index] = { ...newDeductions[index], [field]: value };
            return { ...prev, deductions: newDeductions };
        });
    };

    const saveSalaryDetails = async () => {
        if (!staffDetails?.data) return;
        try {
            const formattedAllowances = salaryForm.allowances.map(a => ({
                name: a.name,
                amount: Number(a.amount)
            }));

            const formattedDeductions = salaryForm.deductions.map(d => ({
                name: d.name,
                amount: Number(d.amount)
            }));

            await updatePayrollStructure({
                id: staffId as any,
                body: {
                    basic_salary: Number(salaryForm.basicSalary),
                    allowances: formattedAllowances,
                    deductions: formattedDeductions,
                    bank_details: {
                        bank_name: salaryForm.bankName,
                        account_name: salaryForm.accountName,
                        account_number: salaryForm.accountNumber,
                    }
                }
            }).unwrap();
            toast.success("Salary details updated successfully!");
        } catch (err) {
            toast.error("Failed to update salary details.");
            console.error(err);
        }
    };

    // Calculations for Summary
    const totalAllowances = salaryForm.allowances.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalDeductions = salaryForm.deductions.reduce((sum, item) => sum + Number(item.amount), 0);
    const grossSalary = salaryForm.basicSalary + totalAllowances;
    const netSalary = grossSalary - totalDeductions;

    if (isLoadingStaff) {
        return (
            <div className="p-8 text-center text-gray-500">
                Loading staff details...
            </div>
        );
    }

    const staff = staffDetails?.data;
    if (!staff) {
        return (
            <div className="p-8 text-center text-rose-500">
                Employee not found.
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Salary Configuration</h1>
                    <p className="text-slate-500 text-sm">
                        {staff.firstName} {staff.lastName} ({staff.publicId || `EMP-${staff._id}`})
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Employee Information */}
                    <Card className="p-4">
                        <h4 className="font-semibold mb-4 text-purple-700 flex items-center gap-2">
                            <Users className="w-4 h-4" /> Employee Information
                        </h4>
                        <div className="grid grid-cols-1 gap-3 text-sm">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Full Name</span>
                                <span className="font-medium text-gray-900">{staff.firstName} {staff.lastName}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Email</span>
                                <span className="font-medium text-gray-900">{staff.email}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Phone</span>
                                <span className="font-medium text-gray-900">{staff.phone || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Department</span>
                                <span className="font-medium text-gray-900">
                                    {typeof staff.department === 'string' ? staff.department : staff.department?.name || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Role</span>
                                <span className="font-medium text-gray-900">{staff.role?.displayName || 'N/A'}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Basic Salary */}
                    <Card className="p-4">
                        <h4 className="font-semibold mb-4 text-blue-700 flex items-center gap-2">
                            <Wallet className="w-4 h-4" /> Basic Salary
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="salary">Basic Salary Amount</Label>
                                <Input
                                    id="salary"
                                    type="number"
                                    value={salaryForm.basicSalary}
                                    onChange={(e) => setSalaryForm({ ...salaryForm, basicSalary: Number(e.target.value) })}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Bank Details */}
                    <Card className="p-4">
                        <h4 className="font-semibold mb-4 text-blue-700 flex items-center gap-2">
                            <Building2 className="w-4 h-4" /> Bank Details
                        </h4>
                        <div className="space-y-3">
                            <Input
                                placeholder="Bank Name"
                                value={salaryForm.bankName}
                                onChange={(e) => setSalaryForm({ ...salaryForm, bankName: e.target.value })}
                            />
                            <Input
                                placeholder="Account Name"
                                value={salaryForm.accountName}
                                onChange={(e) => setSalaryForm({ ...salaryForm, accountName: e.target.value })}
                            />
                            <Input
                                placeholder="Account Number"
                                value={salaryForm.accountNumber}
                                onChange={(e) => setSalaryForm({ ...salaryForm, accountNumber: e.target.value })}
                            />
                        </div>
                    </Card>

                    {/* Summary Card */}
                    <Card className="p-4 bg-blue-50 border-blue-100">
                        <h4 className="font-semibold mb-2 text-blue-800">Monthly Calculation</h4>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Basic Salary:</span>
                            <span>{salaryForm.basicSalary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1 text-green-600">
                            <span>+ Allowances:</span>
                            <span>{totalAllowances.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2 text-red-600">
                            <span>- Deductions:</span>
                            <span>{totalDeductions.toLocaleString()}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-bold text-lg">
                            <span>Net Salary:</span>
                            <span>{netSalary.toLocaleString()}</span>
                        </div>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Allowances */}
                    <Card className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-green-700">Allowances</h4>
                            <Button size="sm" variant="outline" onClick={addAllowance} className="h-8">
                                <PlusCircle className="w-3 h-3 mr-1" /> Add
                            </Button>
                        </div>
                        <div className="space-y-2 max-h-[250px] overflow-y-auto">
                            {salaryForm.allowances.map((item, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <Input
                                        placeholder="Name (e.g. Transport)"
                                        value={item.name}
                                        onChange={(e) => updateAllowance(index, 'name', e.target.value)}
                                        className="h-9 text-sm"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Amount"
                                        value={item.amount}
                                        onChange={(e) => updateAllowance(index, 'amount', Number(e.target.value))}
                                        className="w-28 h-9 text-sm"
                                    />
                                    <Button size="icon" variant="ghost" className="h-9 w-9 text-red-500" onClick={() => removeAllowance(index)}>
                                        <Trash className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                            {salaryForm.allowances.length === 0 && (
                                <p className="text-xs text-gray-400 italic text-center py-4">No allowances added.</p>
                            )}
                        </div>
                    </Card>

                    {/* Deductions */}
                    <Card className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-red-700">Deductions</h4>
                            <Button size="sm" variant="outline" onClick={addDeduction} className="h-8">
                                <PlusCircle className="w-3 h-3 mr-1" /> Add
                            </Button>
                        </div>
                        <div className="space-y-2 max-h-[250px] overflow-y-auto">
                            {salaryForm.deductions.map((item, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <Input
                                        placeholder="Name (e.g. EPF)"
                                        value={item.name}
                                        onChange={(e) => updateDeduction(index, 'name', e.target.value)}
                                        className="h-9 text-sm"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Amount"
                                        value={item.amount}
                                        onChange={(e) => updateDeduction(index, 'amount', Number(e.target.value))}
                                        className="w-28 h-9 text-sm"
                                    />
                                    <Button size="icon" variant="ghost" className="h-9 w-9 text-red-500" onClick={() => removeDeduction(index)}>
                                        <Trash className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                            {salaryForm.deductions.length === 0 && (
                                <p className="text-xs text-gray-400 italic text-center py-4">No deductions added.</p>
                            )}
                        </div>
                    </Card>

                    {/* Save Button */}
                    <Button
                        onClick={saveSalaryDetails}
                        disabled={isUpdating}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        size="lg"
                    >
                        {isUpdating ? "Saving..." : "Save Salary Details"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
