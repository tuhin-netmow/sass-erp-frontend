"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useForm, useFieldArray, type ControllerRenderProps } from "react-hook-form";
import { toast } from "sonner";
import { format } from "date-fns";
import { ArrowLeft, User, ShoppingCart, Receipt, CheckCircle2, Plus, X, Package, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";

import { useGetAllProductsQuery } from "@/store/features/admin/productsApiService";
import { useGetAllStaffsQuery } from "@/store/features/app/staffs/staffApiService";
import {
  useAddSalesInvoiceMutation,
  useAddSalesOrderMutation,
} from "@/store/features/app/salesOrder/salesOrder";
import { useGetActiveCustomersQuery, useLazyGetCustomerByIdQuery } from "@/store/features/app/customers/customersApi";
import type { SalesOrderFormValues } from "@/shared/types/app/salesOrder.types";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router";
import { useAppSelector } from "@/store/store";
import { Textarea } from "@/shared/components/ui/textarea";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { AddProductsModal } from "@/app/components/products/AddProductsModal";
import type { Customer } from "@/shared/types/app/customers";
import { cn } from "@/shared/utils/utils";
import { Calendar } from "@/shared/components/ui/calendar";
import type { Product } from "@/shared";

const orderSchema = z
  .object({
    customerId: z.string().min(1, "Customer is required"),
    shippingAddress: z.string().min(5, "Shipping address is required"),
    orderDate: z.string().min(1, "Order date is required"),
    dueDate: z.string().min(1, "Due date is required"),
    deliveryDate: z.string().optional(),
    staffId: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(
      z.object({
        productId: z.string().min(1, "Product is required"),
        sku: z.string().optional(),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        unitPrice: z.number().min(1, "Unit price must be at least 1"),
        discount: z.number().min(0, "Discount must be 0 or more"),
        salesTax: z.number().min(0, "Sales tax must be 0 or more"),
        specification: z.string().optional(),
        unit: z.string().optional(),
        stockQuantity: z.number().optional(),
        remark: z.string().optional(),
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
      message: "Due date cannot be earlier than order date",
      path: ["dueDate"],
    }
  )
  .refine(
    (data) => {
      if (!data.deliveryDate) return true;
      const orderDate = new Date(data.orderDate);
      const deliveryDate = new Date(data.deliveryDate);

      return deliveryDate >= orderDate;
    },
    {
      message: "Delivery date cannot be earlier than order date",
      path: ["deliveryDate"],
    }
  );

/* -------------------- Sub-Components -------------------- */
const CustomerSelectField = ({
  field,
  onCustomerSelect,
  customerIdFromParam,
}: {
  field: { value: string; onChange: (v: string) => void };
  onCustomerSelect?: (customer: Customer) => void;
  customerIdFromParam: string | null;
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data, isLoading } = useGetActiveCustomersQuery({
    page: 1,
    limit: 20,
    search: query,
  });
  const list = useMemo(() => Array.isArray(data?.data) ? data.data : [], [data]);
  const selected = list.find((c) => String(c._id) === String(field.value));

  const hasPreselectedRef = useRef(false);

  useEffect(() => {
    if (customerIdFromParam && !hasPreselectedRef.current && list.length > 0) {
      const preselected = list.find(
        (c) =>
          String(c._id) === customerIdFromParam ||
          c.publicId === customerIdFromParam
      );
      if (preselected) {
        field.onChange(String(preselected._id));
        if (onCustomerSelect) onCustomerSelect(preselected);
        hasPreselectedRef.current = true;
      }
    }
  }, [customerIdFromParam, list, field, onCustomerSelect]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-9 overflow-hidden"
        >
          <div className="flex items-center gap-2 min-w-0">
            {selected ? (
              <>
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarImage src={selected.thumbUrl} alt={selected.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-left font-medium min-w-0 flex-1">
                  {selected.name}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">Select customer...</span>
            )}
          </div>
          <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search customers..."
            onValueChange={setQuery}
          />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No customers found</CommandEmpty>
            <CommandGroup>
              {isLoading && (
                <div className="py-4 px-3 text-center text-sm text-gray-500">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
                  Loading...
                </div>
              )}
              {!isLoading &&
                list.map((customer) => (
                  <CommandItem
                    key={customer._id}
                    onSelect={() => {
                      field.onChange(String(customer._id));
                      if (onCustomerSelect) onCustomerSelect(customer);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 p-2"
                  >
                    <Avatar className="h-9 w-9 shrink-0 border border-gray-100 shadow-sm">
                      <AvatarImage
                        src={customer.thumbUrl}
                        alt={customer.name}
                      />
                      <AvatarFallback className="bg-blue-50 text-blue-500">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden flex-1">
                      <span className="truncate font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {customer.name}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono">
                          {customer.publicId}
                        </span>
                        {customer.company && (
                          <span className="truncate">• {customer.company}</span>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const StaffSelectField = ({
  field,
}: {
  field: { value?: string; onChange: (v: string) => void };
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data, isLoading } = useGetAllStaffsQuery({
    page: 1,
    limit: 20,
    search: query,
    status: "active",
  });
  const list = useMemo(() => Array.isArray(data?.data) ? data.data : [], [data]);
  const selected = list.find((s) => s._id === field.value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between h-9 overflow-hidden font-normal text-left",
            !field.value && "text-muted-foreground"
          )}
          type="button"
        >
          <div className="flex items-center gap-2 min-w-0">
            {selected ? (
              <>
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarImage src={selected.thumbUrl} alt={selected.name} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-600">
                    <User className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-left font-medium min-w-0 flex-1">
                  {selected.name}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">Select staff...</span>
            )}
          </div>
          <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search staff..." onValueChange={setQuery} />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No staff found</CommandEmpty>
            <CommandGroup>
              {isLoading && (
                <div className="py-4 px-3 text-center text-sm text-gray-500">
                  <div className="animate-spin w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2" />
                  Loading...
                </div>
              )}
              {!isLoading &&
                list.map((staff) => (
                  <CommandItem
                    key={staff._id}
                    onSelect={() => {
                      field.onChange(staff._id);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 p-2"
                  >
                    <Avatar className="h-9 w-9 shrink-0 border border-gray-100 shadow-sm">
                      <AvatarImage src={staff.thumbUrl} alt={staff.name} />
                      <AvatarFallback className="bg-indigo-50 text-indigo-500">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden flex-1">
                      <span className="truncate font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {staff.name}
                      </span>
                      {staff.email && (
                        <span className="truncate text-[10px] text-muted-foreground">
                          {staff.email}
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
};

const ProductSelectField = ({
  field,
  onProductSelect,
}: {
  field: {
    value: string;
    onChange: (v: string) => void;
  };
  onProductSelect?: (product: Product) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data, isLoading } = useGetAllProductsQuery({
    page: 1,
    limit: 50,
    search: query,
  });
  const list = useMemo(() => Array.isArray(data?.data) ? data.data : [], [data]);
  const selected = list.find((p) => p._id === field.value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className="w-full justify-between overflow-hidden h-9"
          variant="outline"
        >
          <div className="flex items-center gap-2 min-w-0">
            {selected ? (
              <>
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarImage src={selected.thumbUrl} alt={selected.name} />
                  <AvatarFallback className="bg-blue-50 text-blue-500">
                    <Package className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-left min-w-0 flex-1 font-medium">
                  {selected.name}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">Select product...</span>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search products..." onValueChange={setQuery} />
          <CommandList className="max-h-[350px]">
            <CommandEmpty>No products found</CommandEmpty>
            <CommandGroup>
              {isLoading && (
                <div className="py-4 px-3 text-center text-sm text-gray-500">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
                  Loading...
                </div>
              )}
              {!isLoading &&
                list.map((product) => (
                  <CommandItem
                    key={product._id}
                    onSelect={() => {
                      if (onProductSelect) {
                        onProductSelect(product);
                      } else {
                        field.onChange(product._id);
                      }
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 p-2"
                  >
                    <Avatar className="h-10 w-10 shrink-0 border border-gray-100 shadow-sm">
                      <AvatarImage src={product.thumbUrl} alt={product.name} />
                      <AvatarFallback className="bg-blue-50 text-blue-500">
                        <Package className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <span className="font-semibold text-sm truncate text-gray-900 dark:text-gray-100">
                        {product.name}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground tracking-tight">
                        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1 rounded uppercase font-bold">
                          {product.sku}
                        </span>
                        <span>• {product.unit?.name || "N/A"}</span>
                        <span
                          className={cn(
                            "ml-auto font-bold",
                            (product.stockQuantity || 0) <= 0
                              ? "text-red-500"
                              : "text-emerald-500"
                          )}
                        >
                          Stock: {product.stockQuantity || 0}
                        </span>
                      </div>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const DatePickerField = ({ field, label }: { field: ControllerRenderProps<SalesOrderFormValues, "orderDate" | "dueDate" | "deliveryDate">; label: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <FormItem className="flex flex-col">
      <FormLabel>{label}</FormLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant={"outline"}
              className={cn(
                "w-full pl-3 text-left font-normal border-gray-200 dark:border-gray-800 h-9",
                !field.value && "text-muted-foreground"
              )}
            >
              {field.value ? (
                format(new Date(field.value), "dd/MM/yyyy")
              ) : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={field.value ? new Date(field.value) : undefined}
            onSelect={(date) => {
              if (date) {
                field.onChange(format(date, "yyyy-MM-dd"));
                setOpen(false);
              }
            }}
            disabled={(date) => date < new Date("1900-01-01")}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
};

export default function CreateSalesOrderPage() {
  const [searchParam] = useSearchParams();
  const location = useLocation();
  const isCreateAny = location.pathname.includes("/create-any");
  const customerIdFromParam = searchParam.get("customerId");
  const navigate = useNavigate();
  const [addSalesOrder, { isLoading }] = useAddSalesOrderMutation();
  const [createInvoice] = useAddSalesInvoiceMutation();

  const currency = useAppSelector((state) => state.currency.value);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const form = useForm<SalesOrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerId: '',
      staffId: '',
      shippingAddress: "",
      orderDate: new Date().toISOString().split("T")[0],
      dueDate: new Date().toISOString().split("T")[0],
      deliveryDate: new Date().toISOString().split("T")[0],
      notes: "",
      items: [
        {
          productId: '',
          sku: "",
          specification: "",
          unit: "",
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          salesTax: 0,
          stockQuantity: 0,
          remark: "",
        },
      ],
    },
  });

  const { control, watch, setValue } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items") ?? [];
  const selectedCustomerId = watch("customerId");
  const [triggerGetCustomer, { data: customerDetails }] =
    useLazyGetCustomerByIdQuery();

  useEffect(() => {
    if (selectedCustomerId) {
      triggerGetCustomer(selectedCustomerId);
    }
  }, [selectedCustomerId, triggerGetCustomer]);

  const customerStats = customerDetails?.data;

  const calculatedItems = items.map((it) => {
    const unitPrice = Number(it.unitPrice || 0);
    const qty = Number(it.quantity || 0);
    const discount = Number(it.discount || 0);
    const taxRate = Number(it.salesTax || 0);

    const subtotal = unitPrice * qty;
    const taxableAmount = subtotal - discount;
    const taxAmount = taxableAmount * (taxRate / 100);
    const total = taxableAmount + taxAmount;

    return {
      subtotal,
      discount,
      pretaxAmount: taxableAmount,
      taxableAmount,
      taxAmount,
      total,
    };
  });

  const totalSubtotal = calculatedItems.reduce((sum, it) => sum + it.subtotal, 0);
  const totalDiscount = calculatedItems.reduce((sum, it) => sum + it.discount, 0);
  const totalTax = calculatedItems.reduce((sum, it) => sum + it.taxAmount, 0);
  const grandTotal = calculatedItems.reduce((sum, it) => sum + it.total, 0);

  const handleCustomerSelect = useCallback(
    (customer: Customer) => {
      if (customer.address) {
        setValue("shippingAddress", customer.address);
      }
    },
    [setValue]
  );

  const handleProductSelect = useCallback(
    (product: Product, index: number, field: ControllerRenderProps<SalesOrderFormValues, `items.${number}.productId`>) => {
      const currentItems = form.getValues("items");
      const isDuplicate = currentItems.some(
        (item, idx) => item.productId === product._id && idx !== index
      );
      if (isDuplicate) {
        toast.error(`"${product.name}" is already in the list`);
        return;
      }
      setValue(`items.${index}.salesTax`, product.salesTax ?? 0);
      setValue(`items.${index}.stockQuantity`, product.stockQuantity ?? 0);
      setValue(`items.${index}.unitPrice`, Number(product.price) || 0);
      setValue(`items.${index}.sku`, product.sku ?? "");
      setValue(`items.${index}.specification`, product.specification ?? "");
      setValue(`items.${index}.unit`, product.unit?.name ?? "");
      if ((product.stockQuantity ?? 0) === 0) {
        setValue(`items.${index}.quantity`, 0);
      } else {
        setValue(`items.${index}.quantity`, 1);
      }
      field.onChange(product._id);
    },
    [setValue, form]
  );

  const onSubmit = async (values: SalesOrderFormValues) => {
    if (!values.customerId)
      return toast.error("Please select a customer");
    if (values.items.some((i) => !i.productId))
      return toast.error("Please select all products");

    try {
      const payload = {
        orderDate: values.orderDate,
        dueDate: values.dueDate,
        deliveryDate: values.deliveryDate,
        customerId: values.customerId,
        staffId: values.staffId,
        shippingAddress: values.shippingAddress,
        notes: values.notes,
        items: values.items.map((i) => ({
          productId: i.productId,
          specification: i.specification,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          discount: Number(i.discount),
          salesTax: Number(i.salesTax),
          remark: i.remark,
        })),
      };

      console.log('create order payload', payload);

      // ➤ STEP 1: Create Sales Order
      const orderRes = await addSalesOrder(payload).unwrap();

      if (orderRes.status && orderRes?.data?._id) {
        toast.success("Sales Order Created! Creating Invoice...");

        // ➤ STEP 2: Create Invoice Automatically
        const invoicePayload = {
          orderId: orderRes.data._id,
          dueDate: values.dueDate, // same due date as order
        };

        const invoiceRes = await createInvoice(invoicePayload).unwrap();

        if (invoiceRes.status) {
          toast.success("Invoice Created Successfully!");
        } else {
          toast.error("Order created but invoice failed to generate.");
        }

        // ➤ Redirect
        navigate("/dashboard/sales/orders");
      }

    } catch (error) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to create sales order");
      console.error(error);
    }
  };



  return (
    <div className="space-y-6 w-full pb-6">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Create Sales Order
          </h1>
          <p className="text-muted-foreground mt-2">Create a new sales order with customer and product details</p>
        </div>
        <Link to="/dashboard/sales/orders">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Orders
          </Button>
        </Link>
      </div>

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Customer & Shipping */}
          <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-lg max-w-5xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border-b-1 border-blue-100 dark:border-blue-900 py-3 gap-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Customer & Shipping</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Select customer and shipping details</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <FormField
                  name="customerId"
                  control={control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <FormControl>
                        <CustomerSelectField
                          field={field}
                          onCustomerSelect={handleCustomerSelect}
                          customerIdFromParam={customerIdFromParam}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="orderDate"
                  control={control}
                  render={({ field }) => (
                    <DatePickerField field={field} label="Order Date" />
                  )}
                />

                {/* Customer Financial Summary Row */}
                {selectedCustomerId && customerStats && (
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 px-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900 my-2 shadow-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">Total Purchase</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {currency} {(Number(customerStats.purchaseAmount ?? customerStats.totalSales ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 xl:border-l border-blue-100 dark:border-blue-800 xl:pl-4">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">Total Paid</span>
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {currency} {(Number(customerStats.paidAmount ?? (customerStats.totalSales || 0) - (customerStats.outstandingBalance || 0))).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 xl:border-l border-blue-100 dark:border-blue-800 xl:pl-4">
                      <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 tracking-wider">Due Amount</span>
                      <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
                        {currency} {(Number(customerStats.dueAmount ?? customerStats.outstandingBalance ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}

                <FormField
                  name="dueDate"
                  control={control}
                  render={({ field }) => (
                    <DatePickerField field={field} label="Due Date" />
                  )}
                />

                <FormField
                  name="deliveryDate"
                  control={control}
                  render={({ field }) => (
                    <DatePickerField field={field} label="Delivery Date" />
                  )}
                />

                <FormField
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Order Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Special instructions, delivery notes, etc..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="shippingAddress"
                  control={control}
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Shipping Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Enter full address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isCreateAny && (
                  <FormField
                    name="staffId"
                    control={control}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Assigned Staff</FormLabel>
                        <FormControl>
                          <StaffSelectField field={field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border-b-1 border-blue-100 dark:border-blue-900 py-3 gap-0">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Order Items</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Add products to the order</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      append({
                        productId: '',
                        sku: "",
                        quantity: 1,
                        unitPrice: 0,
                        discount: 0,
                        salesTax: 0,
                        stockQuantity: 0,
                        remark: "",
                      })
                    }
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Row
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/20 text-white"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add Items
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-6">

              <div className="space-y-4 overflow-x-auto min-w-full">
                {/* Header for Desktop and Mobile (Horizontal Scroll) */}
                <div className="flex min-w-max gap-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 items-center font-bold text-[12px] capitalize tracking-wider text-gray-500">
                  <div className="w-32 xl:sticky xl:left-0 bg-gray-100 dark:bg-gray-800 xl:z-20 text-left">SKU</div>
                  <div className="w-[350px] xl:sticky xl:left-[144px] bg-gray-100 dark:bg-gray-800 xl:z-20 text-left">Product</div>
                  <div className="w-36 text-left">Spec.</div>
                  <div className="w-24 text-left">Unit</div>
                  <div className="w-24 text-left">Stock</div>
                  <div className="w-32 text-left">Price</div>
                  <div className="w-24 text-left">Qty</div>
                  <div className="w-24 text-left">Discount</div>
                  <div className="w-32 text-left">Pretax</div>
                  <div className="w-24 text-left">Tax %</div>
                  <div className="w-32 text-left">Tax Amt </div>
                  <div className="w-36 text-left pr-4">Total ({currency})</div>
                  <div className="flex-1 min-w-[200px]">Remark</div>
                  <div className="w-12"></div>
                </div>

                <div className="space-y-4">
                  {fields.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex flex-nowrap min-w-max gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-100 dark:bg-gray-900/40 dark:border-gray-800 transition-all duration-200 hover:shadow-md"
                    >
                      {/* SKU */}
                      <FormField
                        name={`items.${index}.sku`}
                        control={control}
                        render={({ field }) => (
                          <FormItem className="w-32 xl:sticky xl:left-0 bg-inherit xl:z-10">
                            <FormLabel className="hidden text-xs uppercase tracking-wider text-gray-500 font-bold">SKU</FormLabel>
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
                      <div className="w-[350px] xl:sticky xl:left-[144px] bg-inherit xl:z-10">
                        <FormField
                          name={`items.${index}.productId`}
                          control={control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="hidden text-xs uppercase tracking-wider text-gray-500 font-bold">Product</FormLabel>
                              <FormControl>
                                <ProductSelectField
                                  field={field}
                                  onProductSelect={(product) => handleProductSelect(product, index, field)}
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
                          <FormItem className="w-36">
                            <FormLabel className="hidden text-xs uppercase tracking-wider text-gray-500 font-bold">Spec.</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Spec."
                                className="bg-white border-gray-200 dark:bg-gray-950 dark:border-gray-800 h-9"
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
                          <FormItem className="w-24">
                            <FormLabel className="hidden text-xs uppercase tracking-wider text-gray-500 font-bold">Unit</FormLabel>
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
                      <FormField
                        name={`items.${index}.stockQuantity`}
                        control={control}
                        render={({ field }) => (
                          <FormItem className="w-24">
                            <FormLabel className="hidden text-xs uppercase tracking-wider text-gray-500 font-bold">Stock</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                readOnly
                                className="bg-gray-100 cursor-not-allowed border-gray-200 dark:bg-gray-800 dark:border-gray-700 h-9 text-right"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Price */}
                      <FormField
                        name={`items.${index}.unitPrice`}
                        control={control}
                        render={({ field }) => (
                          <FormItem className="w-32">
                            <FormLabel className="hidden text-xs uppercase tracking-wider text-gray-500 font-bold">Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                className="bg-white border-gray-200 dark:bg-gray-950 dark:border-gray-800 h-9 text-right"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Qty */}
                      <FormField
                        name={`items.${index}.quantity`}
                        control={control}
                        render={({ field }) => {
                          const stockQuantity = form.getValues(`items.${index}.stockQuantity`) ?? 0;
                          return (
                            <FormItem className="w-24">
                              <FormLabel className="hidden text-xs uppercase tracking-wider text-gray-500 font-bold">Qty</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  {...field}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (val > stockQuantity) {
                                      field.onChange(stockQuantity);
                                    } else {
                                      field.onChange(val);
                                    }
                                  }}
                                  className="bg-white border-gray-200 dark:bg-gray-950 dark:border-gray-800 h-9 text-right"
                                  disabled={stockQuantity === 0}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      {/* Discount */}
                      <FormField
                        name={`items.${index}.discount`}
                        control={control}
                        render={({ field }) => (
                          <FormItem className="w-24">
                            <FormLabel className="hidden text-xs uppercase tracking-wider text-gray-500 font-bold">Discount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                className="bg-white border-gray-200 dark:bg-gray-950 dark:border-gray-800 h-9 text-right"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Pretax Amt */}
                      <div className="w-32">
                        <label className="hidden block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Pretax Amt</label>
                        <Input
                          type="number"
                          value={calculatedItems[index]?.pretaxAmount.toFixed(2) ?? "0.00"}
                          readOnly
                          className="bg-gray-100 cursor-not-allowed border-gray-200 dark:bg-gray-800 dark:border-gray-700 h-9 text-right"
                        />
                      </div>

                      {/* Tax % */}
                      <FormField
                        name={`items.${index}.salesTax`}
                        control={control}
                        render={({ field }) => (
                          <FormItem className="w-24">
                            <FormLabel className="hidden text-xs uppercase tracking-wider text-gray-500 font-bold">Tax %</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                className="bg-white border-gray-200 dark:bg-gray-950 dark:border-gray-800 text-right h-9"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Total Tax */}
                      <div className="w-32">
                        <label className="hidden block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Tax Amt</label>
                        <Input
                          type="number"
                          value={calculatedItems[index]?.taxAmount.toFixed(2) ?? "0.00"}
                          readOnly
                          className="bg-gray-100 cursor-not-allowed border-gray-200 dark:bg-gray-800 dark:border-gray-700 h-9 text-right"
                        />
                      </div>

                      {/* Line Total */}
                      <div className="w-36 text-right">
                        <label className="hidden block text-xs uppercase tracking-wider text-blue-600 font-bold mb-2">Total</label>
                        <div className="h-9 flex items-center justify-end px-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md font-bold text-blue-700 dark:text-blue-400 text-xs text-right">
                          {calculatedItems[index]?.total.toFixed(2)}
                        </div>
                      </div>

                      {/* Remark */}
                      <FormField
                        name={`items.${index}.remark`}
                        control={control}
                        render={({ field }) => (
                          <FormItem className="flex-1 min-w-[200px]">
                            <FormLabel className="hidden text-xs uppercase tracking-wider text-gray-500 font-bold">Remark</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Add remark..."
                                className="bg-white border-gray-200 dark:bg-gray-950 dark:border-gray-800 h-9"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Remove */}
                      <div className="xl:pt-0 pt-6">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="h-9 w-9 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border-b-2 border-blue-100 dark:border-blue-900 py-3 gap-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Order Summary</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Total calculations</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="space-y-3 max-w-[300px] ml-auto">
                <div className="flex justify-between items-center py-2 border-b">
                  <div className="font-semibold text-gray-700 dark:text-gray-300">Subtotal:</div>
                  <div className="text-lg font-medium">{currency} {totalSubtotal.toFixed(2)}</div>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <div className="font-semibold text-gray-700 dark:text-gray-300">Total Discount:</div>
                  <div className="text-lg font-medium text-red-600">- {currency} {totalDiscount.toFixed(2)}</div>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <div className="font-semibold text-gray-700 dark:text-gray-300">Total Tax:</div>
                  <div className="text-lg font-medium">{currency} {totalTax.toFixed(2)}</div>
                </div>
                <div className="flex justify-between items-center py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg px-4 mt-4">
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">Grand Total:</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{currency} {grandTotal.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/40 text-white min-w-[200px]"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Create Sales Order</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      <AddProductsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialSelectedIds={items.map((i) => i.productId).filter((id) => id)}
        onApply={(addedProducts, removedIds) => {
          // 1. Remove deselected items
          removedIds.forEach((id) => {
            const currentItems = form.getValues("items");
            const index = currentItems.findIndex((i) => i.productId === id);
            if (index !== -1) remove(index);
          });

          // 2. Handle the "single empty row" case
          const currentItemsAfterRemoval = form.getValues("items");
          if (
            currentItemsAfterRemoval.length === 1 &&
            currentItemsAfterRemoval[0].productId === '' &&
            addedProducts.length > 0
          ) {
            remove(0);
          }

          // 3. Add new items
          addedProducts.forEach((product) => {
            append({
              productId: product._id ?? '',
              sku: product.sku ?? "",
              specification: product.specification ?? "",
              unit: product.unit?.name ?? "",
              quantity: 1,
              unitPrice: Number(product.price) || 0,
              discount: 0,
              salesTax: product.salesTax ?? 0,
              stockQuantity: product.stockQuantity ?? 0,
              remark: "",
            });
          });

          setIsModalOpen(false);
        }}
        orderType="sales"
      />
    </div>
  );
}
