
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/shared/components/ui/dialog";
import { Textarea } from "@/shared/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { useEffect, } from "react";
import { useUpdateSalesOrderStatusMutation } from "@/store/features/app/salesOrder/salesOrder";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";


/* ---------------- TYPES ---------------- */

// export interface StatusOption {
//     value: string;
//     label: string;
// }

interface UpdateDeliveryStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedOrder: any;
    statusOptions: readonly { value: DeliveryFormValues["status"]; label: string }[];
    defaultStatus?: DeliveryFormValues["status"];
    title?: string;
    dateLabel?: string;
}

/* ---------------- SCHEMA ---------------- */

const deliverySchema = z
    .object({
        status: z.enum([
            "pending",
            "in_transit",
            "delivered",
            "failed",
            "returned",
            "confirmed",
            "cancelled",
        ]),
        deliveryDate: z.string().optional(),
        notes: z.string().optional(),
    })
    .refine(
        (data) => {
            const requiredStatuses = [
                "pending",
                "in_transit",
                "delivered",
                "failed",
                "returned",
                "confirmed",
                "cancelled",
            ];
            if (requiredStatuses.includes(data.status)) {
                return !!data.deliveryDate;
            }
            return true;
        },
        {
            path: ["deliveryDate"],
            message: "Delivery date is required for this status",
        }
    );

type DeliveryFormValues = z.infer<typeof deliverySchema>;

/* ---------------- COMPONENT ---------------- */

export default function UpdateDeliveryStatusModal({
    isOpen,
    onClose,
    selectedOrder,
    statusOptions,
    defaultStatus,
    title = "Update Status",
    dateLabel = "Tracking Date",
}: UpdateDeliveryStatusModalProps) {
    const form = useForm<DeliveryFormValues>({
        resolver: zodResolver(deliverySchema),
        defaultValues: {
            status: "pending",
            deliveryDate: "",
            notes: "",
        },
    });

    useEffect(() => {
        if (selectedOrder) {
            const today = new Date().toISOString().split("T")[0];
            // const existingDate = selectedOrder.delivery?.deliveryDate
            //     ? new Date(selectedOrder.delivery.deliveryDate)
            //         .toISOString()
            //         .split("T")[0]
            //     : today;
            const existingDate = today;

            form.reset({
                status: defaultStatus || selectedOrder.delivery_status || "pending",
                deliveryDate: existingDate,
                notes: selectedOrder.delivery?.notes || "",
            });
        }
    }, [selectedOrder, form, defaultStatus]);

    const [updateOrder] = useUpdateSalesOrderStatusMutation();

    const handleUpdate = async (values: DeliveryFormValues) => {
        if (!selectedOrder) return;

        try {
            const payload = {
                status: values.status,
                deliveryDate: values.deliveryDate || undefined,
                notes: values.notes,
            };

            await updateOrder({
                orderId: selectedOrder.id,
                orderData: payload,
            }).unwrap();

            toast.success("Order updated successfully!");
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update order.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(handleUpdate)}>
                    <div className="space-y-4 mt-2">
                        {/* Status */}
                        <div>
                            <label className="block font-semibold mb-1">Status</label>
                            <Select
                                value={form.watch("status")}
                                onValueChange={(v) =>
                                    form.setValue("status", v as DeliveryFormValues["status"])
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block font-semibold mb-1">
                                {dateLabel}
                                {["in_transit", "delivered", "confirmed"].includes(
                                    form.watch("status")
                                ) && <span className="text-red-500 ml-1">*</span>}
                            </label>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal border-gray-200 dark:border-gray-800",
                                            !form.watch("deliveryDate") && "text-muted-foreground"
                                        )}
                                    >
                                        {form.watch("deliveryDate") ? (
                                            format(new Date(form.watch("deliveryDate")!), "dd/MM/yyyy")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={form.watch("deliveryDate") ? new Date(form.watch("deliveryDate")!) : undefined}
                                        onSelect={(date) => {
                                            if (date) {
                                                form.setValue("deliveryDate", format(date, "yyyy-MM-dd"));
                                            }
                                        }}
                                        disabled={(date) => date < new Date("1900-01-01")}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>

                            {form.formState.errors.deliveryDate && (
                                <p className="text-sm text-red-500 mt-1">
                                    {form.formState.errors.deliveryDate.message}
                                </p>
                            )}
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block font-semibold mb-1">Notes</label>
                            <Textarea {...form.register("notes")} />
                        </div>
                    </div>

                    <DialogFooter className="mt-4 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={form.formState.isSubmitting}
                        >
                            Update
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
