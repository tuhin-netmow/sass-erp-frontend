import { useGetCustomersQuery } from "@/store/features/app/customers/customersApi";
import type { Customer } from "@/shared/types/app/customers";
import { useState } from "react";
import { Link } from "react-router";

export default function RecentCustomers() {
  const [page] = useState(1);
  const limit = 6;

  const { data, isLoading, error } = useGetCustomersQuery({
    page,
    limit,
  });

  const customers: Customer[] = data?.data?.slice(0, limit) || [];

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">Failed to load customers</div>;
  }

  return (
    <div className="space-y-4">
      {customers.map((customer) => {
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
                <Link to={`/dashboard/customers/${customer._id}`} className="text-sm font-medium leading-none hover:underline">
                  {customer.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {customer.email}
                </p>
              </div>
            </div>

            {/* Right Amount */}
            <div className="text-sm font-medium">
              {Number(customer?.totalSales).toFixed(2)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
