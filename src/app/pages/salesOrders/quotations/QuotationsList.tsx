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
  ShoppingCart,
} from "lucide-react";
import {
  useGetAllQuotationsQuery,
  useDeleteQuotationMutation,
} from "@/store/features/app/salesOrder/quotationApiService";
import type { Quotation } from "@/shared/types/app/quotation.types";
import { toast } from "sonner";
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

export default function QuotationsList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const limit = 10;

  const { data, isLoading } = useGetAllQuotationsQuery({
    page,
    limit,
    search,
  });

  const [deleteQuotation, { isLoading: isDeleting }] =
    useDeleteQuotationMutation();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteQuotation(deleteId).unwrap();
      toast.success("Quotation deleted successfully");
      setDeleteId(null);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Failed to delete quotation");
    }
  };

  const quotations: Quotation[] = data?.data || [];
  const total = data?.pagination?.total || 0;

  const getStatusBadge = (status: Quotation["status"]) => {
    const statusConfig = {
      draft: { label: "Draft", className: "bg-gray-500" },
      sent: { label: "Sent", className: "bg-blue-500" },
      accepted: { label: "Accepted", className: "bg-green-500" },
      rejected: { label: "Rejected", className: "bg-red-500" },
      expired: { label: "Expired", className: "bg-orange-500" },
      converted: { label: "Converted", className: "bg-purple-500" },
    };
    const config = statusConfig[status];
    return (
      <Badge className={`${config.className} text-white`}>
        {config.label}
      </Badge>
    );
  };

  const columns: ColumnDef<Quotation>[] = [
    {
      accessorKey: "id",
      header: "ID",
      meta: { className: "min-w-[60px]" },
    },
    {
      accessorKey: "quotationNumber",
      header: "Quotation #",
      cell: ({ row }) => (
        <Link
          to={`/dashboard/sales/quotations/${row.original.id || row.original._id}`}
          className="font-medium text-blue-600 hover:underline"
        >
          {row.original.quotationNumber}
        </Link>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {row.original.customer?.name || "-"}
          </div>
          <div className="text-sm text-gray-500">
            {row.original.customer?.company || ""}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "quotationDate",
      header: "Date",
      cell: ({ row }) =>
        new Date(row.original.quotationDate).toLocaleDateString(),
    },
    {
      accessorKey: "validUntil",
      header: "Valid Until",
      cell: ({ row }) =>
        new Date(row.original.validUntil).toLocaleDateString(),
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
      cell: ({ row }) =>
        `${Number(row.original.totalAmount).toFixed(2)}`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const quotation = row.original;
        return (
          <div className="flex items-center gap-1">
            <Link to={`/dashboard/sales/quotations/${quotation.id || quotation._id}`}>
              <Button size="sm" variant="ghost" className="h-8">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link to={`/dashboard/sales/quotations/${quotation.id || quotation._id}/edit`}>
              <Button size="sm" variant="ghost" className="h-8">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            {quotation.status !== "converted" && (
              <Link
                to={`/dashboard/sales/quotations/${quotation.id || quotation._id}/convert`}
              >
                <Button size="sm" variant="ghost" className="h-8">
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-red-600"
              onClick={() => setDeleteId(quotation.id || quotation._id)}
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
        <h2 className="text-2xl font-bold">Sales Quotations</h2>
        <Link to="/dashboard/sales/quotations/create">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            New Quotation
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={quotations}
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
            <AlertDialogTitle>Delete Quotation?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
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
    </div>
  );
}
