"use client";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
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

import { useAddPurchaseOrderMutation } from "@/store/features/app/purchaseOrder/purchaseOrderApiService";
import { useNavigate, useSearchParams } from "react-router";
import { useGetAllSuppliersQuery, useGetSupplierByIdQuery, useLazyGetSupplierByIdQuery } from "@/store/features/app/suppliers/supplierApiService";
import type { Supplier } from "@/shared/types/app/supplier.types";
import { useGetAllProductsQuery, useGetProductByIdQuery } from "@/store/features/admin/productsApiService";
import { useState, useCallback, useEffect } from "react";
import { useAppSelector } from "@/store/store";
import { BackButton } from "@/shared/components/common/BackButton";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { FileText, Package, ShoppingCart, User, X, Plus, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { AddProductsModal } from "@/app/components/products/AddProductsModal";
import type { Product } from "@/shared/types";

const orderSchema = z
  .object({
    supplierId: z.number().min(1, "Required"),
    notes: z.string().optional(),
    orderDate: z.string().min(1, "Required"),
    expectedDeliveryDate: z.string().min(1, "Required"),
    items: z.array(
      z.object({
        productId: z.number().min(1, "Product is required"),
        sku: z.string().optional(),
        specification: z.string().optional(),
        unit: z.string().optional(),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        unitCost: z.number().min(1, "Unit price must be at least 1"),
        discount: z.number().min(0, "Discount must be 0 or more"),
        purchaseTax: z.number().min(0, "Purchase tax must be 0 or more"),
        stockQuantity: z.number().optional(),
      })
    ),
  })
  .refine(
    (data) => {
      const orderDate = new Date(data.orderDate);
      const dueDate = new Date(data.expectedDeliveryDate);

      return dueDate >= orderDate;
    },
    {
      message: "Expected delivery date cannot be earlier than order date",
      path: ["expectedDeliveryDate"],
    }
  );

type PurchaseOrderFormValues = z.infer<typeof orderSchema>;

/* ---------------- EXTRA COMPONENTS ---------------- */

function SupplierSelectField({
  field,
  supplierIdFromParam,
}: {
  field: { value?: number; onChange: (v: number) => void };
  supplierIdFromParam: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hasPreselected, setHasPreselected] = useState(false);

  // Call API with search query
  const { data, isLoading } = useGetAllSuppliersQuery({
    page: 1,
    limit: 50,
    search: query,
  });

  // Fetch single supplier if we have a value (to ensure display name is available)
  const [getSupplierById] = useLazyGetSupplierByIdQuery();
  const { data: singleData } = useGetSupplierByIdQuery(field.value!, {
    skip: !field.value,
  });

  const list = Array.isArray(data?.data) ? data.data : [];

  const selected =
    list.find((s: Supplier) => Number(s._id) === Number(field.value)) ||
    (singleData?.data?._id && Number(singleData.data._id) === Number(field.value)
      ? singleData.data
      : undefined);

  // Pre-selection Logic
  useEffect(() => {
    if (supplierIdFromParam && !hasPreselected && list.length > 0) {
      const preselected = list.find(
        (s) =>
          Number(s._id) === Number(supplierIdFromParam) ||
          s.publicId === supplierIdFromParam
      );
      if (preselected) {
        field.onChange(Number(preselected._id));
        setHasPreselected(true);
      } else {
        // If not in current list, try fetching by ID (could be publicId)
        getSupplierById(supplierIdFromParam)
          .unwrap()
          .then((res) => {
            if (res.data) {
              field.onChange(Number(res.data._id));
              setHasPreselected(true);
            }
          })
          .catch(() => { });
      }
    }
  }, [supplierIdFromParam, list, field, hasPreselected, getSupplierById]);

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

      <PopoverContent className="w-[300px] p-0 shadow-md rounded-lg bg-white z-[1000]">
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
  onProductSelect,
}: {
  field: { value?: number; onChange: (v: number) => void };
  index: number;
  onProductSelect: (product: Product, index: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const { data, isLoading } = useGetAllProductsQuery({
    page: 1,
    limit: 50,
    search: query,
  });

  const { data: singleData } = useGetProductByIdQuery(field.value!, {
    skip: !field.value,
  });

  const list = Array.isArray(data?.data) ? data.data : [];
  const selected = list.find((p) => Number(p._id) === Number(field.value)) ||
    (singleData?.data?._id && Number(singleData.data._id) === Number(field.value) ? singleData.data : undefined);

  const handleSelect = (product: Product) => {
    field.onChange(Number(product._id));
    onProductSelect(product, index);
    setOpen(false);
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
            <span className="truncate text-sm">
              {selected ? selected.name : "Select product..."}
            </span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[300px] p-0 shadow-md rounded-lg bg-white z-[1000]" align="start">
        <Command>
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
                    onSelect={() => handleSelect(product)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={product.thumbUrl} />
                      <AvatarFallback>
                        <Package className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden min-w-0 flex-1">
                      <span className="font-medium text-sm truncate">{product.name}</span>
                      <span className="text-xs text-muted-foreground truncate">
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

/* ---------------- MAIN PAGE ---------------- */

export default function CreatePurchaseOrderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const supplierIdParam = searchParams.get("supplierId");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currency = useAppSelector((state) => state.currency.value);
  const [addPurchaseOrder, { isLoading: isSubmitting }] = useAddPurchaseOrderMutation();

  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      supplierId: 0,
      orderDate: new Date().toISOString().split("T")[0],
      expectedDeliveryDate: "",
      notes: "",
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

  const { control, handleSubmit, setValue } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = useWatch({
    control,
    name: "items",
  }) || [];

  const handleProductSelect = useCallback((product: Product, index: number) => {
    setValue(`items.${index}.productId`, Number(product._id));
    setValue(`items.${index}.purchaseTax`, product.purchaseTax || 0);
    setValue(`items.${index}.unitCost`, Number(product.cost) || 0);
    setValue(`items.${index}.sku`, product.sku || "");
    setValue(`items.${index}.specification`, product.specification || "");
    setValue(`items.${index}.unit`, product.unit?.name || "");
    setValue(`items.${index}.stockQuantity`, product.stockQuantity || 0);
  }, [setValue]);

  const handleBulkAddProducts = useCallback((selectedProducts: Product[]) => {
    selectedProducts.forEach((product) => {
      append({
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
    });
    // Remove the first empty row if it hasn't been used
    if (watchedItems.length === 1 && watchedItems[0].productId === 0) {
      remove(0);
    }
  }, [append, remove, watchedItems]);

  const onSubmit = async (values: PurchaseOrderFormValues) => {
    try {
      const payload = {
        supplier_id: values.supplierId,
        orderDate: values.orderDate,
        expected_delivery_date: values.expectedDeliveryDate,
        notes: values.notes,
        items: values.items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
          unit_cost: item.unitCost,
          discount: item.discount,
          purchase_tax: item.purchaseTax,
        })),
      };

      await addPurchaseOrder(payload).unwrap();
      toast.success("Purchase Order Created Successfully");
      navigate("/dashboard/purchase-orders");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create purchase order");
      console.error(error);
    }
  };

  // Calculations
  const calculatedItems = watchedItems.map((it) => {
    const unitPrice = Number(it.unitCost || 0);
    const qty = Number(it.quantity || 0);
    const discount = Number(it.discount || 0);
    const taxRate = Number(it.purchaseTax || 0);

    const subtotal = unitPrice * qty;
    const taxableAmount = Math.max(subtotal - discount, 0);
    const taxAmount = taxableAmount * (taxRate / 100);
    const total = taxableAmount + taxAmount;

    return { subtotal, discount, pretaxAmount: taxableAmount, taxAmount, total };
  });

  const totals = calculatedItems.reduce(
    (acc, it) => ({
      subtotal: acc.subtotal + it.subtotal,
      discount: acc.discount + it.discount,
      tax: acc.tax + it.taxAmount,
      grandTotal: acc.grandTotal + it.total,
    }),
    { subtotal: 0, discount: 0, tax: 0, grandTotal: 0 }
  );

  return (
    <div className="space-y-6 w-full pb-6">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Create Purchase Order
          </h1>
          <p className="text-muted-foreground mt-2">Create a new purchase order for your supplier</p>
        </div>
        <BackButton />
      </div>

      <Form {...form}>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-lg max-w-5xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b py-3">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Supplier & Order Details</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Select supplier and set order dates</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  name="supplierId"
                  control={control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <FormControl>
                        <SupplierSelectField field={field} supplierIdFromParam={supplierIdParam} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="orderDate"
                  control={control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="expectedDeliveryDate"
                  control={control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Delivery Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Add any notes here..." className="min-h-[80px]" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-lg">
            <CardHeader className="bg-gray-50 dark:bg-gray-900/50 border-b py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Order Items</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage products in this order</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({
                      productId: 0, sku: "", specification: "", unit: "",
                      quantity: 1, unitCost: 0, discount: 0, purchaseTax: 0, stockQuantity: 0
                    })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Row
                  </Button>
                  <Button type="button" onClick={() => setIsModalOpen(true)}>
                    <Package className="w-4 h-4 mr-2" />
                    Select Products
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3 min-w-[120px]">SKU</th>
                    <th className="px-4 py-3 min-w-[250px]">Product / Spec</th>
                    <th className="px-4 py-3 w-32">Unit Cost</th>
                    <th className="px-4 py-3 w-24">Qty</th>
                    <th className="px-4 py-3 w-24">Disc.</th>
                    <th className="px-4 py-3 w-24">Tax %</th>
                    <th className="px-4 py-3 w-32 text-right">Total</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {fields.map((field, index) => {
                    const lineTotal = calculatedItems[index]?.total || 0;
                    return (
                      <tr key={field.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                        <td className="px-4 py-3">
                          <Input
                            {...form.register(`items.${index}.sku`)}
                            readOnly
                            className="bg-gray-100 dark:bg-gray-800 font-mono text-[11px]"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-2">
                            <FormField
                              name={`items.${index}.productId`}
                              control={control}
                              render={({ field }) => (
                                <ProductSelectField field={field} index={index} onProductSelect={handleProductSelect} />
                              )}
                            />
                            <Input
                              {...form.register(`items.${index}.specification`)}
                              readOnly
                              placeholder="Spec"
                              className="text-[11px] bg-gray-50 h-7"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                step="any"
                                {...form.register(`items.${index}.unitCost`, { valueAsNumber: true })}
                                className="text-right"
                              />
                            </FormControl>
                          </FormItem>
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                            className="text-right"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            {...form.register(`items.${index}.discount`, { valueAsNumber: true })}
                            className="text-right"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            {...form.register(`items.${index}.purchaseTax`, { valueAsNumber: true })}
                            className="text-right"
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-blue-600 dark:text-blue-400">
                          {currency} {lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={fields.length === 1}
                            onClick={() => remove(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 flex flex-col items-end border-t">
                <div className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span>{currency} {totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-red-500">
                    <span>Discount:</span>
                    <span>- {currency} {totals.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground border-b pb-2">
                    <span>Tax:</span>
                    <span>{currency} {totals.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-2">
                    <span>Grand Total:</span>
                    <span className="text-blue-600 dark:text-blue-400">{currency} {totals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pb-10">
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={isSubmitting}
              onClick={() => navigate("/dashboard/purchase-orders")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[200px]"
            >
              {isSubmitting ? "Creating..." : "Create Purchase Order"}
            </Button>
          </div>
        </form>
      </Form>

      <AddProductsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={(addedProducts) => handleBulkAddProducts(addedProducts)}
        orderType="purchase"
      />
    </div>
  );
}
