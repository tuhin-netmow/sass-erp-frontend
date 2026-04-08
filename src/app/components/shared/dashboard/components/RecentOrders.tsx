import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { useGetAllSalesOrdersQuery } from "@/store/features/app/salesOrder/salesOrder";
import { useAppSelector } from "@/store/store";
import type { SalesOrder } from "@/shared/types/app/salesOrder.types";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { Link } from "react-router";
import { DataTable } from "./DataTable";

export default function RecentOrders() {
  const [page, setPage] = useState(1); // backend starts from 1
  const [search, setSearch] = useState("");
  const limit = 10;

  const { data, isLoading } = useGetAllSalesOrdersQuery({
    page,
    limit,
    search,
  });

  const orders = data?.data ?? [];

  const currency = useAppSelector((state) => state.currency.value);

  const OrderColumns: ColumnDef<SalesOrder>[] = [
    {
      accessorKey: "orderNumber",
      header: "Order #",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.orderNumber}</span>
      ),
    },

    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <div className="font-semibold">{row.original.customer?.name}</div>
      ),
    },

    {
      accessorKey: "orderDate",
      header: "Date",
      cell: ({ row }) => new Date(row.original.orderDate).toLocaleDateString(),
    },

    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) =>
        row.original.dueDate
          ? new Date(row.original.dueDate).toLocaleDateString()
          : "-",
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;

        const color =
          status === "delivered"
            ? "bg-green-600"
            : status === "pending"
              ? "bg-yellow-600"
              : status === "confirmed"
                ? "bg-blue-600"
                : "bg-gray-500";

        return (
          <Badge className={`${color} text-white capitalize`}>{status}</Badge>
        );
      },
    },

    {
      accessorKey: "totalAmount",
      header: () => <div className="text-right">Amount ({currency})</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {parseFloat(row.original.totalAmount).toFixed(2)}
        </div>
      ),
    },

    // {
    //   accessorKey: "created_by",
    //   header: "Staff",
    //   cell: ({ row }) => `User #${row.original.created_by}`,
    // },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex gap-2">
            <Link to={`/dashboard/sales/orders/${item.publicId || item._id}`}>
              <Button size="sm" variant="outline-info">
                View
              </Button>
            </Link>
            {/* <Link to={`/dashboard/orders/${item.id}/edit`}>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </Link> */}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <DataTable
        columns={OrderColumns}
        data={orders}
        pageIndex={page - 1} // DataTable expects 0-based
        pageSize={limit}
        totalCount={data?.pagination?.total ?? 0}
        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        isFetching={isLoading}
      />
    </div>
  );
}
