import { useParams, Link } from "react-router";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useGetSettingsInfoQuery } from "@/store/features/admin/settingsApiService";
import type { Settings } from "@/shared/types";
import { useGetSalesReturnPaymentByIdQuery } from "@/store/features/app/salesOrder/salesReturnApiService";
import PrintableSalesReturnPayment from "./PrintableSalesReturnPayment";

export default function SalesReturnPaymentPrintPreview() {
    const { id } = useParams();

    const { data: paymentData, isLoading } = useGetSalesReturnPaymentByIdQuery(id as string, {
        skip: !id,
    });

    const { data: fetchedSettingsInfo } = useGetSettingsInfoQuery();
    const settings: Settings | undefined = fetchedSettingsInfo?.data;

    if (isLoading) return <div className="p-8 text-center text-muted-foreground text-lg">Loading payment preview...</div>;

    return (
        <div className="bg-white min-h-screen py-10 print:bg-white print:py-0">
            <div className="max-w-[850px] mx-auto mb-6 px-4 sm:px-0 print:hidden">
                <Link to={`/dashboard/sales/returns/payments/${id}`}>
                    <Button variant="outline" className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back to Details
                    </Button>
                </Link>
            </div>
            <PrintableSalesReturnPayment
                payment={paymentData?.data}
                to={settings}
            />
        </div>
    );
}
