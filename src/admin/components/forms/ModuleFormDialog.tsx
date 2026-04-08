import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { generateId } from "@/shared/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

// Feature schema
const featureSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Feature title is required"),
  description: z.string().min(1, "Feature description is required"),
  iconName: z.string().default("Activity"),
  bgColor: z.string().default("bg-[#1a1f36]"),
  iconColor: z.string().default("text-white"),
});

// Capability schema
const capabilitySchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Capability title is required"),
  items: z.array(z.object({ id: z.string(), value: z.string().min(1) })).min(1, "At least one item is required"),
});

// Main module schema
const moduleSchema = z.object({
  name: z.string().min(1, "Module name is required"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().min(1, "Description is required"),
  category: z.enum(["core", "addon", "enterprise", "beta"]),
  status: z.enum(["active", "inactive", "coming_soon"]),
  sortOrder: z.number().int().min(0).default(0),
  // Hero
  heroTitle: z.string().min(1, "Hero title is required"),
  heroDescription: z.string().min(1, "Hero description is required"),
  heroMainImage: z.string().default("/assets/module/default_module.png"),
  heroIconName: z.string().default("LayoutGrid"),
  // Features
  features: z.array(featureSchema).min(1, "At least one feature is required"),
  // Benefits
  benefits: z.array(z.object({ id: z.string(), value: z.string().min(1) })).min(1, "At least one benefit is required"),
  // Capabilities
  capabilities: z.array(capabilitySchema).min(1, "At least one capability category is required"),
});

export type ModuleFormData = z.infer<typeof moduleSchema>;

export type Module = {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  description: string;
  category: "core" | "addon" | "enterprise" | "beta";
  status: "active" | "inactive" | "coming_soon";
  sortOrder: number;
  hero: {
    title: string;
    description: string;
    mainImage: string;
    iconName: string;
  };
  features: Array<{
    title: string;
    description: string;
    iconName: string;
    bgColor: string;
    iconColor: string;
  }>;
  benefits: string[];
  capabilities: Array<{
    title: string;
    items: string[];
  }>;
};

// Type for data submitted to API (matches Module structure without id fields)
export type ModuleSubmitData = Omit<Module, "_id" | "id">;

interface ModuleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingModule: Module | null;
  onSubmit: (data: ModuleSubmitData) => Promise<void>;
  isSubmitting: boolean;
}

// Lucide icon options
const ICON_OPTIONS = [
  "Activity", "LayoutGrid", "BarChart3", "Clock", "TrendingUp", "Zap",
  "Users", "User", "Calculator", "ShoppingCart", "Package", "Settings",
  "FileText", "CheckCircle", "Target", "GitBranch", "BookOpen", "Star",
  "Warehouse", "Scan", "RefreshCw", "Monitor", "Printer", "Globe",
  "Building", "Wrench", "Trash2", "FolderKanban", "Calendar", "PieChart",
  "DollarSign", "ArrowUpRight", "ArrowDownLeft", "ListTree", "GitMerge",
  "Scale", "Box", "ShoppingBag", "TrendingUp", "Database", "FileEdit"
];

