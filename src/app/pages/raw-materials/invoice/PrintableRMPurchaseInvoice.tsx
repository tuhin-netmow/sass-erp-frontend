import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { useAppSelector } from "@/store/store";
import type {
  RawMaterialInvoice,
  RawMaterialPurchaseOrderItem,
  RawMaterialSupplier
} from "@/shared/types/admin";
import type { Settings } from "@/shared/types";

interface Props {
  invoice: RawMaterialInvoice | undefined;
  from: RawMaterialSupplier | undefined;
  to: Settings | undefined;
}

export default function PrintableRMPurchaseInvoice({
  invoice,
  from,
  to,
}: Props) {
  const total = Number(invoice?.totalPayableAmount ?? 0);

  const paidAmount = invoice?.paidAmount ?? 0;

  const balance = Number(invoice?.dueAmount ?? 0);

  const currency = useAppSelector((state) => state.currency.value);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6">
      <style>{`
        @media print {
          @page {
            margin: 5mm;
            size: A4;
          }
          body {
            -webkit-print-color-adjust: exact;
            font-size: 11px !important;
          }
          #invoice {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          h1 { font-size: 11px !important; }
          h2 { font-size: 11px !important; }
          table { font-size: 11px !important; }
          .details-text, .table-text { 
            font-size: 11px !important; 
            line-height: 1.2 !important; 
          }
          .company-name {
            font-size: 18px !important;
            line-height: 1.2 !important;
          }
          .p-6 { padding: 8px !important; }
          .mb-8 { margin-bottom: 12px !important; }
          .mb-10 { margin-bottom: 16px !important; }
        }
        /* Standardizing screen sizes */
        .company-name { font-size: 18px !important; line-height: 1.2; }
        .details-text { font-size: 12px !important; line-height: 1.4; }
        .table-text { font-size: 12px !important; }
      `}</style>
      {/* INVOICE CONTENT */}
      <div
        id="invoice"
        className="bg-white p-6 max-w-4xl mx-auto print:w-[850px]"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold">PURCHASE INVOICE (Raw Materials)</h1>
            <p className="text-sm text-gray-500">#{invoice?.invoiceNumber}</p>
          </div>

          {/* Company Info */}
          <div className="text-right flex flex-col items-end">
            <img
              src={to?.logoUrl || ""}
              alt={to?.companyName || "Company Logo"}
              className="h-12 w-auto object-contain inline-block"
            />
            <p className="font-semibold">{to?.companyName}</p>
            <p className="text-sm">{to?.address}</p>
            <p className="text-sm">T: {to?.phone || "-"}{to?.email && `, E: ${to.email}`}</p>
          </div>
        </div>

        {/* Main */}
        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-8 mb-10">
          <div>
            <h2 className="font-semibold text-lg mb-2">Supplier</h2>
            <p className="font-semibold">{from?.name}</p>
            <p className="text-sm">{from?.address}</p>
            <p className="text-sm">{from?.email}</p>
            <p className="text-sm">{from?.phone}</p>
          </div>

          <div className="text-sm space-y-1">
            <p>
              <strong>Invoice Date:</strong>{" "}
              {invoice?.invoiceDate
                ? new Date(invoice.invoiceDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
                : "-"}
            </p>
            <p>
              <strong>Due Date:</strong>{" "}
              {invoice?.dueDate
                ? new Date(invoice.dueDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
                : "-"}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <Badge
                className={`${invoice?.status === "paid" ? "bg-green-600" : "bg-yellow-600"
                  } text-white capitalize`}
              >
                {invoice?.status}
              </Badge>
            </p>
            <p>
              <strong>Order #:</strong> {invoice?.purchaseOrder?.poNumber}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="border rounded-md overflow-hidden mb-10">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr className="text-left">
                <th className="p-3">Raw Material</th>
                <th className="p-3">Unit Cost ({currency})</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Total Price ({currency})</th>
                <th className="p-3 text-right">Line Total ({currency})</th>
              </tr>
            </thead>

            <tbody>
              {invoice?.purchaseOrder?.items?.map(
                (item: RawMaterialPurchaseOrderItem) => {
                  const unitCost = Number(item?.unitCost || 0);
                  const quantity = Number(item?.quantity || 0);
                  const totalPrice = unitCost * quantity;
                  const lineTotal = Number(item?.lineTotal || totalPrice);

                  return (
                    <tr key={item?.id} className="border-b">
                      <td className="p-3">{item?.product?.name}</td>
                      <td className="p-3">
                        {unitCost.toFixed(2)}
                      </td>
                      <td className="p-3">{quantity}</td>
                      <td className="p-3">
                        {totalPrice.toFixed(2)}
                      </td>
                      <td className="p-3 text-right">
                        {lineTotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-between items-center">
          {/* LEFT: PAID badge */}
          {invoice?.status === "paid" && (
            <div className="flex justify-center items-center gap-2 w-full sm:w-1/2">
              <div className="px-6 py-3 border-2 border-green-600 text-green-700 font-bold text-xl rounded-lg -rotate-6">
                PAID
              </div>
            </div>
          )}
          <div className="w-64 ml-auto space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold">
                {currency}{" "}
                {Number(invoice?.purchaseOrder?.totalAmount)?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Tax</span>
              <span className="font-semibold">
                {currency}{" "}
                {Number(invoice?.purchaseOrder?.taxAmount)?.toFixed(2)}
              </span>
            </div>

            <Separator />

            <div className="flex justify-between">
              <span>Total</span>
              <span className="font-semibold">
                {currency} {Number(total)?.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Paid</span>
              <span className="font-semibold">
                {currency} {Number(paidAmount)?.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-lg font-bold">
              <span>Balance</span>
              <span>
                {currency} {Number(balance)?.toFixed(2)}
              </span>
            </div>

            {/* Print Button */}
            <div className="mt-10 print:hidden text-right">
              <Button onClick={handlePrint} variant="outline">
                Print Invoice
              </Button>
            </div>
          </div>
        </div>
        <div className="text-center text-xs mt-16 text-gray-500">
          Thank you for being with us.
        </div>
      </div>
    </div>
  );
}
