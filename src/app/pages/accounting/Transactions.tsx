"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Search, Calendar as CalendarIcon, X, Printer } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/shared/utils/utils";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Calendar as CalendarComponent } from "@/shared/components/ui/calendar";
import { DateRangePicker } from "@/shared/components/ui/date-range-picker";

import { useAddTransactionMutation, useGetTransactionsQuery } from "@/store/features/app/accounting/accoutntingApiService";
import { useGetSettingsInfoQuery } from "@/store/features/admin/settingsApiService";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { toast } from "sonner";
import type { CreateTransactionInput } from "@/shared/types/app/accounting.types";
import type { DateRange } from "react-day-picker";


export default function Transactions() {
    const { data: settingsData } = useGetSettingsInfoQuery();
    const from = settingsData?.data;

    const [isOpen, setIsOpen] = useState(false);

    // Filter Query States
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<string | undefined>("ALL");


    const { data: transactionsData, isLoading } = useGetTransactionsQuery({
        page: 1,
        limit: 10,
        search: searchQuery || undefined,
        type: filterType === "ALL" ? undefined : filterType,
        startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
        endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
    });

    const transactions = transactionsData?.data || [];
    const [addTransaction, { isLoading: isAdding }] = useAddTransactionMutation();

    const { control, handleSubmit, reset, formState: { errors } } = useForm<CreateTransactionInput>({
        defaultValues: {
            type: undefined,
            amount: undefined,
            paymentMode: undefined,
            date: format(new Date(), "yyyy-MM-dd"),
            description: "",
        },
    });

    const onSubmit = async (data: CreateTransactionInput) => {
        try {
            await addTransaction(data).unwrap();
            toast.success("Transaction created successfully");
            setIsOpen(false);
            reset({
                type: undefined,
                amount: undefined,
                paymentMode: undefined,
                date: format(new Date(), "yyyy-MM-dd"),
                description: "",
            });
        } catch (error) {
            toast.error("Failed to create transaction");
            console.error(error);
        }
    };

    const clearFilters = () => {
        setDateRange(undefined);
        setSearchQuery("");
        setFilterType("ALL");
    };

    const hasActiveFilters = dateRange || searchQuery || (filterType && filterType !== "ALL");






    //   badge config for transaction types

    const typeBadgeConfig: Record<
        string,
        { variant: "default" | "secondary" | "destructive" | "outline"; className: string }
    > = {
        SALES: {
            variant: "default",
            className: "bg-emerald-600 hover:bg-emerald-700 text-white",
        },

        INCOME: {
            variant: "secondary",
            className: "bg-blue-600 hover:bg-blue-700 text-white border-0",
        },

        PURCHASE: {
            variant: "outline",
            className: "bg-indigo-600 hover:bg-indigo-700 text-white border-0",
        },

        EXPENSE: {
            variant: "destructive",
            className: "bg-orange-600 hover:bg-orange-700 text-white",
        },

        PAYMENT_IN: {
            variant: "outline",
            className: "bg-purple-600 hover:bg-purple-700 text-white border-0",
        },

        PAYMENT_OUT: {
            variant: "destructive",
            className: "bg-rose-600 hover:bg-rose-700 text-white",
        },

        PAYROLL: {
            variant: "destructive",
            className: "bg-red-600 hover:bg-red-700 text-white",
        },
    };




    const paymentModeBadgeConfig: Record<
        string,
        { variant: "default" | "secondary" | "destructive" | "outline"; className: string }
    > = {
        CASH: {
            variant: "secondary",
            className: "bg-green-600 hover:bg-green-700 text-white border-0",
        },

        BANK: {
            variant: "outline",
            className: "bg-blue-600 hover:bg-blue-700 text-white border-0",
        },

        DUE: {
            variant: "destructive",
            className: "bg-yellow-600 hover:bg-yellow-700 text-white",
        },
    };




    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
                    <p className="text-muted-foreground">Manage your daily financial transactions.</p>
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
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            {/* <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            <span className="mr-2 text-xl font-bold">+</span> New Transaction
                        </Button> */}
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Create New Transaction</DialogTitle>
                                <DialogDescription>
                                    Enter the details of the transaction below.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Transaction Type <span className="text-red-500">*</span></Label>
                                            <Controller
                                                name="type"
                                                control={control}
                                                rules={{ required: "Type is required" }}
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className={cn(errors.type && "border-red-500")}>
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="SALES">Sales</SelectItem>
                                                            <SelectItem value="PURCHASE">Purchase</SelectItem>
                                                            <SelectItem value="EXPENSE">Expense</SelectItem>
                                                            <SelectItem value="INCOME">Income</SelectItem>
                                                            <SelectItem value="JOURNAL">Journal</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.type && <p className="text-red-500 text-xs">{errors.type.message}</p>}
                                            <p className="text-[0.8rem] text-muted-foreground">
                                                Sales: Dr Cash / Cr Sales
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Date <span className="text-red-500">*</span></Label>
                                            <Controller
                                                name="date"
                                                control={control}
                                                rules={{ required: "Date is required" }}
                                                render={({ field }) => (
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full justify-start text-left font-normal",
                                                                    !field.value && "text-muted-foreground",
                                                                    errors.date && "border-red-500"
                                                                )}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0">
                                                            <CalendarComponent
                                                                mode="single"
                                                                selected={field.value ? new Date(field.value) : undefined}
                                                                onSelect={(d) => field.onChange(d ? format(d, "yyyy-MM-dd") : "")}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                )}
                                            />
                                            {errors.date && <p className="text-red-500 text-xs">{errors.date.message}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Amount <span className="text-red-500">*</span></Label>
                                            <Controller
                                                name="amount"
                                                control={control}
                                                rules={{ required: "Amount is required", min: { value: 0.01, message: "Amount must be greater than 0" } }}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        placeholder="0.00"
                                                        className={cn(errors.amount && "border-red-500")}
                                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                                    />
                                                )}
                                            />
                                            {errors.amount && <p className="text-red-500 text-xs">{errors.amount.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Payment Mode <span className="text-red-500">*</span></Label>
                                            <Controller
                                                name="paymentMode"
                                                control={control}
                                                rules={{ required: "Mode is required" }}
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className={cn(errors.paymentMode && "border-red-500")}>
                                                            <SelectValue placeholder="Select mode" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="CASH">Cash</SelectItem>
                                                            <SelectItem value="BANK">Bank</SelectItem>
                                                            <SelectItem value="DUE">Due</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.paymentMode && <p className="text-red-500 text-xs">{errors.paymentMode.message}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Description <span className="text-red-500">*</span></Label>
                                        <Controller
                                            name="description"
                                            control={control}
                                            rules={{ required: "Description is required" }}
                                            render={({ field }) => (
                                                <Textarea
                                                    {...field}
                                                    placeholder="Enter transaction details..."
                                                    className={cn(errors.description && "border-red-500")}
                                                />
                                            )}
                                        />
                                        {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsOpen(false)} type="button">Cancel</Button>
                                    <Button type="submit" disabled={isAdding}>
                                        {isAdding ? "Saving..." : "Save Transaction"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Print Only Header */}
            <div id="invoice" className="hidden print:block mb-4">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-2 mt-2 details-text text-left">
                        <h1 className="font-bold uppercase company-name text-left">{from?.companyName || "F&Z Global Trade (M) Sdn Bhd"}</h1>
                        <p className="leading-tight max-w-[400px] text-left">
                            {from?.address || "45, Jalan Industri USJ 1/10, TMN Perindustrian USJ 1, Subang Jaya"}
                        </p>
                        <p className="text-left">T: {from?.phone || "0162759780"}{from?.email && `, E: ${from.email}`}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <div className="mb-1">
                            {from?.logoUrl ? (
                                <img src={from.logoUrl} alt="Logo" className="h-14 object-contain" />
                            ) : (
                                <div className="w-12 h-12 rounded-full border-2 border-[#4CAF50] flex items-center justify-center text-[#4CAF50] font-bold text-lg overflow-hidden">
                                    F&Z
                                </div>
                            )}
                        </div>
                        <h2 className="font-bold text-gray-800 mb-1 uppercase details-text">Transaction List</h2>
                        <div className="details-text space-y-1">
                            <p><strong>Date:</strong> {format(new Date(), "dd/MM/yyyy")}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-lg border shadow-sm print:hidden">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search transactions..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Types</SelectItem>
                            <SelectItem value="SALES">Sales</SelectItem>
                            <SelectItem value="PURCHASE">Purchase</SelectItem>
                            <SelectItem value="EXPENSE">Expense</SelectItem>
                            <SelectItem value="INCOME">Income</SelectItem>
                            <SelectItem value="PAYMENT_OUT">Payment Out</SelectItem>
                            <SelectItem value="PAYMENT_IN">Payment In</SelectItem>
                        </SelectContent>
                    </Select>

                    <DateRangePicker
                        dateRange={dateRange}
                        onDateRangeChange={setDateRange}
                        placeholder="Pick a date range"
                        className="w-60"
                        numberOfMonths={2}
                    />

                    {hasActiveFilters && (
                        <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear Filters">
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Data Table */}
            <div className="border rounded-lg bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Mode</TableHead>
                            <TableHead className="text-right">Amount (RM)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Skeleton className="h-8 w-full" />
                                        <Skeleton className="h-8 w-full" />
                                        <Skeleton className="h-8 w-full" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No transactions found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((tx) => (
                                <TableRow key={tx._id}>
                                    <TableCell>{tx.date}</TableCell>

                                    <TableCell>
                                        <Badge
                                            variant={typeBadgeConfig[tx.type]?.variant ?? "outline"}
                                            className={typeBadgeConfig[tx.type]?.className}
                                        >
                                            {tx.type.replace("_", " ")}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>{tx.description}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={paymentModeBadgeConfig[tx.paymentMode]?.variant ?? "outline"}
                                            className={paymentModeBadgeConfig[tx.paymentMode]?.className}
                                        >
                                            {tx.paymentMode}
                                        </Badge>
                                    </TableCell>

                                    <TableCell className="text-right font-medium">
                                        {Number(tx.amount).toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page {
                        margin: 5mm;
                        size: A4 portrait;
                    }
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
                        color: black !important;
                        font-size: 11px !important;
                    }
                    * {
                        color: black !important;
                        box-shadow: none !important;
                        text-shadow: none !important;
                    }
                    #invoice {
                        max-width: 100% !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .border, .Card, .CardContent, .pt-6 {
                        border: none !important;
                        padding-top: 0 !important;
                        padding-bottom: 0 !important;
                        margin-top: 0 !important;
                    }
                    .bg-card {
                        background: none !important;
                        padding: 0 !important;
                    }
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        table-layout: auto !important;
                    }
                    th, td {
                        border: 1px solid #ddd !important;
                        padding: 4px 6px !important;
                        font-size: 11px !important;
                        text-align: left !important;
                    }
                    .text-right {
                        text-align: right !important;
                    }
                    th {
                        background-color: #f9fafb !important;
                        -webkit-print-color-adjust: exact;
                        font-weight: bold !important;
                        text-transform: uppercase !important;
                    }
                    .company-name {
                        font-size: 18px !important;
                        line-height: 1.2 !important;
                    }
                    .details-text { 
                        font-size: 11px !important; 
                        line-height: 1.4 !important; 
                    }
                    /* Remove colored badges in print but keep text */
                    .inline-flex.items-center.rounded-full.border {
                        border: none !important;
                        padding: 0 !important;
                        background: transparent !important;
                        color: black !important;
                        font-weight: normal !important;
                        font-size: 11px !important;
                    }
                    
                    .mb-8, .mb-6, .pb-2, .pb-4 {
                        margin-bottom: 0 !important;
                        padding-bottom: 0 !important;
                    }
                    .mt-2, .mt-1 {
                        margin-top: 0 !important;
                    }
                    div:has(> table), .rounded-md.border {
                        margin-top: 0 !important;
                        padding-top: 0 !important;
                        border: none !important;
                    }
                }
            `}} />
        </div>
    );
}
