// types/purchaseInvoice.types.ts

import type { PurchaseOrder } from "./purchaseOrder.types";
import type { PurchasePayment } from "./purchasePayment.types";

export type InvoiceStatus =
  | "draft"
  | "pending"
  | "paid"
  | "cancelled"
  | "overdue";




export type PurchaseInvoice = {
  dueAmount: number;
  paidAmount: number;
  _id: string;
  id?: string;
  publicId?: string;
  invoiceNumber: string;
  purchaseOrderId: string;
  purchaseOrder: PurchaseOrder;
  payments: PurchasePayment[];
  totalAmount: number;
  totalPayableAmount: number;
  status: InvoiceStatus;
  invoiceDate: string; // ISO string
  dueDate: string; // ISO string
  createdBy: string;
  creator: {
    _id: string;
    name: string;
    email: string;
  }
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
};
