/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/shared/components/ui/card";
import { DataTable } from "@/app/components/dashboard/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/shared/components/ui/button";
import { Link } from "react-router";
import { PlusCircle } from "lucide-react";
import type { SalesRoute } from "@/shared/types/app/salesRoute.types";
import { useGetAllSalesRouteQuery } from "@/store/features/app/salesRoute/salesRoute";
import { useState } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Map, MapPin, CheckCircle, XCircle, Eye, Edit, UserPlus } from "lucide-react";
import AssignRouteModal from "./AssignRoute";

export default function SalesRoutesPage() {

  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const limit = 10;

  const {
    data: salesRouteData,
    isFetching,
  } = useGetAllSalesRouteQuery({ page, limit, search });

  const salesRoute: SalesRoute[] = salesRouteData?.data || [];

  // Fetch all for stats (simplified frontend calculation)
  const { data: allRoutesData } = useGetAllSalesRouteQuery({ limit: 1000 });
  const allRoutes = allRoutesData?.data || [];


  const totalRoutes = allRoutes.length;
  const activeRoutes = allRoutes.filter((r) => r.isActive).length;
  const inactiveRoutes = allRoutes.filter((r) => !r.isActive).length;
  // TODO: Add Logic for 'Assigned Routes' if applicable on this data model

  const stats = [
    {
      label: "Total Routes",
      value: totalRoutes,
      gradient: "from-blue-600 to-blue-400",
      shadow: "shadow-blue-500/30",
      icon: <Map className="w-6 h-6 text-white" />,
    },
    {
      label: "Active Routes",
      value: activeRoutes,
      gradient: "from-emerald-600 to-emerald-400",
      shadow: "shadow-emerald-500/30",
      icon: <CheckCircle className="w-6 h-6 text-white" />,
    },
    {
      label: "Inactive Routes",
      value: inactiveRoutes,
      gradient: "from-rose-600 to-rose-400",
      shadow: "shadow-rose-500/30",
      icon: <XCircle className="w-6 h-6 text-white" />,
    },
    // Placeholder for another stat if needed
    {
      label: "Start Locations",
      // Just counting unique start locations as a proxy for coverage
      value: new Set(allRoutes.map(r => r.startLocation).filter(Boolean)).size,
      gradient: "from-violet-600 to-violet-400",
      shadow: "shadow-violet-500/30",
      icon: <MapPin className="w-6 h-6 text-white" />,
    },
  ];







  const RoutesColumns: ColumnDef<SalesRoute>[] = [
    {
      accessorKey: "id",
      header: "ID",
      meta: { className: "md:sticky md:left-0 z-20 bg-background min-w-[60px]" } as any,
    },
    {
      accessorKey: "routeName",
      header: "Route Name",
      meta: { className: "md:sticky md:left-[60px] z-20 bg-background md:shadow-[4px_0px_5px_-2px_rgba(0,0,0,0.1)]" } as any,
      cell: ({ row }) => (
        <Link
          to={`/dashboard/sales/sales-routes/${row.original.id}`}
          className="font-medium text-blue-600 hover:underline"
        >
          {row.original.routeName}
        </Link>
      ),
    },

    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.description || "-"}
        </span>
      ),
    },

    // {
    //   accessorKey: "assigned_sales_rep_id",
    //   header: "Sales Rep",
    //   cell: ({ row }) => (
    //     <span className="font-medium">
    //       Rep #{row.original.assigned_sales_rep_id ?? "-"}
    //     </span>
    //   ),
    // },

    {
      accessorKey: "startLocation",
      header: "Start Location",
      cell: ({ row }) => row.original.startLocation || "-",
    },

    {
      accessorKey: "endLocation",
      header: "End Location",
      cell: ({ row }) => row.original.endLocation || "-",
    },

    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          className={
            row.original.isActive
              ? "bg-green-600 text-white"
              : "bg-gray-500 text-white"
          }
        >
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },

    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString(),
    },
    // {
    //   accessorKey: "sataff",
    //   header: "Staff",
    //   cell: () => {


    //     return 0
    //   }

    // },
    // {
    //   accessorKey: "customers",
    //   header: "Customers",
    //   cell: () => {

    //     return 0
    //   }

    // },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const route = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <Link to={`/dashboard/sales/sales-routes/${route.id}`}>
              <Button size="sm" className="h-8 bg-cyan-50 text-cyan-600 hover:bg-cyan-100 border-none shadow-none rounded-lg" title="View">
                <Eye className="h-4 w-4" />
                View
              </Button>
            </Link>
            <Link to={`/dashboard/sales/sales-routes/${route.id}/edit`}>
              <Button size="sm" className="h-8 bg-blue-50 text-blue-600 hover:bg-blue-100 border-none shadow-none rounded-lg" title="Edit">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button
              size="sm"
              className="h-8 bg-violet-50 text-violet-600 hover:bg-violet-100 border-none shadow-none rounded-lg"
              title="Assign"
              onClick={() => {
                setSelectedRouteId(route._id);
                setIsAssignDialogOpen(true);
              }}
            >
              <UserPlus className="h-4 w-4" />
              Assign
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-5 mb-5">
        <h2 className="text-xl font-bold">Sales Routes</h2>
        <Link to="/dashboard/sales/sales-routes/create">
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-5 transition-all duration-200">
            <PlusCircle className="h-4 w-4" />
            New Route
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
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
      <Card className="shadow-sm py-6">
        <CardContent>


          <DataTable
            columns={RoutesColumns}
            data={salesRoute}
            pageIndex={page - 1}
            pageSize={limit}
            totalCount={salesRouteData?.pagination?.total}
            onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
            onSearch={(value) => {
              setSearch(value);
              setPage(1);
            }}
            isFetching={isFetching}
          />



        </CardContent>

      </Card>

      {/* Assign Staff Modal */}
      {selectedRouteId && (
        <AssignRouteModal
          key={selectedRouteId} // Force remount when ID changes
          isOpen={isAssignDialogOpen}
          onClose={() => {
            setIsAssignDialogOpen(false);
            setSelectedRouteId(null);
          }}
          routeId={selectedRouteId}
        />
      )}
    </div>
  );
}
