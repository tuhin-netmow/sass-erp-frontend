"use client";

import { useGetPurchaseOrderByIdQuery } from "@/store/features/app/purchaseOrder/purchaseOrderApiService";
import { useParams, Link } from "react-router";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PrintablePurchaseOrder from "./PrintablePurchaseOrder";
import { useGetSettingsInfoQuery } from "@/store/features/admin/settingsApiService";


export default function PurchaseOrderPrint() {
    const { purchaseId } = useParams();
    const { data, isLoading } = useGetPurchaseOrderByIdQuery(purchaseId as string);
    const purchase = Array.isArray(data?.data) ? data?.data[0] : data?.data;

    const { data: fetchedSettingsInfo } = useGetSettingsInfoQuery();
    const settings = fetchedSettingsInfo?.data;

    // Map Purchase Order Data Structure to Printable Component Props
    // Note: Purchase Invoice usually maps "Bill From" as Supplier and "Ship To" as Company
    // For Purchase Order, we are issuing it TO the supplier.
    // So "From" is Us (Company) and "To" is Supplier.

    // However, PrintablePurchaseInvoice logic (which we are adapting) uses:
    // 'from' -> Supplier (Bill From)
    // 'to' -> Settings (Ship To / Company)
    // This logic works for INVOICE (Supplier sends invoice to Us).

    // For PURCHASE ORDER (We send order to Supplier):
    // We want to show "Purchase Order" title.
    // "From" should be Us.
    // "To" should be Supplier.

    // Let's create a dedicated PrintablePurchaseOrder component for true custom layouts,
    // OR adapt PrintablePurchaseInvoice if the user wants EXACT same look.
    // The user request says "follow this /dashboard/purchase-invoices/2/preview links make for /dashboard/purchase-orders/5/print".

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg text-gray-500">Loading purchase order...</p>
            </div>
        );
    }

    if (!purchase) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg text-red-500">Purchase order not found</p>
            </div>
        );
    }

    return (
        <div className="">
            <div className="max-w-[850px] mx-auto pt-6 px-4 sm:px-0 print:hidden">
                <Link to="/dashboard/purchase-orders">
                    <Button variant="outline" className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back to List
                    </Button>
                </Link>
            </div>
            <PrintablePurchaseOrder purchase={purchase} settings={settings} />
        </div>
    );
}
