import { Button } from "@/shared/components/ui/button";
import { useGetJournalByIdQuery } from "@/store/features/app/accounting/accoutntingApiService";
import { useAppSelector } from "@/store/store";
import { Link, useParams } from "react-router";
import {
    ArrowLeft,
    Calendar,
    FileText,
    Banknote,
    Printer,
    Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { formatDateStandard } from "@/shared/utils/dateUtils";

export default function JournalDetails() {
    const currency = useAppSelector((state) => state.currency.value) || "RM";
    const { journalId } = useParams();
    const { data, isLoading, error } = useGetJournalByIdQuery(journalId as string);

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground animate-pulse">Loading journal details...</p>
            </div>
        </div>
    );

    if (error || !data?.data) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
            <div className="bg-red-100 p-4 rounded-full text-red-600">
                <FileText className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Journal Not Found</h2>
            <p className="text-gray-500 max-w-md">
                The journal entry you are looking for does not exist or has been removed.
            </p>
            <Link to="/dashboard/accounting/reports/journal">
                <Button>Back to Journal Report</Button>
            </Link>
        </div>
    );

    const journal = data.data;

    const formattedJournal = {
        number: journal.publicId || `JV-${journal._id.toString().padStart(6, "0")}`,
        date: formatDateStandard(journal.date),
        referenceType: journal.referenceType || "Manual",
        referenceId: journal.referenceId,
        narration: journal.narration || "No narration provided."
    };

    const totalDebit = journal.entries.reduce((sum, entry) => sum + Number(entry.debit), 0);
    const totalCredit = journal.entries.reduce((sum, entry) => sum + Number(entry.credit), 0);

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in-50 duration-500 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="text-left">
                    <Link
                        to="/dashboard/accounting/reports/journal"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Journal Report
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Journal {formattedJournal.number}</h1>
                        <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 px-3 py-1 shadow-sm font-semibold capitalize">
                            {formattedJournal.referenceType}
                        </Badge>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Link to={`/dashboard/accounting/reports/journal/${journal.publicId || journal._id}/print`}>
                        <Button
                            variant="outline"
                            className="shadow-sm border-primary/20 hover:bg-primary/5 text-primary gap-2"
                        >
                            <Printer className="w-4 h-4" />
                            Print Voucher
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-sm border-border/60 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 p-6 border-b border-emerald-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-emerald-800 uppercase tracking-wider mb-1">Journal Date</p>
                                    <h2 className="text-2xl font-bold text-emerald-700 tracking-tight">
                                        {formattedJournal.date}
                                    </h2>
                                </div>
                                <div className="bg-white p-3 rounded-full shadow-sm text-emerald-600">
                                    <Calendar className="w-8 h-8" />
                                </div>
                            </div>
                        </div>

                        <CardContent className="p-0">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-left">
                                    <Info className="w-5 h-5 text-primary" />
                                    General Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Reference Type</p>
                                        <p className="font-semibold text-gray-900">{formattedJournal.referenceType}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Reference ID</p>
                                        <p className="font-semibold text-gray-900">#{formattedJournal.referenceId || journal._id}</p>
                                    </div>
                                </div>

                                <Separator className="my-6" />

                                <div className="space-y-2 text-left text-left">
                                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Narration</p>
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-gray-700 leading-relaxed italic">
                                        "{formattedJournal.narration}"
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Journal Entries Table */}
                    <Card className="shadow-sm border-border/60 overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Banknote className="w-5 h-5 text-emerald-600" />
                                Entry Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold h-12">
                                            <th className="px-6 text-left">Account</th>
                                            <th className="px-6 text-right">Debit ({currency})</th>
                                            <th className="px-6 text-right">Credit ({currency})</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {journal.entries?.map((entry) => (
                                            <tr key={entry._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 text-left">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900">{entry.account?.name}</span>
                                                        <span className="text-xs text-muted-foreground font-mono">{entry.account?.code}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono font-medium text-blue-700">
                                                    {Number(entry.debit) > 0 ? Number(entry.debit).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono font-medium text-rose-700">
                                                    {Number(entry.credit) > 0 ? Number(entry.credit).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-slate-50 font-bold border-t-2">
                                            <td className="px-6 py-4 text-left">Total</td>
                                            <td className="px-6 py-4 text-right font-mono text-blue-800">
                                                {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-rose-800">
                                                {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Meta / Summary */}
                <div className="space-y-6">
                    <Card className="shadow-sm border-border/60">
                        <CardHeader className="bg-slate-50/50 py-4 border-b">
                            <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-700">
                                <Info className="w-4 h-4 text-blue-500" />
                                Audit Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Created At:</span>
                                    <span className="text-gray-900 font-medium">{formatDateStandard(journal.createdAt)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Last Updated:</span>
                                    <span className="text-gray-900 font-medium">{formatDateStandard(journal.updatedAt)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Internal ID:</span>
                                    <span className="text-gray-900 font-medium">#{journal._id}</span>
                                </div>
                            </div>
                            <Separator />
                            <div className="pt-2">
                                <div className={`p-4 rounded-lg flex flex-col items-center gap-2 ${Math.abs(totalDebit - totalCredit) < 0.01 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                    <Badge className={Math.abs(totalDebit - totalCredit) < 0.01 ? 'bg-emerald-600' : 'bg-rose-600'}>
                                        {Math.abs(totalDebit - totalCredit) < 0.01 ? 'BALANCED' : 'UNBALANCED'}
                                    </Badge>
                                    <p className="text-xs font-medium uppercase tracking-tighter">Status Verification</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
