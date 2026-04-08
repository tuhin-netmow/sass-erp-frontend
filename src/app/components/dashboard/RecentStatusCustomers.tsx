import { useGetActiveCustomersQuery, useGetInactiveCustomersQuery } from "@/store/features/app/customers/customersApi";
import type { Customer } from "@/shared/types/app/customers";

interface RecentStatusCustomersProps {
    status: "active" | "inactive";
}

export default function RecentStatusCustomers({ status }: RecentStatusCustomersProps) {
    const limit = 6;

    // Call both hooks but skip the one that isn't needed for the current status
    // This maintains hook call order while only fetching what's required
    const activeQuery = useGetActiveCustomersQuery(
        { page: 1, limit },
        { skip: status !== "active" }
    );
    const inactiveQuery = useGetInactiveCustomersQuery(
        { page: 1, limit },
        { skip: status !== "inactive" }
    );

    // Select the appropriate query result based on status
    const { data, isLoading, error } = status === "active" ? activeQuery : inactiveQuery;

    const customers: Customer[] = data?.data?.slice(0, limit) || [];

    if (isLoading) {
        return <div className="p-4 text-sm text-muted-foreground">Loading...</div>;
    }

    if (error) {
        return <div className="p-4 text-sm text-red-500">Failed to load customers</div>;
    }

    return (
        <div className="space-y-4">
            {customers.length > 0 ? (
                customers.map((customer) => {
                    const initials = customer.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase();

                    return (
                        <div key={customer._id} className="flex items-center justify-between">
                            {/* Left */}
                            <div className="flex items-center gap-3">
                                {/* Avatar */}
                                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                                    {initials}
                                </div>

                                {/* Name & Email */}
                                <div>
                                    <p className="text-sm font-medium leading-none">
                                        {customer.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {customer.email}
                                    </p>
                                </div>
                            </div>

                            {/* Right Amount */}
                            <div className="text-sm font-medium">
                                {Number(customer?.totalSales || 0).toFixed(2)}
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="p-4 text-sm text-muted-foreground text-center">No {status} customers found.</div>
            )}
        </div>
    );
}
