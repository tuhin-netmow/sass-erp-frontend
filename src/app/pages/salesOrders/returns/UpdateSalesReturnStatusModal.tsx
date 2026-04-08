import { Button } from "@/shared/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/shared/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { useUpdateSalesReturnStatusMutation } from "@/store/features/app/salesOrder/salesReturnApiService";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface UpdateSalesReturnStatusModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    salesReturn: any;
}

export default function UpdateSalesReturnStatusModal({
    open,
    onOpenChange,
    salesReturn,
}: UpdateSalesReturnStatusModalProps) {
    const [status, setStatus] = useState<string>("");
    const [notes, setNotes] = useState<string>("");
    const [updateStatus, { isLoading }] = useUpdateSalesReturnStatusMutation();

    useEffect(() => {
        if (salesReturn) {
            setStatus(salesReturn.status);
            setNotes(salesReturn.notes || "");
        }
    }, [salesReturn]);

    const handleUpdate = async () => {
        if (!salesReturn) return;

        try {
            await updateStatus({
                id: salesReturn.id,
                status: status,
                notes: notes,
            }).unwrap();

            toast.success("Sales return status updated successfully");
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to update status");
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Return Status</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select
                            value={status}
                            onValueChange={setStatus}
                            disabled={salesReturn?.status === 'returned' || salesReturn?.status === 'cancelled'}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="returned">Returned</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                        {salesReturn?.status === 'returned' && (
                            <p className="text-xs text-yellow-600">
                                This return is already completed/returned and cannot be changed.
                            </p>
                        )}
                        {salesReturn?.status === 'cancelled' && (
                            <p className="text-xs text-red-600">
                                This return is cancelled and cannot be changed.
                            </p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Notes</label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add notes about this status update..."
                            className="resize-none"
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpdate}
                        disabled={isLoading || (status === salesReturn?.status && notes === (salesReturn?.notes || "")) || salesReturn?.status === 'returned' || salesReturn?.status === 'cancelled'}
                    >
                        {isLoading ? "Updating..." : "Update Status"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
