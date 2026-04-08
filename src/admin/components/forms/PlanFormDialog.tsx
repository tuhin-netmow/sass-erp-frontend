import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Helper to generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Plus, XCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";

const planSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  max_users: z.string().optional(),
  db_type: z.enum(["shared", "dedicated"]),
  features: z.array(z.object({ id: z.string(), value: z.string() })),
});

export type PlanFormData = z.infer<typeof planSchema>;

export type Plan = {
  id: string | number;
  name: string;
  description?: string;
  slug?: string;
  price?: {
    monthly?: number;
  };
  max_users?: number;
  db_type?: string;
  features?: Array<{ name: string } | string>;
};

// Type for data submitted to API (features as strings)
export type PlanSubmitData = Omit<PlanFormData, 'features'> & {
  features: string[];
};

interface PlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPlan: Plan | null;
  onSubmit: (data: PlanSubmitData) => Promise<void>;
  isSubmitting: boolean;
}

export function PlanFormDialog({
  open,
  onOpenChange,
  editingPlan,
  onSubmit,
  isSubmitting,
}: PlanFormDialogProps) {
  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema) as unknown as never,
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: "",
      max_users: "",
      db_type: "shared",
      features: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features",
  });

  useEffect(() => {
    if (editingPlan) {
      form.reset({
        name: editingPlan.name,
        slug: editingPlan.slug || "",
        description: editingPlan.description || "",
        price: editingPlan.price?.monthly?.toString() || "0",
        max_users: editingPlan.max_users?.toString() || "",
        db_type: (editingPlan.db_type || "shared") as "shared" | "dedicated",
        features: editingPlan.features?.map((f) => ({
          id: generateId(),
          value: typeof f === 'object' ? (f as { name: string }).name : f
        })) || [],
      });
    } else {
      form.reset();
    }
  }, [editingPlan, form]);

  const handleSubmit = async (data: PlanFormData): Promise<void> => {
    // Transform features back to array of strings for submission
    const submitData: PlanSubmitData = {
      ...data,
      features: data.features.map(f => f.value)
    };
    await onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingPlan ? "Edit Plan" : "Create New Plan"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        const slug = form.getValues("slug") || e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                        if (!form.getValues("slug")) {
                          form.setValue("slug", slug);
                        }
                      }}
                      placeholder="e.g., Starter, Professional, Enterprise"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                      }}
                      placeholder="e.g., starter, professional, enterprise"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">URL-friendly identifier. Auto-generated from name if left blank.</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Plan description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($/month)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_users"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Users</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Leave empty for unlimited"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="db_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Database Type</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                    >
                      <option value="shared">Shared Database</option>
                      <option value="dedicated">Dedicated Database</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-2">
              <FormLabel>Features</FormLabel>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`features.${index}.value`}
                      render={({ field: inputField }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              {...inputField}
                              placeholder="Enter feature"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ id: generateId(), value: "" })}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {editingPlan ? "Update" : "Create"} Plan
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
