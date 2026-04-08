import { DataTable } from "@/app/components/dashboard/DataTable";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { PlusCircle } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/components/ui/badge";
import { useGetBomsQuery } from "@/store/features/admin/productionApiService";

type BOM = {
    id: string;
    productName: string;
    itemsCount: number;
    status: "Active" | "Draft" | "Archived";
    lastUpdated: string;
};

export default function BomList() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const limit = 10;

    // Fetch real BOM data from API (tenant-filtered)
    const { data: bomsData, isLoading, isFetching } = useGetBomsQuery({ page, limit, search });

    // Map API response to our interface
    const boms: BOM[] = bomsData?.data?.map((bom: any) => ({
        id: bom.id ? `BOM-${bom.id}` : bom.id,
        productName: bom.product?.name || "Unknown Product",
        itemsCount: bom.items?.length || 0,
        status: bom.is_active ? "Active" : "Archived",
        lastUpdated: bom.updatedAt ? new Date(bom.updatedAt).toISOString().split('T')[0] : "-"
    })) || [];

    const totalCount = bomsData?.pagination?.total || 0;

    const columns: ColumnDef<BOM>[] = [
        { accessorKey: "id", header: "BOM ID" },
        { accessorKey: "productName", header: "Product" },
        { accessorKey: "itemsCount", header: "Materials Count" },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const colors = {
                    Active: "bg-green-500",
                    Draft: "bg-gray-400",
                    Archived: "bg-red-500"
                };
                return <Badge className={colors[row.original.status]}>{row.original.status}</Badge>;
            }
        },
        { accessorKey: "lastUpdated", header: "Last Updated" },
    ];

    return (
        <div className="w-full space-y-4">
            <div className="flex flex-wrap justify-between items-center mb-6">
                <h2 className="text-3xl font-semibold">Bill of Materials (Recipes)</h2>
                <Link to="/dashboard/production/bom/create">
                    <Button className="bg-blue-600 hover:bg-blue-500">
                        <PlusCircle className="mr-2 h-4 w-4" /> Create Recipe
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>BOM Library</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={boms}
                        totalCount={totalCount}
                        pageIndex={page - 1}
                        pageSize={limit}
                        onPageChange={(p) => setPage(p + 1)}
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
