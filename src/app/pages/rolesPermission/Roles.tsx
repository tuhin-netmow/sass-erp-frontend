"use client";

import { useState } from "react";
import { Link } from "react-router";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { DataTable } from "@/app/components/dashboard/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import AddNewRoleForm from "@/app/components/roles/AddRoleForm";
import { useGetAllRolesQuery } from "@/store/features/app/role/roleApiService";
import type { Role } from "@/shared/types/auth/users.types";

type ColumnMeta = {
  className?: string;
};



import { ShieldCheck, Users, XCircle } from "lucide-react";








export default function Roles() {
  // Form modal states
  const [open, setOpen] = useState<boolean>(false);
  // const [openEditForm, setOpenEditForm] = useState<boolean>(false);

  // Pagination & Search states
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const limit = 10;







  // Fetch roles from backend using RTK Query
  const { data, isFetching } = useGetAllRolesQuery({
    page,
    limit,
    search,
  });

  // Safe fallback
  const rolelist = data?.data || [];
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    limit,
    totalPage: 1,
  };

  // Stats calculation
  const totalRoles = pagination.total || 0;
  const activeRoles = rolelist.filter(r => r.status?.toLowerCase() === 'active').length;
  const inactiveRoles = rolelist.filter(r => r.status?.toLowerCase() === 'inactive').length;

  const stats = [
    {
      label: "Total Roles",
      value: totalRoles,
      gradient: "from-blue-600 to-blue-400",
      shadow: "shadow-blue-500/30",
      icon: <Users className="w-6 h-6 text-white" />,
    },
    {
      label: "Active Roles",
      value: activeRoles,
      gradient: "from-emerald-600 to-emerald-400",
      shadow: "shadow-emerald-500/30",
      icon: <ShieldCheck className="w-6 h-6 text-white" />,
    },
    {
      label: "Inactive Roles",
      value: inactiveRoles,
      gradient: "from-rose-600 to-rose-400",
      shadow: "shadow-rose-500/30",
      icon: <XCircle className="w-6 h-6 text-white" />,
    },
  ];















  // Columns for TanStack Table
  const roleColumns: ColumnDef<Role>[] = [
    {
      accessorKey: "_id",
      header: "ID",
      meta: { className: "md:sticky md:left-0 z-20 bg-background min-w-[60px]" } as ColumnMeta,
      cell: ({ row }) => <span className="font-medium text-xs">{(row.getValue("_id") as string)?.slice(-6)}</span>,
    },
    {
      accessorKey: "name",
      header: "Role Name",
      meta: { className: "md:sticky md:left-[60px] z-20 bg-background md:shadow-[4px_0px_5px_-2px_rgba(0,0,0,0.1)]" } as ColumnMeta,
      cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
    },
    {
      accessorKey: "displayName",
      header: "Display Name",
      cell: ({ row }) => <div>{row.getValue("displayName") || row.original.displayName}</div>,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <div className="text-gray-600">{row.getValue("description")}</div>,
    },
    {
      accessorKey: "permissions",
      header: "Permissions",
      cell: ({ row }) => {
        // Handle undefined or complex structured permissions
        const rawPerms = row.getValue("permissions") as string[] | { module: string; actions: string[] }[] | undefined;
        const permissions: string[] = Array.isArray(rawPerms)
          ? rawPerms.map((p) => typeof p === 'string' ? p : p.module ? `${p.module}: ${p.actions?.join(', ')}` : JSON.stringify(p))
          : [];
          
        return (
          <div className="flex flex-wrap gap-1">
            {permissions?.slice(0, 3).map((perm, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {perm}
              </Badge>
            ))}
            {permissions?.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{permissions.length - 3}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const color =
          status.toLowerCase() === "active"
            ? "bg-green-100 text-green-700 hover:bg-green-200"
            : status.toLowerCase() === "inactive"
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
              : "bg-gray-500";

        return <Badge className={`${color} capitalize`}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const role = row.original;
        return (
          <div className="flex items-center gap-2">
            <Link to={`/dashboard/roles/edit/${role._id}`}>
              <Button size="sm" variant="outline">
                Edit
              </Button>
            </Link>

          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Existing Roles</h1>
        <AddNewRoleForm open={open} setOpen={setOpen} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {stats.map((item, idx) => (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-2xl bg-linear-to-br ${item.gradient} p-6 shadow-lg ${item.shadow} transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5`}
          >
            {/* Background Pattern */}
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-black/10 blur-2xl" />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white/90">{item.label}</p>
                <h3 className="mt-2 text-3xl font-bold text-white">
                  {item.value}
                </h3>
              </div>
              <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm">
                {item.icon}
              </div>
            </div>

            {/* Progress/Indicator line (optional visual flair) */}
            <div className="mt-4 h-1 w-full rounded-full bg-black/10">
              <div className="h-full w-2/3 rounded-full bg-white/40" />
            </div>
          </div>
        ))}
      </div>

      {/* Roles Table */}
      <Card className="pt-6 pb-2">
        <CardHeader>
          <CardTitle>Available Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={roleColumns}
            data={rolelist}
            pageIndex={page - 1}
            pageSize={limit}
            totalCount={pagination.total}
            onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
            onSearch={(value) => {
              setSearch(value);
              setPage(1);
            }}
            isFetching={isFetching}
          />
        </CardContent>
      </Card>



      {/* Delete confirmation modal */}

      {/* Edit Role Modal */}
      {/* <EditRoleForm open={openEditForm} setOpen={setOpenEditForm} /> */}


    </div>
  );
}
