/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useAppSelector } from "@/store/store";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
    useAddSalesReturnPaymentMutation,
    useGetAllSalesReturnsQuery,
    useGetSalesReturnByIdQuery
} from "@/store/features/app/salesOrder/salesReturnApiService";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/shared/components/ui/command";
import { Button } from "@/shared/components/ui/button";

const paymentSchema = z.object({
    salesReturnId: z.union([z.string(), z.number()]).refine(val => !!val, "Required"),
    amount: z.number().min(0.01, "Required"),
    paymentMethod: z.string().min(1, "Required"),
    paymentDate: z.string().optional(),
    reference: z.string().optional(),
    notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultReturnId?: string | number | null;
    onSuccess?: () => void;
}

export default function RecordSalesReturnRefundModal({ open, onOpenChange, defaultReturnId, onSuccess }: Props) {
    const currency = useAppSelector((state) => state.currency.value);
    const [addPayment, { isLoading: isSubmitting }] = useAddSalesReturnPaymentMutation();

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            salesReturnId: defaultReturnId || "",
            amount: undefined,
            paymentMethod: "",
            reference: "",
            notes: "",
            paymentDate: new Date().toISOString().split('T')[0],
        },
    });

    // Update default form value when defaultReturnId changes
    useEffect(() => {
        if (defaultReturnId) {
            form.setValue("salesReturnId", defaultReturnId);
        }
    }, [defaultReturnId, form]);

    const watchReturnId = form.watch("salesReturnId");
    const watchAmount = form.watch("amount");

    const { data: returnData } = useGetSalesReturnByIdQuery(watchReturnId, { skip: !watchReturnId });
    const returnDetails = Array.isArray(returnData?.data) ? returnData?.data[0] : returnData?.data;

    const totalVal = Number(returnDetails?.grandTotal || returnDetails?.grand_total || 0);
    const paidVal = Number(returnDetails?.totalRefundedAmount || returnDetails?.total_refunded_amount || 0);
    const balanceVal = totalVal - paidVal;

    async function onSubmit(values: PaymentFormValues) {
        try {
            await addPayment({
                salesReturnId: values.salesReturnId,
                amount: Number(values.amount),
                paymentMethod: values.paymentMethod,
                reference: values.reference || undefined,
                notes: values.notes || undefined,
                paymentDate: values.paymentDate
            }).unwrap(); 
            toast.success("Refund Recorded Successfully!");
            onOpenChange(false);
            form.reset();
            if (onSuccess) onSuccess();
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to record refund.");
        }
    }

    const SalesReturnSelectField = ({ field }: { field: any }) => {
        const [openCombobox, setOpenCombobox] = useState(false);
        const [query, setQuery] = useState("");
        const { data, isLoading } = useGetAllSalesReturnsQuery({ page: 1, limit: 10, search: query }, { skip: !!defaultReturnId });

        if (defaultReturnId) return null; // Hide selector if default ID is set, handled in header

        const list = Array.isArray(data?.data) ? data.data : [];
        const selected = list.find((r: any) => (r.id || r._id) === field.value) || ((returnDetails?.id || returnDetails?._id) === field.value ? returnDetails : null);

        return (
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                    <Button className="w-full justify-between px-3 text-left font-normal h-9" variant="outline">
                        {selected ? (selected.returnNumber || selected.return_number || `RET-${selected.id || selected._id}`) : "Select Sales Return..."}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput placeholder="Search Returns..." onValueChange={setQuery} />
                        <CommandList>
                            <CommandEmpty>No returns found.</CommandEmpty>
                            <CommandGroup>
                                {isLoading && <div className="py-2 px-3 text-xs text-muted-foreground">Loading...</div>}
                                {!isLoading && list.map((r: any) => (
                                    <CommandItem key={r.id || r._id} onSelect={() => { field.onChange(r.id || r._id); setOpenCombobox(false); }}>
                                        <div className="flex flex-col text-left w-full">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-sm">{r?.returnNumber || r?.return_number || `RET-${r.id || r._id}`}</span>
                                                <span className="text-xs font-medium text-slate-500">{r?.customer?.name}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground mt-0.5">Balance: {currency} {(Number(r?.grandTotal || r?.grand_total || 0) - Number(r?.totalRefundedAmount || r?.total_refunded_amount || 0)).toFixed(2)}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl">
                <div className="p-6 pb-2">
                    <DialogHeader className="text-left space-y-1">
                        <DialogTitle className="text-2xl font-bold tracking-tight">Record Refund</DialogTitle>
                        <DialogDescription className="text-base text-muted-foreground">
                            {returnDetails
                                ? `${returnDetails.returnNumber || returnDetails.return_number || `RET-${watchReturnId}`} - ${returnDetails.customer?.name || 'Unknown Customer'}`
                                : "Select a return invoice to record refund"}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="px-6 pb-6 space-y-6">
                    {/* Summary Card */}
                    {returnDetails && (
                        <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100/50 grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground font-medium">Return Total:</p>
                                <p className="text-lg font-bold text-slate-900">{currency} {totalVal.toFixed(2)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground font-medium">Refunded:</p>
                                <p className="text-lg font-bold text-green-600">{currency} {paidVal.toFixed(2)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground font-medium">Balance:</p>
                                <p className="text-lg font-bold text-red-600">{currency} {balanceVal.toFixed(2)}</p>
                            </div>
                        </div>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            {!defaultReturnId && (
                                <FormField name="salesReturnId" control={form.control} render={({ field }) => (
                                    <FormItem className="text-left">
                                        <FormLabel>Select Sales Return <span className="text-red-500">*</span></FormLabel>
                                        <FormControl><SalesReturnSelectField field={field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FormField name="amount" control={form.control} render={({ field }) => (
                                    <FormItem className="text-left space-y-1.5">
                                        <FormLabel className="font-semibold text-slate-700">Amount ({currency}) <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                className="font-medium h-11"
                                                placeholder="0.00"
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    if (val > balanceVal) form.setError("amount", { message: `Max: ${currency} ${balanceVal.toFixed(2)}` });
                                                    else form.clearErrors("amount");
                                                    field.onChange(val || undefined);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField name="paymentMethod" control={form.control} render={({ field }) => (
                                    <FormItem className="text-left space-y-1.5">
                                        <FormLabel className="font-semibold text-slate-700">Payment Method <span className="text-red-500">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-11">
                                                    <SelectValue placeholder="Select Method" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="cash">Cash</SelectItem>
                                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                <SelectItem value="credit_card">Credit Card</SelectItem>
                                                <SelectItem value="cheque">Cheque</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FormField name="paymentDate" control={form.control} render={({ field }) => (
                                    <FormItem className="text-left space-y-1.5">
                                        <FormLabel className="font-semibold text-slate-700">Payment Date <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input type="date" className="h-11 block w-full" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField name="reference" control={form.control} render={({ field }) => (
                                    <FormItem className="text-left space-y-1.5">
                                        <FormLabel className="font-semibold text-slate-700">Reference Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Cheque #, Transaction ID" className="h-11" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <FormField name="notes" control={form.control} render={({ field }) => (
                                <FormItem className="text-left space-y-1.5">
                                    <FormLabel className="font-semibold text-slate-700">Notes</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Additional payment notes..." className="min-h-[100px] resize-none" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <div className="flex gap-3 pt-4 border-t mt-6">
                                <Button
                                    type="submit"
                                    disabled={!watchReturnId || !watchAmount || watchAmount > balanceVal || isSubmitting}
                                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white h-12 text-base font-medium rounded-lg shadow-sm"
                                >
                                    {isSubmitting ? "Saving..." : "Record Refund"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    className="flex-1 border-slate-200 h-12 text-base font-medium rounded-lg hover:bg-slate-50 text-slate-700"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
