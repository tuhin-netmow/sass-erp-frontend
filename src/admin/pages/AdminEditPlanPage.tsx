import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetAllPlansQuery, useUpdatePlanMutation } from "@/store/features/admin/adminApiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { ArrowLeft, Plus, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const featureSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Feature name is required"),
  included: z.boolean(),
  limit: z.string().optional(),
});

const planSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  max_users: z.string().optional(),
  storage: z.string(),
  companies: z.string(),
  api_calls: z.string(),
  db_type: z.enum(["shared", "dedicated"]),
  status: z.enum(["active", "inactive"]),
  display_order: z.string(),
  features: z.array(featureSchema),
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

export default function AdminEditPlanPage() {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const { data, isLoading: isLoadingPlans } = useGetAllPlansQuery(undefined);
  const [updatePlan, { isLoading }] = useUpdatePlanMutation();
  const [plan, setPlan] = useState<Plan | null>(null);

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: "",
      max_users: "",
      storage: "10",
      companies: "1",
      api_calls: "10000",
      db_type: "shared",
      status: "active",
      display_order: "0",
      features: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features",
  });

  useEffect(() => {
    if (data?.data) {
      const foundPlan = data.data.find((p: Plan) => p.id.toString() === planId);
      if (foundPlan) {
        setPlan(foundPlan);
        const planData = foundPlan as any;
        form.reset({
          name: foundPlan.name,
          slug: planData.slug || "",
          description: foundPlan.description || "",
          price: foundPlan.price?.monthly?.toString() || "0",
          max_users: foundPlan.max_users?.toString() || "",
          storage: planData.limits?.storage?.toString() || "10",
          companies: planData.limits?.companies?.toString() || "1",
          api_calls: planData.limits?.apiCallsPerMonth?.toString() || "10000",
          db_type: (planData.db_tier || planData.db_type || "shared") as "shared" | "dedicated",
          status: (planData.status || "active") as "active" | "inactive",
          display_order: planData.display_order?.toString() || "0",
          features: (planData.features || []).map((f: any) => ({
            id: generateId(),
            name: typeof f === 'object' ? (f as { name: string }).name : f,
            included: typeof f === 'object' ? (f.included ?? true) : true,
            limit: typeof f === 'object' && f.limit ? f.limit.toString() : "",
          })),
        });
      }
    }
  }, [data, planId, form]);

  const handleSubmit = async (data: PlanFormData) => {
    if (!plan) return;

    try {
      const monthlyPrice = parseFloat(data.price) || 0;
      const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const payload = {
        name: data.name,
        slug,
        description: data.description,
        price: {
          monthly: monthlyPrice,
          yearly: monthlyPrice * 12,
        },
        limits: {
          users: data.max_users ? parseInt(data.max_users) : -1,
          storage: parseInt(data.storage) || 10,
          companies: parseInt(data.companies) || 1,
          apiCallsPerMonth: parseInt(data.api_calls) || 10000,
        },
        dbTier: data.db_type,
        status: data.status,
        displayOrder: parseInt(data.display_order) || 0,
        features: data.features.map((f) => ({
          name: f.name,
          included: f.included,
          limit: f.limit ? parseInt(f.limit) : undefined,
        })),
      };

      await updatePlan({ planId: plan.id.toString(), ...payload }).unwrap();
      toast.success("Plan updated successfully");
      navigate("/admin/plans");
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err.data?.message || "Failed to update plan");
    }
  };

  if (isLoadingPlans) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Plan not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/plans")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plans
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4">
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

                <FormField
                  control={form.control}
                  name="storage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storage (GB)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Companies</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="api_calls"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Calls/Month</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="10000"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="display_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="0"
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

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-2">
                <FormLabel>Features</FormLabel>
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name={`features.${index}.name`}
                          render={({ field: inputField }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  {...inputField}
                                  placeholder="Enter feature name"
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
                      <div className="flex items-center gap-4">
                        <FormField
                          control={form.control}
                          name={`features.${index}.included`}
                          render={({ field: inputField }) => (
                            <FormItem className="flex flex-row items-center gap-2 space-y-0">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={inputField.value}
                                  onChange={inputField.onChange}
                                  className="h-4 w-4 rounded border-gray-300"
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">Included</FormLabel>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`features.${index}.limit`}
                          render={({ field: inputField }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  {...inputField}
                                  type="number"
                                  placeholder="Limit (optional)"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ id: generateId(), name: "", included: true, limit: "" })}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feature
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/plans")}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Plan"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
