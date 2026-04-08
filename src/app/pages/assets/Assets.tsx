import { useState } from "react";
import { DataTable } from "@/app/components/dashboard/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  useGetAllAssetsQuery,
  useGetAssetStatsQuery,
  useDeleteAssetMutation,
} from "@/store/features/app/assets/assetsApiService";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Building2,
  DollarSign,
  Package,
  Wrench,
  PlusCircle,
  Trash2,
  Eye,
  Edit,

} from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { Asset } from "@/shared";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  disposed: "bg-red-100 text-red-800",
  maintenance: "bg-yellow-100 text-yellow-800",
};

const statusLabels: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  disposed: "Disposed",
  maintenance: "Maintenance",
};

export default function Assets() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: assetsData, isLoading } = useGetAllAssetsQuery({
    page,
    limit,
    search,
    status: statusFilter === "all" ? undefined : (statusFilter as any),
    category: categoryFilter === "all" ? undefined : categoryFilter,
  });

  const { data: statsData } = useGetAssetStatsQuery();
  const [deleteAsset] = useDeleteAssetMutation();

  const assets = assetsData?.data ?? [];
  const stats = statsData?.data;

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this asset?")) {
      try {
        await deleteAsset(id).unwrap();
        toast.success("Asset deleted successfully");
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to delete asset");
      }
    }
  };

  const columns: ColumnDef<Asset>[] = [
    {
      accessorKey: "assetId",
      header: "Asset ID",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.getValue("assetId")}</span>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("category")}</Badge>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => row.getValue("type"),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge className={statusColors[status]}>
            {statusLabels[status] || status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => row.getValue("location"),
    },
    {
      accessorKey: "purchaseCost",
      header: "Purchase Cost",
      cell: ({ row }) => (
        <span className="font-medium">
          ${Number(row.getValue("purchaseCost")).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "currentValue",
      header: "Current Value",
      cell: ({ row }) => (
        <span className="font-medium text-green-600">
          ${Number(row.getValue("currentValue")).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const asset = row.original;
        return (
          <div className="flex items-center gap-2">
            <Link to={`/assets/${asset._id}`}>
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link to={`/assets/${asset._id}/edit`}>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(asset._id)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assets Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your company assets and track their value
          </p>
        </div>
        <Link to="/assets/add">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Asset
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAssets}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeAssets} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalValue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Current: ${stats.depreciatedValue.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Maintenance</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.maintenanceAssets}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.inactiveAssets} inactive
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disposed</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.disposedAssets}</div>
              <p className="text-xs text-muted-foreground">
                Written off assets
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Search</label>
              <input
                type="text"
                placeholder="Search by name, ID, or location..."
                className="w-full px-3 py-2 border rounded-md"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-[200px]">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="disposed">Disposed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[200px]">
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {stats?.categoriesCount &&
                    Object.keys(stats.categoriesCount).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets Table */}
      <DataTable
        columns={columns}
        data={assets}
        isFetching={isLoading}
        pageIndex={page - 1}
        pageSize={limit}
        totalCount={assetsData?.pagination?.total || 0}
        onPageChange={(newPage) => setPage(newPage + 1)}
      />
    </div>
  );
}
