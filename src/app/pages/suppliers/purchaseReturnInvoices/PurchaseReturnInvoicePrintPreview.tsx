import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useGetSettingsInfoQuery } from "@/store/features/admin/settingsApiService";

import { useGetPurchaseReturnInvoiceByIdQuery } from "@/store/features/app/purchaseOrder/purchaseReturnApiService";
import type { PurchaseInvoice } from "@/shared/types/app/PurchaseInvoice.types";
import PrintablePurchaseReturnInvoice from "./PrintablePurchaseReturnInvoice";
import type { Supplier } from "@/shared/types/app/supplier.types";
import type { Settings } from "@/shared";

export default function PurchaseReturnInvoicePrintPreview() {
    const invoiceId = useParams().id;

    const { data: purchaseInvoiceData } = useGetPurchaseReturnInvoiceByIdQuery(invoiceId as string, {
        skip: !invoiceId,
    });

    const invoice: PurchaseInvoice | undefined = purchaseInvoiceData?.data;
    const purchaseReturn = (invoice as any)?.purchase_return;

    const { data: fetchedSettingsInfo } = useGetSettingsInfoQuery();
    const to: Settings | undefined = fetchedSettingsInfo?.data;
    const from: Supplier | undefined = purchaseReturn?.supplier;

    return (
        <div className="pb-10">
            {/* Header / Actions */}
            <div className="max-w-4xl mx-auto p-4 flex justify-between items-center print:hidden mb-2 bg-white">
                <Link
                    to={`/dashboard/purchase-return-invoices/${invoiceId}`}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Return Invoice
                </Link>
            </div>

            <div className="max-w-4xl mx-auto bg-white print:max-w-none">
                <PrintablePurchaseReturnInvoice from={from} to={to} invoice={invoice} />
            </div>
        </div>
    );
}
