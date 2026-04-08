import { useParams } from "react-router";
import { useGetSettingsInfoQuery } from "@/store/features/admin/settingsApiService";
import { useGetSalesOrderByIdQuery } from "@/store/features/app/salesOrder/salesOrder";
import PrintableSalesOrder from "./PrintableSalesOrder";
import { Link } from "react-router";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Settings } from "@/shared";


export default function SalesOrderPrint() {
    const { orderId } = useParams();

    const { data: orderData, isLoading: isOrderLoading } = useGetSalesOrderByIdQuery(orderId as string, {
        skip: !orderId,
    });

    const { data: settingsData, isLoading: isSettingsLoading } = useGetSettingsInfoQuery();
    const settings: Settings | undefined = settingsData?.data;

    if (isOrderLoading || isSettingsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg text-gray-500">Loading order...</p>
            </div>
        );
    }

    if (!orderData?.data) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-lg text-red-500 mb-4">Order not found</p>
                    <Link to="/dashboard/sales/orders">
                        <Button variant="outline">Back to Orders</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen py-10 print:bg-white print:py-0">
            <div className="max-w-[850px] mx-auto mb-6 px-4 print:hidden">
                <Link to="/dashboard/sales/orders">
                    <Button variant="outline" className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back to Orders
                    </Button>
                </Link>
            </div>
            <PrintableSalesOrder
                order={orderData.data}
                to={orderData.data.customer}
                from={settings}
            />
        </div>
    );
}
