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
import { CheckCircle2, CreditCard, Calendar, DollarSign } from "lucide-react";
import { useAddRawMaterialPaymentMutation } from "@/store/features/admin/rawMaterialApiService";
import { toast } from "sonner";
import { useAppSelector } from "@/store/store";

import { useEffect } from "react";
import type { RawMaterialInvoice } from "@/shared";

const paymentSchema = z.object({
    amount: z.any().refine((value) => Number(value) > 0, "Amount must be greater than 0"),
    paymentMethod: z.string().min(1, "Payment method is required"),
    paymentDate: z.string().min(1, "Payment date is required"),
    referenceNumber: z.string().optional(),
    notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface RecordRawMaterialPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: RawMaterialInvoice | undefined;
}

export default function RecordRawMaterialPaymentModal({
    isOpen,
    onClose,
    invoice,
}: RecordRawMaterialPaymentModalProps) {
    const currency = useAppSelector((state) => state.currency.value);
    const [addPayment, { isLoading }] = useAddRawMaterialPaymentMutation();

    // Calculate total amount from invoice or purchase order
    // total_payable_amount = totalAmount + tax_amount - discount_amount
    const poTotalAmount = Number(invoice?.purchaseOrder?.totalAmount || 0);
    const poTaxAmount = Number(invoice?.purchaseOrder?.taxAmount || 0);
    const poDiscountAmount = Number(invoice?.purchaseOrder?.discountAmount || 0);
    const calculatedTotal = poTotalAmount + poTaxAmount - poDiscountAmount;

    const totalAmount = Number(
        invoice?.totalPayableAmount ||
        invoice?.totalAmount ||
        calculatedTotal ||
        invoice?.purchaseOrder?.totalAmount ||
        0
    );
    const paidAmount = Number(invoice?.paidAmount || 0);
    const remainingBalance = totalAmount - paidAmount;

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            amount: remainingBalance > 0 ? remainingBalance : 0,
            paymentMethod: "cash",
            paymentDate: new Date().toISOString().split("T")[0],
            referenceNumber: "",
            notes: "",
        },
    });

    useEffect(() => {
        if (isOpen && invoice) {
            form.reset({
                amount: remainingBalance > 0 ? remainingBalance : 0,
                paymentMethod: "cash",
                paymentDate: new Date().toISOString().split("T")[0],
                referenceNumber: "",
                notes: "",
            });
        }
    }, [isOpen, invoice, remainingBalance, form]);

    async function onSubmit(values: PaymentFormValues) {
        if (!invoice) return;

        const payload = {
            purchaseOrderId: invoice.purchaseOrderId,
            invoiceId: invoice.id!,
            amount: Number(values.amount),
            paymentMethod: values.paymentMethod,
            referenceNumber: values.referenceNumber,
            notes: values.notes,
            paymentDate: values.paymentDate,
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
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <CreditCard className="h-6 w-6 text-indigo-600" />
                        Record Payment
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Invoice #{invoice?.invoiceNumber} - {invoice?.purchaseOrder?.supplier?.name}
                    </p>
                </DialogHeader>

                {/* Invoice Summary Card */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-5 rounded-xl border border-indigo-200 dark:border-indigo-800">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total</p>
                            <p className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                {currency} {totalAmount.toFixed(2)}
                            </p>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Paid</p>
                            <p className="font-bold text-lg text-emerald-600">
                                {currency} {paidAmount.toFixed(2)}
                            </p>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Balance</p>
                            <p className="font-bold text-lg text-amber-600">
                                {currency} {remainingBalance.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* AMOUNT */}
                            <FormField
                                name="amount"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" />
                                            Amount ({currency}) <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="Enter amount"
                                                className="text-lg font-semibold"
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
                                                <SelectItem value="online">Online Payment</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* PAYMENT DATE */}
                            <FormField
                                control={form.control}
                                name="paymentDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
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
                                name="referenceNumber"
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
                                            className="h-24"
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
                                className="flex-1 gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
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
