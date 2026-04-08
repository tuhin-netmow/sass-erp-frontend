import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/shared/components/ui/form";
import { Textarea } from "@/shared/components/ui/textarea";
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
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router";
import { useAddBatchMutation, useGetBomsQuery } from "@/store/features/admin/productionApiService";
import { useGetAllProductsQuery } from "@/store/features/admin/productsApiService";
import { useEffect } from "react";

// Zod schema based on the data format
const productionSchema = z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.number().positive("Quantity must be greater than 0"),
    bomId: z.string().optional(),
    startDate: z.string().optional(),
    notes: z.string().optional(),
});

type ProductionFormValues = z.infer<typeof productionSchema>;

const CreateProduction = () => {
    const navigate = useNavigate();
    const [addBatch, { isLoading }] = useAddBatchMutation();
    const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);

    const form = useForm<ProductionFormValues>({
        resolver: zodResolver(productionSchema),
        mode: "onChange",
        defaultValues: {
            productId: "",
            quantity: 0,
            bomId: undefined,
            startDate: "",
            notes: "",
        },
    });

    // Reset BOM when product changes
    useEffect(() => {
        if (selectedProductId) {
            form.setValue("bomId", undefined);
        }
    }, [selectedProductId, form]);

    function ProductSelectField({
        field,
    }: {
        field: { value?: string; onChange: (v: string) => void };
    }) {
        const [open, setOpen] = useState(false);
        const [query, setQuery] = useState("");

        const { data, isLoading } = useGetAllProductsQuery({
            page: 1,
            limit: 50,
            search: query,
        });

        const list = Array.isArray(data?.data) ? data.data : [];

        const selected = list.find((p) => String(p._id) === String(field.value));

        const handleSelect = (productId: string) => {
            field.onChange(String(productId));
            setSelectedProductId(String(productId));
            setOpen(false);
        };

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                        {selected
                            ? `${selected.name} (SKU: ${selected.sku}) (${selected.unit?.name || "-"
                            })`
                            : "Select Product..."}
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[320px] p-0">
                    <Command>
                        <CommandInput
                            placeholder="Search products..."
                            onValueChange={(value) => setQuery(value)}
                        />

                        <CommandList>
                            <CommandEmpty>No products found.</CommandEmpty>

                            <CommandGroup>
                                {isLoading && (
                                    <div className="py-2 px-3 text-sm text-gray-500">
                                        Loading...
                                    </div>
                                )}

                                {!isLoading &&
                                    list.map((product) => (
                                        <CommandItem
                                            key={product._id}
                                            value={String(product._id)}
                                            onSelect={() => handleSelect(String(product._id))}
                                        >
                                            {product.name} (SKU: {product.sku}) (
                                            {product.unit?.name || "-"})
                                        </CommandItem>
                                    ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        );
    }

    function BOMSelectField({
        field,
        productId,
    }: {
        field: { value?: string; onChange: (v: string) => void };
        productId?: string;
    }) {
        const [open, setOpen] = useState(false);

        // Only fetch BOMs when a product is selected
        const { data, isLoading } = useGetBomsQuery(
            productId ? { search: String(productId), limit: 50 } : undefined,
            {
                skip: !productId,
            }
        );

        const list = Array.isArray(data?.data) ? data.data : [];

        const selected = list.find((b) => String(b._id) === String(field.value));

        const handleSelect = (bomId: string) => {
            field.onChange(String(bomId));
            setOpen(false);
        };

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between" disabled={!productId}>
                        {selected
                            ? `${selected.name} ${selected.description ? `(${selected.description})` : ""}`
                            : productId
                            ? "Select BOM..."
                            : "Select a product first"}
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[320px] p-0">
                    <Command>
                        <CommandList>
                            {!productId && (
                                <CommandEmpty>Please select a product first</CommandEmpty>
                            )}

                            {productId && list.length === 0 && !isLoading && (
                                <CommandEmpty>No BOMs found for this product</CommandEmpty>
                            )}

                            {productId && isLoading && (
                                <div className="py-2 px-3 text-sm text-gray-500">
                                    Loading...
                                </div>
                            )}

                            <CommandGroup>
                                {!isLoading &&
                                    list.map((bom) => (
                                        <CommandItem
                                            key={bom._id}
                                            value={String(bom._id)}
                                            onSelect={() => handleSelect(String(bom._id))}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-medium">{bom.name}</span>
                                                {bom.description && (
                                                    <span className="text-xs text-gray-500">{bom.description}</span>
                                                )}
                                                <span className="text-xs text-gray-400">ID: {bom._id}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        );
    }

    const onSubmit = async (data: ProductionFormValues) => {
        try {
            console.log("Submitting production batch:", data);
            await addBatch(data).unwrap();
            toast.success("Production batch created successfully!");
            navigate("/dashboard/production/list");
        } catch (error) {
            console.error("Failed to create production batch:", error);
            toast.error("Failed to create production batch. Please try again.");
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="flex justify-between items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold">Create New Production Batch</h1>
                <Link to="/dashboard/production/list">
                    <Button variant="outline" size="default">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Batches List</span>
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Batch Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Product ID - Required */}
                                <FormField
                                    control={form.control}
                                    name="productId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product *</FormLabel>
                                            <FormControl>
                                                <ProductSelectField
                                                    field={field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Quantity - Required */}
                                <FormField
                                    control={form.control}
                                    name="quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Quantity *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="50"
                                                    value={field.value || ""}
                                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* BOM ID - Optional */}
                                <FormField
                                    control={form.control}
                                    name="bomId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>BOM (Optional)</FormLabel>
                                            <FormControl>
                                                <BOMSelectField
                                                    field={field}
                                                    productId={selectedProductId}
                                                />
                                            </FormControl>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                BOM will be auto-selected if available for the product
                                            </p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Start Date - Optional */}
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Date (Optional)</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Notes - Optional */}
                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Urgent batch for client X"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-4 pt-4">
                                <Link to="/dashboard/production/list">
                                    <Button variant="outline" type="button" disabled={isLoading}>
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-500" disabled={isLoading}>
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4 mr-2" />
                                    )}
                                    {isLoading ? "Creating..." : "Create Batch"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CreateProduction;
