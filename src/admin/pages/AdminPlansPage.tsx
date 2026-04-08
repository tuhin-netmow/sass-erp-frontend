import { useState } from "react";
import { useNavigate } from "react-router";
import { useGetAllPlansQuery, useDeletePlanMutation } from "@/store/features/admin/adminApiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Plus, Pencil, Trash2, CheckCircle, LayoutGrid, Table as TableIcon } from "lucide-react";
import { toast } from "sonner";
import { AdminDataTable } from "../components/shared/AdminDataTable";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import { type ColumnDef } from "@tanstack/react-table";
import type { Plan as PlanType } from "../components/forms";

export default function AdminPlansPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    planId?: string;
    planName?: string;
  }>({ open: false });

  const { data, isLoading, refetch } = useGetAllPlansQuery(undefined);
  const [deletePlan, { isLoading: isDeleting }] = useDeletePlanMutation();

  const plans = data?.data || [];

  const handleDelete = async (planId: string, planName: string) => {
    setConfirmDialog({ open: true, planId, planName });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.planId) return;

    try {
      await deletePlan(confirmDialog.planId).unwrap();
      toast.success("Plan deleted successfully");
      refetch();
      setConfirmDialog({ open: false });
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err.data?.message || "Failed to delete plan");
    }
  };

  const columns: ColumnDef<PlanType>[] = [
    {
      accessorKey: "name",
      header: "Plan Name",
      cell: (info) => <span className="font-medium">{info.getValue() as string}</span>,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: (info) => (info.getValue() as string | undefined) || "-",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: (info) => {
        const price = info.getValue() as { monthly?: number } | undefined;
        return (
          <Badge variant={price?.monthly === 0 ? "secondary" : "default"}>
            {price?.monthly === 0 ? "Free" : `$${price?.monthly || 0}/mo`}
          </Badge>
        );
      },
    },
    {
      accessorKey: "max_users",
      header: "Max Users",
      cell: (info) => (info.getValue() as number | undefined) ? info.getValue() as string | number : "Unlimited",
    },
    {
      id: "storage",
      header: "Storage",
      cell: (props) => {
        const plan = props.row.original as any;
        return <span>{plan.limits?.storage || 10} GB</span>;
      },
    },
    {
      accessorKey: "db_type",
      header: "Database",
      cell: (info) => {
        const dbType = info.getValue() as string | undefined;
        return (
          <Badge
            variant={dbType === "dedicated" ? "default" : "outline"}
            className={dbType === "dedicated" ? "bg-purple-100 text-purple-800" : ""}
          >
            {dbType || "Shared"}
          </Badge>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: (props) => {
        const plan = props.row.original as any;
        const status = plan.status || "active";
        return (
          <Badge variant={status === "active" ? "default" : "secondary"}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: (props) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/plans/edit/${props.row.original.id}`)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-600"
            onClick={() => handleDelete(props.row.original.id.toString(), props.row.original.name)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
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
          <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
          <p className="text-muted-foreground">
            Manage pricing and features for subscription plans
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
          <Button onClick={() => navigate("/admin/plans/add")}>
            <Plus className="h-4 w-4 mr-2" />
            New Plan
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan: PlanType) => (
            <Card key={plan.id} className="relative h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{plan.description}</p>
                  </div>
                  <Badge variant={plan.price?.monthly === 0 ? "secondary" : "default"} className="shrink-0">
                    {plan.price?.monthly === 0 ? "Free" : `$${plan.price?.monthly || 0}/mo`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Max Users</span>
                    <span className="font-medium">
                      {plan.max_users ? plan.max_users : "Unlimited"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Storage</span>
                    <span className="font-medium">
                      {(plan as any).limits?.storage || 10} GB
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Companies</span>
                    <span className="font-medium">
                      {(plan as any).limits?.companies || 1}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Database</span>
                    <Badge
                      variant={plan.db_type === "dedicated" ? "default" : "outline"}
                      className={plan.db_type === "dedicated" ? "bg-purple-100 text-purple-800" : ""}
                    >
                      {plan.db_type || "Shared"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={(plan as any).status === "active" ? "default" : "secondary"}>
                      {(plan as any).status || "active"}
                    </Badge>
                  </div>
                </div>

                {plan.features && plan.features.length > 0 && (
                  <div className="space-y-2 flex-1">
                    <p className="text-sm font-medium">Features</p>
                    <ul className="space-y-2">
                      {plan.features.map((feature: any, index: number) => {
                        const featureName = typeof feature === 'object' ? feature.name : feature;
                        const isIncluded = typeof feature === 'object' ? feature.included ?? true : true;
                        return (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className={`h-4 w-4 mt-0.5 shrink-0 ${isIncluded ? "text-green-600" : "text-gray-400"}`} />
                            <span className={`flex-1 ${!isIncluded ? "text-muted-foreground line-through" : ""}`}>
                              {featureName}
                              {typeof feature === 'object' && feature.limit && ` (${feature.limit})`}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/admin/plans/edit/${plan.id}`)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-600"
                    onClick={() => handleDelete(plan.id.toString(), plan.name)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
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
          columns={columns}
          data={plans}
          totalCount={plans.length}
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
        title="Delete Plan"
        description={`Are you sure you want to delete plan "${confirmDialog.planName}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}
