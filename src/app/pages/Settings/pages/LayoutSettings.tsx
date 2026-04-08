import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Separator } from "@/shared/components/ui/separator";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { updatePosLayout } from "@/store/layoutSlice";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { toast } from "sonner";
import {
    useGetLayoutSettingsQuery,
    useUpdateLayoutSettingsMutation
} from "@/store/features/admin/settingsApiService";
import { useEffect } from "react";

/* ------------------ PAGE ------------------ */
export default function LayoutSettings() {
    const dispatch = useAppDispatch();
    const posSettings = useAppSelector((state) => state.layout.pos);

    // API Hooks
    const { data: layoutData, isLoading: isFetching } = useGetLayoutSettingsQuery();
    const [updateLayout, { isLoading: isUpdating }] = useUpdateLayoutSettingsMutation();

    // Sync Redux with API data on load
    useEffect(() => {
        if (layoutData?.data?.pos) {
            dispatch(updatePosLayout(layoutData.data.pos));
        }
    }, [layoutData, dispatch]);

    const handleUpdate = (updates: Partial<typeof posSettings>) => {
        dispatch(updatePosLayout(updates));
    };

    const handleSave = async () => {
        try {
            const res = await updateLayout({ pos: posSettings }).unwrap();
            if (res.status) {
                toast.success(res.message || "Layout settings saved successfully!");
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to save layout settings");
        }
    };

    if (isFetching) {
        return <div className="p-8 text-center">Loading layout settings...</div>;
    }

    return (
        <div className="py-4 px-4 space-y-6 max-w-[700px] w-full">
            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-semibold">Layout Settings</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Customize the appearance and layout of your dashboard and POS.
                </p>
            </div>

            <Separator />

            <div className="space-y-6 text-sm">
                <div>
                    <h3 className="text-lg font-medium mb-4">POS Product Grid</h3>

                    <div className="grid gap-6">
                        {/* Show Images */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="show-images">Product Images</Label>
                                <p className="text-xs text-muted-foreground">
                                    Display product thumbnails in the grid
                                </p>
                            </div>
                            <Switch
                                id="show-images"
                                checked={posSettings.showImages}
                                onCheckedChange={(val) => handleUpdate({ showImages: val })}
                            />
                        </div>

                        <Separator className="opacity-50" />

                        {/* Column Count Desktop */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Grid Columns (Large Desktop)</Label>
                                <p className="text-xs text-muted-foreground">
                                    Number of columns on very wide screens (2xl)
                                </p>
                            </div>
                            <div className="w-[120px]">
                                <Select
                                    value={String(posSettings.columns.xxl)}
                                    onValueChange={(val) => handleUpdate({
                                        columns: { ...posSettings.columns, xxl: Number(val) }
                                    })}
                                >
                                    <SelectTrigger className="h-8">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[2, 3, 4, 5, 6].map(num => (
                                            <SelectItem key={num} value={String(num)}>{num} Columns</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Column Count Tablet/Small Desktop */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Grid Columns (Desktop/Tablet)</Label>
                                <p className="text-xs text-muted-foreground">
                                    Number of columns on standard desktop/laptop (xl-2xl)
                                </p>
                            </div>
                            <div className="w-[120px]">
                                <Select
                                    value={String(posSettings.columns.xl)}
                                    onValueChange={(val) => handleUpdate({
                                        columns: { ...posSettings.columns, xl: Number(val) }
                                    })}
                                >
                                    <SelectTrigger className="h-8">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[2, 3, 4, 5].map(num => (
                                            <SelectItem key={num} value={String(num)}>{num} Columns</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Column Count Mobile */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Grid Columns (Mobile)</Label>
                                <p className="text-xs text-muted-foreground">
                                    Number of columns on mobile devices
                                </p>
                            </div>
                            <div className="w-[120px]">
                                <Select
                                    value={String(posSettings.columns.mobile)}
                                    onValueChange={(val) => handleUpdate({
                                        columns: { ...posSettings.columns, mobile: Number(val) }
                                    })}
                                >
                                    <SelectTrigger className="h-8">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3].map(num => (
                                            <SelectItem key={num} value={String(num)}>{num} Columns</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Separator className="opacity-50" />

                        {/* Grid Gap */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Grid Gap</Label>
                                <p className="text-xs text-muted-foreground">
                                    Spacing between product cards
                                </p>
                            </div>
                            <div className="w-[120px]">
                                <Select
                                    value={String(posSettings.gap)}
                                    onValueChange={(val) => handleUpdate({ gap: Number(val) })}
                                >
                                    <SelectTrigger className="h-8">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2">Compact (2)</SelectItem>
                                        <SelectItem value="3">Standard (3)</SelectItem>
                                        <SelectItem value="4">Relaxed (4)</SelectItem>
                                        <SelectItem value="6">Wide (6)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Card Style */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Card Style</Label>
                                <p className="text-xs text-muted-foreground">
                                    Visual appearance of product items
                                </p>
                            </div>
                            <div className="w-[120px]">
                                <Select
                                    value={posSettings.cardStyle}
                                    onValueChange={(val) => handleUpdate({ cardStyle: val as any })}
                                >
                                    <SelectTrigger className="h-8">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="standard">Standard</SelectItem>
                                        <SelectItem value="bordered">Bordered</SelectItem>
                                        <SelectItem value="compact">Compact</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Checkout Behavior */}
                <div className="space-y-6">
                    <h3 className="text-lg font-medium">Checkout Behavior</h3>
                    <div className="grid gap-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="auto-invoice">Auto-generate Invoice</Label>
                                <p className="text-xs text-muted-foreground">
                                    Automatically create an invoice upon order completion in POS
                                </p>
                            </div>
                            <Switch
                                id="auto-invoice"
                                checked={posSettings.autoGenerateInvoice}
                                onCheckedChange={(val) => handleUpdate({ autoGenerateInvoice: val })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="show-due">Enable Due Sale Button</Label>
                                <p className="text-xs text-muted-foreground">
                                    Show the "Due Invoice" button in POS checkout
                                </p>
                            </div>
                            <Switch
                                id="show-due"
                                checked={posSettings.showDueSale}
                                onCheckedChange={(val) => handleUpdate({ showDueSale: val })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="show-paid">Enable Cash Sale Button</Label>
                                <p className="text-xs text-muted-foreground">
                                    Show the "Complete payment" button in POS checkout
                                </p>
                            </div>
                            <Switch
                                id="show-paid"
                                checked={posSettings.showCashSale}
                                onCheckedChange={(val) => handleUpdate({ showCashSale: val })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Default Payment Method</Label>
                                <p className="text-xs text-muted-foreground">
                                    Typical payment method selected by default
                                </p>
                            </div>
                            <div className="w-[150px]">
                                <Select
                                    value={posSettings.defaultPaymentMethod}
                                    onValueChange={(val) => handleUpdate({ defaultPaymentMethod: val })}
                                >
                                    <SelectTrigger className="h-8">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="bank">Bank Transfer</SelectItem>
                                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* SUBMIT */}
                <div className="pt-4 flex justify-end">
                    <Button
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={isUpdating}
                    >
                        {isUpdating ? "Saving..." : "Save Layout Settings"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
