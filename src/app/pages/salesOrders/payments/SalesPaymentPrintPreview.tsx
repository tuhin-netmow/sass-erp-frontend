import { useParams } from "react-router";
import { useGetSettingsInfoQuery } from "@/store/features/admin/settingsApiService";
import type { Settings } from "@/shared/types";
import { useGetSalesPaymentByIdQuery } from "@/store/features/app/salesOrder/salesOrder";
import PrintableSalesPayment from "./PrintableSalesPayment";
import { Link } from "react-router";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SalesPaymentPrintPreview() {
    const { paymentId } = useParams();

    const { data: paymentData, isLoading } = useGetSalesPaymentByIdQuery(paymentId as string, {
        skip: !paymentId,
    });

    const { data: fetchedSettingsInfo } = useGetSettingsInfoQuery();
    const settings: Settings | undefined = fetchedSettingsInfo?.data;

    if (isLoading) return <div className="p-8 text-center text-muted-foreground text-lg">Loading payment preview...</div>;

    return (
        <div className="bg-white min-h-screen py-10 print:bg-white print:py-0">
            <div className="max-w-[850px] mx-auto mb-6 px-4 print:hidden">
                <Link to="/dashboard/sales/payments">
                    <Button variant="outline" className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back to Payments
                    </Button>
                </Link>
            </div>
            <PrintableSalesPayment
                payment={paymentData?.data}
                to={paymentData?.data?.order?.customer}
                from={settings}
            />
        </div>
    );
}
