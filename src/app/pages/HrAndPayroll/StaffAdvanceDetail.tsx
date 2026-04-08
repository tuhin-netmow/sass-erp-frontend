/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useNavigate } from "react-router";
import { useMemo, useState } from "react";

import { toast } from "sonner";
import {
    ArrowDownCircle,
    ArrowLeft,
    CalendarCheck,
    Clock,
    PlusCircle,
    TrendingUp,
    TrendingDown,
    Wallet,
    AlertCircle
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import {
    useGetAllAdvancesQuery,
    useCreateAdvanceMutation,
    useReturnAdvanceMutation
} from "@/store/features/app/payroll/payrollApiService";
import { useGetStaffByIdQuery } from "@/store/features/app/staffs/staffApiService";
import type { PayrollAdvance } from "@/shared/types";

export default function StaffAdvanceDetail() {
    const { staffId } = useParams();
    const navigate = useNavigate();
    const id = staffId as string;

    const { data: staffData, isLoading: isLoadingStaff } = useGetStaffByIdQuery(id);
    const staff = staffData?.data;

    const [advanceForm, setAdvanceForm] = useState({
        amount: 0,
        advanceDate: new Date().toISOString().split('T')[0],
        reason: "",
        status: "paid" as any,
        remarks: ""
    });

    const [selectedReturnItemId, setSelectedReturnItemId] = useState<string>("");
    const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
    const [returnAmount, setReturnAmount] = useState<number>(0);
    const [returnRemarks, setReturnRemarks] = useState("");

    const [createAdvance, { isLoading: isCreatingAdvance }] = useCreateAdvanceMutation();
    const [returnAdvance, { isLoading: isUpdatingAdvance }] = useReturnAdvanceMutation();

    const { data: advancesData, refetch: refetchAdvances } = useGetAllAdvancesQuery(
        id ? { staffId: id } : undefined,
        { skip: !id }
    );

    // Calculate Statistics
    const stats = useMemo(() => {
        const advances = advancesData?.data || [];
        const totalIssued = advances.reduce((sum: number, adv: PayrollAdvance) => sum + Number(adv.amount), 0);
        const totalReturned = advances.reduce((sum: number, adv: PayrollAdvance) => sum + Number(adv.returnedAmount), 0);
        const pendingBalance = totalIssued - totalReturned;
        const activeCount = advances.filter((adv: PayrollAdvance) => (Number(adv.amount) - Number(adv.returnedAmount)) > 0).length;

        return {
            totalIssued,
            totalReturned,
            pendingBalance,
            activeCount
        };
    }, [advancesData]);


    const handleAddAdvance = async () => {
        if (!id) return;
        try {
            await createAdvance({
                staffId: id,
                advanceDate: advanceForm.advanceDate,
                amount: advanceForm.amount,
                reason: advanceForm.reason,
                status: advanceForm.status,
                remarks: advanceForm.remarks
            }).unwrap();
            toast.success("Advance recorded successfully!");
            setAdvanceForm({
                amount: 0,
                advanceDate: new Date().toISOString().split('T')[0],
                reason: "",
                status: "paid",
                remarks: ""
            });
            refetchAdvances();
        } catch (err) {
            toast.error("Failed to record advance.");
            console.error(err);
        }
    };

    const handleReturnAdvance = async () => {
        if (!selectedReturnItemId) return;
        try {
            await returnAdvance({
                id: Number(selectedReturnItemId),
                body: {
                    amount: returnAmount,
                    return_date: returnDate,
                    remarks: returnRemarks
                }
            }).unwrap();
            toast.success("Return recorded successfully!");
            setSelectedReturnItemId("");
            setReturnAmount(0);
            setReturnRemarks("");
            refetchAdvances();
        } catch (err: any) {
            toast.error(err.data?.message || "Failed to record return.");
            console.error(err);
        }
    };

    if (isLoadingStaff) return <div className="p-8 text-center text-gray-500">Loading staff details...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Advance Management</h1>
                    <p className="text-gray-500">Managing advances for <span className="font-semibold text-gray-900">{staff?.firstName} {staff?.lastName}</span> (ID: {id})</p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-none shadow-lg py-6">
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-xs font-semibold uppercase tracking-wider">Total Issued</p>
                                <h3 className="text-2xl font-bold text-white mt-1">RM {stats.totalIssued.toLocaleString()}</h3>
                            </div>
                            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 border-none shadow-lg py-6">
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-xs font-semibold uppercase tracking-wider">Total Returned</p>
                                <h3 className="text-2xl font-bold text-white mt-1">RM {stats.totalReturned.toLocaleString()}</h3>
                            </div>
                            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                                <TrendingDown className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-none shadow-lg py-6">
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider">Pending Balance</p>
                                <h3 className="text-2xl font-bold text-white mt-1">RM {stats.pendingBalance.toLocaleString()}</h3>
                            </div>
                            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                                <Wallet className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500 to-amber-600 border-none shadow-lg py-6">
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-amber-100 text-xs font-semibold uppercase tracking-wider">Active Advances</p>
                                <h3 className="text-2xl font-bold text-white mt-1">{stats.activeCount}</h3>
                            </div>
                            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                                <AlertCircle className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEFT: ADVANCE ISSUANCE */}
                <div className="space-y-6">
                    <Card className="border-orange-100 shadow-sm overflow-hidden pb-6">
                        <CardHeader className="bg-orange-50 border-b-1 border-orange-100 py-3 gap-0">
                            <CardTitle className="text-orange-800 flex items-center gap-2">
                                <PlusCircle className="w-5 h-5 text-orange-600" /> Issue New Advance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs uppercase tracking-wider text-orange-600 font-bold">Amount (RM)</Label>
                                    <Input
                                        type="number"
                                        className="border-orange-200 focus:ring-orange-500"
                                        value={advanceForm.amount}
                                        onChange={(e) => setAdvanceForm({ ...advanceForm, amount: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs uppercase tracking-wider text-orange-600 font-bold">Date</Label>
                                    <Input
                                        type="date"
                                        className="border-orange-200 focus:ring-orange-500 block"
                                        value={advanceForm.advanceDate}
                                        onChange={(e) => setAdvanceForm({ ...advanceForm, advanceDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs uppercase tracking-wider text-orange-600 font-bold">Reason / Remarks</Label>
                                <Input
                                    className="border-orange-200 focus:ring-orange-500"
                                    placeholder="Note for advance issuance"
                                    value={advanceForm.reason}
                                    onChange={(e) => setAdvanceForm({ ...advanceForm, reason: e.target.value })}
                                />
                            </div>
                            <Button
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 transition-all mt-2"
                                onClick={handleAddAdvance}
                                disabled={isCreatingAdvance || !advanceForm.amount}
                            >
                                {isCreatingAdvance ? "Processing..." : "Confirm & Issue Advance"}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="border-b-1 border-gray-200 py-3 gap-0">
                            <CardTitle className="text-gray-800 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-orange-500" /> Advance History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold text-gray-600">Date</th>
                                            <th className="px-6 py-3 font-semibold text-gray-600">Issued</th>
                                            <th className="px-6 py-3 font-semibold text-gray-600">Balance</th>
                                            <th className="px-6 py-3 font-semibold text-gray-600">Remarks</th>
                                            <th className="px-6 py-3 font-semibold text-gray-600 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {advancesData?.data && advancesData.data.length > 0 ? (
                                            advancesData.data.map((adv: PayrollAdvance) => (
                                                <tr key={adv.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 text-gray-500">{adv.advanceDate}</td>
                                                    <td className="px-6 py-4 font-bold text-orange-600 text-base">RM {Number(adv.amount).toLocaleString()}</td>
                                                    <td className="px-6 py-4 font-bold text-gray-700 text-base">RM {(Number(adv.amount) - Number(adv.returnedAmount)).toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-gray-500 text-xs max-w-[200px] truncate" title={adv.reason || ""}>{adv.reason || "-"}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Badge className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider ${adv.status === 'returned' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-orange-100 text-orange-700 hover:bg-orange-100'}`}>
                                                            {adv.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="text-center py-12 text-gray-400 italic">No advances found for this employee</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT: RETURN MANAGEMENT */}
                <div className="space-y-6">
                    <Card className="border-green-100 shadow-sm overflow-hidden pb-6">
                        <CardHeader className="bg-green-50 border-b-1 border-green-100 py-3 gap-0">
                            <CardTitle className="text-green-800 flex items-center gap-2">
                                <ArrowDownCircle className="w-5 h-5 text-green-600" /> Process Return
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs uppercase tracking-wider text-green-600 font-bold">Select Active Advance</Label>
                                <select
                                    className="w-full h-10 rounded-md border border-green-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                    value={selectedReturnItemId}
                                    onChange={(e) => setSelectedReturnItemId(e.target.value)}
                                >
                                    <option value="">-- Choose Advance to Return --</option>
                                    {advancesData?.data?.filter((a: PayrollAdvance) => a.status !== 'returned').map((adv: PayrollAdvance) => (
                                        <option key={adv.id} value={adv.id}>
                                            Date: {adv.advanceDate} | Balance: RM {(Number(adv.amount) - Number(adv.returnedAmount)).toLocaleString()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs uppercase tracking-wider text-green-600 font-bold">Return Amount (RM)</Label>
                                    <Input
                                        type="number"
                                        className="border-green-200 focus:ring-green-500"
                                        value={returnAmount}
                                        onChange={(e) => setReturnAmount(Number(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs uppercase tracking-wider text-green-600 font-bold">Return Date</Label>
                                    <Input
                                        type="date"
                                        className="border-green-200 focus:ring-green-500"
                                        value={returnDate}
                                        onChange={(e) => setReturnDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs uppercase tracking-wider text-green-600 font-bold">Remarks (Optional)</Label>
                                <Input
                                    className="border-green-200 focus:ring-green-500"
                                    placeholder="Note for this partial/full return"
                                    value={returnRemarks}
                                    onChange={(e) => setReturnRemarks(e.target.value)}
                                />
                            </div>
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 transition-all mt-2"
                                disabled={isUpdatingAdvance || !selectedReturnItemId || returnAmount <= 0}
                                onClick={handleReturnAdvance}
                            >
                                {isUpdatingAdvance ? "Recording..." : "Record Return"}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="border-b-1 border-gray-200 py-3 gap-0">
                            <CardTitle className="text-gray-800 flex items-center gap-2">
                                <CalendarCheck className="w-5 h-5 text-green-500" /> Return History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold text-gray-600">Return Date</th>
                                            <th className="px-6 py-3 font-semibold text-gray-600">Amount</th>
                                            <th className="px-6 py-3 font-semibold text-gray-600">Remarks</th>
                                            <th className="px-6 py-3 font-semibold text-gray-600 text-right">Linked Advance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {(() => {
                                            const allReturns = advancesData?.data?.flatMap((adv: PayrollAdvance) =>
                                                (adv.returns || []).map((ret: any) => ({
                                                    ...ret,
                                                    advanceDate: adv.advanceDate
                                                }))
                                            ).sort((a: any, b: any) => new Date(b.returnDate || b.return_date).getTime() - new Date(a.returnDate || a.return_date).getTime());

                                            if (!allReturns || allReturns.length === 0) {
                                                return (
                                                    <tr>
                                                        <td colSpan={4} className="text-center py-12 text-gray-400 italic">No returns processed yet</td>
                                                    </tr>
                                                );
                                            }

                                            return allReturns.map((ret: any) => (
                                                <tr key={ret.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 text-gray-500">{ret.returnDate || ret.return_date}</td>
                                                    <td className="px-6 py-4 font-bold text-green-600 text-base">RM {Number(ret.amount).toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-gray-500 text-xs max-w-[200px] truncate" title={ret.remarks}>{ret.remarks || "-"}</td>
                                                    <td className="px-6 py-4 text-gray-400 text-right text-xs">Issued On: {ret.advanceDate}</td>
                                                </tr>
                                            ));
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
