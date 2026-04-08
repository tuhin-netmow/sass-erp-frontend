import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useGetSettingsInfoQuery } from "@/store/features/admin/settingsApiService";

import { useGetPurchaseReturnByIdQuery } from "@/store/features/app/purchaseOrder/purchaseReturnApiService";
import PrintablePurchaseReturnInvoice from "../purchaseReturnInvoices/PrintablePurchaseReturnInvoice";
import type { Supplier } from "@/shared/types/app/supplier.types";
import { Button } from "@/shared/components/ui/button";
import type { Settings } from "@/shared";

export default function PurchaseReturnPrint() {
    const { returnId } = useParams();

    const { data: purchaseReturnData, isLoading: isReturnLoading } = useGetPurchaseReturnByIdQuery(returnId as string, {
        skip: !returnId,
    });

    const { data: fetchedSettingsInfo, isLoading: isSettingsLoading } = useGetSettingsInfoQuery();
    const to: Settings | undefined = fetchedSettingsInfo?.data;
    const purchaseReturn = purchaseReturnData?.data;
    const from: Supplier | undefined = purchaseReturn?.supplier;

    if (isReturnLoading || isSettingsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg text-gray-500">Loading return...</p>
            </div>
        );
    }

    if (!purchaseReturn) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-lg text-red-500 mb-4">Purchase return not found</p>
                    <Link to="/dashboard/purchase-orders/returned">
                        <Button variant="outline">Back to Returns</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Create a mock invoice structure from purchase return data
    const mockInvoice = {
        invoice_number: purchaseReturn.returnNumber,
        invoice_date: purchaseReturn.returnDate,
        dueDate: purchaseReturn.returnDate,
        totalAmount: purchaseReturn.totalAmount,
        discount_amount: purchaseReturn.discountAmount,
        tax_amount: purchaseReturn.taxAmount,
        grand_total: purchaseReturn.grandTotal || purchaseReturn.totalPayableAmount,
        items: purchaseReturn.items,
        notes: purchaseReturn.notes,
        purchase_return: purchaseReturn,
    };

    return (
        <div className="bg-white min-h-screen py-10 print:bg-white print:py-0">
            <div className="max-w-[850px] mx-auto mb-6 px-4 print:hidden">
                <Link to="/dashboard/purchase-orders/returned">
                    <Button variant="outline" className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back to Returns
                    </Button>
                </Link>
            </div>
            <PrintablePurchaseReturnInvoice
                from={from}
                to={to}
                invoice={mockInvoice as any}
            />
        </div>
    );
}
