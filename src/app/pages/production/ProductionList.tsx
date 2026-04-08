import { DataTable } from "@/app/components/dashboard/DataTable";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import {
    MoreHorizontal,
    PlusCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

import { useState } from "react";
import { Link } from "react-router";
import { useGetBatchesQuery, useDeleteBatchMutation } from "@/store/features/admin/productionApiService";
import type { ProductionBatch as ApiProductionBatch } from "@/shared/types/admin";

type DisplayBatch = {
    id: string;
    productName: string;
    sku: string;
    quantity: number;
    startDate: string;
    dueDate: string;
    status: "Planned" | "In Progress" | "Completed" | "QA Check" | "Cancelled";
    supervisor: string;
};

export default function ProductionList() {
    const [page, setPage] = useState<number>(1);
    const [search, setSearch] = useState<string>("");
    const limit = 10;

    // API call to fetch production batches (tenant-aware)
    const { data: batchesData, isLoading, isFetching } = useGetBatchesQuery({ page, limit, search });

    const [deleteBatch] = useDeleteBatchMutation();

    // Map API response to our interface
    const batches: DisplayBatch[] = batchesData?.data?.map((batch: ApiProductionBatch) => ({
        id: String(batch.id),
        productName: batch.product?.name || "Unknown Product",
        sku: "",
        quantity: batch.quantity,
        startDate: batch.startDate ? new Date(batch.startDate).toISOString().split('T')[0] : "-",
        dueDate: batch.endDate ? new Date(batch.endDate).toISOString().split('T')[0] : "-",
        status: batch.status === "pending" ? "Planned"
            : batch.status === "in_progress" ? "In Progress"
                : batch.status === "completed" ? "Completed"
                    : batch.status === "cancelled" ? "Cancelled"
                        : "Planned",
        supervisor: "-"
    })) || [];

    const totalCount = batchesData?.pagination?.total || 0;

    const handleDelete = async (id: string) => {
        // Extract numeric ID from string ID
        const batchId = batchesData?.data?.find((b: ApiProductionBatch) => String(b.id) === id)?.id;
        if (batchId) {
            await deleteBatch(String(batchId)).unwrap();
        }
    };

    const columns: ColumnDef<DisplayBatch>[] = [
        {
            accessorKey: "id",
            header: "Batch ID",
        },
        {
            accessorKey: "productName",
            header: "Product",
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.productName}</div>
                    <div className="text-xs text-gray-500">{row.original.sku}</div>
                </div>
            )
        },
        {
            accessorKey: "quantity",
            header: "Quantity",
        },
        {
            accessorKey: "startDate",
            header: "Timeline",
            cell: ({ row }) => (
                <div className="text-xs">
                    <div>Start: {row.original.startDate}</div>
                    <div className="text-gray-500">Due: {row.original.dueDate}</div>
                </div>
            ),
        },
        {
            accessorKey: "supervisor",
            header: "Supervisor",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const { status } = row.original;
                let colorClass = "bg-gray-500";
                if (status === "In Progress") colorClass = "bg-blue-500";
                else if (status === "Completed") colorClass = "bg-green-500";
                else if (status === "QA Check") colorClass = "bg-orange-500";
                else if (status === "Planned") colorClass = "bg-yellow-500";
                else if (status === "Cancelled") colorClass = "bg-red-500";

                return (
                    <span
                        className={`py-1 px-2 rounded-full text-xs text-white font-medium ${colorClass}`}
                    >
                        {status}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
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
                            <DropdownMenuItem>
                                <Link to={`/dashboard/production/${row.original.id}`} className="w-full">View Details</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Link to="#" className="w-full">Update Status</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(row.original.id)} className="text-red-600 focus:text-red-600">
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <div className="w-full">
            <div className="flex flex-wrap justify-between items-center mb-6">
                <h2 className="text-3xl font-semibold">All Productions</h2>

                <Link to="/dashboard/production/create">
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-500">
                        <PlusCircle size={18} />
                        New Production
                    </button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Production Batches</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={batches}
                        pageIndex={page - 1}
                        pageSize={limit}
                        totalCount={totalCount}
                        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
                        onSearch={(value) => {
                            setSearch(value);
                            setPage(1);
                        }}
                        isFetching={isLoading || isFetching}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
