"use client";

import { useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useGetNumberingSequencesQuery, useUpdateNumberingSequencesMutation } from "@/store/features/admin/settingsApiService";
import { toast } from "sonner";
import { Loader2, Hash } from "lucide-react";
import { useForm } from "react-hook-form";
import { Separator } from "@/shared/components/ui/separator";

export default function PrefixSettings() {
    const { data: settingsData, isLoading } = useGetNumberingSequencesQuery();
    const [updateSettings, { isLoading: isUpdating }] = useUpdateNumberingSequencesMutation();

    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            invoice_format: "INV-{0000}",
            invoice_next_number: 1,
            order_format: "ORD-{0000}",
            order_next_number: 1,
            quotation_format: "QT-{0000}",
            quotation_next_number: 1,
            customer_format: "CUST-{0000}",
            customer_next_number: 1,
            supplier_format: "SUPP-{0000}",
            supplier_next_number: 1,
            product_format: "PROD-{0000}",
            product_next_number: 1,
            purchase_order_format: "PO-{0000}",
            purchase_order_next_number: 1,
            purchase_invoice_format: "PINV-{0000}",
            purchase_invoice_next_number: 1,
        }
    });

    useEffect(() => {
        if (settingsData?.data) {
            // Helper to migrate legacy fields to format for UI display
            const migrate = (type: string, data: any) => {
                if (!data[`${type}_format`] && data[`${type}_prefix`]) {
                    const padding = Number(data[`${type}_padding_width`]) || 0;
                    const zeros = "0".repeat(padding);
                    return `${data[`${type}_prefix`]}{${zeros}}`;
                }
                return data[`${type}_format`];
            };

            const migratedData = {
                ...settingsData.data,
                invoice_format: migrate('invoice', settingsData.data) || "INV-{0000}",
                order_format: migrate('order', settingsData.data) || "ORD-{0000}",
                quotation_format: migrate('quotation', settingsData.data) || "QT-{0000}",
                customer_format: migrate('customer', settingsData.data) || "CUST-{0000}",
                supplier_format: migrate('supplier', settingsData.data) || "SUPP-{0000}",
                product_format: migrate('product', settingsData.data) || "PROD-{0000}",
                purchase_order_format: migrate('purchase_order', settingsData.data) || "PO-{0000}",
                purchase_invoice_format: migrate('purchase_invoice', settingsData.data) || "PINV-{0000}",
            };
            reset(migratedData);
        }
    }, [settingsData, reset]);

    const onSubmit = async (data: any) => {
        try {
            // Ensure numbers are handled as numbers
            const formattedData = {
                ...data,
                invoice_next_number: Number(data.invoice_next_number),
                order_next_number: Number(data.order_next_number),
                quotation_next_number: Number(data.quotation_next_number),
                customer_next_number: Number(data.customer_next_number),
                supplier_next_number: Number(data.supplier_next_number),
                product_next_number: Number(data.product_next_number),
                purchase_order_next_number: Number(data.purchase_order_next_number),
                purchase_invoice_next_number: Number(data.purchase_invoice_next_number),
            };
            await updateSettings(formattedData).unwrap();
            toast.success("Prefix settings updated successfully");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to update settings");
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <Card className="py-6 border-2 transition-all duration-300 hover:border-blue-200">
                <CardHeader className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Hash className="w-5 h-5 text-blue-600" />
                        <CardTitle>Prefix & Numbering Settings</CardTitle>
                    </div>
                    <CardDescription>
                        Configure custom formats and starting numbers for your documents and records.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                        {/* SALES & ORDERS */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Sales Documents</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-x-2 grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="invoice_format">Invoice Format</Label>
                                        <Input id="invoice_format" {...register("invoice_format")} placeholder="INV-{year}-{0000}" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="invoice_next_number">Next Invoice No.</Label>
                                        <Input id="invoice_next_number" type="number" {...register("invoice_next_number")} />
                                    </div>
                                </div>

                                <div className="space-x-2 grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="order_format">Order Format</Label>
                                        <Input id="order_format" {...register("order_format")} placeholder="ORD-{0000}" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="order_next_number">Next Order No.</Label>
                                        <Input id="order_next_number" type="number" {...register("order_next_number")} />
                                    </div>
                                </div>

                                <div className="space-x-2 grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="quotation_format">Quotation Format</Label>
                                        <Input id="quotation_format" {...register("quotation_format")} placeholder="QT-{0000}" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="quotation_next_number">Next Quotation No.</Label>
                                        <Input id="quotation_next_number" type="number" {...register("quotation_next_number")} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* PURCHASE DOCUMENTS */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Purchase Documents</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-x-2 grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="purchase_order_format">Purchase Order Format</Label>
                                        <Input id="purchase_order_format" {...register("purchase_order_format")} placeholder="PO-{0000}" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="purchase_order_next_number">Next PO Number</Label>
                                        <Input id="purchase_order_next_number" type="number" {...register("purchase_order_next_number")} />
                                    </div>
                                </div>

                                <div className="space-x-2 grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="purchase_invoice_format">Purchase Invoice Format</Label>
                                        <Input id="purchase_invoice_format" {...register("purchase_invoice_format")} placeholder="PINV-{0000}" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="purchase_invoice_next_number">Next P. Invoice No.</Label>
                                        <Input id="purchase_invoice_next_number" type="number" {...register("purchase_invoice_next_number")} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* MASTER DATA */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Master Data</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-x-2 grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customer_format">Customer ID Format</Label>
                                        <Input id="customer_format" {...register("customer_format")} placeholder="CUST-{0000}" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customer_next_number">Next Customer ID No.</Label>
                                        <Input id="customer_next_number" type="number" {...register("customer_next_number")} />
                                    </div>
                                </div>

                                <div className="space-x-2 grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="supplier_format">Supplier ID Format</Label>
                                        <Input id="supplier_format" {...register("supplier_format")} placeholder="SUPP-{0000}" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="supplier_next_number">Next Supplier ID No.</Label>
                                        <Input id="supplier_next_number" type="number" {...register("supplier_next_number")} />
                                    </div>
                                </div>

                                <div className="space-x-2 grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="product_format">Product SKU Format</Label>
                                        <Input id="product_format" {...register("product_format")} placeholder="PROD-{0000}" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="product_next_number">Next SKU No.</Label>
                                        <Input id="product_next_number" type="number" {...register("product_next_number")} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 border-t">
                            <Button type="submit" disabled={isUpdating} className="min-w-[150px] bg-blue-600 hover:bg-blue-700">
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Save Prefix Settings"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="bg-blue-50/50 border-blue-100">
                <CardContent className="pt-6">
                    <div className="flex gap-3 text-sm text-blue-800">
                        <div className="p-1 px-2.5 bg-blue-100 rounded-full h-fit mt-0.5 font-bold">?</div>
                        <div className="space-y-1">
                            <p className="font-semibold text-base mb-2">Dynamic Format Guide:</p>
                            <p>You can use the following variables in your formats:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                <ul className="list-disc list-inside space-y-1">
                                    <li><strong>{`{0000}`}</strong> - Sequence number with 4 zeros padding</li>
                                    <li><strong>{`{0}`}</strong> - Sequence number without padding</li>
                                    <li><strong>{`{year}`}</strong> - Current year (e.g. 2026)</li>
                                    <li><strong>{`{YY}`}</strong> - Short year (e.g. 26)</li>
                                </ul>
                                <ul className="list-disc list-inside space-y-1">
                                    <li><strong>{`{month}`}</strong> - Current month (01-12)</li>
                                    <li><strong>{`{date}`}</strong> / <strong>{`{day}`}</strong> - Current day (01-31)</li>
                                    <li><strong>{`{MM}`}</strong> - Month (01-12)</li>
                                    <li><strong>{`{DD}`}</strong> - Day (01-31)</li>
                                </ul>
                            </div>
                            <p className="mt-4 p-2 bg-blue-100/50 rounded border border-blue-200 inline-block font-mono text-xs">
                                Example: <span className="text-blue-600 font-bold">INV-{`{year}`}{`{month}`}-{`{0000}`}</span> &rarr; <span className="text-green-700 font-bold">INV-202601-0001</span>
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-amber-50/50 border-amber-100">
                <CardContent className="pt-6">
                    <div className="flex gap-3 text-sm text-amber-800">
                        <div className="p-1 px-2.5 bg-amber-100 rounded-full h-fit mt-0.5 font-bold">!</div>
                        <div className="space-y-1">
                            <p className="font-semibold">Important Notes:</p>
                            <ul className="list-disc list-inside space-y-1 mt-1 font-medium">
                                <li>The <strong>{`{0000}`}</strong> part determines the padding. Use more or fewer zeros as needed.</li>
                                <li>If you don't include a sequence placeholder, the number will be appended to the end automatically.</li>
                                <li>Lowering the "Next Number" below existing records may cause duplicate ID errors.</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
