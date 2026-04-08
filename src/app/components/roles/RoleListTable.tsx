
import { useState } from "react";
import { useGetAllRolesQuery, useDeleteRoleMutation } from "@/store/features/app/role/roleApiService";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Badge } from "@/shared/components/ui/badge";
import {
  Search,
  Shield,
  MoreVertical,
  Pencil,
  Trash2,
  AlertTriangle,
  Layout,
} from "lucide-react";
import { Link } from "react-router";
import { ACTIONS, MODULES } from "@/app/config/permissions";
import { RoleDeleteDialog } from "./RoleDeleteDialog";
import { perm, usePermissions } from "@/shared/hooks/usePermissions";
import { flattenPermissions } from "@/shared/utils/permissionUtils";
import type { Role } from "@/shared/types/auth/users.types";

export function RoleListTable() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

  const { hasPermission, isAdmin } = usePermissions();
  const canDeleteRole = isAdmin || hasPermission(perm(MODULES.ROLES, ACTIONS.DELETE));
  const canEditRole = isAdmin || hasPermission(perm(MODULES.ROLES, ACTIONS.UPDATE));

  const { data, isLoading, refetch } = useGetAllRolesQuery({ page, limit, search });
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  const handleDelete = async () => {
    if (!roleToDelete) return;
    try {
      await deleteRole(roleToDelete).unwrap();
      toast.success("Role deleted successfully");
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
      refetch();
    } catch (error) {
      const err = error as any;
      toast.error(err.data?.message || "Failed to delete role");
    }
  };

  const roles = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search roles by name or description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 rounded-xl border-gray-200 h-10 w-full"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 whitespace-nowrap px-2">
          <Shield className="w-4 h-4" />
          <span>Total: {pagination?.total || 0} Roles</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden transition-all duration-300">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                <TableHead className="font-bold text-gray-900 py-5">Role Identity</TableHead>
                <TableHead className="font-bold text-gray-900 py-5">Display Information</TableHead>
                <TableHead className="font-bold text-gray-900 py-5">Security Rights</TableHead>
                <TableHead className="font-bold text-gray-900 py-5">Status</TableHead>
                <TableHead className="font-bold text-gray-900 py-5 text-center px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-500 font-medium font-mono text-sm animate-pulse tracking-widest">LOADING MODULES...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center border border-dashed border-gray-200">
                        <Shield className="w-10 h-10 text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-semibold text-lg">No roles defined yet</p>
                      <p className="text-gray-400 text-sm max-w-[300px]">Create a new role to start managing access and permissions for your team members.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role: Role) => (
                  <TableRow key={role._id} className="group hover:bg-blue-50/30 transition-colors border-b border-gray-100 last:border-0">
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{role.name}</span>
                        <span className="text-[10px] font-mono text-gray-400 uppercase leading-none mt-1 select-all">{role._id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-800">{role.displayName}</p>
                        <p className="text-xs text-gray-500 line-clamp-1 max-w-[250px]">{role.description}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {flattenPermissions(role.permissions)?.slice(0, 3).map((perm: string, i: number) => (
                          <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 font-mono text-[10px] px-1.5 py-0.5">
                            {perm}
                          </Badge>
                        ))}
                        {flattenPermissions(role.permissions)?.length > 3 && (
                          <Badge variant="outline" className="text-[10px] font-bold text-gray-400 border-gray-200">
                            +{flattenPermissions(role.permissions).length - 3} MORE
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)] ${role.status === "active" ? "bg-green-500 shadow-green-500/50" : "bg-gray-300"}`}></div>
                        <Badge
                          variant={role.status === "active" ? "default" : "secondary"}
                          className={`
                            capitalize text-[11px] font-bold tracking-tight rounded-md px-2 py-0
                            ${role.status === "active" ? "bg-green-50 text-green-700 hover:bg-green-100 border-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300"}
                          `}
                        >
                          {role.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-center px-4">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canEditRole && (
                          <Link
                            to={`/dashboard/roles/edit/${role._id}`}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Edit Role Config"
                          >
                            <Pencil size={18} />
                          </Link>
                        )}
                        {canDeleteRole && (
                          <button
                            onClick={() => { setRoleToDelete(role._id); setDeleteDialogOpen(true); }}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Purge Role"
                            disabled={['superadmin', 'admin'].includes(role.name.toLowerCase())}
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl"><MoreVertical size={18} /></button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl p-2 w-48 shadow-xl border-gray-100">
                            <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer font-medium">
                              <Layout size={16} /> View Bindings
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer font-medium text-amber-600 focus:text-amber-700">
                              <AlertTriangle size={16} /> Audit Trail
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      {pagination && (pagination.totalPages ?? 0) > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
          <div className="flex items-center gap-1 text-[13px] text-gray-500 font-medium">
            <span>Showing range</span>
            <span className="font-bold text-gray-900 border-b border-gray-300 px-1">{((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)}</span>
            <span>of</span>
            <span className="font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded ml-1">{pagination.total} Roles</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl px-4 border-gray-200 hover:bg-gray-50"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1.5 tracking-tight font-bold">
              {Array.from({ length: pagination.totalPages ?? 1 }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm transition-all shadow-sm ${page === p ? "bg-blue-600 text-white shadow-blue-500/20" : "bg-white text-gray-500 hover:border-gray-300 border border-transparent"}`}
                >
                  {p}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.totalPages ?? 1, p + 1))}
              disabled={page === (pagination.totalPages ?? 1)}
              className="rounded-xl px-4 border-gray-200 hover:bg-gray-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Dialog Binding */}
      <RoleDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
