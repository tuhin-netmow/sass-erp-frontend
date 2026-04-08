export type Attendance = {
  _id: string;
  staffId: string;
  date: string;       // "2025-12-02"
  checkIn: string;   // "09:00:00"
  checkOut: string;  // "18:00:00"
  notes: string;
  status: "present" | "absent" | "late" | "leave" | string;
};
