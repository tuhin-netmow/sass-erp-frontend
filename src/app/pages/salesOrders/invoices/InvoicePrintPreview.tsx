import { useParams, Link } from "react-router";
import PrintableInvoice from "./PrintableInvoice";
import { useGetInvoiceByIdQuery } from "@/store/features/app/salesOrder/salesOrder";
import { useGetSettingsInfoQuery } from "@/store/features/admin/settingsApiService";
import type { Settings } from "@/shared/types";
import type { SalesInvoice } from "@/shared/types/app/salesInvoice.types";
import type { Customer } from "@/shared/types/app/customers";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";

export default function InvoicePrintPreview() {
  const invoiceId = useParams().invoiceId;

  const { data: invoiceData } = useGetInvoiceByIdQuery(invoiceId as string, {
    skip: !invoiceId,
  });

  const invoice: SalesInvoice | undefined = invoiceData?.data;

  const { data: fetchedSettingsInfo } = useGetSettingsInfoQuery();

  const from: Settings | undefined = fetchedSettingsInfo?.data;

  const to: Customer | undefined = invoice?.order?.customer;

  return (
    <div className="">
      {/* Header with Back and Print buttons - Hidden when printing */}
      <div className="print:hidden flex items-center justify-between mb-4 px-4 py-3 bg-white border-b sticky top-0 z-10 shadow-sm">
        <Link to={`/dashboard/sales/invoices/${invoiceId}`}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Invoice
          </Button>
        </Link>
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="w-4 h-4" />
          Print Invoice
        </Button>
      </div>

      <PrintableInvoice from={from} to={to} invoice={invoice} />
    </div>
  );
}
