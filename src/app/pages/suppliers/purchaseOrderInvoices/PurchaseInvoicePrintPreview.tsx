import { useParams, Link } from "react-router";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useGetSettingsInfoQuery } from "@/store/features/admin/settingsApiService";
import type { Settings } from "@/shared/types";
import { useGetPurchaseInvoiceByIdQuery } from "@/store/features/app/purchaseOrder/purchaseOrderApiService";
import type { PurchaseInvoice } from "@/shared/types/app/PurchaseInvoice.types";
import PrintablePurchaseInvoice from "./PrintablePurchaseInvoice";
import type { Supplier } from "@/shared/types/app/supplier.types";

export default function PurchaseInvoicePrintPreview() {
  const invoiceId = useParams().id;

  //console.log('invoiceId', invoiceId);

  const { data: purchaseInvoiceData } = useGetPurchaseInvoiceByIdQuery(invoiceId as string, {
    skip: !invoiceId,
  });

  console.log('purchaseInvoiceData', purchaseInvoiceData);

  const invoice: PurchaseInvoice | undefined = purchaseInvoiceData?.data;

  console.log('invoice in purchase', invoice);

  const { data: fetchedSettingsInfo } = useGetSettingsInfoQuery();

  const to: Settings | undefined = fetchedSettingsInfo?.data;

  const from: Supplier | undefined = invoice?.purchaseOrder?.supplier;

  return (
    <div className="">
      <div className="max-w-[850px] mx-auto pt-6 px-4 sm:px-0 print:hidden">
        <Link to={`/dashboard/purchase-invoices/${invoiceId}`}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Details
          </Button>
        </Link>
      </div>
      <PrintablePurchaseInvoice from={from} to={to} invoice={invoice} />
    </div>
  );
}
