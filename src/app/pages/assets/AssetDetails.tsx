import { useParams } from "react-router";
import { Link } from "react-router";
import { useGetAssetByIdQuery, useGetAssetMovementsQuery } from "@/store/features/app/assets/assetsApiService";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  ArrowLeft,
  Edit,
  MapPin,
  DollarSign,
  ArrowRightLeft,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { DataTable } from "@/app/components/dashboard/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { AssetMovement } from "@/shared";


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
  maintenance: "Under Maintenance",
};

export default function AssetDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: assetData, isLoading } = useGetAssetByIdQuery(id!, {
    skip: !id,
  });
  const { data: movementsData } = useGetAssetMovementsQuery(
    { id: id!, params: {} },
    { skip: !id }
  );

  const asset = assetData?.data;
  const movements = movementsData?.data ?? [];

  const movementColumns: ColumnDef<AssetMovement>[] = [
    {
      accessorKey: "fromLocation",
      header: "From",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          {row.getValue("fromLocation")}
        </div>
      ),
    },
    {
      accessorKey: "toLocation",
      header: "To",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-green-600" />
          {row.getValue("toLocation")}
        </div>
      ),
    },
    {
      accessorKey: "movedBy.name",
      header: "Moved By",
      cell: ({ row }) => row.original.movedBy?.name || "System",
    },
    {
      accessorKey: "movedAt",
      header: "Date",
      cell: ({ row }) => new Date(row.getValue("movedAt")).toLocaleDateString(),
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => row.getValue("reason") || "-",
    },
  ];

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!asset) {
    return <div className="p-6">Asset not found</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/assets">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{asset.name}</h1>
              <Badge className={statusColors[asset.status]}>
                {statusLabels[asset.status] || asset.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              ID: {asset.assetId} • {asset.category} • {asset.type}
            </p>
          </div>
        </div>
        <Link to={`/assets/${asset._id}/edit`}>
          <Button className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Asset
          </Button>
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchase Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${asset.purchaseCost.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(asset.purchaseDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${asset.currentValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Depreciated:{" "}
              {((asset.purchaseCost - asset.currentValue) / asset.purchaseCost * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Location</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{asset.location}</div>
            {asset.assignedTo && (
              <p className="text-xs text-muted-foreground">
                Assigned to: {asset.assignedTo.name}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Depreciation</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{asset.depreciationRate}%</div>
            <p className="text-xs text-muted-foreground">Per year</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Asset ID
                  </label>
                  <p className="text-lg font-mono">{asset.assetId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Public ID
                  </label>
                  <p className="text-lg font-mono">{asset.publicId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Category
                  </label>
                  <p>{asset.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Type
                  </label>
                  <p>{asset.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Serial Number
                  </label>
                  <p>{asset.serialNumber || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Manufacturer
                  </label>
                  <p>{asset.manufacturer || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Model
                  </label>
                  <p>{asset.model || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Warranty Expiry
                  </label>
                  <p>
                    {asset.warrantyExpiry
                      ? new Date(asset.warrantyExpiry).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              {asset.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Description
                  </label>
                  <p className="mt-1">{asset.description}</p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Last Maintenance
                  </label>
                  <p>
                    {asset.lastMaintenanceDate
                      ? new Date(asset.lastMaintenanceDate).toLocaleDateString()
                      : "No maintenance recorded"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Next Maintenance
                  </label>
                  <p>
                    {asset.nextMaintenanceDate
                      ? new Date(asset.nextMaintenanceDate).toLocaleDateString()
                      : "Not scheduled"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Movement History</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={movementColumns}
                data={movements}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Maintenance history and upcoming schedules will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
