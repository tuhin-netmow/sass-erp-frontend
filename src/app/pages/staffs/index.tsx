/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataTable } from "@/app/components/dashboard/DataTable";
import { Avatar, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { ACTIONS, MODULES } from "@/app/config/permissions";
import { perm, usePermissions } from "@/shared/hooks/usePermissions";
import {
  useDeleteStaffMutation,
  useGetAllStaffsQuery,
} from "@/store/features/app/staffs/staffApiService";
import { useGetAllRolesQuery } from "@/store/features/app/role/roleApiService";

import type { Department, Staff } from "@/shared/types";
import type { Role } from "@/shared/types/auth/users.types";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CalendarX2,
  Clock,
  PlusCircle,
  Trash,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { toast } from "sonner";


// Simple modal
function ConfirmModal({
  open,
  onClose,
  onConfirm,
  message,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-xl w-96">
        <h3 className="text-lg font-semibold mb-4">Confirm Action</h3>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Staffs() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleId, setRoleId] = useState<string>("all");
  const [limit] = useState(10);


  // --- Permissions ---
  const { hasPermission, isAdmin } = usePermissions();
  // const canViewStaff = isAdmin || hasPermission(perm(MODULES.STAFFS, ACTIONS.VIEW));
  // const canCreateStaff = isAdmin || hasPermission(perm(MODULES.STAFFS, ACTIONS.CREATE));
  // const canEditStaff = isAdmin || hasPermission(perm(MODULES.STAFFS, ACTIONS.UPDATE));
  const canDeleteStaff = isAdmin || hasPermission(perm(MODULES.STAFFS, ACTIONS.DELETE));

  const { data: staffsData, isLoading } = useGetAllStaffsQuery({
    page,
    limit,
    search,
    roleId: roleId === "all" ? undefined : roleId,
  });

  const { data: rolesData } = useGetAllRolesQuery({ limit: 100 });
  const roles = rolesData?.data ?? [];

  const staffsList = staffsData?.data as Staff[] | [];
  const [deleteStaff] = useDeleteStaffMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  // -----------------------------------------
  //  DYNAMIC STATS BASED ON API RESPONSE
  // -----------------------------------------
  const totalStaff = staffsList?.length;

  const activeStaff = staffsList?.filter(
    (s: Staff) => s.status?.toLowerCase() === "Active"
  ).length;

  const inactiveStaff = staffsList?.filter(
    (s: Staff) => s.status?.toLowerCase() === "Inactive"
  ).length;

  const onLeaveStaff = staffsList?.filter(
    (s) => s.status?.toLowerCase() === "On Leave"
  ).length;
  // If your DB uses "leave" or "onLeave", update the string.

  const stats = [
    {
      label: "Total Staffs",
      value: totalStaff,
      gradient: "from-blue-600 to-blue-400",
      shadow: "shadow-blue-500/30",
      icon: <Users className="w-6 h-6 text-white" />,
    },
    {
      label: "Active Staffs",
      value: activeStaff,
      gradient: "from-emerald-600 to-emerald-400",
      shadow: "shadow-emerald-500/30",
      icon: <Clock className="w-6 h-6 text-white" />,
    },
    {
      label: "On Leave",
      value: onLeaveStaff,
      gradient: "from-amber-600 to-amber-400",
      shadow: "shadow-amber-500/30",
      icon: <CalendarX2 className="w-6 h-6 text-white" />,
    },
    {
      label: "Inactive Staffs",
      value: inactiveStaff,
      gradient: "from-rose-600 to-rose-400",
      shadow: "shadow-rose-500/30",
      icon: <XCircle className="w-6 h-6 text-white" />,
    },
  ];

  // -----------------------
  // DELETE HANDLER
  // -----------------------
  const handleDeleteClick = (staff: Staff) => {
    setSelectedStaff(staff);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedStaff) return;
    try {
      await deleteStaff(selectedStaff._id).unwrap();
      toast.success("Staff deleted successfully!");
      setModalOpen(false);
      setSelectedStaff(null);
    } catch (err) {
      toast.error("Failed to delete staff.");
      console.error(err);
    }
  };

  const staffColumns: ColumnDef<Staff>[] = [
    {
      id: "sl",
      header: "SL",
      meta: { className: "md:sticky md:left-0 z-20 bg-background min-w-[70px]" } as any,
      cell: ({ row }) => (
        <span className="font-medium">{(page - 1) * limit + row.index + 1}</span>
      ),
    },
    {
      accessorKey: "firstName",
      header: "Name",
      meta: { className: "md:sticky md:left-[70px] z-20 bg-background md:shadow-[4px_0px_5px_-2px_rgba(0,0,0,0.1)]" } as any,
      cell: ({ row }) => (
        <div className="font-semibold">
          {row.original?.firstName} {row.original?.lastName}
        </div>
      ),
    },
    {
      accessorKey: "thumbUrl",
      header: "Image",
      cell: ({ row }) => {
        const image = row.getValue("thumbUrl") as string;
        return (
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={image} />
            </Avatar>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },

    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => {
        const department = row.getValue("department") as Department | null;
        return <div className="font-normal">{department?.name}</div>;
      },
    },

    {
      accessorKey: "position",
      header: "Position",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as Role | null;
        return <div className="font-normal">{role?.displayName}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;

        const color =
          status.toLowerCase() === "active"
            ? "bg-green-600"
            : status.toLowerCase() === "inactive"
              ? "bg-red-500"
              : "bg-gray-500";

        return <Badge className={`${color} text-white capitalize`}>{status}</Badge>;
      },
    },

    {
      accessorKey: "createdAt",
      header: "Hire Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt") as string);
        return date.toLocaleDateString();
      },
    },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex gap-2">
            <Link to={`/dashboard/staffs/${item._id}`}>
              <Button size="sm" variant="outline-info">
                View
              </Button>
            </Link>
            <Link to={`/dashboard/staffs/${item._id}/edit`}>
              <Button size="sm" variant="outline">
                Edit
              </Button>
            </Link>

            {canDeleteStaff &&
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteClick(item)}
              >
                <Trash className="w-4 h-4 mr-1" />
              </Button>
            }

          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-5 mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Staffs Management</h1>

        <Link to="/dashboard/staffs/add">
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <PlusCircle className="h-4 w-4" />
            Add Staff
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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

      <Card className="pt-6 pb-2">


        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <DataTable
              columns={staffColumns}
              data={staffsList ?? []}
              pageIndex={page - 1}
              pageSize={limit}
              totalCount={staffsData?.pagination?.total}
              onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
              onSearch={(value) => {
                setSearch(value);
                setPage(1);
              }}
              isFetching={isLoading}
              filters={
                <Select value={roleId} onValueChange={(val) => { setRoleId(val); setPage(1); }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role._id} value={String(role._id)}>
                        {role.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            />
          )}
        </CardContent>
      </Card>

      {/* CONFIRM MODAL */}
      <ConfirmModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        message={`Are you sure you want to delete ${selectedStaff?.firstName} ${selectedStaff?.lastName}?`}
      />
    </div>
  );
}
