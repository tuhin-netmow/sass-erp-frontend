
import type { Payment } from "../common";
import type { SalesInvoice } from "./salesInvoice.types";
import type { SalesOrder } from "./salesOrder.types";





export interface SalesPayment {
  notes: string;
  _id: string;
  id?: string;
  invoiceId: string | null;
  orderId: string;
  amount: string;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber: string;
  status: string;
  createdBy: string;
  creator:{
    _id: string;
    name: string;
    email: string
  };
  createdAt: string;
  updatedAt: string;
  order: SalesOrder;
  invoice: SalesInvoice | null;
  payments: Payment[];
}