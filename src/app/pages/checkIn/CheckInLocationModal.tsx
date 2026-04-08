import { MapEmbed } from "@/shared/components/common/MapEmbed";
import { GoogleMapEmbed } from "@/shared/components/common/GoogleMapEmbed";
import { Navigation } from "lucide-react";

import { type Customer } from "@/shared/types/app/customers";
import type { StaffAttendance } from "@/shared";

type ModalProps =
  | {
    attendance: StaffAttendance;
    onClose: () => void;
  }
  | {
    customer: Customer;
    checkins: StaffAttendance[];
    onClose: () => void;
  };

export default function CheckInLocationModal(props: ModalProps) {
  const { onClose } = props;

  // Type guard or simple check for attendance
  const isSingleAttendance = "attendance" in props;

  // Extract data based on which prop set was provided
  const attendance = isSingleAttendance ? props.attendance : null;
  const customer = isSingleAttendance ? props.attendance?.customer : props.customer;
  const checkins = isSingleAttendance ? [] : props.checkins;

  // Coordinate access needs to be careful because 'customer' in StaffAttendance
  // might have slightly different property names than official Customer type
  // (e.g. address is there, but latitude/longitude might be on attendance record)
  const lat = isSingleAttendance ? props.attendance?.latitude : props.customer?.latitude;
  const lng = isSingleAttendance ? props.attendance?.longitude : props.customer?.longitude;

  const hasCoords = typeof lat === "number" && typeof lng === "number";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[95%] max-w-3xl">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-medium">
            {isSingleAttendance
              ? `Attendance Location — Staff ID: ${attendance?.staffId}`
              : `Customer Location — ${customer?.name ?? "Unknown Customer"}`}
          </h2>
          <button className="px-3 py-1 bg-gray-200 rounded" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <div className="text-sm text-gray-500">Address</div>
            <div className="font-medium">{customer?.address ?? "—"}</div>
          </div>
          {isSingleAttendance && attendance && (
            <>
              <div>
                <div className="text-sm text-gray-500">Check-in Time</div>
                <div className="font-medium">{attendance?.checkInTime ? new Date(attendance.checkInTime).toLocaleString() : "—"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Distance</div>
                <div className="font-medium">{attendance?.distanceMeters ?? 0}m</div>
              </div>
            </>
          )}
          <div>
            <div className="text-sm text-gray-500">Coordinates</div>
            <div className="font-medium">
              {lat ?? "—"}, {lng ?? "—"}
            </div>
          </div>

          <div className="w-full h-64 rounded overflow-hidden border">
            {hasCoords ? (
              <div className="w-full h-full">
                <GoogleMapEmbed
                  center={{ lat: lat!, lng: lng! }}
                  zoom={16}
                  startLocation={{
                    lat: lat!,
                    lng: lng!,
                    name: isSingleAttendance ? `Staff ${attendance?.staffId}` : (customer?.name ?? "Customer"),
                  }}
                  endLocation={{
                    lat: lat!,
                    lng: lng!,
                    name: isSingleAttendance ? `Staff ${attendance?.staffId}` : (customer?.name ?? "Customer"),
                  }}
                  customerMarkers={checkins.map((ci: StaffAttendance) => ({
                    lat: parseFloat(String(ci.latitude)),
                    lng: parseFloat(String(ci.longitude)),
                    name: `Check-in: ${new Date(ci.checkInTime).toLocaleTimeString()}`,
                  }))}
                />
              </div>
            ) : (
              customer?.address ? (
                <MapEmbed location={customer?.address} />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50 text-gray-400">
                  No location data available
                </div>
              )
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            {hasCoords && (
              <a
                href={`https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 rounded-lg bg-[#33CCFF] text-white font-semibold flex items-center gap-2 hover:bg-[#2EB8E6] transition-all shadow-md active:scale-95"
              >
                <Navigation className="w-4 h-4 fill-current" />
                Navigate with Waze
              </a>
            )}
            <button onClick={onClose} className="px-4 py-1.5 rounded-lg border font-medium hover:bg-gray-50 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
