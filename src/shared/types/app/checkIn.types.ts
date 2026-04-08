/* =======================
   Check-In Types
   ======================= */

import type { Staff } from "../common";



export interface StaffAttendance {
  id: number;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  customerId: number;
  staffId: number;
  checkInTime: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  staff?: Staff | null;
  customer: {
    id: number;
    name: string;
    company: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
}


