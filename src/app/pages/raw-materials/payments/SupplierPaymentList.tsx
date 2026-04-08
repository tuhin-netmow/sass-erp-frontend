import { DataTable } from "@/app/components/dashboard/DataTable";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { PlusCircle } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useGetAllRawMaterialPaymentsQuery,  } from "@/store/features/admin/rawMaterialApiService";
import { useAppSelector } from "@/store/store";
import type { RawMaterialPayment } from "@/shared";

export default function SupplierPaymentList() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const currency = useAppSelector((state) => state.currency.value);

    const { data, isFetching } = useGetAllRawMaterialPaymentsQuery({
        page,
        limit: 10,
        search,
    });

    const payments = data?.data || [];
    const totalCount = data?.pagination?.total || 0;

    const columns: ColumnDef<RawMaterialPayment>[] = [
        {
            accessorKey: "id",
            header: "Payment ID",
            cell: ({ row }) => (
                <Link to={`/dashboard/raw-materials/payments/${row.original.id}`}>
                    <span className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                        #{row.original.id}
                    </span>
                </Link>
            )
        },
        {
            accessorKey: "purchaseOrder.poNumber",
            header: "PO Number",
            cell: ({ row }) => <span>{row.original.purchaseOrder?.poNumber || "N/A"}</span>
        },
        {
            accessorKey: "invoice.invoiceNumber",
            header: "Invoice Number",
            cell: ({ row }) => <span>{row.original.invoice?.invoiceNumber || "N/A"}</span>
        },
        {
            accessorKey: "purchaseOrder.supplier.name",
            header: "Supplier",
            cell: ({ row }) => <span>{row.original.purchaseOrder?.supplier?.name || "N/A"}</span>
        },
        {
            accessorKey: "paymentDate",
            header: "Payment Date",
            cell: ({ row }) => {
                const date = new Date(row.original.paymentDate);
                return <span>{date.toLocaleDateString()}</span>;
            }
        },
        {
            accessorKey: "amount",
            header: "Amount Paid",
            cell: ({ row }) => (
                <span className="font-bold text-green-600">
                    {currency} {row.original.amount.toLocaleString()}
                </span>
            )
        },
        {
            accessorKey: "paymentMethod",
            header: "Method",
            cell: ({ row }) => {
                const method = row.original.paymentMethod;
                const formatted = method
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                return <span>{formatted}</span>;
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <Link to={`/dashboard/raw-materials/payments/${row.original.id}`}>
                    <Button variant="outline" size="sm">
                        View
                    </Button>
                </Link>
            )
        },
    ];

    return (
        <div className="w-full space-y-4">
            <div className="flex flex-wrap justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Purchase Payments (Raw Materials)</h2>
                <Link to="/dashboard/raw-materials/payments/create">
                    <Button className="bg-blue-600 hover:bg-blue-500">
                        <PlusCircle className="h-4 w-4" /> Make Payment
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={payments}
                        totalCount={totalCount}
                        pageIndex={page - 1}
                        pageSize={10}
                        onPageChange={p => setPage(p + 1)}
                        onSearch={setSearch}
                        isFetching={isFetching}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
