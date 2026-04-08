/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, type JSX } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/app/components/dashboard/DataTable";
import { format } from "date-fns";
import CheckInLocationModal from "./CheckInLocationModal";
import { useGetAllStaffAttendanceQuery,} from "@/store/features/app/checkIn/checkIn";
import ClenderButton from "./ClenderButton";
import { MapPin, Car, Users } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useGetAllStaffsQuery } from "@/store/features/app/staffs/staffApiService";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import type { StaffAttendance } from "@/shared";

/* ================= COMPONENT ================= */

export default function StaffWiseCheckInList(): JSX.Element {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [locationItem, setLocationItem] = useState<StaffAttendance | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [staffId, setStaffId] = useState<string>("all");

    const { data: staffListResponse } = useGetAllStaffsQuery({ status: "active", limit: 100 });
    const staffList = staffListResponse?.data || [];

    const selectedStaff = useMemo(() => staffList.find((s: any) => s.id.toString() === staffId), [staffList, staffId]);

    const { data: response, isFetching, isLoading } = useGetAllStaffAttendanceQuery({
        page,
        limit,
        search: search || undefined,
        staffId: staffId !== "all" ? staffId : undefined,
        date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined,
    });

    const attendanceItems = useMemo(() => response?.data || [], [response]);
    const totalCount = useMemo(() => response?.pagination?.total || 0, [response]);

    /* ================= TABLE COLUMNS ================= */

    const columns = useMemo<ColumnDef<StaffAttendance>[]>(
        () => [
            {
                accessorKey: "staff",
                header: "Staff Member",
                cell: ({ row }) => {
                    const staff = row.original.staff;
                    return (
                        <div className="font-medium text-slate-900 border-none shadow-none">
                            {staff?.firstName ? `${staff.firstName} ${staff.lastName}` : staff?.name || "N/A"}
                        </div>
                    );
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
                cell: ({ row }) => (
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {row.original.distanceMeters}m
                    </div>
                ),
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-400 bg-clip-text text-transparent">
                        Staff Wise Checkin List
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">Detailed history of staff customer visits and check-ins</p>
                </div>

                <div className="flex flex-wrap gap-3 items-end bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 ml-1">Staff Member</label>
                        <Select value={staffId} onValueChange={(val) => { setStaffId(val); setPage(1); }}>
                            <SelectTrigger className="w-[180px] h-10 rounded-xl border-slate-200 focus:ring-blue-500 transition-all">
                                <SelectValue placeholder="All Staff" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Staff</SelectItem>
                                {staffList.map((staff: any) => (
                                    <SelectItem key={staff._id} value={staff._id.toString()}>
                                        {staff.firstName} {staff.lastName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 ml-1">Date</label>
                        <ClenderButton selectedDate={selectedDate} onDateChange={setSelectedDate} />
                    </div>
                </div>
            </div>

            <Card className="shadow-lg shadow-slate-200/50 overflow-hidden rounded-3xl pb-2">
                <CardHeader className="border-b-1 border-slate-50 bg-white/50 backdrop-blur-sm py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-800">Attendance Records</CardTitle>
                            <p className="text-xs text-slate-500 mt-0.5 font-medium italic">
                                {staffId === "all" ? "All staff members" : `${selectedStaff?.firstName} ${selectedStaff?.lastName}`} • {selectedDate ? format(selectedDate, "PPP") : "All dates"}
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>

            {locationItem && (
                <CheckInLocationModal
                    attendance={locationItem}
                    onClose={() => setLocationItem(null)}
                />
            )}
        </div>
    );
}
