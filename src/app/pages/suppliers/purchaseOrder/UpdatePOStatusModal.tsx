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
import { useEffect } from "react";
import { useUpdatePurchaseOrderMutation } from "@/store/features/app/purchaseOrder/purchaseOrderApiService";

/* ---------------- TYPES ---------------- */

interface UpdatePOStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedPO: any;
    statusOptions: readonly { value: string; label: string }[];
}

/* ---------------- SCHEMA ---------------- */

const poStatusSchema = z.object({
    status: z.string().min(1, "Status is required"),
    notes: z.string().optional(),
});

type POStatusFormValues = z.infer<typeof poStatusSchema>;

/* ---------------- COMPONENT ---------------- */

export default function UpdatePOStatusModal({
    isOpen,
    onClose,
    selectedPO,
    statusOptions,
}: UpdatePOStatusModalProps) {
    const form = useForm<POStatusFormValues>({
        resolver: zodResolver(poStatusSchema),
        defaultValues: {
            status: "pending",
            notes: "",
        },
    });

    useEffect(() => {
        if (selectedPO) {
            const currentStatus = selectedPO.status || "pending";
            const isStatusAvailable = statusOptions.some(opt => opt.value === currentStatus);

            form.reset({
                status: isStatusAvailable ? currentStatus : "approved",
                notes: selectedPO.notes || "",
            });
        }
    }, [selectedPO, form, statusOptions]);

    const [updatePO, { isLoading }] = useUpdatePurchaseOrderMutation();

    const handleUpdate = async (values: POStatusFormValues) => {
        if (!selectedPO) return;

        try {
            const res = await updatePO({
                id: selectedPO.id,
                body: {
                    status: values.status as any,
                    //notes: values.notes,
                },
            }).unwrap();

            if (res.status) {
                toast.success("Purchase order status updated successfully!");
                onClose();
            } else {
                toast.error(res?.message || "Failed to update status.");
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err?.data?.message || "Failed to update purchase order status.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Update Purchase Order Status</DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(handleUpdate)}>
                    <div className="space-y-4 mt-2">
                        {/* Status */}
                        <div>
                            <label className="block font-semibold mb-1">Status</label>
                            <Select
                                value={form.watch("status")}
                                onValueChange={(v) => form.setValue("status", v)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.status && (
                                <p className="text-sm text-red-500 mt-1">
                                    {form.formState.errors.status.message}
                                </p>
                            )}
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block font-semibold mb-1">Notes</label>
                            <Textarea
                                {...form.register("notes")}
                                placeholder="Add any internal notes..."
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-6 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? "Updating..." : "Update Status"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
