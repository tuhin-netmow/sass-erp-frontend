import { useState } from "react";
import { useGetAllModulesQuery, useCreateModuleMutation, useUpdateModuleMutation, useDeleteModuleMutation, useUpdateModuleStatusMutation } from "@/store/features/admin/adminApiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Plus, Pencil, Trash2, LayoutGrid, Table as TableIcon, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import { AdminDataTable } from "../components/shared/AdminDataTable";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import { createColumnHelper } from "@tanstack/react-table";
import { ModuleFormDialog, type ModuleSubmitData, type Module } from "../components/forms";

const columnHelper = createColumnHelper<Module>();

export default function AdminModulesPage() {
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    moduleId?: string;
    moduleName?: string;
  }>({ open: false });

  const { data, isLoading, refetch } = useGetAllModulesQuery({});
  const [createModule, { isLoading: isCreating }] = useCreateModuleMutation();
  const [updateModule, { isLoading: isUpdating }] = useUpdateModuleMutation();
  const [deleteModule, { isLoading: isDeleting }] = useDeleteModuleMutation();
  const [updateModuleStatus, { isLoading: isUpdatingStatus }] = useUpdateModuleStatusMutation();

  const modules = data?.data || [];

  const handleOpen = (module?: Module) => {
    setEditingModule(module || null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingModule(null);
  };

  const handleSubmit = async (data: ModuleSubmitData) => {
    try {
      if (editingModule) {
        await updateModule({
          moduleId: editingModule._id || editingModule.id || "",
          ...data,
        }).unwrap();
        toast.success("Module updated successfully");
      } else {
        await createModule(data).unwrap();
        toast.success("Module created successfully");
      }

      handleClose();
      refetch();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err.data?.message || "Failed to save module");
    }
  };

  const handleDelete = async (moduleId: string, moduleName: string) => {
    setConfirmDialog({ open: true, moduleId, moduleName });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.moduleId) return;

    try {
      await deleteModule(confirmDialog.moduleId).unwrap();
      toast.success("Module deleted successfully");
      refetch();
      setConfirmDialog({ open: false });
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err.data?.message || "Failed to delete module");
    }
  };

  const handleToggleStatus = async (module: Module) => {
    const newStatus = module.status === "active" ? "inactive" : "active";
    try {
      await updateModuleStatus({
        moduleId: module._id || module.id || "",
        status: newStatus,
      }).unwrap();
      toast.success(`Module ${newStatus === "active" ? "activated" : "deactivated"} successfully`);
      refetch();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err.data?.message || "Failed to update module status");
    }
  };

  const columns = [
    columnHelper.accessor("name", {
      header: "Module Name",
      cell: (info) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <LayoutGrid className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <span className="font-medium">{info.getValue()}</span>
            <p className="text-xs text-muted-foreground">{info.row.original.slug}</p>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("description", {
      header: "Description",
      cell: (info) => (
        <span className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
          {info.getValue() || "-"}
        </span>
      ),
    }),
    columnHelper.accessor("category", {
      header: "Category",
      cell: (info) => {
        const category = info.getValue();
        const colors: Record<string, string> = {
          core: "bg-blue-100 text-blue-800",
          addon: "bg-purple-100 text-purple-800",
          enterprise: "bg-amber-100 text-amber-800",
          beta: "bg-gray-100 text-gray-800",
        };
        return (
          <Badge className={colors[category] || "bg-gray-100"}>
            {category?.charAt(0).toUpperCase() + category?.slice(1)}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue();
        return (
          <Badge variant={status === "active" ? "default" : "secondary"}>
            {status === "active" ? "Active" : status === "coming_soon" ? "Coming Soon" : "Inactive"}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("sortOrder", {
      header: "Order",
      cell: (info) => info.getValue() || 0,
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (props) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleStatus(props.row.original)}
            disabled={isUpdatingStatus}
            title={props.row.original.status === "active" ? "Deactivate" : "Activate"}
          >
            {props.row.original.status === "active" ? (
              <PowerOff className="h-4 w-4" />
            ) : (
              <Power className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpen(props.row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-600"
            onClick={() => handleDelete(props.row.original._id || props.row.original.id || "", props.row.original.name)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }),
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ERP Modules</h1>
          <p className="text-muted-foreground">
            Manage modules for the landing page and system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 px-3"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-8 px-3"
            >
              <TableIcon className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => handleOpen()}>
            <Plus className="h-4 w-4 mr-2" />
            New Module
          </Button>

          <ModuleFormDialog
            open={open}
            onOpenChange={(open) => {
              setOpen(open);
              if (!open) setEditingModule(null);
            }}
            editingModule={editingModule}
            onSubmit={handleSubmit}
            isSubmitting={isCreating || isUpdating}
          />
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module: Module) => (
            <Card key={module._id || module.id} className="relative h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl">{module.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{module.slug}</p>
                  </div>
                  <Badge
                    variant={module.status === "active" ? "default" : "secondary"}
                    className="shrink-0"
                  >
                    {module.status === "active" ? "Active" : module.status === "coming_soon" ? "Coming Soon" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {module.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Category</span>
                    <Badge
                      variant="outline"
                      className={
                        module.category === "core"
                          ? "bg-blue-100 text-blue-800"
                          : module.category === "addon"
                          ? "bg-purple-100 text-purple-800"
                          : module.category === "enterprise"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {module.category?.charAt(0).toUpperCase() + module.category?.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Features</span>
                    <span className="font-medium">{module.features?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Benefits</span>
                    <span className="font-medium">{module.benefits?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Capabilities</span>
                    <span className="font-medium">{module.capabilities?.length || 0}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleToggleStatus(module)}
                    disabled={isUpdatingStatus}
                  >
                    {module.status === "active" ? (
                      <PowerOff className="h-4 w-4 mr-2" />
                    ) : (
                      <Power className="h-4 w-4 mr-2" />
                    )}
                    {module.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpen(module)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-600"
                    onClick={() => handleDelete(module._id || module.id || "", module.name)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <AdminDataTable
          columns={columns as any}
          data={modules}
          totalCount={modules.length}
          pageIndex={0}
          pageSize={20}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          search=""
          onSearch={() => {}}
          isFetching={isLoading}
        />
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        onConfirm={confirmDelete}
        title="Delete Module"
        description={`Are you sure you want to delete module "${confirmDialog.moduleName}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}
