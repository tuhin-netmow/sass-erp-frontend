/* eslint-disable @typescript-eslint/no-explicit-any */

import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Shield, Layout as LayoutIcon, Settings, List as ListIcon, Save, Loader2 } from "lucide-react";
import { RoleDashboardWidgets } from "./RoleDashboardWidgets";
import { RolePermissionsMatrix } from "./RolePermissionsMatrix";
import { RoleMenuAccess } from "./RoleMenuAccess";
import { flattenPermissions, structurePermissions } from "@/shared/utils/permissionUtils";
import { zodResolver } from "@hookform/resolvers/zod";

const roleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  status: z.enum(["active", "inactive"]),
  permissions: z.any(),
  menus: z.array(z.object({
    menuId: z.string(),
    label: z.string(),
    actions: z.array(z.string()),
  })),
  dashboards: z.array(z.object({
    widgetId: z.string(),
    position: z.object({
      x: z.number(), y: z.number(), w: z.number(), h: z.number(),
    }),
    config: z.record(z.string(), z.any()),
  })),
});

export type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleFormProps {
  initialValues?: Partial<RoleFormValues>;
  onSubmit: (values: RoleFormValues) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function RoleForm({ initialValues, onSubmit, isLoading, submitLabel = "Save Role" }: RoleFormProps) {
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: initialValues?.name || "",
      displayName: initialValues?.displayName || "",
      description: initialValues?.description || "",
      status: initialValues?.status || "active",
      permissions: initialValues?.permissions ? flattenPermissions(initialValues.permissions as any) : [],
      menus: initialValues?.menus || [],
      dashboards: initialValues?.dashboards || [],
    },
  });

  const handleActualSubmit = (values: RoleFormValues) => {
    const payload = {
      ...values,
      permissions: structurePermissions(values.permissions as any)
    };
    onSubmit(payload as any);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleActualSubmit)} className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="bg-gray-100 p-1 rounded-xl mb-6 grid grid-cols-4 w-full h-auto shadow-sm border border-gray-200">
            <TabsTrigger value="general" className="gap-2 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
              <Settings className="w-4 h-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="permissions" className="gap-2 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
              <Shield className="w-4 h-4" />
              Rights
            </TabsTrigger>
            <TabsTrigger value="menus" className="gap-2 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
              <ListIcon className="w-4 h-4" />
              Menus
            </TabsTrigger>
            <TabsTrigger value="dashboards" className="gap-2 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
              <LayoutIcon className="w-4 h-4" />
              Widgets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-gray-900 border-l-2 border-blue-600 pl-2">Role Identifier</FormLabel>
                    <FormControl><Input className="rounded-xl border-gray-200 focus:ring-blue-500" placeholder="e.g., TEAM_LEAD" {...field} /></FormControl>
                    <FormDescription>Internal code name (Uppercase, no spaces)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-gray-900 border-l-2 border-blue-600 pl-2">Friendly Name</FormLabel>
                    <FormControl><Input className="rounded-xl border-gray-200 focus:ring-blue-500" placeholder="e.g., Team Leader" {...field} /></FormControl>
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
                  <FormLabel className="font-bold text-gray-900 border-l-2 border-blue-600 pl-2">Role Summary</FormLabel>
                  <FormControl><Textarea className="rounded-xl border-gray-200 focus:ring-blue-500" placeholder="Describe the responsibilities..." rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="max-w-[200px]">
                  <FormLabel className="font-bold text-gray-900 border-l-2 border-blue-600 pl-2">Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="rounded-xl border-gray-200"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="active" className="rounded-lg">Active</SelectItem>
                      <SelectItem value="inactive" className="rounded-lg">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="permissions" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <RolePermissionsMatrix
              selectedPermissions={form.watch("permissions") as string[]}
              onChange={(perms) => form.setValue("permissions", perms, { shouldDirty: true })}
            />
          </TabsContent>

          <TabsContent value="menus" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <RoleMenuAccess
              selectedMenus={form.watch("menus") || []}
              onChange={(menus) => form.setValue("menus", menus, { shouldDirty: true })}
            />
          </TabsContent>

          <TabsContent value="dashboards" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <RoleDashboardWidgets
              selectedWidgets={form.watch("dashboards") || []}
              onChange={(widgets) => form.setValue("dashboards", widgets, { shouldDirty: true })}
            />
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-end gap-3 pt-6 border-t font-semibold">
          <Button type="submit" disabled={isLoading} className="rounded-xl px-10 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 py-6 text-lg font-bold transition-all hover:scale-[1.02] active:scale-95">
            {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
