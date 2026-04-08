/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { useLazyGetInvoiceByIdQuery, useLazyGetOrdersItemsQuery } from "@/store/features/app/salesOrder/salesOrder";
import { useGetSettingsInfoQuery } from "@/store/features/admin/settingsApiService";
import PrintableInvoicesSummary from "./PrintableInvoicesSummary";
import type { SalesInvoice } from "@/shared/types/app/salesInvoice.types";
import { Loader2 } from "lucide-react";

export default function InvoiceItemsSummaryPreview() {
    const [searchParams] = useSearchParams();
    const idsParam = searchParams.get("ids");
    const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
    const [loading, setLoading] = useState(true);

    const [triggerGetInvoice] = useLazyGetInvoiceByIdQuery();
    const [triggerGetOrdersItems] = useLazyGetOrdersItemsQuery();
    const { data: settingsData } = useGetSettingsInfoQuery();

    useEffect(() => {
        async function fetchInvoices() {
            if (!idsParam) {
                setLoading(false);
                return;
            }

            const ids = idsParam.split(",");
            try {
                const results = await Promise.all(
                    ids.map(id => triggerGetInvoice(id).unwrap())
                );

                const fetchedInvoices = results
                    .map(res => res.data)
                    .filter((inv): inv is SalesInvoice => !!inv);

                // Fetch Items details for all orders in batch
                const orderIds = fetchedInvoices.map(inv => inv.orderId).filter(Boolean).join(",");
                if (orderIds) {
                    try {
                        const itemsResponse = await triggerGetOrdersItems(orderIds).unwrap();
                        if (itemsResponse.status && Array.isArray(itemsResponse.data)) {
                            // Merge items into invoices
                            const mergedInvoices = fetchedInvoices.map(inv => {
                                const orderData = itemsResponse.data.find((d: any) => d.id === inv.orderId);
                                if (orderData && orderData.items) {
                                    return {
                                        ...inv,
                                        order: {
                                            ...inv.order,
                                            items: orderData.items
                                        }
                                    };
                                }
                                return inv;
                            });
                            setInvoices(mergedInvoices);
                        } else {
                            setInvoices(fetchedInvoices);
                        }
                    } catch (err) {
                        console.error("Error fetching batch items:", err);
                        setInvoices(fetchedInvoices);
                    }
                } else {
                    setInvoices(fetchedInvoices);
                }
            } catch (error) {
                console.error("Error fetching invoices for items summary:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchInvoices();
    }, [idsParam, triggerGetInvoice, triggerGetOrdersItems]);

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (invoices.length === 0) {
        return (
            <div className="flex h-[400px] items-center justify-center text-gray-500">
                No invoices found for the provided IDs.
            </div>
        );
    }

    return (
        <PrintableInvoicesSummary
            invoices={invoices}
            from={settingsData?.data}
            itemsOnly={true}
        />
    );
}
