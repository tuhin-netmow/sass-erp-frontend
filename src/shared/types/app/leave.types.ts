export type Leave = {
  _id?: string;            // optional for creation
  staffId: string;
  leaveType: "sick" | "casual" | "annual" | "unpaid" | string; // can extend as needed
  startDate: string;     // "YYYY-MM-DD"
  endDate: string;       // "YYYY-MM-DD"
  reason: string;
  status?: "pending" | "approved" | "rejected" | string; // optional, backend may set
  createdAt?: string;
  updatedAt?: string;
};
