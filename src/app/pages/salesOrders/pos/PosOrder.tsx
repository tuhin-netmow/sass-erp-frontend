/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { ShoppingCart, Search, Plus, Minus, Trash2, CheckCircle2, User } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
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
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/shared/components/ui/command";
import { Textarea } from "@/shared/components/ui/textarea";

import { useGetAllProductsQuery } from "@/store/features/admin/productsApiService";
import {
    useAddSalesInvoiceMutation,
    useAddSalesOrderMutation,
    useAddSalesPaymentMutation,
} from "@/store/features/app/salesOrder/salesOrder";
import { useGetCustomersQuery } from "@/store/features/app/customers/customersApi";
import { useNavigate } from "react-router";
import { useAppSelector } from "@/store/store";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PosAddCustomer } from "./PosAddCustomer";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/utils";

// --- Types & Schema (Mirrored from CreateSalesOrderPage) ---
const orderSchema = z
    .object({
        customerId: z.string().min(1, "Customer is required"),
        shippingAddress: z.string().min(5, "Shipping address is required"),
        orderDate: z.string().min(1, "Order date is required"),
        dueDate: z.string().min(1, "Due date is required"),
        items: z.array(
            z.object({
                productId: z.string().min(1, "Product is required"),
                quantity: z.number().min(1, "Quantity must be at least 1"),
                unitPrice: z.number().min(0, "Unit price must be at least 0"),
                discount: z.number().min(0, "Discount must be 0 or more"),
                salesTax: z.number().min(0, "Sales tax must be 0 or more"),
                // Extra fields for UI display in POS
                name: z.string().optional(),
                sku: z.string().optional(),
                stockQuantity: z.number().optional(),
                unit: z.string().optional(),
            })
        ),
    })
    .refine(
        (data) => {
            const orderDate = new Date(data.orderDate);
            const dueDate = new Date(data.dueDate);
            return dueDate >= orderDate;
        },
        {
            message: "Due date cannot be earlier",
            path: ["dueDate"],
        }
    );

type SalesOrderFormValues = z.infer<typeof orderSchema>;

