/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
import { Button } from "@/shared/components/ui/button";
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
import { ChevronLeft } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
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

import { toast } from "sonner";
import { useAppSelector } from "@/store/store";
import {
    useAddSalesReturnPaymentMutation,
    useGetAllSalesReturnsQuery,
    useGetSalesReturnByIdQuery
} from "@/store/features/app/salesOrder/salesReturnApiService";

const paymentSchema = z.object({
    sales_return_id: z.number().min(1, "Required"),
    amount: z.number().min(0.01, "Required"),
    payment_method: z.string().min(1, "Required"),
    reference: z.string().optional(),
    notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function CreateSalesReturnPayment() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnNumberParam = searchParams.get("rn");
    const [addPayment] = useAddSalesReturnPaymentMutation();

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            sales_return_id: 0,
            amount: undefined,
            payment_method: "",
            reference: "",
            notes: "",
        },
    });

    const currency = useAppSelector((state) => state.currency.value);

    const SalesReturnSelectField = ({ field }: { field: any }) => {
        const [open, setOpen] = useState(false);
        const [query, setQuery] = useState(returnNumberParam || "");
        const { data, isLoading } = useGetAllSalesReturnsQuery({ page: 1, limit: 10, search: query });
        const list = Array.isArray(data?.data) ? data.data : [];

        useEffect(() => {
            if (!field.value && list.length > 0 && returnNumberParam) {
                const ret = list.find((r: any) => r.orderNumber === returnNumberParam);
                if (ret) field.onChange(ret.id);
            }
        }, [list, field]);

        const selected = list.find((r: any) => r.id === field.value);

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button className="w-full justify-between px-3 text-left font-normal h-9" variant="outline">
                        {selected ? (selected.return_number || `RET-${selected.id}`) : "Select Sales Return..."}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput placeholder="Search Returns..." onValueChange={setQuery} />
                        <CommandList>
                            <CommandEmpty>No returns found.</CommandEmpty>
                            <CommandGroup>
                                {isLoading && <div className="py-2 px-3 text-xs text-muted-foreground">Loading...</div>}
                                {!isLoading && list.map((r: any) => (
                                    <CommandItem key={r.id} onSelect={() => { field.onChange(r.id); setOpen(false); }}>
                                        <div className="flex flex-col text-left">
                                            <span className="font-bold text-sm">{r?.return_number || `RET-${r.id}`}</span>
                                            <span className="text-xs text-muted-foreground">Balance: {currency} {(Number(r?.grand_total || 0) - Number(r?.total_refunded_amount || 0)).toFixed(2)}</span>
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

    async function onSubmit(values: PaymentFormValues) {
        try {
            await addPayment({
                sales_return_id: values.sales_return_id,
                paymentMethod: values.payment_method,
                notes: values.notes || undefined,
            }).unwrap();
            toast.success("Refund Recorded Successfully!");
            navigate("/dashboard/sales/returns/payments");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to record refund.");
        }
    }

    const watchReturnId = form.watch("sales_return_id");
    const watchAmount = form.watch("amount");

    const { data: returnData } = useGetSalesReturnByIdQuery(watchReturnId, { skip: !watchReturnId });
    const returnDetails = Array.isArray(returnData?.data) ? returnData?.data[0] : returnData?.data;

    const totalVal = Number(returnDetails?.grand_total || 0);
    const paidVal = Number(returnDetails?.total_refunded_amount || 0);
    const balanceVal = totalVal - paidVal;

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-2 text-left">
                <Link to="/dashboard/sales/returns/payments"><Button variant="outline" size="sm" className="gap-2"><ChevronLeft size={16} /> Back to Refunds</Button></Link>
            </div>

            <h1 className="text-2xl font-bold text-blue-700 text-left">Record Sales Return Refund</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-xl border p-6 bg-white shadow-sm text-left">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900">Refund Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField name="sales_return_id" control={form.control} render={({ field }) => (
                                    <FormItem className="text-left"><FormLabel>Sales Return</FormLabel><FormControl><SalesReturnSelectField field={field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField name="amount" control={form.control} render={({ field }) => (
                                    <FormItem className="text-left"><FormLabel>Amount ({currency})</FormLabel><FormControl>
                                        <Input type="number" step="0.01" placeholder="0.00" value={field.value ?? ""} onChange={(e) => {
                                            const val = Number(e.target.value);
                                            if (val > balanceVal) form.setError("amount", { message: `Amount cannot exceed balance (${currency} ${balanceVal.toFixed(2)})` });
                                            else form.clearErrors("amount");
                                            field.onChange(val || undefined);
                                        }} />
                                    </FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField name="payment_method" control={form.control} render={({ field }) => (
                                    <FormItem className="text-left"><FormLabel>Payment Method</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Method" /></SelectTrigger></FormControl><SelectContent><SelectItem value="cash">Cash</SelectItem><SelectItem value="bank_transfer">Bank Transfer</SelectItem><SelectItem value="credit_card">Credit Card</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                )} />
                                <FormField name="reference" control={form.control} render={({ field }) => (
                                    <FormItem className="text-left"><FormLabel>Reference</FormLabel><FormControl><Input placeholder="Ref #" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField name="notes" control={form.control} render={({ field }) => (
                                    <FormItem className="md:col-span-2 text-left"><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="..." className="h-24" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" disabled={!watchReturnId || !watchAmount || watchAmount > balanceVal} className="bg-blue-600 hover:bg-blue-700 text-white px-8">Record Refund</Button>
                                <Button type="button" variant="outline" onClick={() => form.reset()}>Cancel</Button>
                            </div>
                        </form>
                    </Form>
                </div>

                <div className="rounded-xl border bg-slate-50 shadow-sm overflow-hidden sticky top-6">
                    <div className="bg-blue-600 p-4 text-white text-left font-bold tracking-tight">Refund Summary</div>
                    <div className="p-6 space-y-4 text-left">
                        {returnDetails ? (
                            <>
                                <div className="space-y-3 pb-4 border-b">
                                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Return #</span><span className="font-bold">{returnDetails.orderNumber}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{currency} {Number(returnDetails.totalAmount).toFixed(2)}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax</span><span>{currency} {Number(returnDetails.taxAmount).toFixed(2)}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-muted-foreground text-red-500">Discount</span><span className="text-red-500">- {currency} {Number(returnDetails.discountAmount).toFixed(2)}</span></div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center"><span className="font-bold">Total Refundable</span><span className="font-black text-lg text-blue-600">{currency} {totalVal.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-sm text-green-600 font-medium"><span>Already Refunded</span><span>{currency} {paidVal.toFixed(2)}</span></div>
                                    <div className="bg-white p-4 rounded-lg border shadow-sm mt-3">
                                        <p className="text-xs text-muted-foreground uppercase font-bold mb-1 tracking-wider">Remaining Balance</p>
                                        <p className="text-2xl font-black text-red-600">{currency} {balanceVal.toFixed(2)}</p>
                                    </div>
                                </div>
                                {watchAmount > 0 && (
                                    <div className="pt-4 border-t space-y-2">
                                        <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">New Entry</h3>
                                        <div className="flex justify-between text-sm"><span>Amount</span><span className="font-bold">{currency} {Number(watchAmount).toFixed(2)}</span></div>
                                        <div className="flex justify-between text-sm"><span>Balance after</span><span className="font-bold text-blue-600">{currency} {(balanceVal - Number(watchAmount)).toFixed(2)}</span></div>
                                    </div>
                                )}
                            </>
                        ) : <div className="py-10 text-center text-muted-foreground italic">Select a sales return to see financial breakdown.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
