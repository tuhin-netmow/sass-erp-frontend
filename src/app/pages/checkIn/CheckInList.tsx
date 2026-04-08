/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, type JSX } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/app/components/dashboard/DataTable";
import { format } from "date-fns";
import CheckInLocationModal from "./CheckInLocationModal";
import { useGetAllStaffAttendanceQuery,  } from "@/store/features/app/checkIn/checkIn";
import ClenderButton from "./ClenderButton";
import { MapPin, Car } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { StaffAttendance } from "@/shared";

/* ================= COMPONENT ================= */

export default function CheckInList(): JSX.Element {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [locationItem, setLocationItem] = useState<StaffAttendance | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const { data: response, isFetching, isLoading } = useGetAllStaffAttendanceQuery({
    page,
    limit,
    search,
    date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined,
  });

  const attendanceItems = useMemo(() => response?.data || [], [response]);
  const totalCount = useMemo(() => response?.pagination?.total || 0, [response]);

  /* ================= TABLE COLUMNS ================= */

  const columns = useMemo<ColumnDef<StaffAttendance>[]>(
    () => [
      {
        accessorKey: "staff",
        header: "Checked-in User",
        cell: ({ row }) => {
          const staff = row.original.staff;
          return staff?.firstName ? `${staff.firstName} ${staff.lastName}` : staff?.name || "N/A";
        },
      },
      {
        id: "customer",
        header: "Customer & Company",
        cell: ({ row }) => {
          const customer = row.original.customer;
          return (
            <div className="flex flex-col gap-0.5">
              {customer.company && <span className="font-semibold text-gray-900">{customer.company}</span>}
              <span className={customer.company ? "text-xs text-muted-foreground" : "font-medium text-gray-900"}>
                {customer.name}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "checkInTime",
        header: "Check-in Time",
        cell: ({ row }) => {
          const date = new Date(row.original.checkInTime);
          return isNaN(date.getTime()) ? row.original.checkInTime : date.toLocaleString();
        },
      },
      {
        accessorKey: "distanceMeters",
        header: "Distance (m)",
        cell: ({ row }) => `${row.original.distanceMeters}m`,
      },
      {
        id: "location",
        header: "Location",
        cell: ({ row }) => {
          const { latitude, longitude, customer } = row.original;
          const hasLocation = (latitude && longitude) || customer?.address;

          const handleWazeClick = () => {
            let url = "";
            if (latitude && longitude) {
              url = `https://www.waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
            } else if (customer?.address) {
              url = `https://www.waze.com/ul?q=${encodeURIComponent(customer.address)}`;
            }
            if (url) window.open(url, "_blank");
          };

          if (!hasLocation) return <span className="text-muted-foreground text-xs">—</span>;

          return (
            <div className="flex items-center gap-1.5">
              <Button
                size="icon"
                className="h-8 w-8 bg-blue-50 text-blue-600 hover:bg-blue-100 border-none shadow-none rounded-lg"
                onClick={() => setLocationItem(row.original)}
                title="View Map"
              >
                <MapPin className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                className="h-8 w-8 bg-orange-50 text-orange-500 hover:bg-orange-100 border-none shadow-none rounded-lg"
                onClick={handleWazeClick}
                title="Open in Waze"
              >
                <Car className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  /* ================= UI ================= */

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Check In List</h1>
        <ClenderButton selectedDate={selectedDate} onDateChange={setSelectedDate} />
      </div>

      <div className="bg-white">
        <DataTable
          columns={columns}
          data={attendanceItems}
          pageIndex={page - 1}
          pageSize={limit}
          totalCount={totalCount}
          onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
          isFetching={isFetching || isLoading}
        />
      </div>

      {locationItem && (
        <CheckInLocationModal
          attendance={locationItem}
          onClose={() => setLocationItem(null)}
        />
      )}
    </div>
  );
}