export default function PosOrder() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [newlyAddedCustomer, setNewlyAddedCustomer] = useState<any>(null);
    const currency = useAppSelector((state) => state.currency.value);
    const posLayout = useAppSelector((state) => state.layout.pos);

    // API Hooks
    const { data: productsData } = useGetAllProductsQuery({
        page: 1,
        limit: 100, // Fetch more for POS
        search: search,
    });
    const [addSalesOrder, { isLoading: isOrdering }] = useAddSalesOrderMutation();
    const [createInvoice, { isLoading: isInvoicing }] = useAddSalesInvoiceMutation();
    const [addSalesPayment, { isLoading: isPaying }] = useAddSalesPaymentMutation();

    const isLoading = isOrdering || isInvoicing || isPaying;

    // Form Setup
    const form = useForm<SalesOrderFormValues>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            customerId: "",
            shippingAddress: "",
            orderDate: new Date().toISOString().split("T")[0], // Default today
            dueDate: new Date().toISOString().split("T")[0],   // Default today
            items: [],
        },
    });

    const { control, watch, setValue } = form;
    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "items",
    });

    const items = watch("items");

    // Calculations
    const calculatedItems = items.map((it) => {
        const unitPrice = Number(it.unitPrice || 0);
        const qty = Number(it.quantity || 0);
        const discount = Number(it.discount || 0);
        const taxRate = Number(it.salesTax || 0);

        const subtotal = unitPrice * qty;
        const taxableAmount = subtotal - discount;
        const taxAmount = taxableAmount * (taxRate / 100);
        const total = taxableAmount + taxAmount;

        return { subtotal, discount, taxableAmount, taxAmount, total };
    });

    const totalSubtotal = calculatedItems.reduce((sum, it) => sum + it.subtotal, 0);
    const totalDiscount = calculatedItems.reduce((sum, it) => sum + it.discount, 0);
    const totalTax = calculatedItems.reduce((sum, it) => sum + it.taxAmount, 0);
    const grandTotal = calculatedItems.reduce((sum, it) => sum + it.total, 0);

    // Cart Actions
    const addToCart = (product: any) => {
        const availableStock = product.stockQuantity ?? 0;

        // If stock is 0, don't allow adding
        if (availableStock <= 0) {
            toast.error(`Out of stock!`);
            return;
        }

        const existingIndex = items.findIndex((i) => i.productId === product._id);

        if (existingIndex >= 0) {
            // Increment quantity
            const existingItem = items[existingIndex];

            // Check if incrementing exceeds stock
            if (existingItem.quantity + 1 > availableStock) {
                toast.error(`Cannot add more. Only ${availableStock} in stock.`);
                return;
            }

            update(existingIndex, {
                ...existingItem,
                quantity: existingItem.quantity + 1,
            });
        } else {
            // Add new item
            append({
                productId: product._id,
                quantity: 1,
                unitPrice: Number(product.price),
                discount: 0,
                salesTax: Number(product.salesTax || product.sales_tax || 0),
                name: product.name,
                sku: product.sku,
                stockQuantity: availableStock,
                unit: product.unit?.name || "",
            });
        }
    };

    const adjustQuantity = (index: number, delta: number) => {
        const item = items[index];
        const stock = item.stockQuantity ?? 0;
        const newQty = item.quantity + delta;

        // If decreasing, just do it (unless it hits 0, which we handle below as updating to newQty)
        if (delta < 0) {
            if (newQty > 0) {
                update(index, { ...item, quantity: newQty });
            }
            return;
        }

        // If increasing, check stock
        if (newQty > stock) {
            toast.error(`Cannot exceed available stock of ${stock}`);
            return;
        }

        if (newQty > 0) {
            update(index, { ...item, quantity: newQty });
        }
    };

    const handleNewOrder = () => {
        form.reset({
            customerId: "",
            shippingAddress: "",
            orderDate: new Date().toISOString().split("T")[0],
            dueDate: new Date().toISOString().split("T")[0],
            items: [],
        });
        setNewlyAddedCustomer(null);
        setSearch("");
    };

    // Submit Handler
    const onSubmit = async (values: SalesOrderFormValues, mode: 'due' | 'paid' = 'due') => {
        if (!values.customerId) return toast.error("Please select a customer");
        if (values.items.length === 0) return toast.error("Cart is empty");

        try {
            const orderRes = await addSalesOrder(values).unwrap();

            if (orderRes.status &&  (orderRes?.data as any)?._id) {
                const orderId =  orderRes?.data?._id;

                // 1. Create Invoice
                const invoiceRes = await createInvoice({
                    orderId: orderId,
                    dueDate: values.dueDate,
                }).unwrap();

                if (invoiceRes.status) {
                    const invoiceId =  (invoiceRes?.data as any)?._id;

                    // 2. If 'paid', add payment
                    if (mode === 'paid') {
                        await addSalesPayment({
                            orderId: orderId,
                            invoiceId: invoiceId,
                            amount: String(grandTotal), // Use grand total for full payment
                            paymentMethod: 'cash', // Default to cash for POS
                            paymentDate: new Date().toISOString(),
                            status: 'completed',
                            notes: 'POS Full Payment'
                        }).unwrap();

                        toast.success("Order Created & Paid Successfully!");
                    } else {
                        toast.success("Due Invoice Created Successfully!");
                    }

                    navigate("/dashboard/sales/orders");
                } else {
                    toast.error("Invoice generation failed.");
                }
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to process request");
        }
    };

    // Customer Select Component (Local)
    const CustomerSelect = ({ field }: { field: any }) => {
        const [open, setOpen] = useState(false);
        const [q, setQ] = useState("");
        const { data } = useGetCustomersQuery({ page: 1, limit: 10, search: q });
        const list = data?.data || [];
        const selected = list.find((c: any) => c._id === field.value)
            || (newlyAddedCustomer?._id === field.value ? newlyAddedCustomer : null);

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between h-9">
                        {selected ? selected.name : "Select Customer..."}
                        <User className="h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0">
                    <Command>
                        <CommandInput placeholder="Search customer..." onValueChange={setQ} />
                        <CommandList>
                            <CommandEmpty>No customer found.</CommandEmpty>
                            <CommandGroup>
                                {list.map((c: any) => (
                                    <CommandItem
                                        key={c._id}
                                        onSelect={() => {
                                            field.onChange(c._id);
                                            if (c.address) setValue("shippingAddress", c.address);
                                            setOpen(false);
                                        }}
                                    >
                                        {c.name}
                                        {field.value === (c._id) && <CheckCircle2 className="ml-auto h-4 w-4" />}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        );
    };

    return (
        <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-6rem)] gap-4">
            {/* RIGHT: Cart / Checkout Form - Shows first on mobile */}
            <div className="w-full lg:w-[400px] flex flex-col lg:order-2">
                <Form {...form}>
                    <div className="h-full flex flex-col">
                        <Card className="flex-1 flex flex-col h-full border-0 shadow-xl rounded-xl lg:rounded-xl overflow-hidden">
                            {/* 1. Header & Customer Info */}
                            <CardHeader className="bg-muted/30 pb-4 px-4 border-b space-y-3 pt-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <ShoppingCart className="w-5 h-5" />
                                        New Sale
                                    </CardTitle>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        className="h-8 w-8 p-0 bg-blue-100 text-blue-600 hover:bg-blue-200"
                                        onClick={handleNewOrder}
                                        title="New Order"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </Button>
                                </div>

                                {/* Customer Select & Add */}
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1 space-y-2">
                                        <FormField
                                            control={control}
                                            name="customerId"
                                            render={({ field }) => (
                                                <FormItem className="space-y-0">
                                                    <FormLabel className="sr-only">Customer</FormLabel>
                                                    <FormControl>
                                                        <CustomerSelect field={field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <PosAddCustomer
                                        onCustomerAdded={(c) => {
                                            setNewlyAddedCustomer(c);
                                            setValue("customerId", c._id);
                                            if (c.address) setValue("shippingAddress", c.address);
                                        }}
                                    />
                                </div>

                                {/* Dates & Address (Collapsible or Compact) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                    <FormField
                                        control={control}
                                        name="orderDate"
                                        render={({ field }) => (
                                            <FormItem className="space-y-0">
                                                <FormControl>
                                                    <Input type="date" {...field} className="h-8 text-xs block" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="dueDate"
                                        render={({ field }) => (
                                            <FormItem className="space-y-0">
                                                <FormControl>
                                                    <Input type="date" {...field} className="h-8 text-xs block" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={control}
                                    name="shippingAddress"
                                    render={({ field }) => (
                                        <FormItem className="space-y-0">
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Shipping Address..."
                                                    {...field}
                                                    className="min-h-[2.5rem] py-1 text-xs resize-none"
                                                    rows={1}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardHeader>

                            {/* 2. Cart Items List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white max-h-[300px] lg:max-h-none">
                                {fields.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                                        <ShoppingCart className="w-12 h-12 mb-2" />
                                        <p>Cart is empty</p>
                                    </div>
                                ) : (
                                    fields.map((field, index) => {
                                        const itemTotal = calculatedItems[index]?.total || 0;
                                        const stock = items[index]?.stockQuantity ?? 0;
                                        const unit = items[index]?.unit || "";

                                        return (
                                            <div key={field.id} className="flex flex-col gap-2 p-3 bg-muted/20 rounded-lg border group relative hover:border-blue-200 transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1 pr-2">
                                                        <div className="font-medium text-sm truncate">
                                                            {(field as any).name || "Item #" + (index + 1)}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <div className="text-xs text-muted-foreground">
                                                                {currency} {Number(items[index].unitPrice).toFixed(2)}
                                                                {unit && <span className="ml-1">/ {unit}</span>}
                                                            </div>
                                                            <Badge variant="outline" className={`text-[10px] h-4 py-0 px-1 font-normal ${stock < 10 ? 'text-orange-600 border-orange-200 bg-orange-50' : 'text-gray-500'}`}>
                                                                Stock: {stock}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="text-sm font-semibold">
                                                        {currency} {itemTotal.toFixed(2)}
                                                    </div>
                                                </div>

                                                {/* Controls: Qty, Discount, Tax */}
                                                <div className="grid grid-cols-12 gap-2 mt-1 items-end">
                                                    {/* Quantity */}
                                                    <div className="col-span-4 flex items-center gap-0.5 bg-white rounded-md border p-0.5 shadow-sm h-8 relative">
                                                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 rounded-sm" onClick={() => adjustQuantity(index, -1)}>
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <span className="flex-1 text-center text-xs font-medium">{items[index].quantity}</span>
                                                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 rounded-sm" onClick={() => adjustQuantity(index, 1)}>
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>

                                                    {/* Discount Input */}
                                                    <div className="col-span-3">
                                                        <FormField
                                                            control={control}
                                                            name={`items.${index}.discount`}
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-0">
                                                                    <FormLabel className="text-[10px] text-muted-foreground uppercase">Disc</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            type="number"
                                                                            {...field}
                                                                            className="h-8 text-xs px-2 bg-white"
                                                                            min={0}
                                                                            onChange={e => field.onChange(Number(e.target.value))}
                                                                        />
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    {/* Tax Input */}
                                                    <div className="col-span-3">
                                                        <FormField
                                                            control={control}
                                                            name={`items.${index}.salesTax`}
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-0">
                                                                    <FormLabel className="text-[10px] text-muted-foreground uppercase">Tax%</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            type="number"
                                                                            {...field}
                                                                            className="h-8 text-xs px-2 bg-white"
                                                                            min={0}
                                                                            onChange={e => field.onChange(Number(e.target.value))}
                                                                        />
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    {/* Delete */}
                                                    <div className="col-span-2 flex justify-end">
                                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50" onClick={() => remove(index)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>

                            {/* 3. Footer Summary & Checkout */}
                            <div className="p-4 bg-muted/10 border-t space-y-4">
                                <div className="space-y-1.5 text-sm">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Subtotal</span>
                                        <span>{currency} {totalSubtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground text-red-500">
                                        <span>Discount</span>
                                        <span>- {currency} {totalDiscount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Tax</span>
                                        <span>{currency} {totalTax.toFixed(2)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg pt-1">
                                        <span>Total</span>
                                        <span>{currency} {grandTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className={cn(
                                    "grid gap-3",
                                    posLayout.showDueSale && posLayout.showCashSale ? "grid-cols-2" : "grid-cols-1"
                                )}>
                                    {posLayout.showDueSale && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-12 text-md border-primary text-primary hover:bg-primary/5"
                                            disabled={isLoading}
                                            onClick={form.handleSubmit((v) => onSubmit(v, 'due'))}
                                        >
                                            Due Invoice
                                        </Button>
                                    )}
                                    {posLayout.showCashSale && (
                                        <Button
                                            type="button"
                                            className="h-12 text-md"
                                            disabled={isLoading}
                                            onClick={form.handleSubmit((v) => onSubmit(v, 'paid'))}
                                        >
                                            Complete payment
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                </Form>
            </div>

            {/* LEFT: Product Grid - Shows second on mobile */}
            <div className="flex-1 flex flex-col gap-4 lg:order-1">
                <div className="flex items-center gap-4 bg-card p-3 lg:p-4 rounded-xl shadow-sm border">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search products by name or SKU..."
                            className="pl-8 bg-background"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div
                    className="grid overflow-y-auto p-1 pr-2 pb-4 lg:pb-1"
                    style={{
                        gridTemplateColumns: `repeat(auto-fill, minmax(0, 1fr))`,
                        display: 'grid',
                        gap: `${posLayout.gap * 4}px`,
                    }}
                >
                    <style>{`
                        @media (min-width: 0px) {
                            .pos-grid { grid-template-columns: repeat(${posLayout.columns.mobile}, minmax(0, 1fr)) !important; }
                        }
                        @media (min-width: 640px) {
                            .pos-grid { grid-template-columns: repeat(${posLayout.columns.sm}, minmax(0, 1fr)) !important; }
                        }
                        @media (min-width: 768px) {
                            .pos-grid { grid-template-columns: repeat(${posLayout.columns.md}, minmax(0, 1fr)) !important; }
                        }
                        @media (min-width: 1024px) {
                            .pos-grid { grid-template-columns: repeat(${posLayout.columns.lg}, minmax(0, 1fr)) !important; }
                        }
                        @media (min-width: 1280px) {
                            .pos-grid { grid-template-columns: repeat(${posLayout.columns.xl}, minmax(0, 1fr)) !important; }
                        }
                        @media (min-width: 1536px) {
                            .pos-grid { grid-template-columns: repeat(${posLayout.columns.xxl}, minmax(0, 1fr)) !important; }
                        }
                    `}</style>
                    <div className="pos-grid grid w-full col-span-full" style={{ gap: `${posLayout.gap * 4}px` }}>
                        {productsData?.data?.map((product: any) => {
                            const stock = product.stockQuantity ?? 0;
                            const isOutOfStock = stock <= 0;
                            return (
                                <Card
                                    key={product._id}
                                    className={`cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group border-2 ${isOutOfStock ? 'opacity-60 grayscale' : ''} ${posLayout.cardStyle === 'compact' ? 'h-fit' : ''} ${posLayout.cardStyle === 'bordered' ? 'border-muted-foreground/20' : ''}`}
                                    onClick={() => addToCart(product)}
                                >
                                    <CardContent className={posLayout.cardStyle === 'compact' ? 'p-0' : 'p-0'}>
                                        {posLayout.showImages && (
                                            <div className={`${posLayout.cardStyle === 'compact' ? 'aspect-[16/9]' : 'aspect-square'} bg-muted relative`}>
                                                {product.thumbUrl ? (
                                                    <img src={product.thumbUrl} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                                        No Image
                                                    </div>
                                                )}
                                                {!isOutOfStock && (
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Plus className="text-white w-8 h-8" />
                                                    </div>
                                                )}
                                                {isOutOfStock && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                        <Badge variant="destructive">Out of Stock</Badge>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className={posLayout.cardStyle === 'compact' ? 'p-2' : 'p-3'}>
                                            <div className="font-semibold truncate text-sm lg:text-base" title={product.name}>{product.name}</div>
                                            {posLayout.cardStyle !== 'compact' && (
                                                <div className="flex justify-between items-center mt-1">
                                                    <div className="text-[10px] lg:text-xs text-muted-foreground">SKU: {product.sku}</div>
                                                    <div className={`text-[10px] lg:text-xs font-medium px-1.5 py-0.5 rounded ${stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        Stock: {stock}
                                                    </div>
                                                </div>
                                            )}
                                            <div className={`font-bold text-blue-600 ${posLayout.cardStyle === 'compact' ? 'mt-1 text-sm' : 'mt-2 text-base'} flex items-center gap-1`}>
                                                {currency} {Number(product.price || 0).toFixed(2)}
                                                {product.unit?.name && <span className="text-[10px] lg:text-sm font-normal text-muted-foreground">/ {product.unit.name}</span>}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                    {productsData?.data?.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Search className="w-12 h-12 mb-2 opacity-20" />
                            <p>No products found matching "{search}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
