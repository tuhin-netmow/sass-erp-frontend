import type { Payment } from "../common";
import type { SalesOrder } from "./salesOrder.types";




export interface SalesInvoice {
  paidAmount: number;
  remainingBalance: number;
  _id: string;
  id?: string;
  publicId?: string;
  invoiceNumber: string;
  orderId: string;
  invoiceDate: string; // ISO date string
  dueDate: string; // ISO date string
  totalAmount: string; // numeric string
  totalPayable: string; // numeric string
  status: string;
  paymentStatus?: string;
  createdBy: string;
  creator: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  order: SalesOrder;
  payments: Payment[]
}


// -------------------- Invoice Create Payload --------------------
export interface InvoiceCreatePayload {
  orderId: string;
  dueDate: string; // "YYYY-MM-DD" format
}