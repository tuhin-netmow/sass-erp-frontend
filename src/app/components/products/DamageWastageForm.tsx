import { Input } from "@/shared/components/ui/input";
import { Form } from "@/shared/components/ui/form";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/shared/components/ui/sheet";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/button";
import { useUpdateStockMutation } from "@/store/features/admin/productsApiService";
import { toast } from "sonner";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { ShieldAlert, Trash2, CheckCircle2 } from "lucide-react";
import type { Product } from "@/shared/types";
import { useEffect } from "react";
import z from "zod";
import { Textarea } from "@/shared/components/ui/textarea";
import { ACTIONS, MODULES } from "@/app/config/permissions";
import { perm, usePermissions } from "@/shared/hooks/usePermissions";

const wastageFormSchema = z.object({
    product_id: z.string().min(1, "Required"),
    current_stock: z.number().min(0, "Current stock must be 0 or more"),
    quantity: z.number().min(1, "Wastage quantity must be greater than 0"),
    date: z.string().min(1, "Required"),
    notes: z.string().min(1, "Reason for wastage is required"),
}).refine((data) => data.quantity <= data.current_stock, {
    message: "Wastage quantity cannot exceed current stock",
    path: ["quantity"],
});

type WastageFormValues = z.infer<typeof wastageFormSchema>;

export default function DamageWastageForm({
    open,
    setOpen,
    products,
    refetchProducts,
    initialProductId,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    products?: Product[];
    refetchProducts?: () => void;
    initialProductId?: string;
}) {
    const { hasPermission, isAdmin } = usePermissions();
    const canUpdateStock = isAdmin || hasPermission(perm(MODULES.PRODUCTS, ACTIONS.UPDATE));

    const form = useForm<WastageFormValues>({
        resolver: zodResolver(wastageFormSchema),
        defaultValues: {
            product_id: "",
            current_stock: 0,
            quantity: 0,
            date: new Date().toISOString().split("T")[0],
            notes: "",
        },
    });

    const { control, setValue, reset } = form;

    // Set initial product if provided
    useEffect(() => {
        if (open && initialProductId) {
            setValue("product_id", initialProductId);
        } else if (open && !initialProductId) {
            reset({
                product_id: "",
                current_stock: 0,
                quantity: 0,
                date: new Date().toISOString().split("T")[0],
                notes: "",
            });
        }
    }, [open, initialProductId, setValue, reset]);

    const selectedProductId = useWatch({
        control,
        name: "product_id",
    });

    const selectedProduct = products?.find(
        (p) => p._id === selectedProductId
    );

    useEffect(() => {
        if (selectedProduct) {
            setValue("current_stock", selectedProduct.stockQuantity || 0);
        } else {
            setValue("current_stock", 0);
        }
    }, [selectedProduct, setValue]);

    const [updateStock] = useUpdateStockMutation();

    const onSubmit = async (values: WastageFormValues) => {
        if (!selectedProduct) {
            toast.error("Please select a valid product");
            return;
        }

        if (values.quantity > selectedProduct.stockQuantity) {
            toast.error("Wastage quantity cannot exceed current stock");
            return;
        }

        const payload = {
            id: selectedProduct._id as any,
            body: {
                quantity: Number(values.quantity),
                operation: "subtract",
                movement_type: "waste",
                date: values.date,
                notes: values.notes,
            },
        };

        try {
            const res = await updateStock(payload).unwrap();
            if (res.status) {
                toast.success("Damage/Wastage recorded successfully");
                refetchProducts?.();
                setOpen(false);
                form.reset();
            } else {
                toast.error("Failed to record wastage: " + res.message);
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to record wastage");
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Trash2 className="w-5 h-5 text-rose-500" />
                        Record Damage / Wastage
                    </SheetTitle>
                </SheetHeader>

                <div className="p-4 max-h-[90vh] overflow-y-auto">
                    {!canUpdateStock ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                            <ShieldAlert className="w-10 h-10 text-destructive" />
                            <h2 className="text-lg font-semibold">Access Denied</h2>
                            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
                        </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <Field>
                                    <FieldLabel>Product Name</FieldLabel>
                                    <Input
                                        value={selectedProduct?.name || "No product selected"}
                                        disabled
                                        className="bg-muted font-medium text-foreground border-border"
                                    />
                                </Field>

                                <Controller
                                    control={control}
                                    name="current_stock"
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel>Current Stock</FieldLabel>
                                            <Input type="number" {...field} disabled />
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="quantity"
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Wastage Quantity</FieldLabel>
                                            <Input
                                                type="number"
                                                placeholder="Enter quantity"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                            />
                                            <FieldError>{fieldState.error?.message}</FieldError>
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="date"
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Date</FieldLabel>
                                            <Input type="date" {...field} />
                                            <FieldError>{fieldState.error?.message}</FieldError>
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="notes"
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Reason / Damage Details</FieldLabel>
                                            <Textarea placeholder="Describe the damage..." {...field} />
                                            <FieldError>{fieldState.error?.message}</FieldError>
                                        </Field>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 py-6 font-semibold text-white shadow-lg shadow-rose-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-rose-500/40 active:translate-y-0 active:shadow-none"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span>Report Damage</span>
                                </Button>
                            </form>
                        </Form>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
