import { DataTable } from "@/app/components/dashboard/DataTable";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { PlusCircle } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useGetFinishedGoodsQuery } from "@/store/features/admin/productionApiService";

type FinishedGood = {
    id: string;
    product: string;
    quantity: number;
    costPrice: number;
    salesPrice: number;
    date: string;
    sku: string;
};

export default function FinishedGoodsList() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const limit = 10;

    // Fetch real finished goods data from API (tenant-filtered)
    const { data: finishedGoodsData, isLoading, isFetching } = useGetFinishedGoodsQuery({ page, limit, search });

    // Map API response to our interface
    const finishedGoods: FinishedGood[] = finishedGoodsData?.data?.map((fg: any) => ({
        id: `FG-${fg.id}`,
        product: fg.name || "Unknown Product",
        quantity: fg.stockQuantity || 0,
        costPrice: fg.cost || 0,
        salesPrice: fg.price || 0,
        date: fg.createdAt ? new Date(fg.createdAt).toISOString().split('T')[0] : "-",
        sku: fg.sku || "-"
    })) || [];

    const totalCount = finishedGoodsData?.pagination?.total || 0;

    const columns: ColumnDef<FinishedGood>[] = [
        { accessorKey: "id", header: "Entry ID" },
        { accessorKey: "date", header: "Date" },
        { accessorKey: "sku", header: "SKU" },
        { accessorKey: "product", header: "Product" },
        { accessorKey: "quantity", header: "Stock Qty" },
        {
            accessorKey: "costPrice",
            header: "Cost Price",
            cell: ({ row }) => <span>${row.original.costPrice.toFixed(2)}</span>
        },
        {
            accessorKey: "salesPrice",
            header: "Sales Price",
            cell: ({ row }) => <span className="font-semibold text-green-600">${row.original.salesPrice.toFixed(2)}</span>
        },
    ];

    return (
        <div className="w-full space-y-4">
            <div className="flex flex-wrap justify-between items-center mb-6">
                <h2 className="text-3xl font-semibold">Finished Goods (Stock Entry)</h2>
                <Link to="/dashboard/production/finished-goods/create">
                    <Button className="bg-blue-600 hover:bg-blue-500">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Stock
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Finished Goods Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={finishedGoods}
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
