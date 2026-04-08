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

import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate, useParams } from "react-router";

import {
  useGetAllRawMaterialSuppliersQuery,
  useGetAllRawMaterialsQuery,
  useGetRawMaterialPurchaseOrderByIdQuery,
  useUpdateRawMaterialPurchaseOrderMutation,

} from "@/store/features/admin/rawMaterialApiService";
import { useAppSelector } from "@/store/store";
import type { RawMaterialSupplier } from "@/shared";

interface POItem {
  rawMaterialId: number;
  quantity: number;
  unitCost: number;
}

interface PurchaseOrderFormValues {
  supplierId: number;
  orderDate: string;
  expectedDeliveryDate: string;
  notes: string;
  items: POItem[];
}

export default function EditRawMaterialPurchaseOrder() {
  const navigate = useNavigate();
  const { purchaseId } = useParams();
  const currency = useAppSelector((state) => state.currency.value);

  const { data: poData, isLoading: poLoading } =
    useGetRawMaterialPurchaseOrderByIdQuery(Number(purchaseId));
  const [updatePurchaseOrder, { isLoading: isUpdating }] =
    useUpdateRawMaterialPurchaseOrderMutation();

  const form = useForm<PurchaseOrderFormValues>({
    defaultValues: {
      supplierId: 0,
      orderDate: new Date().toISOString().split("T")[0],
      expectedDeliveryDate: "",
      notes: "",
      items: [{ rawMaterialId: 0, quantity: 1, unitCost: 0 }],
    },
  });

  const { control, reset, watch } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");

  /* ================= Supplier Select ================= */
  function SupplierSelectField({
    field,
  }: {
    field: { value?: number; onChange: (v: number) => void };
  }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    const { data, isLoading } = useGetAllRawMaterialSuppliersQuery({
      page: 1,
      limit: 20,
      search: query,
    });

    const list = Array.isArray(data?.data) ? data.data : [];
    const selected = list.find(
      (s: RawMaterialSupplier) => s.id === field.value
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
                        field.onChange(Number(supplier.id));
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

  /* ================= Raw Material Select ================= */
  function RawMaterialSelectField({
    field,
  }: {
    field: { value?: number; onChange: (v: number) => void };
  }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    const { data, isLoading } = useGetAllRawMaterialsQuery({
      page: 1,
      limit: 50,
      search: query,
    });

    const list = Array.isArray(data?.data) ? data.data : [];
    const selected = list.find((r: any) => r.id === field.value);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {selected ? selected.name : "Select Raw Material..."}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[320px] p-0">
          <Command>
            <CommandInput
              placeholder="Search raw materials..."
              onValueChange={(value) => setQuery(value)}
            />

            <CommandList>
              <CommandEmpty>No raw materials found.</CommandEmpty>

              <CommandGroup>
                {isLoading && (
                  <div className="py-2 px-3 text-sm text-gray-500">
                    Loading...
                  </div>
                )}

                {!isLoading &&
                  list.map((material: any) => (
                    <CommandItem
                      key={material.id}
                      onSelect={() => {
                        field.onChange(material.id);
                        setOpen(false);
                      }}
                    >
                      {material.name}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  /* ================= Form Population on Load ================= */
  useEffect(() => {
    if (poData?.data) {
      const po = poData.data;
      reset({
        supplierId: po.supplierId,
        orderDate: po.orderDate
          ? new Date(po.orderDate).toISOString().split("T")[0]
          : "",
        expectedDeliveryDate: po.expectedDeliveryDate
          ? new Date(po.expectedDeliveryDate).toISOString().split("T")[0]
          : "",
        notes: po.notes,
        items: (po.items ?? []).map((item: any) => ({
          rawMaterialId: item.rawMaterialId || item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
        })),
      });
    }
  }, [poData, reset]);

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.unitCost),
    0
  );

  const onSubmit = async (values: PurchaseOrderFormValues) => {
    try {
      const payload = {
        supplierId: values.supplierId,
        orderDate: values.orderDate,
        expectedDeliveryDate: values.expectedDeliveryDate,
        notes: values.notes,
        items: values.items.map((item) => ({
          productId: Number(item.rawMaterialId),
          quantity: Number(item.quantity),
          unitCost: Number(item.unitCost),
        })),
      };

      const res = await updatePurchaseOrder({
        id: Number(purchaseId),
        body: payload,
      }).unwrap();
      if (res.status) {
        toast.success(res.message || "Purchase Order Updated Successfully");
        navigate("/dashboard/raw-materials/purchase-orders");
      } else {
        toast.error(res.message || "Something went wrong");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update purchase order");
      console.error(error);
    }
  };

  if (poLoading)
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        Loading Purchase Order...
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center">
        <h1 className="text-3xl font-bold">Edit Purchase Order</h1>
        <Link to="/dashboard/raw-materials/purchase-orders" className="ml-auto">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4" /> Back to POs
          </Button>
        </Link>
      </div>

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Supplier & Details */}
          <div className="border rounded-md p-4">
            <h2 className="font-semibold mb-4">Supplier & Details</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Supplier */}
              <FormField
                name="supplierId"
                control={control}
                rules={{ required: "Supplier is required" }}
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
              {/* Order Date */}
              <FormField
                name="orderDate"
                control={control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              {/* Expected Date */}
              <FormField
                name="expectedDeliveryDate"
                control={control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            {/* Notes */}
            <FormField
              name="notes"
              control={control}
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional notes..." {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Order Items */}
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Raw Materials</h2>
              <Button
                type="button"
                onClick={() =>
                  append({ rawMaterialId: 0, quantity: 1, unitCost: 0 })
                }
              >
                + Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-3 items-center bg-gray-50 p-3 rounded"
                >
                  {/* Raw Material */}
                  <FormField
                    name={`items.${index}.rawMaterialId`}
                    control={control}
                    rules={{ required: "Raw material required" }}
                    render={({ field }) => (
                      <FormItem className="col-span-6">
                        <FormLabel>Raw Material</FormLabel>
                        <FormControl>
                          <RawMaterialSelectField field={field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Unit Price */}
                  <FormField
                    name={`items.${index}.unitCost`}
                    control={control}
                    rules={{ required: "Price required" }}
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Unit Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
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
                      <FormItem className="col-span-2">
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Line Total */}
                  <div className="col-span-1">
                    <FormLabel>Total</FormLabel>
                    <div className="font-semibold">
                      {currency}{" "}
                      {(items[index].quantity * items[index].unitCost).toFixed(
                        2
                      )}
                    </div>
                  </div>
                  {/* Remove */}
                  <div className="col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-4 text-right pr-2">
              <div>
                Subtotal: {currency} {subtotal.toFixed(2)}
              </div>
              <div className="font-bold text-lg">
                Total: {currency} {subtotal.toFixed(2)}
              </div>
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
