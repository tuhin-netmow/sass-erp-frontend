/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Filter, Plus, ShieldAlert, Trash2, Printer, Eye } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Link } from "react-router";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/shared/components/ui/command";
import { Check, ChevronDown, CornerDownRight } from "lucide-react";
import { useAddJournalEntryMutation, useGetAccountingAccountsQuery, useGetJournalReportQuery } from "@/store/features/app/accounting/accoutntingApiService";
import { toast } from "sonner";
import { ACTIONS, MODULES } from "@/app/config/permissions";
import { perm, usePermissions } from "@/shared/hooks/usePermissions";

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/shared/components/ui/pagination";

export default function JournalReport() {
    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
        to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), // Last day of current month
    });
    const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);

    // --- Permissions ---
    const { hasPermission, isAdmin } = usePermissions();
    const CanCreateJournalReport = isAdmin || hasPermission(perm(MODULES.ACCOUNTING, ACTIONS.CREATE));

    // API Hooks
    const { data: accountsData } = useGetAccountingAccountsQuery({ limit: 1000 });
    const { data: reportData, isLoading: isReportLoading } = useGetJournalReportQuery({
        limit,
        page,
        from: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
        to: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
    });
    const [addJournalEntry, { isLoading }] = useAddJournalEntryMutation();

    // New Entry Form State
    const [entryDate, setEntryDate] = useState<Date | undefined>(new Date());
    const [narration, setNarration] = useState("");
    const [rows, setRows] = useState<{ accountId: string; debit: number; credit: number }[]>([
        { accountId: "", debit: 0, credit: 0 },
        { accountId: "", debit: 0, credit: 0 },
    ]);

    const handleAddRow = () => {
        setRows([...rows, { accountId: "", debit: 0, credit: 0 }]);
    };

    const handleRemoveRow = (index: number) => {
        if (rows.length > 2) {
            const newRows = [...rows];
            newRows.splice(index, 1);
            setRows(newRows);
        }
    };

    const handleRowChange = (index: number, field: string, value: any) => {
        const newRows = [...rows];
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        newRows[index][field] = value;
        setRows(newRows);
    };

    const AccountCombobox = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
        const [open, setOpen] = useState(false);
        const accounts = accountsData?.data || [];

        // Sort or organize accounts if needed. Assuming API returns them in a way that respects hierarchy or we use level.
        // If sorting by code helps:
        // const sortedAccounts = [...accounts].sort((a, b) => a.code.localeCompare(b.code));

        return (
            <Popover open={open} onOpenChange={setOpen} modal={true}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        {value
                            ? accounts.find((acc) => acc._id === value)?.name
                            : "Select account..."}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[450px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Search account..." />
                        <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                            <CommandEmpty>No account found.</CommandEmpty>
                            <CommandGroup>
                                {accounts.map((acc) => {

                                    const level = acc.level || 0;

                                    return (
                                        <CommandItem
                                            key={acc._id}
                                            value={acc.name}
                                            onSelect={() => {
                                                onChange(acc._id);
                                                setOpen(false);
                                            }}
                                            className="flex items-center gap-2"
                                            style={{ paddingLeft: `${level === 0 ? 12 : (level * 20) + 12}px` }}
                                        >
                                            <div className="flex items-center flex-1 gap-2">
                                                <div className="flex items-center gap-1">
                                                    {level > 0 && (
                                                        <CornerDownRight className="h-3 w-3 text-muted-foreground stroke-[1.5]" />
                                                    )}

                                                    <div className="flex flex-col">
                                                        <span className={cn(
                                                            level === 0 ? "font-semibold text-foreground" : "text-muted-foreground"
                                                        )}>
                                                            {acc.name}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground/70">{acc.code}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Check
                                                className={cn(
                                                    "ml-auto h-4 w-4",
                                                    value === acc._id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        );
    };

    const totalDebit = rows.reduce((sum, row) => sum + Number(row.debit), 0);
    const totalCredit = rows.reduce((sum, row) => sum + Number(row.credit), 0);
    const isBalanced = totalDebit === totalCredit && totalDebit > 0;

    const totalPages = reportData?.pagination?.totalPages || 1;

    const renderPaginationItems = () => {
        const items = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            items.push(
                <PaginationItem key="1">
                    <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setPage(1); }}>1</PaginationLink>
                </PaginationItem>
            );
            if (startPage > 2) {
                items.push(<PaginationItem key="ellipsis-start"><PaginationEllipsis /></PaginationItem>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        href="#"
                        isActive={page === i}
                        onClick={(e) => {
                            e.preventDefault();
                            setPage(i);
                        }}
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                items.push(<PaginationItem key="ellipsis-end"><PaginationEllipsis /></PaginationItem>);
            }
            items.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setPage(totalPages); }}>{totalPages}</PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Journal Report</h2>
                    <p className="text-muted-foreground">Chronological record of all financial transactions.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => window.print()}
                        className="flex items-center gap-2"
                    >
                        <Printer className="h-4 w-4" />
                        Print
                    </Button>
                    {/* Add New Entry Button */}
                    <Dialog open={isNewEntryOpen} onOpenChange={setIsNewEntryOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Plus className="mr-2 h-4 w-4" /> New Journal Entry
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[800px]">

                            {
                                !CanCreateJournalReport ? (
                                    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                                            <ShieldAlert className="h-10 w-10 text-destructive" />
                                        </div>

                                        <h2 className="text-lg font-semibold">Access Denied</h2>

                                        <p className="text-sm text-muted-foreground">
                                            You do not have permission to create a journal report.
                                            <br />
                                            Please contact your administrator.
                                        </p>

                                        <Button variant="outline" onClick={() => setIsNewEntryOpen(false)}>
                                            Close
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <DialogHeader>
                                            <DialogTitle>Create New Journal Entry</DialogTitle>
                                            <DialogDescription>
                                                Record a manual journal entry. Ensure Total Debit equals Total Credit.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Date</Label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full justify-start text-left font-normal",
                                                                    !entryDate && "text-muted-foreground"
                                                                )}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {entryDate ? format(entryDate, "PPP") : <span>Pick a date</span>}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0">
                                                            <Calendar
                                                                mode="single"
                                                                selected={entryDate}
                                                                onSelect={setEntryDate}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Narration / Reference</Label>
                                                    <Input
                                                        placeholder="e.g. Adjustment for depreciation"
                                                        value={narration}
                                                        onChange={(e) => setNarration(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="border rounded-md p-4 bg-muted/20 space-y-4">
                                                <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground mb-2">
                                                    <div className="col-span-5">Account</div>
                                                    <div className="col-span-3 text-right">Debit (RM)</div>
                                                    <div className="col-span-3 text-right">Credit (RM)</div>
                                                    <div className="col-span-1"></div>
                                                </div>

                                                {rows.map((row, index) => (
                                                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                                        <div className="col-span-5">
                                                            <AccountCombobox
                                                                value={row.accountId}
                                                                onChange={(val) => handleRowChange(index, "accountId", val)}
                                                            />
                                                        </div>
                                                        <div className="col-span-3">
                                                            <Input
                                                                type="number"
                                                                className="text-right"
                                                                placeholder="0.00"
                                                                value={row.debit === 0 ? '' : row.debit}
                                                                onChange={(e) => handleRowChange(index, "debit", Number(e.target.value))}
                                                            />
                                                        </div>
                                                        <div className="col-span-3">
                                                            <Input
                                                                type="number"
                                                                className="text-right"
                                                                placeholder="0.00"
                                                                value={row.credit === 0 ? '' : row.credit}
                                                                onChange={(e) => handleRowChange(index, "credit", Number(e.target.value))}
                                                            />
                                                        </div>
                                                        <div className="col-span-1 flex justify-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                                onClick={() => handleRemoveRow(index)}
                                                                disabled={rows.length <= 2}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}

                                                <Button variant="outline" size="sm" onClick={handleAddRow} className="mt-2">
                                                    <Plus className="mr-2 h-3.5 w-3.5" /> Add Row
                                                </Button>
                                            </div>

                                            <div className="flex justify-end gap-6 px-4 font-semibold text-sm">
                                                <div className="flex gap-2">
                                                    <span className="text-muted-foreground">Total Debit:</span>
                                                    <span>{totalDebit.toFixed(2)}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="text-muted-foreground">Total Credit:</span>
                                                    <span>{totalCredit.toFixed(2)}</span>
                                                </div>
                                                <div className={cn("flex gap-2", isBalanced ? "text-emerald-600" : "text-destructive")}>
                                                    <span>Difference:</span>
                                                    <span>{(totalDebit - totalCredit).toFixed(2)}</span>
                                                </div>
                                            </div>

                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsNewEntryOpen(false)}>Cancel</Button>
                                            <Button
                                                type="submit"
                                                disabled={!isBalanced || isLoading}
                                                onClick={async () => {
                                                    if (!entryDate || !isBalanced) return;

                                                    try {
                                                        const payload = {
                                                            date: format(entryDate, 'yyyy-MM-dd'),
                                                            narration,
                                                            entries: rows.map(r => ({
                                                                accountId: r.accountId,
                                                                debit: r.debit,
                                                                credit: r.credit
                                                            }))
                                                        };

                                                        await addJournalEntry(payload).unwrap();
                                                        toast.success("Journal entry created successfully");
                                                        setIsNewEntryOpen(false);
                                                        // Reset form
                                                        setEntryDate(new Date());
                                                        setNarration("");
                                                        setRows([
                                                            { accountId: "", debit: 0, credit: 0 },
                                                            { accountId: "", debit: 0, credit: 0 },
                                                        ]);
                                                    } catch (error) {
                                                        console.error("Failed to create entry:", error);
                                                        toast.error("Failed to create journal entry");
                                                    }
                                                }}
                                            >
                                                {isLoading ? "Saving..." : "Save Entry"}
                                            </Button>
                                        </DialogFooter>
                                    </>)}
                        </DialogContent>
                    </Dialog>

                    {/* Date Filter */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[140px] justify-start text-left font-normal",
                                        !dateRange.from && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange.from ? format(dateRange.from, "PP") : <span>From Date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    mode="single"
                                    selected={dateRange.from}
                                    onSelect={(d) => setDateRange(prev => ({ ...prev, from: d }))}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <span className="text-muted-foreground">-</span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[140px] justify-start text-left font-normal",
                                        !dateRange.to && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange.to ? format(dateRange.to, "PP") : <span>To Date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    mode="single"
                                    selected={dateRange.to}
                                    onSelect={(d) => setDateRange(prev => ({ ...prev, to: d }))}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Print Only Header */}
            <div className="hidden print:block text-center mb-[15px] pb-1">
                <h1 className="text-4xl font-extrabold uppercase tracking-tight">JOURNAL REPORT</h1>
                <div className="mt-1 text-sm text-gray-700 font-semibold">
                    {dateRange.from ? (
                        <>
                            <span>From: {format(dateRange.from, 'd MMMM yyyy')}</span>
                            {dateRange.to && <span> - To: {format(dateRange.to, 'd MMMM yyyy')}</span>}
                        </>
                    ) : (
                        <span>Report Generated On: {format(new Date(), 'd MMMM yyyy')}</span>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {isReportLoading ? (
                    <div className="text-center py-10">Loading journal entries...</div>
                ) : (
                    <>
                        {reportData?.data?.map((entry) => (
                            <Card key={entry._id} className="overflow-hidden border-2 transition-all duration-300 hover:border-emerald-200 hover:shadow-lg gap-4">
                                <CardHeader className="bg-linear-to-r from-emerald-50 via-green-50 to-emerald-50 dark:from-emerald-950/30 dark:via-green-950/30 dark:to-emerald-950/30 border-b-1 border-emerald-100 dark:border-emerald-900 py-2 px-6 gap-0">
                                    <div className="flex flex-wrap justify-between items-center gap-3">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">{entry.date}</span>
                                            <span className="text-lg font-bold text-gray-800 dark:text-gray-100">{entry.narration || "No Narration"}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Badge variant="outline" className="border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300 font-semibold px-3 py-1">
                                                {entry.referenceType} #{entry._id}
                                            </Badge>
                                            <div className="flex items-center">
                                                <Link to={`/dashboard/accounting/reports/journal/${entry.publicId || entry._id}`}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link to={`/dashboard/accounting/reports/journal/${entry.publicId || entry._id}/print`}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                                                        title="Print Voucher"
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                                <TableHead className="w-[50%] py-1.5 px-6 font-semibold text-gray-700 dark:text-gray-300">Account Name</TableHead>
                                                <TableHead className="text-right py-1.5 px-6 font-semibold text-gray-700 dark:text-gray-300">Debit (RM)</TableHead>
                                                <TableHead className="text-right py-1.5 px-6 font-semibold text-gray-700 dark:text-gray-300">Credit (RM)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {entry.entries.map((row) => (
                                                <TableRow key={row._id} className="hover:bg-muted/20 transition-colors">
                                                    <TableCell className="font-medium py-1.5 px-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-gray-900 dark:text-gray-100">{row.account?.name}</span>
                                                            <span className="text-xs text-muted-foreground mt-0.5">Code: {row.account?.code}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right py-1.5 px-6 font-mono text-gray-800 dark:text-gray-200">
                                                        {Number(row.debit) > 0 ? (
                                                            <span className="text-blue-600 dark:text-blue-400 font-semibold">{Number(row.debit).toFixed(2)}</span>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right py-1.5 px-6 font-mono text-gray-800 dark:text-gray-200">
                                                        {Number(row.credit) > 0 ? (
                                                            <span className="text-green-600 dark:text-green-400 font-semibold">{Number(row.credit).toFixed(2)}</span>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {/* Footer for Check */}
                                            <TableRow className="bg-linear-to-r from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 border-t-2 border-emerald-200 dark:border-emerald-800 font-bold">
                                                <TableCell className="py-1.5 px-6 text-gray-800 dark:text-gray-100">Total</TableCell>
                                                <TableCell className="text-right py-1.5 px-6 font-mono text-blue-700 dark:text-blue-300 text-base">
                                                    {entry.entries.reduce((sum, item) => sum + Number(item.debit), 0).toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-right py-1.5 px-6 font-mono text-green-700 dark:text-green-300 text-base">
                                                    {entry.entries.reduce((sum, item) => sum + Number(item.credit), 0).toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        ))}
                        {reportData?.data && reportData.data.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 print:hidden">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Per page:</span>
                                    <select
                                        value={limit}
                                        onChange={(e) => {
                                            setLimit(Number(e.target.value));
                                            setPage(1);
                                        }}
                                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none bg-background text-foreground"
                                    >
                                        {[5, 10, 20, 50, 100].map((size) => (
                                            <option key={size} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="text-sm text-gray-500 ml-2">
                                        Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, reportData?.pagination?.total || 0)} of {reportData?.pagination?.total || 0} entries
                                    </span>
                                </div>
                                <Pagination className="m-0 w-auto">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1); }}
                                                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>
                                        {renderPaginationItems()}
                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(page + 1); }}
                                                className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .no-print, 
                    header, 
                    nav, 
                    aside, 
                    button,
                    .print\\:hidden {
                        display: none !important;
                    }
                    html, body {
                        background: white !important;
                        overflow: visible !important;
                        height: auto !important;
                    }
                    .text-4xl {
                        font-size: 18px !important;
                        margin-bottom: 4px !important;
                        line-height: 1 !important;
                    }
                    .text-4xl + div {
                        line-height: 1 !important;
                        margin-top: 2px !important;
                    }
                    .border-2 {
                        border: 1px solid #eee !important;
                        margin-bottom: 10px !important;
                        break-inside: avoid !important;
                    }
                    .shadow-lg, .shadow-md, .shadow-sm {
                        box-shadow: none !important;
                    }
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }
                    th, td {
                        border-bottom: 1px solid #eee !important;
                        padding: 2px 6px !important;
                        font-size: 8px !important;
                    }
                    th {
                        line-height: 1 !important;
                        text-transform: uppercase !important;
                    }
                    .px-6 {
                        padding-left: 8px !important;
                        padding-right: 8px !important;
                    }
                    .py-2, .py-1.5 {
                        padding-top: 2px !important;
                        padding-bottom: 2px !important;
                    }
                    .text-lg {
                        font-size: 12px !important;
                    }
                    .text-xs {
                        font-size: 7px !important;
                    }
                    .tracking-wide {
                        letter-spacing: normal !important;
                    }
                    /* Aggressively remove unnecessary gaps */
                    .mb-8, .mb-6 {
                        margin-bottom: 0 !important;
                    }
                    .mt-8 {
                        margin-top: 0 !important;
                    }
                    /* Ensure heading section has exactly 15px margin */
                    .hidden.print\\:block.mb-\\[15px\\] {
                        margin-bottom: 15px !important;
                    }
                }
            `}} />
        </div>
    );
}
