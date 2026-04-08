import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useGetSettingsInfoQuery } from "@/store/features/admin/settingsApiService";
import type { Settings } from "@/shared/types";
import { useGetSalesReturnByIdQuery } from "@/store/features/app/salesOrder/salesReturnApiService";
import PrintableSalesReturnInvoice from "./PrintableSalesReturnInvoice";
import type { Customer } from "@/shared/types/app/customers";
import { Button } from "@/shared/components/ui/button";

export default function SalesReturnPrint() {
    const { returnId } = useParams();

    const { data: salesReturnData, isLoading: isReturnLoading } = useGetSalesReturnByIdQuery(returnId!, {
        skip: !returnId,
    });

    const { data: fetchedSettingsInfo, isLoading: isSettingsLoading } = useGetSettingsInfoQuery();
    const from: Settings | undefined = fetchedSettingsInfo?.data;
    const salesReturn = salesReturnData?.data;
    const to: Customer | undefined = salesReturn?.customer;

    if (isReturnLoading || isSettingsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg text-gray-500">Loading return...</p>
            </div>
        );
    }

    if (!salesReturn) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-lg text-red-500 mb-4">Sales return not found</p>
                    <Link to="/dashboard/sales/returns">
                        <Button variant="outline">Back to Returns</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Create a mock invoice structure from sales return data
    const mockInvoice = {
        invoice_number: salesReturn.return_number,
        invoice_date: salesReturn.return_date,
        dueDate: salesReturn.return_date,
        totalAmount: salesReturn.totalAmount,
        discount_amount: salesReturn.discountAmount,
        tax_amount: salesReturn.taxAmount,
        grand_total: salesReturn.grand_total || salesReturn.totalPayableAmount,
        items: salesReturn.items,
        notes: salesReturn.notes,
        sales_return: salesReturn,
    };

    return (
        <div className="bg-white min-h-screen py-10 print:bg-white print:py-0">
            <div className="max-w-[850px] mx-auto mb-6 px-4 print:hidden">
                <Link to="/dashboard/sales/returns">
                    <Button variant="outline" className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back to Returns
                    </Button>
                </Link>
            </div>
            <PrintableSalesReturnInvoice
                from={from}
                to={to}
                invoice={mockInvoice as any}
            />
        </div>
    );
}
