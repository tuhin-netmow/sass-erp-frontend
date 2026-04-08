
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useAddRoleMutation } from "@/store/features/app/role/roleApiService";
import { toast } from "sonner";
import { perm, usePermissions } from "@/shared/hooks/usePermissions";
import { ACTIONS, MODULES } from "@/app/config/permissions";
import { ShieldAlert, PlusCircle, Shield, Loader2, Layout, List as ListIcon, Settings } from "lucide-react";
import { RolePermissionsMatrix } from "./RolePermissionsMatrix";
import { RoleMenuAccess } from "./RoleMenuAccess";
import { RoleDashboardWidgets } from "./RoleDashboardWidgets";
import { structurePermissions } from "@/shared/utils/permissionUtils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const roleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  display_name: z.string().min(2, "Display name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  status: z.enum(["active", "inactive"]),
  permissions: z.array(z.string()),
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

type RoleFormValues = z.infer<typeof roleSchema>;

export default function AddNewRoleForm({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { hasPermission, isAdmin } = usePermissions();
  const canCreateRole = isAdmin || hasPermission(perm(MODULES.ROLES, ACTIONS.CREATE));

  const [createRole, { isLoading }] = useAddRoleMutation();

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      display_name: "",
      description: "",
      status: "active",
      permissions: [],
      menus: [],
      dashboards: [],
    },
  });

  const handleAddRole = async (values: RoleFormValues) => {
    try {
      // Transform permissions for the API
      const payload = {
        ...values,
        permissions: structurePermissions(values.permissions),
      };

      const res = await createRole(payload as any).unwrap();
      if (res.status) {
        toast.success(res.message || "Role created successfully.");
        setOpen(false);
        form.reset();
      } else {
        toast.error(res.message || "Failed to create role");
      }
    } catch (error) {
      const err = error as any;
      toast.error(err?.data?.message || err?.message || "Something went wrong!");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-blue-500/40 active:translate-y-0 active:shadow-none">
          <PlusCircle size={18} />
          Add Role
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="max-w-[800px] w-full p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>Add New Role</SheetTitle>
        </SheetHeader>

        {!canCreateRole ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4 px-6 flex-1">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10">
              <ShieldAlert className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Access Denied</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You do not have permission to add a new Role.
            </p>
            <Button variant="outline" onClick={() => setOpen(false)} className="mt-4">Close</Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddRole)} className="flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="bg-gray-100 p-1 rounded-xl mb-6 grid grid-cols-4 w-full h-auto shadow-inner">
                    <TabsTrigger value="general" className="gap-2 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <Settings className="w-4 h-4" />
                      Details
                    </TabsTrigger>
                    <TabsTrigger value="permissions" className="gap-2 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <Shield className="w-4 h-4" />
                      Perms
                    </TabsTrigger>
                    <TabsTrigger value="menus" className="gap-2 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <ListIcon className="w-4 h-4" />
                      Menus
                    </TabsTrigger>
                    <TabsTrigger value="dashboards" className="gap-2 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <Layout className="w-4 h-4" />
                      Widgets
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Role Name (Code)</FormLabel>
                          <FormControl><Input className="rounded-xl border-gray-200" placeholder="e.g., MANAGER" {...field} /></FormControl>
                          <FormDescription>Unique identifier (Uppercase, no spaces)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="display_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Display Name</FormLabel>
                          <FormControl><Input className="rounded-xl border-gray-200" placeholder="e.g., Sales Manager" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Description</FormLabel>
                          <FormControl><Textarea className="rounded-xl border-gray-200 min-h-[100px]" placeholder="What can this role do?" rows={3} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl border-gray-200"><SelectValue placeholder="Select status" /></SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl px-2">
                              {statusOptions.map(opt => <SelectItem key={opt.value} value={opt.value} className="rounded-lg">{opt.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="permissions" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <RolePermissionsMatrix
                      selectedPermissions={form.watch("permissions")}
                      onChange={(perms) => form.setValue("permissions", perms)}
                    />
                  </TabsContent>

                  <TabsContent value="menus" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <RoleMenuAccess
                      selectedMenus={form.watch("menus")}
                      onChange={(menus: any[]) => form.setValue("menus", menus)}
                    />
                  </TabsContent>

                  <TabsContent value="dashboards" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <RoleDashboardWidgets
                      selectedWidgets={form.watch("dashboards")}
                      onChange={(widgets) => form.setValue("dashboards", widgets)}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              <div className="border-t p-6 bg-gray-50 flex items-center justify-end gap-3 mt-auto sticky bottom-0">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading} className="rounded-xl px-6 border-gray-300">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="rounded-xl px-10 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 font-bold transition-all hover:scale-[1.02]">
                  {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating Bundle...</> : "Publish Role"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}
