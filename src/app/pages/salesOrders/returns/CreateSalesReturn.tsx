/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useFieldArray, useForm, type UseFormSetValue, type ControllerRenderProps } from "react-hook-form";
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

import { useAddSalesReturnMutation } from "@/store/features/app/salesOrder/salesReturnApiService";
import { useGetAllSalesOrdersQuery, useGetSalesOrderByIdQuery } from "@/store/features/app/salesOrder/salesOrder";
import { useNavigate, useSearchParams } from "react-router";
import { useGetCustomersQuery, useGetCustomerByIdQuery } from "@/store/features/app/customers/customersApi";
import type { Customer } from "@/shared/types/app/customers";
import { useGetAllProductsQuery, useGetProductByIdQuery } from "@/store/features/admin/productsApiService";
import { useState, useEffect } from "react";
import { useAppSelector } from "@/store/store";
import { BackButton } from "@/shared/components/common/BackButton";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { FileText, Package, ShoppingCart, User, Plus, ChevronDown, CheckCircle2, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { AddProductsModal } from "@/app/components/products/AddProductsModal";

const orderSchema = z
    .object({
        customerId: z.union([z.string(), z.number()]).refine(val => !!val, "Required"),
        notes: z.string().optional(),
        orderDate: z.string().min(1, "Required"),
        dueDate: z.string().min(1, "Required"),
        items: z.array(
            z.object({
                productId: z.union([z.string(), z.number()]).refine(val => !!val, "Product is required"),
                sku: z.string().optional(),
                specification: z.string().optional(),
                unit: z.string().optional(),
                quantity: z.number().min(1, "Quantity must be at least 1"),
                unitPrice: z.number().min(0, "Unit price must be at least 0"),
                discount: z.number().min(0, "Discount must be 0 or more"),
                salesTax: z.number().min(0, "Sales tax must be 0 or more"),
                stockQuantity: z.number().optional(),
                remark: z.string().optional(),
            })
        ),
        salesOrderId: z.union([z.string(), z.number()]).optional(),
        orderNumber: z.string().optional(),
    })
    .refine(
        (data) => {
            const orderDate = new Date(data.orderDate);
            const dueDate = new Date(data.dueDate);

            return dueDate >= orderDate;
        },
        {
            message: "Due date cannot be earlier than return date",
            path: ["dueDate"],
        }
    );

type SalesOrderFormValues = z.infer<typeof orderSchema>;

export default function CreateSalesReturn() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const customerIdParam = searchParams.get("customerId");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const currency = useAppSelector((state) => state.currency.value);
    const [addSalesReturn, { isLoading }] = useAddSalesReturnMutation();

    const form = useForm<SalesOrderFormValues>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            customerId: customerIdParam || "",
            orderDate: new Date().toISOString().split("T")[0],
            dueDate: new Date().toISOString().split("T")[0],
            notes: "",
            salesOrderId: "",
            orderNumber: "",
            items: [],
        },
    });

    const { control, watch } = form;
    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    const items = watch("items") ?? [];

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

    const watchSalesOrderId = watch("salesOrderId");
    const { data: salesOrderData } = useGetSalesOrderByIdQuery(String(watchSalesOrderId ?? ""), { skip: !watchSalesOrderId });

    useEffect(() => {
        if (salesOrderData?.data) {
            const order = salesOrderData.data;
            if (order.items && Array.isArray(order.items)) {
                const newItems = order.items.map((item: any) => ({
                    productId: item._id || item.productId || item.id,
                    sku: item.product?.sku || "",
                    specification: item.product?.specification || "",
                    unit: item.product?.unit?.name || "",
                    quantity: Number(item.quantity),
                    unitPrice: Number(item.unitPrice),
                    discount: Number(item.discount),
                    salesTax: Number(item.salesTaxPercent) || Number(item.sales_tax_percent) || 0,
                    stockQuantity: Number(item.product?.stockQuantity) || 0,
                    remark: item.remark || ""
                }));
                form.setValue("items", newItems);
            }
        }
    }, [salesOrderData, form]);

    /* -------------------- Sub-Components -------------------- */
    function CustomerSelectField({ field }: { field: ControllerRenderProps<SalesOrderFormValues, "customerId"> }) {
        const [open, setOpen] = useState(false);
        const [query, setQuery] = useState("");

        const { data, isLoading } = useGetCustomersQuery({ page: 1, limit: 20, search: query });
        const { data: singleData } = useGetCustomerByIdQuery(String(field.value ?? ""), { skip: !field.value });

        const list = Array.isArray(data?.data) ? data.data.filter((c: Customer) => c.isActive) : [];
        const selected = list.find((s: Customer) => s._id === field.value) ||
            (singleData?.data && singleData.data._id === field.value ? singleData.data : undefined);

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between h-9 px-3">
                        <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0 text-left">
                            <Avatar className="h-6 w-6 shrink-0">
                                <AvatarImage src={selected?.thumbUrl} />
                                <AvatarFallback><User className="h-3 w-3" /></AvatarFallback>
                            </Avatar>
                            <span className="truncate text-sm">{selected ? (selected.company || selected.name) : "Select Customer..."}</span>
                        </div>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                    <Command shouldFilter={false}>
                        <CommandInput placeholder="Search customers..." onValueChange={(value) => setQuery(value)} />
                        <CommandList>
                            <CommandEmpty>No active customers found.</CommandEmpty>
                            <CommandGroup>
                                {isLoading && <div className="py-2 px-3 text-sm text-gray-500">Loading...</div>}
                                {!isLoading && list.map((customer) => (
                                    <CommandItem key={customer._id} onSelect={() => { field.onChange(customer._id); setOpen(false); }} className="flex items-center gap-2 cursor-pointer py-3">
                                        <Avatar className="h-8 w-8 shrink-0"><AvatarImage src={customer.thumbUrl} /><AvatarFallback><User className="h-4 w-4" /></AvatarFallback></Avatar>
                                        <div className="flex flex-col overflow-hidden flex-1">
                                            <span className="truncate font-medium text-sm">{customer.company || customer.name}</span>
                                            <span className="truncate text-xs text-muted-foreground">{customer.name}</span>
                                            {customer.address && <span className="truncate text-xs text-muted-foreground/80">{customer.address}</span>}
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

    function SalesOrderSelectField({ field, customerId, setValue }: { field: ControllerRenderProps<SalesOrderFormValues, "salesOrderId">; customerId: string | number | undefined; setValue: UseFormSetValue<SalesOrderFormValues> }) {
        const [open, setOpen] = useState(false);
        const [query, setQuery] = useState("");

        const { data, isLoading } = useGetAllSalesOrdersQuery({ page: 1, limit: 100, search: query, customerId: String(customerId) }, { skip: !customerId });
        const { data: singleData } = useGetSalesOrderByIdQuery(String(field.value ?? ""), { skip: !field.value });

        const list = (Array.isArray(data?.data) ? data.data : []).filter((so: any) => String(so.customerId || so.customer_id) === String(customerId));
        const selected = list.find((so: any) => so._id === field.value) ||
            (singleData?.data && singleData.data._id === field.value ? singleData.data : undefined);

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" disabled={!customerId} className="w-full justify-between h-9 px-3 text-left overflow-hidden">
                        <span className="truncate text-sm">{selected ? (selected.orderNumber || `SO-${selected._id}`) : "Select Sales Order..."}</span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput placeholder="Search sales orders..." onValueChange={(value) => setQuery(value)} />
                        <CommandList className="max-h-[300px]">
                            <CommandEmpty>No sales orders found.</CommandEmpty>
                            <CommandGroup>
                                {isLoading && <div className="py-2 px-3 text-sm text-muted-foreground">Loading...</div>}
                                {!isLoading && list.map((so: any) => (
                                    <CommandItem key={so._id} onSelect={() => { field.onChange(so._id); setValue("orderNumber", so.orderNumber); setOpen(false); }} className="flex items-center gap-2 cursor-pointer">
                                        <div className="flex flex-col flex-1">
                                            <span className="font-medium text-sm">{so.orderNumber}</span>
                                            <span className="text-xs text-muted-foreground">Date: {new Date(so.orderDate).toLocaleDateString()} | Total: {so.totalPayableAmount}</span>
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

    function ProductSelectField({ field, index, setValue }: { field: ControllerRenderProps<SalesOrderFormValues, `items.${number}.productId`>; index: number; setValue: UseFormSetValue<SalesOrderFormValues> }) {
        const [open, setOpen] = useState(false);
        const [query, setQuery] = useState("");

        const { data, isLoading } = useGetAllProductsQuery({ page: 1, limit: 50, search: query });
        const { data: singleData } = useGetProductByIdQuery(String(field.value ?? ""), { skip: !field.value });

        const list = Array.isArray(data?.data) ? data.data : [];
        const selected = list.find((p) => p._id === field.value) ||
            (singleData?.data && singleData.data._id === field.value ? singleData.data : undefined);

        const handleSelect = (productId: string | number) => {
            const product = list.find((p) => ( p._id) === productId);
            field.onChange(productId);
            setOpen(false);
            if (product) {
                setValue(`items.${index}.salesTax`, product.salesTax || 0);
                setValue(`items.${index}.unitPrice`, Number(product.price) || 0);
                setValue(`items.${index}.sku`, product.sku || "");
                setValue(`items.${index}.specification`, product.specification || "");
                setValue(`items.${index}.unit`, product.unit?.name || "");
                setValue(`items.${index}.stockQuantity`, product.stockQuantity || 0);
            }
        };

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between h-9 overflow-hidden text-left">
                        <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                            {selected && <Avatar className="h-6 w-6 shrink-0"><AvatarImage src={selected.thumbUrl} /><AvatarFallback><Package className="h-3 w-3" /></AvatarFallback></Avatar>}
                            <span className="truncate text-sm">{selected ? selected.name : "Select product..."}</span>
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput placeholder="Search products..." onValueChange={(value) => setQuery(value)} />
                        <CommandList className="max-h-[300px]">
                            <CommandEmpty>No products found.</CommandEmpty>
                            <CommandGroup>
                                {isLoading && <div className="py-2 px-3 text-sm text-muted-foreground">Loading...</div>}
                                {!isLoading && list.map((product) => (
                                    <CommandItem key={product._id} onSelect={() => handleSelect(product._id)} className="flex items-center gap-2 cursor-pointer">
                                        <Avatar className="h-8 w-8 shrink-0"><AvatarImage src={product.thumbUrl} /><AvatarFallback><Package className="h-4 w-4" /></AvatarFallback></Avatar>
                                        <div className="flex flex-col"><span className="font-medium text-sm">{product.name}</span><span className="text-xs text-muted-foreground">SKU: {product.sku} | Unit: {product.unit?.name || "-"} | Stock: {product.stockQuantity || 0}</span></div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        );
    }


    const onSubmit = async (values: SalesOrderFormValues) => {
        try {
            const calculatedItems = values.items.map((it) => {
                const unitPrice = Number(it.unitPrice || 0);
                const qty = Number(it.quantity || 0);
                const discount = Number(it.discount || 0);
                const taxRate = Number(it.salesTax || 0);
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
                customerId: values.customerId,
                orderDate: values.orderDate,
                dueDate: values.dueDate,
                notes: values.notes,
                items: values.items.map((item) => ({
                    productId: item.productId,
                    quantity: Number(item.quantity),
                    unitPrice: Number(item.unitPrice),
                    discount: Number(item.discount),
                    salesTax: Number(item.salesTax),
                    remark: item.remark,
                })),
                ...(values.salesOrderId && { orderId: values.salesOrderId }),
                ...(values.orderNumber && { orderNumber: values.orderNumber }),
                totalAmount: totalSubtotal,
                discountAmount: totalDiscount,
                taxAmount: totalTax,
                totalPayableAmount: grandTotal,
                netAmount: totalSubtotal - totalDiscount
            };

            await addSalesReturn(payload).unwrap();
            toast.success("Sales Return Created Successfully");
            navigate("/dashboard/sales/returns");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to create sales return");
        }
    };

    return (
        <div className="space-y-6 w-full pb-6">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Create Sales Return</h1>
                    <p className="text-muted-foreground mt-2 text-sm">Create a new sales return order for your customer</p>
                </div>
                <BackButton />
            </div>

            <Form {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                    <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-lg max-w-5xl">
                        <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border-b-1 border-blue-100 dark:border-blue-900 py-3 gap-0">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30"><FileText className="w-6 h-6 text-white" /></div>
                                <div className="flex-1">
                                    <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Customer & Order Details</CardTitle>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Select customer and set return dates</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pb-6 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField name="customerId" control={control} render={({ field }) => (
                                    <FormItem><FormLabel>Customer</FormLabel><FormControl><CustomerSelectField field={field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField name="salesOrderId" control={control} render={({ field }) => (
                                    <FormItem><FormLabel>Sales Order</FormLabel><FormControl><SalesOrderSelectField field={field} customerId={watch("customerId")} setValue={form.setValue} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField name="orderDate" control={control} render={({ field }) => (
                                    <FormItem><FormLabel>Return Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField name="dueDate" control={control} render={({ field }) => (
                                    <FormItem><FormLabel>Due Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField name="notes" control={control} render={({ field }) => (
                                    <FormItem className="md:col-span-2"><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Optional notes..." {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border-b-1 border-blue-100 dark:border-blue-900 py-3 gap-0">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30"><ShoppingCart className="w-6 h-6 text-white" /></div>
                                    <div className="flex-1">
                                        <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Order Items</CardTitle>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 text-left">Add products to this sales return</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Button type="button" variant="outline" onClick={() => append({ productId: "", sku: "", specification: "", unit: "", quantity: 1, unitPrice: 0, discount: 0, salesTax: 0, stockQuantity: 0 })} className="gap-2"><Plus className="w-4 h-4" /> Add Row</Button>
                                    <Button type="button" onClick={() => setIsModalOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"><ShoppingCart className="w-4 h-4" /> Add Items</Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pb-6">
                            <div className="space-y-4 overflow-x-auto min-w-full">
                                <div className="hidden xl:flex min-w-max gap-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 items-center font-bold text-[12px] capitalize tracking-wider text-gray-500">
                                    <div className="w-32 sticky left-0 bg-gray-100 dark:bg-gray-800 z-20 text-left">SKU</div>
                                    <div className="w-[350px] sticky left-[144px] bg-gray-100 dark:bg-gray-800 z-20 text-left">Product</div>
                                    <div className="w-32 text-left">Spec.</div>
                                    <div className="w-24 text-left">Unit</div>
                                    <div className="w-24 text-left">Stock</div>
                                    <div className="w-32 text-left">Price</div>
                                    <div className="w-24 text-left">Qty</div>
                                    <div className="w-24 text-left">Discount</div>
                                    <div className="w-32 text-left">Pretax</div>
                                    <div className="w-24 text-left">Tax %</div>
                                    <div className="w-32 text-left">Tax Amt</div>
                                    <div className="w-36 text-left pr-4 text-sm">Total ({currency})</div>
                                    <div className="flex-1 min-w-[200px]">Remark</div>
                                    <div className="w-10"></div>
                                </div>
                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex flex-wrap xl:flex-nowrap min-w-max gap-4 items-start xl:items-center bg-gray-50 p-4 rounded-xl border border-gray-100 dark:bg-gray-900/40 dark:border-gray-800 transition-all duration-200 hover:shadow-md">
                                            <FormField name={`items.${index}.sku`} control={control} render={({ field }) => (
                                                <FormItem className="w-full sm:w-28 xl:w-32 sticky left-0 bg-inherit xl:z-10"><FormLabel className="xl:hidden">SKU</FormLabel><FormControl><Input {...field} readOnly className="bg-gray-100 h-9 font-mono text-[10px]" /></FormControl></FormItem>
                                            )} />
                                            <div className="w-[350px] sticky left-[144px] bg-inherit xl:z-10">
                                                <FormField name={`items.${index}.productId`} control={control} render={({ field }) => (
                                                    <FormItem><FormLabel className="xl:hidden">Product</FormLabel><FormControl><ProductSelectField field={field} index={index} setValue={form.setValue} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                            </div>
                                            <FormField name={`items.${index}.specification`} control={control} render={({ field }) => (
                                                <FormItem className="w-full sm:w-32 xl:w-32"><FormLabel className="xl:hidden">Spec.</FormLabel><FormControl><Input {...field} readOnly className="bg-gray-100 h-9" /></FormControl></FormItem>
                                            )} />
                                            <FormField name={`items.${index}.unit`} control={control} render={({ field }) => (
                                                <FormItem className="w-24"><FormLabel className="xl:hidden">Unit</FormLabel><FormControl><Input {...field} readOnly className="bg-gray-100 h-9 text-center" /></FormControl></FormItem>
                                            )} />
                                            <div className="w-24"><FormLabel className="xl:hidden text-xs font-bold block mb-1">Stock</FormLabel><Input type="number" value={items[index].stockQuantity || 0} readOnly className="bg-gray-100 h-9 text-right" /></div>
                                            <div className="w-32 text-left bg-gray-100 dark:bg-gray-800 rounded-md">
                                                <FormField name={`items.${index}.unitPrice`} control={control} render={({ field }) => (
                                                <FormItem className="w-full"><FormLabel className="xl:hidden text-xs font-bold">Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} readOnly className="h-9 text-right bg-gray-100 dark:bg-gray-800 border-none" /></FormControl></FormItem>
                                            )} />
                                            </div>
                                            <FormField name={`items.${index}.quantity`} control={control} render={({ field }) => (
                                                <FormItem className="w-24"><FormLabel className="xl:hidden text-xs font-bold">Qty</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-9 text-right bg-white dark:bg-gray-950" /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField name={`items.${index}.discount`} control={control} render={({ field }) => (
                                                <FormItem className="w-24"><FormLabel className="xl:hidden text-xs font-bold">Discount</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-9 text-right" /></FormControl></FormItem>
                                            )} />
                                            <div className="w-32 text-left">
                                                <FormLabel className="xl:hidden text-xs font-bold block mb-1">Pretax</FormLabel>
                                                <Input type="number" value={calculatedItems[index]?.taxableAmount.toFixed(2) ?? "0.00"} readOnly className="bg-gray-100 h-9 text-right" />
                                            </div>
                                            <FormField name={`items.${index}.salesTax`} control={control} render={({ field }) => (
                                                <FormItem className="w-24 text-left"><FormLabel className="xl:hidden text-xs font-bold">Tax%</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-9 text-right" /></FormControl></FormItem>
                                            )} />
                                            <div className="w-32 text-left">
                                                <FormLabel className="xl:hidden text-xs font-bold block mb-1">Tax Amt</FormLabel>
                                                <Input type="number" value={calculatedItems[index]?.taxAmount.toFixed(2) ?? "0.00"} readOnly className="bg-gray-100 h-9 text-right" />
                                            </div>
                                            <div className="w-36 text-left pr-4 font-semibold h-9 flex items-center text-sm">
                                                {currency} {((items[index].quantity * items[index].unitPrice - items[index].discount) * (1 + (items[index].salesTax || 0) / 100)).toFixed(2)}
                                            </div>
                                            <FormField name={`items.${index}.remark`} control={control} render={({ field }) => (
                                                <FormItem className="flex-1 min-w-[200px]"><FormLabel className="xl:hidden">Remark</FormLabel><FormControl><Input {...field} placeholder="Remark..." className="h-9" /></FormControl></FormItem>
                                            )} />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"><X className="w-4 h-4" /></Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-xl border-2 border-blue-100 dark:border-blue-900 w-full max-w-[400px]">
                                    <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b border-blue-200 dark:border-blue-800 text-left">Return Summary</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm"><span className="font-medium text-gray-600 dark:text-gray-400">Subtotal</span><span className="font-semibold">{currency} {totalSubtotal.toFixed(2)}</span></div>
                                        <div className="flex justify-between text-sm text-red-600"><span className="font-medium">Discount</span><span className="font-semibold">- {currency} {totalDiscount.toFixed(2)}</span></div>
                                        <div className="flex justify-between text-sm"><span className="font-medium text-gray-600 dark:text-gray-400">Tax</span><span className="font-semibold">{currency} {totalTax.toFixed(2)}</span></div>
                                        <div className="flex justify-between text-lg font-bold border-t-2 border-blue-200 pt-3 mt-2"><span className="text-gray-800">Grand Total</span><span className="text-blue-600">{currency} {grandTotal.toFixed(2)}</span></div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4 pt-4 pb-10">
                        <Button type="button" variant="outline" onClick={() => navigate('/dashboard/sales/returns')} className="px-8 py-3 h-auto font-medium">Cancel</Button>
                        <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-3 h-auto font-semibold text-white shadow-lg shadow-blue-500/40 hover:-translate-y-0.5 transition-all">
                            {isLoading ? "Creating..." : <><CheckCircle2 className="w-5 h-5 mr-2" /> Create Sales Return</>}
                        </Button>
                    </div>
                </form>
            </Form>

            <AddProductsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialSelectedIds={items.map(i => String(i.productId)).filter(id => id)}
                onApply={(addedProducts, deselectedIds) => {
                    const currentItems = form.getValues("items");
                    const newItems = currentItems.filter(item => !deselectedIds.includes(item.productId as string));
                    addedProducts.forEach(product => {
                        if (!newItems.some(item => item.productId === product._id)) {
                            newItems.push({ productId: product._id, sku: product.sku || "", specification: product.specification || "", unit: product.unit?.name || "", quantity: 1, unitPrice: Number(product.price) || 0, discount: 0, salesTax: product.salesTax || 0, stockQuantity: product.stockQuantity || 0 });
                        }
                    });
                    form.setValue("items", newItems);
                }}
                orderType="sales"
            />
        </div>
    );
}
