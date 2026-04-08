import { Input } from "@/shared/components/ui/input";
import { Form } from "@/shared/components/ui/form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/button";
import { useUpdateStockMutation } from "@/store/features/admin/productsApiService";
import { toast } from "sonner";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Check, ChevronDown, ShieldAlert, ArrowRightLeft, CheckCircle2 } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
// import { cn } from "@/shared/utils/utils";
import type { Product } from "@/shared/types";
import { useEffect, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/components/ui/select";
import z from "zod";
import { Textarea } from "@/shared/components/ui/textarea";
import { ACTIONS, MODULES } from "@/app/config/permissions";
import { perm, usePermissions } from "@/shared/hooks/usePermissions";

// 1️⃣ Define form schema using Zod
const stockFormSchema = z.object({
  product_id: z.string().min(1, "Required"),
  current_stock: z.number().min(0, "Current stock must be 0 or more"),
  quantity: z.number().min(1, "Stock must be greater than 0"),
  operation: z.string().min(1, "Required"),
  date: z.string().min(1, "Required"),
  movement_type: z.string().min(1, "Required"),
  notes: z.string().optional(),
});

type StockFormValues = z.infer<typeof stockFormSchema>;

export default function AddStockForm({
  open,
  setOpen,
  products,
  search,
  setSearch,
  refetchProducts,
  initialProductId,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  products?: Product[];
  search?: string;
  setSearch?: (val: string) => void;
  refetchProducts?: () => void;
  initialProductId?: string;
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const { hasPermission, isAdmin } = usePermissions();
  const canCreateStock = isAdmin || hasPermission(perm(MODULES.PRODUCTS, ACTIONS.CREATE));

  const form = useForm<StockFormValues>({
    resolver: zodResolver(stockFormSchema),
    defaultValues: {
      product_id: "",
      current_stock: 0,
      quantity: 0,
      operation: "add",
      date: new Date().toISOString().split("T")[0],
      movement_type: "adjustment",
      notes: "",
    },
  });

  const { control, setValue, reset } = form;

  // Set initial product if provided
  useEffect(() => {
    if (open && initialProductId) {
      setValue("product_id", initialProductId);
    } else if (open && !initialProductId) {
      reset({
        product_id: "",
        current_stock: 0,
        quantity: 0,
        operation: "add",
        date: new Date().toISOString().split("T")[0],
        movement_type: "adjustment",
        notes: "",
      });
    }
  }, [open, initialProductId, setValue, reset]);

  // Watch selected productId
  const selectedProductId = useWatch({
    control,
    name: "product_id",
  });

  // Find the selected product from parent products
  const selectedProduct = products?.find(
    (p) => p._id === selectedProductId
  );

  // Auto-fill stock when product changes
  useEffect(() => {
    if (selectedProduct) {
      setValue("current_stock", selectedProduct.stockQuantity || 0);
    } else {
      setValue("current_stock", 0);
    }
  }, [selectedProduct, setValue]);

  const [updateStock] = useUpdateStockMutation();

  const onSubmit = async (values: z.infer<typeof stockFormSchema>) => {
    console.log("Form Values:", values);
    if (!selectedProduct) {
      console.error("No product selected");
      toast.error("Please select a valid product for stock adjustment");
      return;
    };
    const payload = {
      id: selectedProduct._id as any,
      body: {
        quantity: Number(values.quantity),
        operation: values.operation,
        movement_type: values.movement_type,
        date: values.date,
        notes: values.notes,
      },
    };
    console.log("Payload:", payload);
    try {
      const res = await updateStock(payload).unwrap();
      console.log("Stock updated successfully:", res);
      if (res.status) {
        toast.success("Stock updated successfully");
        refetchProducts?.();
        setOpen(false);
      } else {
        toast.error("Failed to update stock: " + res.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update stock");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="flex items-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-blue-500 px-6 py-2 font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-blue-500/40 active:translate-y-0 active:shadow-none">
          <ArrowRightLeft className="w-4 h-4" />
          <span>Adjust Stock</span>
        </Button>
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Adjust Stock</SheetTitle>
        </SheetHeader>

        <div className="p-4 max-h-[90vh] overflow-y-auto">
          {!canCreateStock ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10">
                <ShieldAlert className="w-10 h-10 text-destructive" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Access Denied
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You do not have permission to add a new Stock. <br />
                Please contact your administrator if you believe this is an
                error.
              </p>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="mt-4"
              >
                Close
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                {/* PRODUCT DROPDOWN */}
                <Controller
                  control={control}
                  name="product_id"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Product Name</FieldLabel>
                      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                          >
                            {selectedProduct
                              ? selectedProduct.name
                              : "Select product..."}
                            <ChevronDown className="opacity-50 h-4 w-4" />
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search product..."
                              className="h-9"
                              value={search}
                              onValueChange={setSearch}
                            />

                            <CommandList>
                              <CommandEmpty>No matching product.</CommandEmpty>

                              <CommandGroup>
                                {products?.map((product) => (
                                  <CommandItem
                                    key={product._id}
                                    value={product.name}
                                    onSelect={() => {
                                      field.onChange(product._id);
                                      setPopoverOpen(false);
                                    }}
                                  >
                                    {product.name}
                                    <Check
                                      className={`ml-auto h-4 w-4 ${field.value === product._id
                                        ? "opacity-100"
                                        : "opacity-0"
                                        }`}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                {/* STOCK INPUT */}
                <Controller
                  control={control}
                  name="current_stock"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Current Stock</FieldLabel>
                      <Input
                        type="number"
                        placeholder="Enter stock"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        disabled
                      />

                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="quantity"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Quantity</FieldLabel>
                      <Input
                        type="number"
                        placeholder="Enter stock"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="operation"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Operation</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select operation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="add">Add</SelectItem>
                          <SelectItem value="subtract">Subtract</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="movement_type"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Movement Type</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select operation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="purchase">Purchase</SelectItem>
                          <SelectItem value="sale">Sale</SelectItem>
                          <SelectItem value="return">Return</SelectItem>
                          <SelectItem value="adjustment">Adjustment</SelectItem>
                          <SelectItem value="transfer">Transfer</SelectItem>
                          <SelectItem value="production">Production</SelectItem>
                          <SelectItem value="waste">Waste</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="date"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Date</FieldLabel>
                      <Input type="date" {...field} className="block" />
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="notes"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Notes</FieldLabel>
                      <Textarea placeholder="Write notes..." {...field} />
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                <div className="flex justify-center items-center gap-2">
                  <Button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-6 font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-blue-500/40 active:translate-y-0 active:shadow-none"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Confirm Adjustment</span>
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
