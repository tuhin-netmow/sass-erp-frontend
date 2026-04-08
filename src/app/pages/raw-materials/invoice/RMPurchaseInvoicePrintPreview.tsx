import { useParams } from "react-router";
import { useGetSettingsInfoQuery } from "@/store/features/admin/settingsApiService";
import type { RawMaterialInvoice, RawMaterialSupplier, Settings } from "@/shared/types";
import {
  useGetRawMaterialPurchaseInvoiceByIdQuery,
 
} from "@/store/features/admin/rawMaterialApiService";
import PrintableRMPurchaseInvoice from "./PrintableRMPurchaseInvoice";


export default function RMPurchaseInvoicePrintPreview() {
  const invoiceId = useParams().id;

  const { data: purchaseInvoiceData } = useGetRawMaterialPurchaseInvoiceByIdQuery(invoiceId as string, {
    skip: !invoiceId,
  });

  const invoice: RawMaterialInvoice | undefined = purchaseInvoiceData?.data;

  const { data: fetchedSettingsInfo } = useGetSettingsInfoQuery();

  const to: Settings | undefined = fetchedSettingsInfo?.data;

  const from: RawMaterialSupplier | undefined = invoice?.purchaseOrder?.supplier;

  return (
    <div className="">
      <PrintableRMPurchaseInvoice from={from} to={to} invoice={invoice} />
    </div>
  );
}
