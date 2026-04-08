/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataTable } from "@/app/components/dashboard/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  PackagePlus,
  MapPin,
  Trash2,
  User,
  MoreHorizontal,
  Edit,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useState } from "react";
import { Link } from "react-router";
import {
  useDeleteCustomerMutation,
  useGetCustomerStatsQuery,
  useGetInactiveCustomersQuery,
} from "@/store/features/app/customers/customersApi";
import type { Customer } from "@/shared/types/app/customers";
import { toast } from "sonner";
import {
  MODULES,
  ACTIONS,
} from "@/app/config/permissions";
import { usePermissions, perm } from "@/shared/hooks/usePermissions";
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
import { useAppSelector } from "@/store/store";

import {
  Dialog,
  DialogContent,
} from "@/shared/components/ui/dialog";

import { MapEmbed } from "@/shared/components/common/MapEmbed";

export default function InActiveCustomersList() {
  const [pageIndex, setPageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [mapLocation, setMapLocation] = useState<string | null>(null);

  const { hasPermission, isAdmin } = usePermissions();
  // const canViewCustomer = isAdmin || hasPermission(perm(MODULES.CUSTOMERS, ACTIONS.VIEW));
  const canCreateCustomer = isAdmin || hasPermission(perm(MODULES.CUSTOMERS, ACTIONS.CREATE));
  const canEditCustomer = isAdmin || hasPermission(perm(MODULES.CUSTOMERS, ACTIONS.UPDATE));
  const canDeleteCustomer = isAdmin || hasPermission(perm(MODULES.CUSTOMERS, ACTIONS.DELETE));

  const [previewData, setPreviewData] = useState<{
    images: string[];
    index: number;
  } | null>(null);

  const [pageSize, setPageSize] = useState(10);
  const currentPage = pageIndex + 1;

  const currency = useAppSelector((state) => state.currency.value);

  // Fetch customers with pagination and search
  const { data, isLoading, error } = useGetInactiveCustomersQuery({
    page: currentPage,
    limit: pageSize,
    search: searchTerm || undefined,

  });

  const [deleteCustomer, { isLoading: isDeleting }] =
    useDeleteCustomerMutation();

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteCustomer(deleteId).unwrap();
      toast.success("Customer deleted successfully");
      setDeleteId(null);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Failed to delete customer");
    }
  };

  const customers = data?.data || [];
  // const totalPages = data?.pagination.totalPage || 1;
  const totalCustomers = data?.pagination.total || 0;

  // Calculate stats from customers

  const { data: customerStats } = useGetCustomerStatsQuery(undefined);

  const activeCustomers = customerStats?.data?.find((c: any) => c.label === "All Active Customers")?.value || 0;
  const totalCustomersStat = customerStats?.data?.find((c: any) => c.label === "Total Customers")?.value || 0;
  const newCustomers = customerStats?.data?.find((c: any) => c.label === "New Customers")?.value || 0;
  const inactiveCustomers = customerStats?.data?.find((c: any) => c.label === "Inactive Customers")?.value || 0;
  // const totalSales = customerStats?.data?.find((c: any) => c.label === "Total Sales Amount")?.value || 0;
  // const totalPaid = customerStats?.data?.find((c: any) => c.label === "Total Paid")?.value || 0;
  // const totalDue = customerStats?.data?.find((c: any) => c.label === "Total Due")?.value || 0;

  const stats = [
    {
      label: "Active Customers",
      value: activeCustomers,
      gradient: "from-emerald-600 to-emerald-400",
      shadow: "shadow-emerald-500/30",
      icon: <UserCheck className="w-6 h-6 text-white" />,
    },
    {
      label: "Total Customers",
      value: totalCustomersStat,
      gradient: "from-blue-600 to-blue-400",
      shadow: "shadow-blue-500/30",
      icon: <Users className="w-6 h-6 text-white" />,
    },
    {
      label: "New Customers",
      value: newCustomers,
      gradient: "from-violet-600 to-violet-400",
      shadow: "shadow-violet-500/30",
      icon: <UserPlus className="w-6 h-6 text-white" />,
    },
    {
      label: "Inactive Customers",
      value: inactiveCustomers,
      gradient: "from-rose-600 to-rose-400",
      shadow: "shadow-rose-500/30",
      icon: <UserX className="w-6 h-6 text-white" />,
    },
  ];


  const customerColumns: ColumnDef<Customer>[] = [
    {
      accessorKey: "id",
      header: "ID",
      meta: { className: "md:sticky md:left-0 z-20 bg-background min-w-[60px]" } as any
    },
    {
      accessorKey: "name",
      header: "Name",
      meta: { className: "md:sticky md:left-[60px] z-20 bg-background md:shadow-[4px_0px_5px_-2px_rgba(0,0,0,0.1)]" } as any,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-sm">
            {row.original.company || "—"}
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            {row.original.name}
          </span>
        </div>
      )
    },
    {
      accessorKey: "thumb_url", header: "Image",
      cell: ({ row }) => {
        const thumbUrl = row.getValue("thumb_url") as string;
        const galleryItems = row.original.galleryItems || [];
        return thumbUrl ? (
          <img
            src={thumbUrl}
            alt="Customer"
            className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() =>
              setPreviewData({
                images: [thumbUrl, ...galleryItems].filter(Boolean),
                index: 0,
              })
            }
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-5 h-5 text-gray-500" />
          </div>
        );
      },
    },
    {
      accessorKey: "gallery_items",
      header: "Gallery",
      cell: ({ row }) => {
        const gallery = row.original.galleryItems || [];
        const thumbUrl = row.original.thumbUrl;

        return (
          <div className="flex items-center gap-1">
            {gallery.length > 0 ? (
              <div className="flex -space-x-2 overflow-hidden hover:space-x-1 transition-all duration-300 p-1">
                {gallery.slice(0, 3).map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Gallery ${i}`}
                    className="w-8 h-8 rounded-full border-2 border-background object-cover cursor-pointer hover:scale-110 transition-transform"
                    onClick={() =>
                      setPreviewData({
                        images: [thumbUrl, ...gallery].filter(Boolean) as string[],
                        index: i + 1, // +1 because thumbUrl is at index 0
                      })
                    }
                  />
                ))}
                {gallery.length > 3 && (
                  <div
                    className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-medium cursor-pointer"
                    onClick={() =>
                      setPreviewData({
                        images: [thumbUrl, ...gallery].filter(Boolean) as string[],
                        index: 4, // 1 thumbnail + 3 gallery items displayed
                      })
                    }
                  >
                    +{gallery.length - 3}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">-</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "customer_type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("customer_type") as string;
        return type === "business" ? "Business" : "Individual";
      },
    },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone" },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="max-w-[200px] whitespace-normal break-words">
            {customer.address || "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "credit_limit",
      header: () => (
        <div className="text-right">Credit Limit ({currency})</div>
      ),
      cell: ({ row }) => {
        const limit = row.getValue("credit_limit") as number;
        return (
          <div className="text-right">
            {limit ? `${Number(limit).toFixed(2)}` : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "totalSales",
      header: () => (
        <div className="text-right">Total Sales Amount ({currency})</div>
      ),
      cell: ({ row }) => {
        const amount = row.getValue("totalSales") as number;
        return (
          <div className="text-right font-medium">
            {amount ? Number(amount).toFixed(2) : "0.00"}
          </div>
        );
      },
    },
    {
      id: "paid_amount",
      header: () => (
        <div className="text-right">Total Paid ({currency})</div>
      ),
      cell: ({ row }) => {
        const total = (row.original.totalSales || 0) as number;
        const balance = (row.original.outstandingBalance || 0) as number;
        const paid = total - balance;
        return (
          <div className="text-right text-emerald-600 font-medium">
            {paid ? Number(paid).toFixed(2) : "0.00"}
          </div>
        );
      },
    },
    {
      accessorKey: "outstanding_balance",
      header: () => <div className="text-right">Total Due ({currency})</div>,
      cell: ({ row }) => {
        const balance = row.getValue("outstanding_balance") as number;
        return (
          <div className="text-right text-rose-600 font-bold">
            {balance ? Number(balance).toFixed(2) : "0.00"}
          </div>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean;
        const variant = isActive ? "success" : "destructive";
        return (
          <Badge variant={variant} className="text-white">
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "location",
      header: "Location",
      cell: ({ row }) => {
        const { latitude, longitude, address, city, state, country } = row.original;
        const hasLocation = (latitude && longitude) || address;

        const handleMapClick = () => {
          let query = "";
          if (latitude && longitude) {
            query = `${latitude},${longitude}`;
          } else {
            query = [address, city, state, country].filter(Boolean).join(", ");
          }
          if (query) setMapLocation(query);
        };

        if (!hasLocation) return <span className="text-muted-foreground">-</span>;

        return (
          <Button variant="ghost" size="icon" onClick={handleMapClick}>
            <MapPin className="h-4 w-4 text-primary" />
          </Button>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const id = row.original._id;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {canEditCustomer && (
                <DropdownMenuItem asChild>
                  <Link to={`/dashboard/customers/${id}/edit/by-staff`} className="flex items-center">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/customers/${id}`} className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Link>
              </DropdownMenuItem>
              {canDeleteCustomer && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeleteId(id)}
                    className="flex items-center text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (error) {
    return (
      <div className="w-full p-6">
        <div className="text-red-600">
          Error loading customers. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-3xl font-semibold">Inactive Customers</h2>

        <div className="flex flex-wrap items-center gap-4">
          {canCreateCustomer && (
            <Link to="/dashboard/customers/create">
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <PackagePlus className="h-4 w-4" />
                Add Customer
              </Button>
            </Link>
          )}

          <Link to="/dashboard/customers/map">
            <Button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              <MapPin className="h-4 w-4" />
              Customer Map
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="flex flex-wrap gap-6 mb-6">
        {stats?.map((item, idx) => (
          <div
            key={idx}
            className={`relative flex-1 min-w-[240px] overflow-hidden rounded-2xl bg-gradient-to-br ${item.gradient} p-6 shadow-lg ${item.shadow} transition-all duration-300 hover:scale-[1.02] hover:translate-y-[-2px]`}
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
        <CardHeader>
          <CardTitle>Inactive Customers</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto w-full">
          {isLoading ? (
            <div className="text-center py-8">Loading customers...</div>
          ) : (
            <DataTable
              columns={customerColumns}
              data={customers}
              pageIndex={pageIndex}
              pageSize={pageSize}
              totalCount={totalCustomers}
              onPageChange={setPageIndex}
              onSearch={(value) => {
                setSearchTerm(value);
                setPageIndex(0);
              }}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPageIndex(0);
              }}
              isFetching={isLoading}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              customer and remove their data from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog
        open={!!previewData}
        onOpenChange={(open) => !open && setPreviewData(null)}
      >
        <DialogContent className="max-w-3xl p-5 overflow-hidden bg-white">
          <div className="relative flex items-center justify-center">
            {previewData && (
              <>
                <img
                  src={previewData.images[previewData.index]}
                  alt="Customer Preview"
                  className="max-w-full max-h-[70vh] rounded-lg object-contain"
                />

                {/* Left Arrow (Previous) */}
                {previewData.images.length > 1 && (
                  <button
                    onClick={() =>
                      setPreviewData((prev) =>
                        prev
                          ? {
                            ...prev,
                            index:
                              prev.index === 0
                                ? prev.images.length - 1
                                : prev.index - 1,
                          }
                          : null
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                )}

                {/* Right Arrow (Next) */}
                {previewData.images.length > 1 && (
                  <button
                    onClick={() =>
                      setPreviewData((prev) =>
                        prev
                          ? {
                            ...prev,
                            index:
                              prev.index === prev.images.length - 1
                                ? 0
                                : prev.index + 1,
                          }
                          : null
                      )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                )}

                {/* Counter */}
                {previewData.images.length > 1 && (
                  <div className="absolute bottom-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md">
                    {previewData.index + 1} / {previewData.images.length}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!mapLocation}
        onOpenChange={(open) => !open && setMapLocation(null)}
      >
        <DialogContent className="sm:max-w-[700px] p-5 overflow-hidden bg-white">
          <div className="w-full h-[450px]">
            {mapLocation && (
              <MapEmbed location={mapLocation} width={700} height={450} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
