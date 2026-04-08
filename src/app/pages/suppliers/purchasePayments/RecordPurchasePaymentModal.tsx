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
import { useAddPurchasePaymentMutation } from "@/store/features/app/purchaseOrder/purchaseOrderApiService";
import { toast } from "sonner";
import { useAppSelector } from "@/store/store";
import type { PurchaseInvoice } from "@/shared/types/app/PurchaseInvoice.types";
import { useEffect } from "react";

const paymentSchema = z.object({
    amount: z.any().refine((value) => Number(value) > 0, "Amount must be greater than 0"),
    paymentMethod: z.string().min(1, "Payment method is required"),
    date: z.string().min(1, "Payment date is required"),
    reference: z.string().optional(),
    notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface RecordPurchasePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: PurchaseInvoice | undefined;
}

export default function RecordPurchasePaymentModal({
    isOpen,
    onClose,
    invoice,
}: RecordPurchasePaymentModalProps) {
    const currency = useAppSelector((state) => state.currency.value);
    const [addPayment, { isLoading }] = useAddPurchasePaymentMutation();

    const totalAmount = invoice?.totalPayableAmount || 0;
    const paidAmount = invoice?.paidAmount || 0;
    const remainingBalance = totalAmount - paidAmount;

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            amount: remainingBalance > 0 ? remainingBalance : 0,
            paymentMethod: "cash",
            date: new Date().toISOString().split("T")[0],
            reference: "",
            notes: "",
        },
    });

    useEffect(() => {
        if (isOpen && invoice) {
            form.reset({
                amount: remainingBalance > 0 ? remainingBalance : 0,
                paymentMethod: "cash",
                date: new Date().toISOString().split("T")[0],
                reference: "",
                notes: "",
            });
        }
    }, [isOpen, invoice, remainingBalance, form]);

    async function onSubmit(values: PaymentFormValues) {
        if (!invoice) return;

        const payload = {
            purchase_order_id: invoice.purchaseOrderId,
            amount: Number(values.amount),
            payment_method: values.paymentMethod.toLowerCase(),
            reference: values.reference || undefined,
            notes: values.notes || undefined,
            date: values.date,
        };

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

    const isAmountInvalid =
        !watchAmount ||
        isNaN(Number(watchAmount)) ||
        Number(watchAmount) <= 0 ||
        Number(watchAmount) > remainingBalance;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Record Purchase Payment</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Invoice #{invoice?.invoiceNumber} - {invoice?.purchaseOrder?.supplier?.name}
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
                            <span className="text-muted-foreground">Remaining Balance:</span>
                            <p className="font-bold text-lg text-red-600">
                                {currency} {remainingBalance.toFixed(2)}
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
                                                {...field}
                                                onChange={(e) => {
                                                    const raw = e.target.value;
                                                    if (raw === "") {
                                                        form.clearErrors("amount");
                                                        field.onChange("");
                                                        return;
                                                    }

                                                    const value = Number(raw);
                                                    if (isNaN(value)) return;

                                                    if (value > remainingBalance) {
                                                        form.setError("amount", {
                                                            type: "manual",
                                                            message: `Amount cannot exceed remaining balance (${currency} ${remainingBalance.toFixed(2)})`,
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
                                name="paymentMethod"
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
                                className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                {isLoading ? "Recording..." : "Record Payment"}
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
