/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { DataTable } from "@/app/components/dashboard/DataTable";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Link } from "react-router";
import type { ColumnDef } from "@tanstack/react-table";
import {
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  Package,
  MapPin,
} from "lucide-react";
import { useGetWarehousesQuery } from "@/store/features/admin/productsApiService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { toast } from "sonner";
// import { ACTIONS, MODULES } from "@/app/config/permissions";
// import { perm, usePermissions } from "@/shared/hooks/usePermissions";

export interface WarehouseData {
  _id: string;
  name: string;
  location: string;
  address: string;
  manager?: string;
  capacity?: number;
  current_stock?: number;
  isActive: boolean;
  createdAt: string;
}

export default function WarehousesList() {
  // --- Permissions (uncomment to activate) ---
  // const { hasPermission, isAdmin } = usePermissions();
  // const canViewProduct = isAdmin || hasPermission(perm(MODULES.PRODUCTS, ACTIONS.VIEW));
  // const canCreateProduct = isAdmin || hasPermission(perm(MODULES.PRODUCTS, ACTIONS.CREATE));
  // const canEditProduct = isAdmin || hasPermission(perm(MODULES.PRODUCTS, ACTIONS.UPDATE));
  // const canDeleteProduct = isAdmin || hasPermission(perm(MODULES.PRODUCTS, ACTIONS.DELETE));

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const limit = 10;

  const { data, isLoading } = useGetWarehousesQuery({ page, limit, search });

  const warehouses: WarehouseData[] = data?.data || [];
  const total = data?.pagination?.total || 0;

  const handleDelete = async () => {
    // TODO: Implement delete mutation
    toast.warning("Delete functionality not yet implemented");
    setDeleteId(null);
  };

  const columns: ColumnDef<WarehouseData>[] = [
    {
      accessorKey: "_id",
      header: "ID",
      meta: { className: "min-w-[60px]" },
    },
    {
      accessorKey: "name",
      header: "Warehouse Name",
      cell: ({ row }) => (
        <Link
          to={`/dashboard/products/warehouses/${row.original._id}`}
          className="font-medium text-blue-600 hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          {row.original.location || row.original.address || "-"}
        </div>
      ),
    },
    {
      accessorKey: "manager",
      header: "Manager",
      cell: ({ row }) => row.original.manager || "-",
    },
    {
      accessorKey: "capacity",
      header: "Capacity",
      cell: ({ row }) =>
        row.original.capacity
          ? `${Number(row.original.capacity).toLocaleString()} units`
          : "-",
    },
    {
      accessorKey: "current_stock",
      header: "Current Stock",
      cell: ({ row }) => {
        const stock = row.original.current_stock || 0;
        const capacity = row.original.capacity || 0;
        const percentage = capacity > 0 ? (stock / capacity) * 100 : 0;

        return (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-500" />
            <span>{stock.toLocaleString()} units</span>
            {capacity > 0 && (
              <Badge
                variant={percentage > 80 ? "destructive" : "default"}
                className="ml-2"
              >
                {percentage.toFixed(0)}%
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          className={row.original.isActive ? "bg-green-600" : "bg-gray-500"}
        >
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const warehouse = row.original;
        return (
          <div className="flex items-center gap-1">
            <Link to={`/dashboard/products/warehouses/${warehouse._id}`}>
              <Button size="sm" variant="ghost" className="h-8">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link to={`/dashboard/products/warehouses/${warehouse._id}/edit`}>
              <Button size="sm" variant="ghost" className="h-8">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-red-600"
              onClick={() => setDeleteId(warehouse._id as any)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Warehouses</h2>
        <Link to="/dashboard/products/warehouses/create">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            New Warehouse
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={warehouses}
            pageIndex={page - 1}
            pageSize={limit}
            totalCount={total}
            onPageChange={(newPage) => setPage(newPage + 1)}
            onSearch={setSearch}
            isFetching={isLoading}
          />
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Warehouse?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All stock in this warehouse will be
              affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