export function ModuleFormDialog({
  open,
  onOpenChange,
  editingModule,
  onSubmit,
  isSubmitting,
}: ModuleFormDialogProps) {
  const form = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema) as unknown as never,
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      category: "core",
      status: "active",
      sortOrder: 0,
      heroTitle: "",
      heroDescription: "",
      heroMainImage: "/assets/module/default_module.png",
      heroIconName: "LayoutGrid",
      features: [{ id: generateId(), title: "", description: "", iconName: "Activity", bgColor: "bg-[#1a1f36]", iconColor: "text-white" }],
      benefits: [{ id: generateId(), value: "" }],
      capabilities: [{ id: generateId(), title: "", items: [{ id: generateId(), value: "" }] }],
    },
  });

  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({
    control: form.control,
    name: "features",
  });

  const {
    fields: benefitFields,
    append: appendBenefit,
    remove: removeBenefit,
  } = useFieldArray({
    control: form.control,
    name: "benefits",
  });

  const {
    fields: capabilityFields,
    append: appendCapability,
    remove: removeCapability,
  } = useFieldArray({
    control: form.control,
    name: "capabilities",
  });

  useEffect(() => {
    if (editingModule) {
      form.reset({
        name: editingModule.name,
        slug: editingModule.slug,
        description: editingModule.description,
        category: editingModule.category,
        status: editingModule.status,
        sortOrder: editingModule.sortOrder || 0,
        heroTitle: editingModule.hero?.title || "",
        heroDescription: editingModule.hero?.description || "",
        heroMainImage: editingModule.hero?.mainImage || "/assets/module/default_module.png",
        heroIconName: editingModule.hero?.iconName || "LayoutGrid",
        features: editingModule.features?.map((f) => ({
          id: generateId(),
          title: f.title,
          description: f.description,
          iconName: f.iconName,
          bgColor: f.bgColor,
          iconColor: f.iconColor,
        })) || [{ id: generateId(), title: "", description: "", iconName: "Activity", bgColor: "bg-[#1a1f36]", iconColor: "text-white" }],
        benefits: editingModule.benefits?.map((b) => ({
          id: generateId(),
          value: b,
        })) || [{ id: generateId(), value: "" }],
        capabilities: editingModule.capabilities?.map((c) => ({
          id: generateId(),
          title: c.title,
          items: c.items.map((item) => ({ id: generateId(), value: item })),
        })) || [{ id: generateId(), title: "", items: [{ id: generateId(), value: "" }] }],
      });
    } else {
      form.reset();
    }
  }, [editingModule, form]);

  const handleSubmit = async (data: ModuleFormData): Promise<void> => {
    // Transform data for API
    const submitData: ModuleSubmitData = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      category: data.category,
      status: data.status,
      sortOrder: data.sortOrder,
      hero: {
        title: data.heroTitle,
        description: data.heroDescription,
        mainImage: data.heroMainImage,
        iconName: data.heroIconName,
      },
      features: data.features.map((f) => ({
        title: f.title,
        description: f.description,
        iconName: f.iconName,
        bgColor: f.bgColor,
        iconColor: f.iconColor,
      })),
      benefits: data.benefits.map((b) => b.value),
      capabilities: data.capabilities.map((c) => ({
        title: c.title,
        items: c.items.map((i) => i.value),
      })),
    };
    await onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingModule ? "Edit Module" : "Create New Module"}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Module Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              const slug = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                              form.setValue("slug", slug);
                            }}
                            placeholder="e.g., Dashboard, HR, Accounting"
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
                            placeholder="e.g., dashboard, hr, accounting"
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">URL-friendly identifier</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Brief module description"
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                          >
                            <option value="core">Core</option>
                            <option value="addon">Add-on</option>
                            <option value="enterprise">Enterprise</option>
                            <option value="beta">Beta</option>
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
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="coming_soon">Coming Soon</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sortOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sort Order</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Hero Tab */}
              <TabsContent value="hero" className="space-y-4">
                <FormField
                  control={form.control}
                  name="heroTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hero Title</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Dashboard Module"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="heroDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hero Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Detailed description for the landing page"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="heroMainImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Main Image Path</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="/assets/module/dashboard_module.png"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="heroIconName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon Name</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                          >
                            {ICON_OPTIONS.map((icon) => (
                              <option key={icon} value={icon}>{icon}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features" className="space-y-4">
                <div className="space-y-3">
                  {featureFields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Feature {index + 1}</span>
                        {featureFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFeature(index)}
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name={`features.${index}.title`}
                          render={({ field: inputField }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Title</FormLabel>
                              <FormControl>
                                <Input
                                  {...inputField}
                                  placeholder="Feature title"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`features.${index}.iconName`}
                          render={({ field: inputField }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Icon</FormLabel>
                              <FormControl>
                                <select
                                  {...inputField}
                                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                >
                                  {ICON_OPTIONS.map((icon) => (
                                    <option key={icon} value={icon}>{icon}</option>
                                  ))}
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`features.${index}.description`}
                        render={({ field: inputField }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Description</FormLabel>
                            <FormControl>
                              <Textarea
                                {...inputField}
                                placeholder="Feature description"
                                rows={2}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendFeature({ id: generateId(), title: "", description: "", iconName: "Activity", bgColor: "bg-[#1a1f36]", iconColor: "text-white" })}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4">
                {/* Benefits */}
                <div className="space-y-2">
                  <Label>Benefits</Label>
                  <div className="space-y-2">
                    {benefitFields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name={`benefits.${index}.value`}
                          render={({ field: inputField }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  {...inputField}
                                  placeholder="Enter benefit"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {benefitFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBenefit(index)}
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendBenefit({ id: generateId(), value: "" })}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Benefit
                  </Button>
                </div>

                {/* Capabilities */}
                <div className="space-y-2">
                  <Label>Capabilities</Label>
                  <div className="space-y-3">
                    {capabilityFields.map((capField, capIndex) => (
                      <div key={capField.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Category {capIndex + 1}</span>
                          {capabilityFields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCapability(capIndex)}
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>

                        <FormField
                          control={form.control}
                          name={`capabilities.${capIndex}.title`}
                          render={({ field: inputField }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Category Title</FormLabel>
                              <FormControl>
                                <Input
                                  {...inputField}
                                  placeholder="e.g., Financial Overview"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-1">
                          <Label className="text-xs">Items</Label>
                          {form.watch(`capabilities.${capIndex}.items`)?.map((item: any, itemIndex: number) => (
                            <div key={item.id} className="flex items-center gap-2">
                              <FormField
                                control={form.control}
                                name={`capabilities.${capIndex}.items.${itemIndex}.value`}
                                render={({ field: inputField }) => (
                                  <FormItem className="flex-1">
                                    <FormControl>
                                      <Input
                                        {...inputField}
                                        placeholder="Capability item"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              {form.watch(`capabilities.${capIndex}.items`)?.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const items = form.getValues(`capabilities.${capIndex}.items`);
                                    const newItems = items.filter((_: any, i: number) => i !== itemIndex);
                                    form.setValue(`capabilities.${capIndex}.items`, newItems);
                                  }}
                                >
                                  <XCircle className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const items = form.getValues(`capabilities.${capIndex}.items`) || [];
                              form.setValue(`capabilities.${capIndex}.items`, [...items, { id: generateId(), value: "" }]);
                            }}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Item
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendCapability({ id: generateId(), title: "", items: [{ id: generateId(), value: "" }] })}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Capability Category
                  </Button>
                </div>
              </TabsContent>

              <DialogFooter className="pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {editingModule ? "Update" : "Create"} Module
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
