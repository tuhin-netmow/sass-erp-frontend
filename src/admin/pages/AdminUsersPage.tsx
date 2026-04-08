import { useState } from "react";
import { useGetAllUsersAcrossAllTenantsQuery, useUpdateUserStatusMutation, useDeleteUserMutation } from "@/store/features/admin/adminApiService";
import type { AdminUsersQueryParams } from "@/shared/types/api";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import { MoreVertical, Shield, ShieldOff, Trash2, Database } from "lucide-react";
import { toast } from "sonner";
import { AdminDataTable } from "../components/shared/AdminDataTable";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import { createColumnHelper } from "@tanstack/react-table";

type User = {
  _id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  companyId?: string;
  companyName?: string;
  companySubdomain?: string;
  dbType?: string;
  dbName?: string;
  planName?: string;
  planSlug?: string;
  roleId?: {
    _id: string;
    name: string;
    displayName?: string;
  } | null;
  status: string;
  position?: string;
  departmentId?: string;
  phone?: string;
};

const columnHelper = createColumnHelper<User>();

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dbTypeFilter, setDbTypeFilter] = useState<string>("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId?: string;
    userName?: string;
  }>({ open: false });

  const { data, isLoading, refetch } = useGetAllUsersAcrossAllTenantsQuery({
    search,
    page,
    limit: pageSize,
    status: statusFilter || undefined,
    dbType: dbTypeFilter || undefined,
  } as AdminUsersQueryParams);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateUserStatusMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const users = data?.data || [];
  const totalCount = data?.total || 0;

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await updateStatus({ userId, status: newStatus }).unwrap();
      toast.success(`User ${newStatus === "active" ? "activated" : "deactivated"} successfully`);
      refetch();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err.data?.message || "Failed to update user status");
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    setConfirmDialog({ open: true, userId, userName });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.userId) return;

    try {
      await deleteUser(confirmDialog.userId).unwrap();
      toast.success("User deleted successfully");
      refetch();
      setConfirmDialog({ open: false });
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err.data?.message || "Failed to delete user");
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      active: "default",
      inactive: "secondary",
      terminated: "outline",
      on_leave: "outline",
    };

    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800 hover:bg-green-100",
      inactive: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      terminated: "bg-red-100 text-red-800 hover:bg-red-100",
      on_leave: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    };

    return (
      <Badge
        variant={variants[status] || "secondary"}
        className={colors[status] || ""}
      >
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  // Database type badge component
  const DbTypeBadge = ({ dbType }: { dbType?: string }) => {
    if (!dbType) return <span className="text-muted-foreground">-</span>;

    return (
      <Badge
        variant={dbType === "dedicated" ? "default" : "outline"}
        className={dbType === "dedicated" ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : ""}
      >
        <Database className="h-3 w-3 mr-1" />
        {dbType.toUpperCase()}
      </Badge>
    );
  };

  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => (
        <div>
          <span className="font-medium">{info.getValue()}</span>
          {info.row.original.position && (
            <p className="text-xs text-muted-foreground">{info.row.original.position}</p>
          )}
        </div>
      ),
    }),
    columnHelper.accessor("email", {
      header: "Email",
    }),
    columnHelper.accessor("companyName", {
      header: "Company",
      cell: (info) => (
        <div>
          <span className="font-medium">{info.getValue() || "-"}</span>
          {info.row.original.companySubdomain && (
            <p className="text-xs text-muted-foreground">
              {info.row.original.companySubdomain}
            </p>
          )}
        </div>
      ),
    }),
    columnHelper.accessor("dbType", {
      header: "Database",
      cell: (info) => <DbTypeBadge dbType={info.getValue()} />,
    }),
    columnHelper.accessor("planName", {
      header: "Plan",
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor("roleId", {
      header: "Role",
      cell: (info) => {
        const roleId = info.getValue() as { name?: string; displayName?: string } | null;
        return (
          <Badge variant="outline">
            {roleId?.name || "User"}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (props) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => handleToggleStatus(props.row.original._id, props.row.original.status)}
              disabled={isUpdating}
            >
              {props.row.original.status === "active" ? (
                <>
                  <ShieldOff className="h-4 w-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(props.row.original._id, props.row.original.name)}
              disabled={isDeleting}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Users</h1>
          <p className="text-muted-foreground">
            Manage all registered users across all companies and databases
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="terminated">Terminated</option>
          <option value="on_leave">On Leave</option>
        </select>

        <select
          value={dbTypeFilter}
          onChange={(e) => {
            setDbTypeFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="">All Database Types</option>
          <option value="shared">Shared</option>
          <option value="dedicated">Dedicated</option>
        </select>
      </div>

      <AdminDataTable
        columns={columns as any}
        data={users}
        totalCount={totalCount}
        pageIndex={page - 1}
        pageSize={pageSize}
        onPageChange={(newPage) => setPage(newPage + 1)}
        onPageSizeChange={setPageSize}
        search={search}
        onSearch={setSearch}
        isFetching={isLoading}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        onConfirm={confirmDelete}
        title="Delete User"
        description={`Are you sure you want to delete user "${confirmDialog.userName}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}
