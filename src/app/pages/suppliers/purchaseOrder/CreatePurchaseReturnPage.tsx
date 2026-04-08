"use client";
import { useFieldArray, useForm, type UseFormSetValue } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
    Form,
    FormField,
    FormItem,
    FormControl,
    FormLabel,
    FormMessage,
} from "@/shared/components/ui/form";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/shared/components/ui/popover";
import {
    Command,
    CommandInput,
    CommandList,
    CommandItem,
    CommandEmpty,
    CommandGroup,
} from "@/shared/components/ui/command";

import { toast } from "sonner";

import { useAddPurchaseReturnMutation } from "@/store/features/app/purchaseOrder/purchaseReturnApiService";
import { useGetAllPurchasesQuery, useGetPurchaseOrderByIdQuery, useLazyGetPurchaseOrderByIdQuery } from "@/store/features/app/purchaseOrder/purchaseOrderApiService";
import { useNavigate, useSearchParams } from "react-router";
import { useGetAllSuppliersQuery, useGetSupplierByIdQuery } from "@/store/features/app/suppliers/supplierApiService";
import type { Supplier } from "@/shared/types/app/supplier.types";
import { useGetAllProductsQuery, useGetProductByIdQuery } from "@/store/features/admin/productsApiService";
import { useState } from "react";
import { useAppSelector } from "@/store/store";
import { BackButton } from "@/shared/components/common/BackButton";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { FileText, Package, ShoppingCart, User, Plus, ChevronDown, CheckCircle2, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { AddProductsModal } from "@/app/components/products/AddProductsModal";


const orderSchema = z.object({
    supplierId: z.number().min(1, "Required"),
    notes: z.string().optional(),
    returnDate: z.string().min(1, "Return date is required"),
    items: z.array(
        z.object({
            productId: z.number().min(1, "Product is required"),
            sku: z.string().optional(),
            specification: z.string().optional(),
            unit: z.string().optional(),
            quantity: z.number().min(1, "Quantity must be at least 1"),
            unitCost: z.number().min(0, "Unit price must be at least 0"),
            discount: z.number().min(0, "Discount must be 0 or more"),
            purchaseTax: z.number().min(0, "Purchase tax must be 0 or more"),
            stockQuantity: z.number().optional(),
        })
    ),
    purchaseOrderId: z.number().optional(),
    poNumber: z.string().optional(),
});

/* ---------------- TYPES ---------------- */

type PurchaseOrderFormValues = z.infer<typeof orderSchema>;

/* ---------------------------------------- */

export default function CreatePurchaseReturnPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const supplierIdParam = searchParams.get("supplierId");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const currency = useAppSelector((state) => state.currency.value);
    const [addPurchaseReturn, { isLoading }] = useAddPurchaseReturnMutation();

    const form = useForm<PurchaseOrderFormValues>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            supplierId: supplierIdParam ? Number(supplierIdParam) : 0,
            returnDate: new Date().toISOString().split("T")[0],
            notes: "",
            purchaseOrderId: 0,
            poNumber: "",
            items: [
                {
                    productId: 0,
                    sku: "",
                    specification: "",
                    unit: "",
                    quantity: 1,
                    unitCost: 0,
                    discount: 0,
                    purchaseTax: 0,
                    stockQuantity: 0,
                },
            ],
        },
    });

    const { control, watch } = form;
    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    const items = watch("items") ?? [];

    const calculatedItems = items.map((it) => {
        const unitPrice = Number(it.unitCost || 0);
        const qty = Number(it.quantity || 0);
        const discount = Number(it.discount || 0);
        const taxRate = Number(it.purchaseTax || 0);

        const subtotal = unitPrice * qty;
        const taxableAmount = subtotal - discount; // Pretax amount
        const taxAmount = taxableAmount * (taxRate / 100);
        const total = taxableAmount + taxAmount;

        return {
            subtotal,
            discount,
            pretaxAmount: taxableAmount,
            taxAmount,
            total,
        };
    });

    const totalSubtotal = calculatedItems.reduce((sum, it) => sum + it.subtotal, 0);
    const totalDiscount = calculatedItems.reduce((sum, it) => sum + it.discount, 0);
    const totalTax = calculatedItems.reduce((sum, it) => sum + it.taxAmount, 0);
    const grandTotal = calculatedItems.reduce((sum, it) => sum + it.total, 0);


    /* ---------------- Searchable select components ---------------- */

    function SupplierSelectField({
        field,
    }: {
        field: { value?: number; onChange: (v: number) => void };
    }) {
        const [open, setOpen] = useState(false);
        const [query, setQuery] = useState("");

        // Call API with search query
        const { data, isLoading } = useGetAllSuppliersQuery({
            page: 1,
            limit: 20,
            search: query,
        });

        // Fetch single supplier if we have a value (to ensure display name is available)
        const { data: singleData } = useGetSupplierByIdQuery(Number(field.value), {
            skip: !field.value,
        });

        const list = Array.isArray(data?.data) ? data.data : [];

        const selected =
            list.find((s: Supplier) => Number(s._id) === Number(field.value)) ||
            (singleData?.data?._id && Number(singleData.data._id) === Number(field.value)
                ? singleData.data
                : undefined);

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between h-9 px-3">
                        <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                            <Avatar className="h-6 w-6 shrink-0">
                                <AvatarImage src={selected?.thumbUrl} />
                                <AvatarFallback>
                                    <User className="h-3 w-3" />
                                </AvatarFallback>
                            </Avatar>
                            <span className="truncate text-sm">
                                {selected ? selected.name : "Select Supplier..."}
                            </span>
                        </div>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[300px] p-0">
                    <Command>
                        <CommandInput
                            placeholder="Search suppliers..."
                            onValueChange={(value) => setQuery(value)}
                        />

                        <CommandList>
                            <CommandEmpty>No suppliers found.</CommandEmpty>

                            <CommandGroup>
                                {isLoading && (
                                    <div className="py-2 px-3 text-sm text-gray-500">
                                        Loading...
                                    </div>
                                )}

                                {!isLoading &&
                                    list.map((supplier) => (
                                        <CommandItem
                                            key={supplier._id}
                                            onSelect={() => {
                                                field.onChange(Number(supplier._id));
                                                setOpen(false);
                                            }}
                                            className="flex items-center gap-2 cursor-pointer py-3"
                                        >
                                            <Avatar className="h-8 w-8 shrink-0">
                                                <AvatarImage src={supplier.thumbUrl} />
                                                <AvatarFallback>
                                                    <User className="h-4 w-4" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col overflow-hidden flex-1">
                                                <span className="truncate font-medium text-sm">{supplier.name}</span>
                                                {supplier.contactPerson && (
                                                    <span className="truncate text-xs text-muted-foreground">
                                                        Contact: {supplier.contactPerson}
                                                    </span>
                                                )}
                                                {supplier.address && (
                                                    <span className="truncate text-xs text-muted-foreground/80">
                                                        {supplier.address}
                                                    </span>
                                                )}
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

    function PurchaseOrderSelectField({
        field,
        supplierId,
        setValue,
    }: {
        field: { value?: number; onChange: (v: number) => void };
        supplierId: number;
        setValue: UseFormSetValue<PurchaseOrderFormValues>;
    }) {
        const [open, setOpen] = useState(false);
        const [query, setQuery] = useState("");
        const [triggerGetPO] = useLazyGetPurchaseOrderByIdQuery();

        const { data, isLoading } = useGetAllPurchasesQuery(
            {
                page: 1,
                limit: 50,
                search: query,
                supplierId: supplierId || undefined,
            }
        );

        const { data: singleData } = useGetPurchaseOrderByIdQuery(field.value?.toString() || "", {
            skip: !field.value,
        });

        const list = Array.isArray(data?.data) ? data.data : [];

        const selected =
            list.find((po: any) => Number(po._id) === Number(field.value)) ||
            (singleData?.data?._id && Number(singleData.data._id) === Number(field.value)
                ? singleData.data
                : undefined);

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-9 px-3 group"
                    >
                        <span className="truncate text-sm">
                            {selected ? (selected.poNumber || `PO-${selected._id}`) : "Select Purchase Order..."}
                        </span>
                        <div className="flex items-center gap-1">
                            {selected && (
                                <div
                                    role="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        field.onChange(0);
                                        setValue("poNumber", "");
                                    }}
                                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors z-10"
                                    title="Unselect Purchase Order"
                                >
                                    <X className="h-3 w-3 opacity-60 hover:opacity-100" />
                                </div>
                            )}
                            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                        </div>
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[300px] p-0" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder="Search purchase orders..."
                            onValueChange={(value) => setQuery(value)}
                        />
                        <CommandList className="max-h-[300px]">
                            <CommandEmpty>No purchase orders found.</CommandEmpty>
                            <CommandGroup>
                                {isLoading && (
                                    <div className="py-2 px-3 text-sm text-muted-foreground">
                                        Loading...
                                    </div>
                                )}
                                {!isLoading &&
                                    list.map((po: any) => (
                                        <CommandItem
                                            key={po._id}
                                            value={po.poNumber}
                                            onSelect={async () => {
                                                field.onChange(Number(po._id));
                                                setValue("poNumber", po.poNumber);

                                                // Auto-set supplier if not set or different
                                                if (po.supplierId) {
                                                    setValue("supplierId", Number(po.supplierId));
                                                }

                                                setOpen(false);

                                                // Fetch full PO details to populate items
                                                try {
                                                    const res = await triggerGetPO(po.publicId || po._id).unwrap();
                                                    const fullPO = Array.isArray(res.data) ? res.data[0] : res.data;

                                                    if (fullPO && fullPO.items) {
                                                        const newItems = fullPO.items.map((item: any) => ({
                                                            productId: Number(item.productId),
                                                            sku: item.product?.sku || "",
                                                            specification: item.product?.specification || "",
                                                            unit: item.product?.unit?.name || "",
                                                            quantity: Number(item.quantity),
                                                            unitCost: Number(item.unitCost),
                                                            discount: Number(item.discount),
                                                            purchaseTax: Number(item.purchaseTaxPercent || 0),
                                                            stockQuantity: 0, // Would need product fetch to get real stock, or just let user check
                                                        }));

                                                        setValue("items", newItems);
                                                        toast.success("Items loaded from Purchase Order");
                                                    }
                                                } catch (err) {
                                                    console.error("Failed to load PO items", err);
                                                    toast.error("Failed to load items from Purchase Order");
                                                }
                                            }}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <div className="flex flex-col flex-1">
                                                <span className="font-medium text-sm">{po.poNumber || `PO-${po._id}`}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {po.supplier?.name} | {new Date(po.orderDate).toLocaleDateString()}
                                                </span>
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

    function ProductSelectField({
        field,
        index,
        setValue,
    }: {
        field: { value?: number; onChange: (v: number) => void };
        index: number;
        setValue: UseFormSetValue<PurchaseOrderFormValues>;
    }) {
        const [open, setOpen] = useState(false);
        const [query, setQuery] = useState("");

        const { data, isLoading } = useGetAllProductsQuery({
            page: 1,
            limit: 50,
            search: query,
        });

        // Fetch single product if we have a value (to ensure display name is available even if not in current search list)
        const { data: singleData } = useGetProductByIdQuery(Number(field.value), {
            skip: !field.value,
        });

        const list = Array.isArray(data?.data) ? data.data : [];

        // Prioritize finding in the list, fallback to the single fetched data
        const selected = list.find((p) => Number(p._id) === Number(field.value)) ||
            (singleData?.data?._id && Number(singleData.data._id) === Number(field.value) ? singleData.data : undefined);


        const handleSelect = (productId: number) => {
            // If the selected product is from the list, use it directly.
            const product = list.find((p) => Number(p._id) === Number(productId));

            field.onChange(Number(productId));
            setOpen(false);

            if (product) {
                // Auto-set values for this row
                setValue(`items.${index}.purchaseTax`, product.purchaseTax || 0);
                setValue(`items.${index}.unitCost`, Number(product.cost) || 0); // Using cost for PO
                setValue(`items.${index}.sku`, product.sku || "");
                setValue(`items.${index}.specification`, product.specification || "");
                setValue(`items.${index}.unit`, product.unit?.name || "");
                setValue(`items.${index}.stockQuantity`, product.stockQuantity || 0);
            }
        };

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between h-9 overflow-hidden">
                        <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                            {selected && (
                                <Avatar className="h-6 w-6 shrink-0">
                                    <AvatarImage src={selected.thumbUrl} />
                                    <AvatarFallback>
                                        <Package className="h-3 w-3" />
                                    </AvatarFallback>
                                </Avatar>
                            )}
                            <span className="truncate text-left min-w-0 flex-1 text-sm">
                                {selected
                                    ? selected.name
                                    : "Select product..."}
                            </span>
                        </div>
                        {/* <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> */}
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[300px] p-0" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder="Search products..."
                            onValueChange={(value) => setQuery(value)}
                        />

                        <CommandList className="max-h-[300px]">
                            <CommandEmpty>No products found.</CommandEmpty>

                            <CommandGroup>
                                {isLoading && (
                                    <div className="py-2 px-3 text-sm text-muted-foreground">
                                        Loading...
                                    </div>
                                )}

                                {!isLoading &&
                                    list.map((product) => (
                                        <CommandItem
                                            key={product._id}
                                            value={String(product._id)}
                                            onSelect={() => handleSelect(Number(product._id))}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <Avatar className="h-8 w-8 shrink-0">
                                                <AvatarImage src={product.thumbUrl} />
                                                <AvatarFallback>
                                                    <Package className="h-4 w-4" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{product.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    SKU: {product.sku} | Unit: {product.unit?.name || "-"} | Stock: {product.stockQuantity || 0}
                                                </span>
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


    /* ---------------- ON SUBMIT ---------------- */
    const onSubmit = async (values: PurchaseOrderFormValues) => {
        try {
            // Calculate totals
            const calculatedItems = values.items.map((it) => {
                const unitPrice = Number(it.unitCost || 0);
                const qty = Number(it.quantity || 0);
                const discount = Number(it.discount || 0);
                const taxRate = Number(it.purchaseTax || 0);

                const subtotal = unitPrice * qty;
                const taxableAmount = subtotal - discount;
                const taxAmount = taxableAmount * (taxRate / 100);
                const total = taxableAmount + taxAmount;

                return { subtotal, discount, taxAmount, total };
            });

            const totalSubtotal = calculatedItems.reduce((sum, it) => sum + it.subtotal, 0);
            const totalDiscount = calculatedItems.reduce((sum, it) => sum + it.discount, 0);
            const totalTax = calculatedItems.reduce((sum, it) => sum + it.taxAmount, 0);
            const grandTotal = calculatedItems.reduce((sum, it) => sum + it.total, 0);

            const payload = {
                supplier_id: Number(values.supplierId),
                return_date: values.returnDate,
                notes: values.notes,
                items: values.items.map((item) => ({
                    product_id: Number(item.productId),
                    quantity: Number(item.quantity),
                    unit_cost: Number(item.unitCost),
                    discount: Number(item.discount),
                    purchase_tax: Number(item.purchaseTax),
                })),
                status: "returned" as const,
                purchase_order_id: Number(values.purchaseOrderId),
                po_number: values.poNumber,
                totalAmount: totalSubtotal,
                discount_amount: totalDiscount,
                tax_amount: totalTax,
                total_payable_amount: grandTotal,
                net_amount: totalSubtotal - totalDiscount
            };

            const response = await addPurchaseReturn(payload).unwrap();

            console.log("Purchase Return Created:", response);

            toast.success("Purchase Return Created Successfully");

            navigate("/dashboard/purchase-orders/returned");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to create purchase return");
            console.error(error);
        }
    };

    /* ---------------------------------------- */
    return (
        <div className="space-y-6 w-full pb-6">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                        Create Purchase Return
                    </h1>
                    <p className="text-muted-foreground mt-2">Create a new purchase return order for your supplier</p>
                </div>
                <BackButton />
            </div>

            <Form {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                    {/* ---------------- SUPPLIER & DETAILS ---------------- */}
                    <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-lg max-w-5xl">
                        <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border-b-1 border-blue-100 dark:border-blue-900 py-3 gap-0">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Supplier & Order Details</CardTitle>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Select supplier and set order dates</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pb-6">

                            <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-4">
                                {/* Supplier */}
                                <FormField
                                    name="supplierId"
                                    control={control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Supplier</FormLabel>
                                            <FormControl>
                                                <SupplierSelectField field={field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Purchase Order */}
                                <FormField
                                    name="purchaseOrderId"
                                    control={control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Purchase Order</FormLabel>
                                            <FormControl>
                                                <PurchaseOrderSelectField
                                                    field={field}
                                                    supplierId={watch("supplierId")}
                                                    setValue={form.setValue}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Return Date */}
                                <FormField
                                    name="returnDate"
                                    control={control}
                                    rules={{ required: "Return date is required" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Return Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} className="block" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Notes */}
                                <FormField
                                    name="notes"
                                    control={control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notes</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Optional notes..." className="min-h-[80px]" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* ---------------- ITEMS ---------------- */}
                    <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border-b-1 border-blue-100 dark:border-blue-900 py-3 gap-0">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30">
                                        <ShoppingCart className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Order Items</CardTitle>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Add products to this purchase order</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            append({
                                                productId: 0,
                                                sku: "",
                                                specification: "",
                                                unit: "",
                                                quantity: 1,
                                                unitCost: 0,
                                                discount: 0,
                                                purchaseTax: 0,
                                                stockQuantity: 0,
                                            })
                                        }
                                        className="gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Row
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setIsModalOpen(true)}
                                        className="gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/20"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        Add Items
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pb-6">

                            <div className="space-y-4 overflow-x-auto min-w-full">
                                {/* Header for Desktop */}
                                <div className="hidden xl:flex min-w-max gap-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 items-center font-bold text-[12px] capitalize tracking-wider text-gray-500">
                                    <div className="w-32 sticky left-0 bg-gray-100 dark:bg-gray-800 z-20">SKU</div>
                                    <div className="flex-1 min-w-[250px] sticky left-[144px] bg-gray-100 dark:bg-gray-800 z-20">Product</div>
                                    <div className="w-32">Spec.</div>
                                    <div className="w-24">Unit</div>
                                    <div className="w-24 text-left">Stock</div>
                                    <div className="w-32 text-left">Price</div>
                                    <div className="w-24 text-left">Qty</div>
                                    <div className="w-24 text-left">Total Qty</div>
                                    <div className="w-24 text-left">Discount</div>
                                    <div className="w-32 text-left">Pretax</div>
                                    <div className="w-24 text-left">Tax %</div>
                                    <div className="w-32 text-left">Tax Amt</div>
                                    <div className="w-36 text-right pr-4">Total ({currency})</div>
                                    <div className="w-10"></div>
                                </div>

                                <div className="space-y-4">
                                    {fields.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className="flex flex-wrap xl:flex-nowrap min-w-max gap-4 items-start xl:items-center bg-gray-50 p-4 rounded-xl border border-gray-100 dark:bg-gray-900/40 dark:border-gray-800 transition-all duration-200 hover:shadow-md"
                                        >
                                            {/* SKU */}
                                            <FormField
                                                name={`items.${index}.sku`}
                                                control={control}
                                                render={({ field }) => (
                                                    <FormItem className="w-full sm:w-28 xl:w-32 sticky left-0 bg-inherit xl:z-10">
                                                        <FormLabel className="xl:hidden text-xs uppercase tracking-wider text-gray-500 font-bold">SKU</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                readOnly
                                                                placeholder="SKU"
                                                                className="bg-gray-100 cursor-not-allowed border-gray-200 dark:bg-gray-800 dark:border-gray-700 font-mono text-[10px] h-9"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Product */}
                                            <div className="flex-1 min-w-[250px] xl:min-w-[250px] sticky left-[144px] bg-inherit xl:z-10">
                                                <FormField
                                                    name={`items.${index}.productId`}
                                                    control={control}
                                                    rules={{ required: "Product required" }}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="xl:hidden text-xs uppercase tracking-wider text-gray-500 font-bold">Product</FormLabel>
                                                            <FormControl>
                                                                <ProductSelectField
                                                                    field={field}
                                                                    index={index}
                                                                    setValue={form.setValue}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* Spec */}
                                            <FormField
                                                name={`items.${index}.specification`}
                                                control={control}
                                                render={({ field }) => (
                                                    <FormItem className="w-full sm:w-32 xl:w-32">
                                                        <FormLabel className="xl:hidden text-xs uppercase tracking-wider text-gray-500 font-bold">Spec.</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                readOnly
                                                                placeholder="Spec."
                                                                className="bg-gray-100 cursor-not-allowed border-gray-200 dark:bg-gray-800 dark:border-gray-700 h-9"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Unit */}
                                            <FormField
                                                name={`items.${index}.unit`}
                                                control={control}
                                                render={({ field }) => (
                                                    <FormItem className="w-20 xl:w-24">
                                                        <FormLabel className="xl:hidden text-xs uppercase tracking-wider text-gray-500 font-bold">Unit</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                readOnly
                                                                placeholder="Unit"
                                                                className="bg-gray-100 cursor-not-allowed border-gray-200 dark:bg-gray-800 dark:border-gray-700 h-9 text-center"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Stock */}
                                            <div className="w-20 xl:w-24">
                                                <label className="xl:hidden text-xs uppercase tracking-wider text-gray-500 font-bold block mb-1">Stock</label>
                                                <Input
                                                    type="number"
                                                    value={items[index].stockQuantity || 0}
                                                    readOnly
                                                    className="bg-gray-100 cursor-not-allowed border-gray-200 dark:bg-gray-800 dark:border-gray-700 h-9 text-right"
                                                />
                                            </div>

                                            {/* Unit Price */}
                                            <FormField
                                                name={`items.${index}.unitCost`}
                                                control={control}
                                                rules={{ required: "Price required" }}
                                                render={({ field }) => (
                                                    <FormItem className="w-full sm:w-28 xl:w-32">
                                                        <FormLabel className="xl:hidden text-xs uppercase tracking-wider text-gray-500 font-bold">Price</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                {...field}
                                                                onChange={(e) =>
                                                                    field.onChange(Number(e.target.value))
                                                                }
                                                                className="bg-white border-gray-200 dark:bg-gray-950 dark:border-gray-800 h-9 text-right"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Quantity */}
                                            <FormField
                                                name={`items.${index}.quantity`}
                                                control={control}
                                                rules={{ required: "Quantity required" }}
                                                render={({ field }) => (
                                                    <FormItem className="w-full sm:w-20 xl:w-24">
                                                        <FormLabel className="xl:hidden text-xs uppercase tracking-wider text-gray-500 font-bold">Qty</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) =>
                                                                    field.onChange(Number(e.target.value))
                                                                }
                                                                className="bg-white border-gray-200 dark:bg-gray-950 dark:border-gray-800 h-9 text-right"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Total Quantity (Stock + Qty) */}
                                            <div className="w-full sm:w-24 xl:w-24">
                                                <label className="xl:hidden text-xs uppercase tracking-wider text-gray-500 font-bold block mb-1">Total Qty</label>
                                                <Input
                                                    type="number"
                                                    value={(Number(items[index].stockQuantity || 0) + Number(items[index].quantity || 0))}
                                                    readOnly
                                                    className="bg-gray-100 cursor-not-allowed border-gray-200 dark:bg-gray-800 dark:border-gray-700 h-9 text-right font-bold text-blue-600 dark:text-blue-400"
                                                />
                                            </div>

                                            {/* discount */}
                                            <FormField
                                                name={`items.${index}.discount`}
                                                control={control}
                                                rules={{ required: "Discount required" }}
                                                render={({ field }) => (
                                                    <FormItem className="w-full sm:w-20 xl:w-24">
                                                        <FormLabel className="xl:hidden text-xs uppercase tracking-wider text-gray-500 font-bold">Discount</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) =>
                                                                    field.onChange(Number(e.target.value))
                                                                }
                                                                className="bg-white border-gray-200 dark:bg-gray-950 dark:border-gray-800 h-9 text-right"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Pretax Amount (Calculated) */}
                                            <div className="w-full sm:w-24 xl:w-32">
                                                <label className="xl:hidden text-xs uppercase tracking-wider text-gray-500 font-bold block text-left mb-1">Pretax</label>
                                                <Input
                                                    type="number"
                                                    value={(items[index].quantity * items[index].unitCost - items[index].discount).toFixed(2)}
                                                    readOnly
                                                    className="bg-gray-100 cursor-not-allowed border-gray-200 dark:bg-gray-800 dark:border-gray-700 h-9 text-right"
                                                />
                                            </div>

                                            {/* Tax % */}
                                            <FormField
                                                name={`items.${index}.purchaseTax`}
                                                control={control}
                                                render={({ field }) => (
                                                    <FormItem className="w-full sm:w-16 xl:w-24">
                                                        <FormLabel className="xl:hidden text-xs uppercase tracking-wider text-gray-500 font-bold">Tax %</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                {...field}
                                                                onChange={(e) =>
                                                                    field.onChange(Number(e.target.value))
                                                                }
                                                                className="bg-white border-gray-200 dark:bg-gray-950 dark:border-gray-800 h-9 text-right"
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Tax Amount (Calculated) */}
                                            <div className="w-full sm:w-24 xl:w-32 text-right">
                                                <label className="xl:hidden text-xs uppercase tracking-wider text-gray-500 font-bold block text-left mb-1">Tax Amt</label>
                                                <Input
                                                    type="number"
                                                    value={
                                                        (((items[index].quantity * items[index].unitCost -
                                                            items[index].discount) *
                                                            (items[index].purchaseTax || 0)) /
                                                            100).toFixed(2)
                                                    }
                                                    readOnly
                                                    className="bg-gray-100 cursor-not-allowed border-gray-200 dark:bg-gray-800 dark:border-gray-700 h-9 text-right"
                                                />
                                            </div>

                                            {/* Line Total */}
                                            <div className="w-full sm:w-28 xl:w-36 text-right pr-4">
                                                <label className="xl:hidden text-xs uppercase tracking-wider text-gray-500 font-bold block text-left mb-1">Total</label>
                                                <div className="font-semibold h-9 flex items-center justify-end">
                                                    {currency}{" "}
                                                    {(
                                                        items[index].quantity * items[index].unitCost -
                                                        items[index].discount +
                                                        ((items[index].quantity * items[index].unitCost -
                                                            items[index].discount) *
                                                            (items[index].purchaseTax || 0)) /
                                                        100
                                                    ).toFixed(2)}
                                                </div>
                                            </div>

                                            {/* Remove */}
                                            <div className="w-10 flex justify-center">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => remove(index)}
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>


                            {/* Summary */}
                            <div className="mt-6 flex justify-end">
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-xl border-2 border-blue-100 dark:border-blue-900 w-full max-w-[400px]">
                                    <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b border-blue-200 dark:border-blue-800">Order Summary</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-gray-600 dark:text-gray-400">Subtotal</span>
                                            <span className="font-semibold text-gray-900 dark:text-gray-100">{currency} {totalSubtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-red-600 dark:text-red-400">
                                            <span className="font-medium">Discount</span>
                                            <span className="font-semibold">- {currency} {totalDiscount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-gray-600 dark:text-gray-400">Tax</span>
                                            <span className="font-semibold text-gray-900 dark:text-gray-100">{currency} {totalTax.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold border-t-2 border-blue-200 dark:border-blue-800 pt-3 mt-2">
                                            <span className="text-gray-800 dark:text-gray-100">Grand Total</span>
                                            <span className="text-blue-600 dark:text-blue-400">{currency} {grandTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </CardContent>
                    </Card>


                    {/* Submit */}
                    <div className="flex justify-end gap-4 pt-4 pb-10">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/dashboard/purchase-orders/returned')}
                            className="px-6 min-w-[100px]"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/40 min-w-[200px]"
                        >
                            {isLoading ? <span className="animate-spin mr-2">⏳</span> : <CheckCircle2 className="w-5 h-5" />}
                            Create Purchase Return
                        </Button>
                    </div>


                </form>
            </Form>

            <AddProductsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialSelectedIds={items.map((i) => String(i.productId)).filter((id) => id !== "0")}
                onApply={(addedProducts: any[], deselectedIds: string[]) => {
                    // Remove deselected items
                    const currentItems = form.getValues("items");
                    const newItems = currentItems.filter(item => !deselectedIds.includes(String(item.productId)));

                    // Add new items
                    addedProducts.forEach((product: any) => {
                        if (!newItems.some(item => item.productId === Number(product._id))) {
                            newItems.push({
                                productId: Number(product._id),
                                sku: product.sku || "",
                                specification: product.specification || "",
                                unit: product.unit?.name || "",
                                quantity: 1,
                                unitCost: Number(product.cost) || 0,
                                discount: 0,
                                purchaseTax: product.purchaseTax || 0,
                                stockQuantity: product.stockQuantity || 0,
                            });
                        }
                    });

                    form.setValue("items", newItems);
                }}
                orderType="purchase"
            />


        </div>
    );
}
