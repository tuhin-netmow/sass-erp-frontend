/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/components/ui/popover";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup } from "@/shared/components/ui/command";

import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate, useParams } from "react-router";

import { useGetAllSuppliersQuery } from "@/store/features/app/suppliers/supplierApiService";
import { useGetAllProductsQuery } from "@/store/features/admin/productsApiService";
import { useGetPurchaseOrderByIdQuery, useUpdatePurchaseOrderMutation } from "@/store/features/app/purchaseOrder/purchaseOrderApiService";
import type { Supplier } from "@/shared/types/app/supplier.types";

interface POItem {
  productId: string;
  quantity: number;
  unitCost: number;
}

interface PurchaseOrderFormValues {
  supplierId: string;
  orderDate: string;
  expected_delivery_date: string;
  notes: string;
  items: POItem[];
}

export default function EditPurchaseOrderPage() {
  const navigate = useNavigate();
  const { purchaseId } = useParams(); // Purchase Order ID


  const { data: poData, isFetching: poLoading } = useGetPurchaseOrderByIdQuery(purchaseId as string);
  const [updatePurchaseOrder, { isLoading: isUpdating }] = useUpdatePurchaseOrderMutation();

  const form = useForm<PurchaseOrderFormValues>({
    defaultValues: {
      supplierId: "",
      orderDate: new Date().toISOString().split("T")[0],
      expected_delivery_date: "",
      notes: "",
      items: [{ productId: "", quantity: 1, unitCost: 0 }],
    },
  });

  const { control, reset, watch } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");

  /* ---------------- Searchable selects ---------------- */


  function SupplierSelectField({
    field,
  }: {
    field: { value?: string; onChange: (v: string) => void };
  }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    // Call API with search query
    const { data, isLoading } = useGetAllSuppliersQuery({
      page: 1,
      limit: 20,
      search: query,
    });

    const list = Array.isArray(data?.data) ? data.data : [];

    const selected = list.find(
      (s: Supplier) => String(s.id) === String(field.value)
    );

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {selected ? selected.name : "Select Supplier..."}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[320px] p-0">
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
                      key={supplier.id}
                      onSelect={() => {
                        field.onChange(String(supplier.id));
                        setOpen(false);
                      }}
                    >
                      {supplier.name}
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

    const selected = list.find(
      (p) => String(p._id) === String(field.value)
    );

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {selected
              ? `${selected.name} (SKU: ${selected.sku})`
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
                      onSelect={() => {
                        field.onChange(String(product._id));
                        setOpen(false);
                      }}
                    >
                      {product.name} (SKU: {product.sku})
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }











  useEffect(() => {
    if (poData?.data) {
      const po = Array.isArray(poData.data) ? poData.data[0] : poData.data;
      reset({
        supplierId: String(po.supplierId),
        orderDate: po.orderDate ? new Date(po.orderDate).toISOString().split("T")[0] : "",
        expected_delivery_date: po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toISOString().split("T")[0] : "",
        notes: po.notes,
        items: (po.items ?? []).map((item: any) => ({
          productId: String(item.productId),
          quantity: item.quantity,
          unitCost: item.unit_cost ?? item.unitCost,
        })),
      });
    }
  }, [poData, reset]);

  const subtotal = items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitCost), 0);

  const onSubmit = async (values: PurchaseOrderFormValues) => {
    try {
      const payload = {
        supplier_id: Number(values.supplierId),
        orderDate: values.orderDate,
        expected_date: values.expected_delivery_date,
        notes: values.notes,
        items: values.items.map(item => ({
          product_id: Number(item.productId),
          quantity: Number(item.quantity),
          unit_cost: Number(item.unitCost),
        })),
      };


      const res = await updatePurchaseOrder({ id: purchaseId as string, body: payload }).unwrap();
      if (res.status) {
        toast.success(res.message || "Purchase Order Updated Successfully");
        navigate("/dashboard/suppliers/purchase-orders");
      } else {
        toast.success(res.message || "Somthing wrong");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update purchase order");
      console.error(error);
    }
  };

  if (poLoading) return <div>Loading Purchase Order...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center">
        <h1 className="text-3xl font-bold">Edit Purchase Order</h1>
        <Link to="/dashboard/suppliers/purchase-orders" className="ml-auto">
          <Button variant="outline"><ArrowLeft className="w-4 h-4" /> Back to POs</Button>
        </Link>
      </div>

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Supplier & Details */}
          <div className="border rounded-md p-4">
            <h2 className="font-semibold mb-4">Supplier & Details</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Supplier */}
              <FormField name="supplierId" control={control} rules={{ required: "Supplier is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <FormControl><SupplierSelectField field={field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Order Date */}
              <FormField name="orderDate" control={control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                  </FormItem>
                )}
              />
              {/* Expected Date */}
              <FormField name="expected_delivery_date" control={control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                  </FormItem>
                )}
              />
            </div>
            {/* Notes */}
            <FormField name="notes" control={control}
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Notes</FormLabel>
                  <FormControl><Textarea placeholder="Optional notes..." {...field} /></FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Order Items */}
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Order Items</h2>
              <Button type="button" onClick={() => append({ productId: "", quantity: 1, unitCost: 0 })}>+ Add Item</Button>
            </div>

            <div className="space-y-3">
              {fields.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-3 items-center bg-gray-50 p-3 rounded">
                  {/* Product */}
                  <FormField name={`items.${index}.productId`} control={control} rules={{ required: "Product required" }}
                    render={({ field }) => (
                      <FormItem className="col-span-6">
                        <FormLabel>Product</FormLabel>
                        <FormControl><ProductSelectField field={field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Unit Price */}
                  <FormField name={`items.${index}.unitCost`} control={control} rules={{ required: "Price required" }}
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Unit Price</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Quantity */}
                  <FormField name={`items.${index}.quantity`} control={control} rules={{ required: "Quantity required" }}
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Quantity</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Line Total */}
                  <div className="col-span-1">
                    <FormLabel>Total</FormLabel>
                    <div className="font-semibold">
                      RM {(items[index].quantity * items[index].unitCost).toFixed(2)}
                    </div>
                  </div>
                  {/* Remove */}
                  <div className="col-span-1 flex justify-end">
                    <Button type="button" variant="outline-destructive" size="sm" onClick={() => remove(index)}>X</Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-4 text-right pr-2">
              <div>Subtotal: RM {subtotal.toFixed(2)}</div>
              <div className="font-bold text-lg">Total: RM {subtotal.toFixed(2)}</div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button className="px-6" type="submit" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Purchase Order"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
