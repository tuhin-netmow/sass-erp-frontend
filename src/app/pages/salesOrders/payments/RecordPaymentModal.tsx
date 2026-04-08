import {
    Dialog,
    DialogContent,
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
import { CheckCircle2 } from "lucide-react";
import { useAddSalesPaymentMutation } from "@/store/features/app/salesOrder/salesOrder";
import { toast } from "sonner";
import { useAppSelector } from "@/store/store";
import type { SalesInvoice } from "@/shared/types/app/salesInvoice.types";
import { useEffect } from "react";

const paymentSchema = z.object({
    amount: z.any().refine((value) => Number(value) > 0, "Amount must be greater than 0"),
    payment_method: z.string().min(1, "Payment method is required"),
    date: z.string().min(1, "Payment date is required"),
    reference: z.string().optional(),
    notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface RecordPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: SalesInvoice | undefined;
    type?: 'payment' | 'refund';
}

export default function RecordPaymentModal({
    isOpen,
    onClose,
    invoice,
    type = 'payment',
}: RecordPaymentModalProps) {
    const currency = useAppSelector((state) => state.currency.value);
    const [addPayment, { isLoading }] = useAddSalesPaymentMutation();

    const totalAmount =
        Number(invoice?.order?.totalAmount || 0) -
        Number(invoice?.order?.discountAmount || 0) +
        Number(invoice?.order?.taxAmount || 0);

    const paidAmount =
        invoice?.payments?.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0) || 0;

    const remainingBalance = totalAmount - paidAmount;

    const isRefund = type === 'refund';

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            amount: isRefund ? paidAmount : (remainingBalance > 0 ? remainingBalance : 0),
            payment_method: "",
            date: new Date().toISOString().split("T")[0],
            reference: "",
            notes: "",
        },
    });

    // Reset form when type changes
    useEffect(() => {
        if (isOpen) {
            form.setValue('amount', isRefund ? paidAmount : (remainingBalance > 0 ? remainingBalance : 0));
        }
    }, [type, isOpen, paidAmount, remainingBalance, isRefund, form]);

    async function onSubmit(values: PaymentFormValues) {
        if (!invoice) return;

        const payload: Record<string, any> = {
            order_id: invoice.order?._id,
            invoice_id: invoice.id || invoice._id,
            amount: isRefund ? -Number(values.amount) : Number(values.amount),
            payment_method: values.payment_method.toLowerCase(),
            customer_id: invoice.order?.customerId,
            date: values.date,
        };

        if (values.reference) payload.reference = values.reference;
        if (values.notes) payload.notes = values.notes;

        try {
            const res = await addPayment(payload).unwrap();

            if (res.status) {
                toast.success(res.message || "Payment recorded successfully!");
                form.reset();
                onClose();
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Error recording payment");
        }
    }

    const watchAmount = form.watch("amount");

    // Validation Logic
    const maxAmount = isRefund ? paidAmount : remainingBalance;
    const isAmountInvalid =
        !watchAmount ||
        isNaN(Number(watchAmount)) ||
        Number(watchAmount) <= 0 ||
        Number(watchAmount) > maxAmount;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">{isRefund ? 'Record Refund' : 'Record Payment'}</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Invoice #{invoice?.invoiceNumber} - {invoice?.order?.customer?.name}
                    </p>
                </DialogHeader>

                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg mb-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <span className="text-muted-foreground">Invoice Total:</span>
                            <p className="font-semibold">
                                {currency} {totalAmount.toFixed(2)}
                            </p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Paid Amount:</span>
                            <p className="font-semibold text-green-600">
                                {currency} {paidAmount.toFixed(2)}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <span className="text-muted-foreground">{isRefund ? 'Refundable Amount:' : 'Remaining Balance:'}</span>
                            <p className={`font-bold text-lg ${isRefund ? 'text-orange-600' : 'text-red-600'}`}>
                                {currency} {isRefund ? paidAmount.toFixed(2) : remainingBalance.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* AMOUNT */}
                            <FormField
                                name="amount"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Amount ({currency}) <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="Enter amount"
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    const raw = e.target.value;
                                                    if (raw === "") {
                                                        form.clearErrors("amount");
                                                        field.onChange("");
                                                        return;
                                                    }

                                                    const value = Number(raw);
                                                    if (isNaN(value)) return;

                                                    const limit = isRefund ? paidAmount : remainingBalance;

                                                    if (value > limit) {
                                                        form.setError("amount", {
                                                            type: "manual",
                                                            message: `Amount cannot exceed ${isRefund ? 'refundable amount' : 'remaining balance'} (${currency} ${limit.toFixed(2)})`,
                                                        });
                                                    } else {
                                                        form.clearErrors("amount");
                                                    }

                                                    field.onChange(raw);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* PAYMENT METHOD */}
                            <FormField
                                control={form.control}
                                name="payment_method"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Payment Method <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Method" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="cash">Cash</SelectItem>
                                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                <SelectItem value="credit_card">Credit Card</SelectItem>
                                                <SelectItem value="cheque">Cheque</SelectItem>
                                                <SelectItem value="online">Online</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* PAYMENT DATE */}
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Payment Date <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* REFERENCE */}
                            <FormField
                                control={form.control}
                                name="reference"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reference Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Cheque #, Transaction ID" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* NOTES */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Additional payment notes..."
                                            className="h-20"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* BUTTONS */}
                        <div className="flex items-center gap-3 pt-4">
                            <Button
                                type="submit"
                                disabled={isAmountInvalid || isLoading}
                                className={`flex-1 gap-2 ${isRefund ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                {isRefund ? 'Record Refund' : 'Record Payment'}
                            </Button>
                            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
